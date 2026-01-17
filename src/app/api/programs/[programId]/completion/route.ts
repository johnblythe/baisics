import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { withDebugOverrides, logDebugState } from '@/lib/debug/api';

export interface ProgramCompletionData {
  isComplete: boolean;
  programId: string;
  programName: string;
  // Stats
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  durationWeeks: number;
  // Comparison stats (week 1 vs final week)
  firstWeekVolume: number;
  finalWeekVolume: number;
  volumeGrowth: number; // percentage
  // Timing
  startDate: string;
  completionDate: string | null;
  // User info for sharing
  userName?: string;
}

/**
 * GET - Check if a program is complete and get completion stats
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ programId: string }> }
) {
  const { programId } = await context.params;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get program with all related data
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                workoutLogs: {
                  where: {
                    userId,
                    status: 'completed',
                  },
                  orderBy: { completedAt: 'asc' },
                  include: {
                    exerciseLogs: {
                      include: {
                        setLogs: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        ownerUser: {
          select: { name: true },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Check if user owns/has access to this program
    if (program.userId !== userId && program.createdBy !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all unique workouts in the program
    const allWorkouts = program.workoutPlans.flatMap(wp => wp.workouts);
    const totalScheduledWorkouts = allWorkouts.length;

    // Get completed workouts for this program
    const completedWorkoutLogs = await prisma.workoutLog.findMany({
      where: {
        userId,
        programId,
        status: 'completed',
      },
      include: {
        exerciseLogs: {
          include: {
            setLogs: true,
          },
        },
      },
      orderBy: { completedAt: 'asc' },
    });

    // Program is complete if every unique workout has been completed at least once
    const completedWorkoutIds = new Set(completedWorkoutLogs.map(wl => wl.workoutId));
    const isComplete = allWorkouts.every(w => completedWorkoutIds.has(w.id));

    if (!isComplete) {
      return NextResponse.json({
        isComplete: false,
        programId,
        programName: program.name,
        totalWorkouts: completedWorkoutLogs.length,
        totalScheduledWorkouts,
        remainingWorkouts: allWorkouts.filter(w => !completedWorkoutIds.has(w.id)).length,
      });
    }

    // Calculate completion stats
    const totalWorkouts = completedWorkoutLogs.length;

    // Calculate total volume and sets
    let totalVolume = 0;
    let totalSets = 0;

    for (const log of completedWorkoutLogs) {
      for (const exerciseLog of log.exerciseLogs) {
        for (const setLog of exerciseLog.setLogs) {
          totalSets++;
          totalVolume += (setLog.weight || 0) * setLog.reps;
        }
      }
    }

    // Calculate duration in weeks
    const firstWorkout = completedWorkoutLogs[0];
    const lastWorkout = completedWorkoutLogs[completedWorkoutLogs.length - 1];
    const startDate = firstWorkout?.startedAt || program.createdAt;
    const completionDate = lastWorkout?.completedAt || new Date();

    const durationMs = completionDate.getTime() - startDate.getTime();
    const durationWeeks = Math.max(1, Math.ceil(durationMs / (7 * 24 * 60 * 60 * 1000)));

    // Calculate first week vs final week volume for comparison
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const firstWeekEnd = new Date(startDate.getTime() + oneWeekMs);
    const finalWeekStart = new Date(completionDate.getTime() - oneWeekMs);

    let firstWeekVolume = 0;
    let finalWeekVolume = 0;

    for (const log of completedWorkoutLogs) {
      const logDate = log.completedAt || log.startedAt;
      const logVolume = log.exerciseLogs.reduce((sum, el) => {
        return sum + el.setLogs.reduce((setSum, sl) => setSum + (sl.weight || 0) * sl.reps, 0);
      }, 0);

      if (logDate <= firstWeekEnd) {
        firstWeekVolume += logVolume;
      }
      if (logDate >= finalWeekStart) {
        finalWeekVolume += logVolume;
      }
    }

    // Calculate volume growth percentage
    const volumeGrowth = firstWeekVolume > 0
      ? Math.round(((finalWeekVolume - firstWeekVolume) / firstWeekVolume) * 100)
      : 0;

    const data: ProgramCompletionData = {
      isComplete: true,
      programId,
      programName: program.name,
      totalWorkouts,
      totalVolume: Math.round(totalVolume),
      totalSets,
      durationWeeks,
      firstWeekVolume: Math.round(firstWeekVolume),
      finalWeekVolume: Math.round(finalWeekVolume),
      volumeGrowth,
      startDate: startDate.toISOString(),
      completionDate: completionDate.toISOString(),
      userName: program.ownerUser?.name || undefined,
    };

    // Apply debug overrides if in development
    await logDebugState('program-completion');
    const finalData = await withDebugOverrides(data, 'program-completion');

    return NextResponse.json(finalData);
  } catch (error) {
    console.error('Error checking program completion:', error);
    return NextResponse.json(
      { error: 'Failed to check program completion' },
      { status: 500 }
    );
  }
}
