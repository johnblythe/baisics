import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Public endpoint to fetch shared workout data
 * No auth required - workout data is intentionally public when shared
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
      select: {
        id: true,
        completedAt: true,
        startedAt: true,
        status: true,
        user: {
          select: {
            name: true,
          },
        },
        workout: {
          select: {
            name: true,
            dayNumber: true,
          },
        },
        program: {
          select: {
            name: true,
          },
        },
        exerciseLogs: {
          select: {
            id: true,
            completedAt: true,
            exercise: {
              select: {
                name: true,
                sets: true,
                reps: true,
              },
            },
            setLogs: {
              select: {
                setNumber: true,
                weight: true,
                reps: true,
              },
              orderBy: {
                setNumber: 'asc',
              },
            },
          },
        },
      },
    });

    if (!workoutLog) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Only share completed workouts
    if (workoutLog.status !== 'completed') {
      return NextResponse.json(
        { error: 'This workout is not available for sharing' },
        { status: 404 }
      );
    }

    // Calculate stats
    const exercisesCompleted = workoutLog.exerciseLogs.filter(
      (el) => el.completedAt !== null
    ).length;

    const totalSets = workoutLog.exerciseLogs.reduce(
      (sum, el) => sum + el.setLogs.length,
      0
    );

    const totalVolume = workoutLog.exerciseLogs.reduce(
      (sum, el) => sum + el.setLogs.reduce(
        (setSum, set) => setSum + ((set.weight || 0) * (set.reps || 0)),
        0
      ),
      0
    );

    // Calculate duration in minutes
    const duration = workoutLog.completedAt && workoutLog.startedAt
      ? Math.round(
          (new Date(workoutLog.completedAt).getTime() -
           new Date(workoutLog.startedAt).getTime()) / 60000
        )
      : null;

    // Get first name only for privacy
    const firstName = workoutLog.user?.name?.split(' ')[0] || 'Someone';

    // Build exercise summary (for expandable details)
    const exercises = workoutLog.exerciseLogs.map((el) => ({
      name: el.exercise.name,
      targetSets: el.exercise.sets,
      targetReps: el.exercise.reps,
      completedSets: el.setLogs.length,
      sets: el.setLogs.map((set) => ({
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
      })),
    }));

    return NextResponse.json({
      id: workoutLog.id,
      firstName,
      workoutName: workoutLog.workout.name,
      programName: workoutLog.program.name,
      dayNumber: workoutLog.workout.dayNumber,
      completedAt: workoutLog.completedAt,
      stats: {
        exercisesCompleted,
        totalExercises: workoutLog.exerciseLogs.length,
        totalSets,
        totalVolume: Math.round(totalVolume),
        duration,
      },
      exercises,
    });
  } catch (error) {
    console.error('Error fetching shared workout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    );
  }
}
