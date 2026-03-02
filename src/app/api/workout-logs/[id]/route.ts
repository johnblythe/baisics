import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

const EXERCISE_SELECT = {
  id: true,
  name: true,
  sets: true,
  reps: true,
  restPeriod: true,
  measureType: true,
  measureUnit: true,
  sortOrder: true,
} as const;

// GET /api/workout-logs/[id] - fetch workout log with full details
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        exerciseLogs: {
          include: {
            exercise: { select: EXERCISE_SELECT },
            setLogs: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: {
            exercise: { sortOrder: 'asc' },
          },
        },
        workout: {
          select: {
            id: true,
            name: true,
            dayNumber: true,
            focus: true,
            exercises: {
              select: EXERCISE_SELECT,
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!workoutLog) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (workoutLog.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Quick-log backfill: if no exercise logs, create shells from workout template
    if (workoutLog.quickLog && workoutLog.exerciseLogs.length === 0 && workoutLog.workout.exercises.length > 0) {
      const createdExerciseLogs = await prisma.$transaction(async (tx) => {
        // Race condition guard: check again inside transaction
        const existingCount = await tx.exerciseLog.count({
          where: { workoutLogId: workoutLog.id },
        });
        if (existingCount > 0) {
          return tx.exerciseLog.findMany({
            where: { workoutLogId: workoutLog.id },
            include: {
              exercise: { select: EXERCISE_SELECT },
              setLogs: { orderBy: { setNumber: 'asc' } },
            },
            orderBy: { exercise: { sortOrder: 'asc' } },
          });
        }

        const logs = [];
        for (const exercise of workoutLog.workout.exercises) {
          const exerciseLog = await tx.exerciseLog.create({
            data: {
              workoutLogId: workoutLog.id,
              exerciseId: exercise.id,
              startedAt: workoutLog.startedAt,
            },
          });

          // Create empty set log placeholders
          const setCount = exercise.sets || 1;
          await tx.setLog.createMany({
            data: Array.from({ length: setCount }, (_, i) => ({
              exerciseLogId: exerciseLog.id,
              setNumber: i + 1,
              weight: null,
              reps: 0,
            })),
          });

          // Fetch with set logs
          const fullLog = await tx.exerciseLog.findUnique({
            where: { id: exerciseLog.id },
            include: {
              exercise: { select: EXERCISE_SELECT },
              setLogs: { orderBy: { setNumber: 'asc' } },
            },
          });
          if (fullLog) logs.push(fullLog);
        }
        return logs;
      });

      return NextResponse.json({
        ...workoutLog,
        exerciseLogs: createdExerciseLogs,
      });
    }

    return NextResponse.json(workoutLog);
  } catch (error) {
    console.error('Error fetching workout log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout log' },
      { status: 500 }
    );
  }
}

// PATCH /api/workout-logs/[id] - update log metadata (date, notes)
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Find entry and verify ownership
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!workoutLog) {
      return NextResponse.json({ error: 'Workout log not found' }, { status: 404 });
    }

    if (workoutLog.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update data
    const updateData: { notes?: string | null; completedAt?: Date; startedAt?: Date } = {};

    if (body.notes !== undefined) {
      updateData.notes = body.notes === '' ? null : body.notes;
    }

    // Handle date change (completedAt + startedAt)
    if (body.completedAt !== undefined) {
      const newDate = new Date(body.completedAt);
      if (isNaN(newDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
      }

      // Date conflict check: another completed log for same workoutId on target date
      const dayStart = new Date(newDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(newDate);
      dayEnd.setHours(23, 59, 59, 999);

      const conflict = await prisma.workoutLog.findFirst({
        where: {
          id: { not: id },
          userId: session.user.id,
          workoutId: workoutLog.workoutId,
          status: 'completed',
          completedAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (conflict) {
        return NextResponse.json(
          { error: 'A completed log for this workout already exists on that date' },
          { status: 409 }
        );
      }

      updateData.completedAt = newDate;

      // Also shift startedAt if provided, otherwise preserve original duration
      if (body.startedAt !== undefined) {
        const startDate = new Date(body.startedAt);
        if (!isNaN(startDate.getTime())) {
          updateData.startedAt = startDate;
        }
      } else if (workoutLog.startedAt && workoutLog.completedAt) {
        // Preserve duration: shift startedAt by same offset
        const duration = workoutLog.completedAt.getTime() - workoutLog.startedAt.getTime();
        updateData.startedAt = new Date(newDate.getTime() - duration);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No recognized fields to update' }, { status: 400 });
    }

    const updated = await prisma.workoutLog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating workout log:', error);
    return NextResponse.json(
      { error: 'Failed to update workout log' },
      { status: 500 }
    );
  }
}
