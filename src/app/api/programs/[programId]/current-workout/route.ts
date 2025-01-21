import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

type Params = {
  params: {
    programId: string;
  };
};

export async function GET(
  req: Request,
  context: Promise<Params>
): Promise<NextResponse> {
  const { params } = await context;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const program = await prisma.program.findFirst({
      where: { 
        id: params.programId,
        createdBy: session.user.id,
      },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: true,
              },
            },
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

    const completedWorkoutIds = new Set(program.workoutLogs?.map(log => log.workoutId));
    const nextWorkout = program.workoutPlans?.[0]?.workouts.find(
      workout => !completedWorkoutIds.has(workout.id)
    );

    const response = {
      workout: nextWorkout ? {
        id: nextWorkout.id,
        name: nextWorkout.name,
        dayNumber: nextWorkout.dayNumber,
        focus: nextWorkout.focus,
        exerciseCount: nextWorkout.exercises.length,
      } : null,
      nutrition: {
        proteinGrams: program.workoutPlans?.[0]?.proteinGrams || 0,
        carbGrams: program.workoutPlans?.[0]?.carbGrams || 0,
        fatGrams: program.workoutPlans?.[0]?.fatGrams || 0,
        dailyCalories: program.workoutPlans?.[0]?.dailyCalories || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching current workout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 