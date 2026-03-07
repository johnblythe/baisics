import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Find or create freestyle program in a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      let program = await tx.program.findFirst({
        where: { userId, source: 'freestyle' },
        include: { workoutPlans: true },
      });

      let workoutPlanId: string;

      if (!program) {
        program = await tx.program.create({
          data: {
            name: 'Freestyle Workouts',
            source: 'freestyle',
            createdBy: userId,
            userId,
            active: false,
          },
          include: { workoutPlans: true },
        });

        const workoutPlan = await tx.workoutPlan.create({
          data: {
            userId,
            programId: program.id,
            daysPerWeek: 0,
            dailyCalories: 0,
            proteinGrams: 0,
            carbGrams: 0,
            fatGrams: 0,
            splitType: 'freestyle',
          },
        });

        workoutPlanId = workoutPlan.id;
      } else {
        workoutPlanId = program.workoutPlans[0].id;
      }

      // Create a new workout
      const workout = await tx.workout.create({
        data: {
          name: 'Freestyle Workout',
          focus: 'freestyle',
          workoutPlanId,
          dayNumber: 0,
        },
      });

      // Create a workout log
      const workoutLog = await tx.workoutLog.create({
        data: {
          userId,
          workoutId: workout.id,
          programId: program.id,
          status: 'in_progress',
        },
      });

      return {
        workoutId: workout.id,
        workoutLogId: workoutLog.id,
        programId: program.id,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating freestyle workout:', error);
    return NextResponse.json(
      { error: 'Failed to create freestyle workout' },
      { status: 500 }
    );
  }
}
