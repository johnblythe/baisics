import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { updateStreak } from '@/lib/streaks';
import { checkAndAwardMilestone } from '@/lib/milestone-service';
import { sendEmail } from '@/lib/email';
import { createProgramCompletionEmail } from '@/lib/email/templates/program-completion';
import { getDebugState } from '@/lib/debug/api';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    // Parse optional completedAt from request body
    let customCompletedAt: Date | undefined;
    const contentLength = request.headers.get('content-length');
    const hasBody = contentLength && parseInt(contentLength, 10) > 0;

    if (hasBody) {
      try {
        const body = await request.json();
        if (body.completedAt) {
          customCompletedAt = new Date(body.completedAt);
          const now = new Date();
          // Set to end of today to allow completing for today
          const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
          if (customCompletedAt > endOfToday) {
            return NextResponse.json({ error: 'Cannot complete workouts for future dates' }, { status: 400 });
          }
        }
      } catch (parseError) {
        // Client sent body but it's malformed JSON - this is a client bug
        console.error('Malformed JSON in workout complete request:', {
          workoutLogId: id,
          contentLength,
          error: parseError instanceof Error ? parseError.message : String(parseError)
        });
        return NextResponse.json({ error: 'Malformed JSON in request body' }, { status: 400 });
      }
    }
    // No body - proceed with default completedAt (now)

    // Get the workout log to verify ownership
    const workoutLog = await prisma.workoutLog.findUnique({
      where: { id },
    });

    if (!workoutLog) {
      return new NextResponse('Workout log not found', { status: 404 });
    }

    if (workoutLog.userId !== userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const completionTime = customCompletedAt || new Date();

    // Update the workout log status and completedAt
    const updatedWorkoutLog = await prisma.workoutLog.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: completionTime,
      },
      include: {
        exerciseLogs: {
          include: {
            setLogs: true,
          },
        },
      },
    });

    // Also mark all exercise logs as completed
    await prisma.exerciseLog.updateMany({
      where: {
        workoutLogId: id,
        completedAt: null,
      },
      data: {
        completedAt: completionTime,
      },
    });

    // Update workout streak (non-blocking - don't fail if streak update fails)
    let streakData = { current: 0, longest: 0, extended: false };
    try {
      streakData = await updateStreak(userId);
    } catch (streakError) {
      console.error('Failed to update streak (workout still completed):', {
        userId,
        workoutLogId: id,
        error: streakError instanceof Error ? streakError.message : String(streakError)
      });
    }

    // Check for milestone achievements (non-blocking)
    let milestoneData = { unlocked: false, milestone: null as string | null, totalWorkouts: 0, totalVolume: 0 };
    try {
      milestoneData = await checkAndAwardMilestone(userId);
    } catch (milestoneError) {
      console.error('Failed to check milestones (workout still completed):', {
        userId,
        workoutLogId: id,
        error: milestoneError instanceof Error ? milestoneError.message : String(milestoneError)
      });
    }

    // Calculate workout stats for this specific workout
    let workoutStats = { setsCompleted: 0, totalVolume: 0 };
    try {
      const completedSets = updatedWorkoutLog.exerciseLogs.flatMap(el => el.setLogs.filter(s => s.completedAt));
      workoutStats.setsCompleted = completedSets.length;
      workoutStats.totalVolume = completedSets.reduce((sum, set) => {
        return sum + ((set.weight || 0) * set.reps);
      }, 0);
    } catch (statsError) {
      console.error('Failed to calculate workout stats:', statsError);
    }

    // Determine if this is the user's first workout (WORKOUT_1 milestone just unlocked)
    // Debug override: force first workout celebration
    let debugState: string | null = null;
    try {
      debugState = await getDebugState();
    } catch (debugError) {
      console.error('Failed to get debug state (continuing without debug overrides):', debugError);
    }
    const isFirstWorkout = debugState === 'first_workout_complete'
      || (milestoneData.unlocked && milestoneData.milestone === 'WORKOUT_1');

    // Check for program completion (non-blocking)
    let programCompletion: {
      isComplete: boolean;
      programId: string;
      programName: string;
      totalWorkouts: number;
      totalVolume: number;
      totalSets: number;
      durationWeeks: number;
      firstWeekVolume: number;
      finalWeekVolume: number;
      volumeGrowth: number;
      startDate: string;
      completionDate: string;
    } | null = null;

    try {
      const programId = workoutLog.programId;

      // Get program with all workouts
      const program = await prisma.program.findUnique({
        where: { id: programId },
        include: {
          workoutPlans: {
            include: {
              workouts: true,
            },
          },
          ownerUser: {
            select: { name: true, email: true },
          },
        },
      });

      if (program) {
        // Get all unique workouts in the program
        const allWorkouts = program.workoutPlans.flatMap(wp => wp.workouts);
        const workoutPlan = program.workoutPlans[0];
        const daysPerWeek = workoutPlan?.daysPerWeek || 3;
        const durationWeeks = workoutPlan?.phaseDurationWeeks || 8;

        // Calculate expected total workouts for program completion
        const expectedTotalWorkouts = daysPerWeek * durationWeeks;

        // Get all completed workouts for this program
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

        // Program is complete when user has done the expected number of workouts
        // (e.g., 3 days/week x 8 weeks = 24 workouts)
        const isProgramComplete = completedWorkoutLogs.length >= expectedTotalWorkouts;

        if (isProgramComplete) {
          // Calculate completion stats
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

          const firstWorkoutLog = completedWorkoutLogs[0];
          const lastWorkoutLog = completedWorkoutLogs[completedWorkoutLogs.length - 1];
          const startDate = firstWorkoutLog?.startedAt || program.createdAt;
          const programCompletionDate = lastWorkoutLog?.completedAt || new Date();

          const durationMs = programCompletionDate.getTime() - startDate.getTime();
          const durationWeeks = Math.max(1, Math.ceil(durationMs / (7 * 24 * 60 * 60 * 1000)));

          // Calculate first week vs final week volume
          const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
          const firstWeekEnd = new Date(startDate.getTime() + oneWeekMs);
          const finalWeekStart = new Date(programCompletionDate.getTime() - oneWeekMs);

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

          const volumeGrowth = firstWeekVolume > 0
            ? Math.round(((finalWeekVolume - firstWeekVolume) / firstWeekVolume) * 100)
            : 0;

          programCompletion = {
            isComplete: true,
            programId,
            programName: program.name,
            totalWorkouts: completedWorkoutLogs.length,
            totalVolume: Math.round(totalVolume),
            totalSets,
            durationWeeks,
            firstWeekVolume: Math.round(firstWeekVolume),
            finalWeekVolume: Math.round(finalWeekVolume),
            volumeGrowth,
            startDate: startDate.toISOString(),
            completionDate: programCompletionDate.toISOString(),
          };

          // Send program completion notification email (non-blocking)
          if (program.ownerUser?.email) {
            const emailData = {
              userName: program.ownerUser.name || 'Athlete',
              programName: program.name,
              totalWorkouts: completedWorkoutLogs.length,
              totalVolume: Math.round(totalVolume),
              totalSets,
              durationWeeks,
              firstWeekVolume: Math.round(firstWeekVolume),
              finalWeekVolume: Math.round(finalWeekVolume),
              volumeGrowth,
              completionDate: programCompletionDate.toISOString(),
              programId,
            };

            const emailContent = createProgramCompletionEmail(emailData);

            // Fire and forget - don't block the response
            sendEmail({
              to: program.ownerUser.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            }).catch(emailError => {
              console.error('Failed to send program completion email:', emailError);
            });
          }
        }
      }
    } catch (programError) {
      console.error('Failed to check program completion (workout still completed):', {
        userId,
        workoutLogId: id,
        error: programError instanceof Error ? programError.message : String(programError)
      });
    }

    return NextResponse.json({
      ...updatedWorkoutLog,
      streak: {
        current: streakData.current,
        longest: streakData.longest,
        extended: streakData.extended
      },
      milestone: milestoneData.unlocked ? {
        unlocked: true,
        type: milestoneData.milestone,
        totalWorkouts: milestoneData.totalWorkouts,
        totalVolume: milestoneData.totalVolume,
      } : null,
      isFirstWorkout,
      workoutStats,
      programCompletion,
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 