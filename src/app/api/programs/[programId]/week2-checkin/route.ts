import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { withDebugOverrides, logDebugState } from '@/lib/debug/api';

// Types for API response
export interface Week2CheckInData {
  shouldShow: boolean;
  alreadyShown: boolean;
  completedWorkouts: number;
  programName: string;
  originalGoals: {
    trainingGoal: string | null;
    daysAvailable: number | null;
    experienceLevel: string | null;
  };
  programStats: {
    daysPerWeek: number;
    totalWorkoutsInProgram: number;
    weekNumber: number;
  };
}

// GET - Check if Week 2 check-in should be shown
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId } = await params;

    // Get program with check-in status
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        workoutPlans: {
          include: {
            workouts: true,
          },
        },
        workoutLogs: {
          where: {
            status: 'completed',
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get user intake for original goals
    const userIntake = await prisma.userIntake.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    const completedWorkouts = program.workoutLogs.length;
    const daysPerWeek = program.workoutPlans[0]?.daysPerWeek || 3;
    const totalWorkoutsInProgram = program.workoutPlans.reduce(
      (sum, plan) => sum + plan.workouts.length,
      0
    );

    // Calculate week number based on workouts completed
    const weekNumber = Math.ceil(completedWorkouts / daysPerWeek) || 1;

    // Determine if we should show the check-in
    // Week 2 = roughly workouts 5-8 for a 4-day program, 4-6 for a 3-day program
    // Show when: workout 5-8 range AND not already shown
    const isInWeek2Range = completedWorkouts >= 4 && completedWorkouts <= 10;
    const shouldShow = isInWeek2Range && !program.week2CheckInShown;

    const data: Week2CheckInData = {
      shouldShow,
      alreadyShown: program.week2CheckInShown,
      completedWorkouts,
      programName: program.name,
      originalGoals: {
        trainingGoal: userIntake?.trainingGoal || null,
        daysAvailable: userIntake?.daysAvailable || null,
        experienceLevel: userIntake?.experienceLevel || null,
      },
      programStats: {
        daysPerWeek,
        totalWorkoutsInProgram,
        weekNumber,
      },
    };

    // Apply debug overrides if in development
    await logDebugState('week2-checkin');
    const finalData = await withDebugOverrides(data, 'week2-checkin');

    return NextResponse.json(finalData);
  } catch (error) {
    console.error('Error checking Week 2 check-in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Record user's Week 2 check-in response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { programId } = await params;
    const body = await request.json();
    const { option } = body as { option: 'going_great' | 'too_hard' | 'too_easy' | 'life_happened' };

    if (!['going_great', 'too_hard', 'too_easy', 'life_happened'].includes(option)) {
      return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
    }

    // Update program with check-in response
    const program = await prisma.program.update({
      where: { id: programId },
      data: {
        week2CheckInShown: true,
        week2CheckInShownAt: new Date(),
        week2CheckInOption: option,
      },
    });

    // Log analytics
    await prisma.appLog.create({
      data: {
        level: 'INFO',
        category: 'week2_checkin',
        type: 'response_recorded',
        message: `Week 2 check-in response: ${option}`,
        metadata: {
          programId,
          option,
          programName: program.name,
        },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      option,
      message: getResponseMessage(option),
    });
  } catch (error) {
    console.error('Error recording Week 2 check-in:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getResponseMessage(option: string): string {
  switch (option) {
    case 'going_great':
      return "That's awesome! Keep up the great work.";
    case 'too_hard':
      return "No problem—we can adjust your program to match your current level.";
    case 'too_easy':
      return "Great feedback! Consider adding weight or reps as you progress.";
    case 'life_happened':
      return "Life happens to everyone. You're still here—that's what matters.";
    default:
      return "Thanks for the feedback!";
  }
}
