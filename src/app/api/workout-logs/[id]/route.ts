import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

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
            exercise: {
              select: {
                id: true,
                name: true,
                sets: true,
                reps: true,
                restPeriod: true,
                measureType: true,
                measureUnit: true,
                sortOrder: true,
              },
            },
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
              select: {
                id: true,
                name: true,
                sets: true,
                reps: true,
                restPeriod: true,
                measureType: true,
                measureUnit: true,
                sortOrder: true,
              },
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
        const logs = [];
        for (const exercise of workoutLog.workout.exercises) {
          const exerciseLog = await tx.exerciseLog.create({
            data: {
              workoutLogId: workoutLog.id,
              exerciseId: exercise.id,
              startedAt: workoutLog.startedAt,
            },
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  sets: true,
                  reps: true,
                  restPeriod: true,
                  measureType: true,
                  measureUnit: true,
                  sortOrder: true,
                },
              },
              setLogs: true,
            },
          });

          // Create empty set log placeholders
          const setCount = exercise.sets || 1;
          for (let i = 1; i <= setCount; i++) {
            await tx.setLog.create({
              data: {
                exerciseLogId: exerciseLog.id,
                setNumber: i,
                weight: null,
                reps: 0,
              },
            });
          }

          // Re-fetch with set logs
          const fullLog = await tx.exerciseLog.findUnique({
            where: { id: exerciseLog.id },
            include: {
              exercise: {
                select: {
                  id: true,
                  name: true,
                  sets: true,
                  reps: true,
                  restPeriod: true,
                  measureType: true,
                  measureUnit: true,
                  sortOrder: true,
                },
              },
              setLogs: {
                orderBy: { setNumber: 'asc' },
              },
            },
          });
          logs.push(fullLog);
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
    const body = await request.json();

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
    const updateData: Record<string, unknown> = {};

    if (body.notes !== undefined) {
      updateData.notes = body.notes || null;
    }

    // Handle date change (completedAt + startedAt)
    if (body.completedAt !== undefined) {
      const newDate = new Date(body.completedAt);

      // Date conflict check: another completed log for same workoutId on target date
      const dayStart = new Date(newDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(newDate);
      dayEnd.setHours(23, 59, 59, 999);

      const conflict = await prisma.workoutLog.findFirst({
        where: {
          id: { not: id },
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
        updateData.startedAt = new Date(body.startedAt);
      } else if (workoutLog.startedAt && workoutLog.completedAt) {
        // Preserve duration: shift startedAt by same offset
        const duration = workoutLog.completedAt.getTime() - workoutLog.startedAt.getTime();
        updateData.startedAt = new Date(newDate.getTime() - duration);
      }
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
