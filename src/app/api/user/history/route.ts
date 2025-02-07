import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { UserProgramHistory } from '@/types/program';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    const whereClause = {
      createdBy: userId,
      ...(programId ? { id: programId } : {}),
    };

    const programs = await prisma.program.findMany({
      where: whereClause,
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                workoutLogs: true,
              },
            },
          },
        },
        userImages: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const programHistory: UserProgramHistory = {
      programs: programs.map(program => {
        // Calculate total workouts and completed workouts
        const totalWorkouts = program.workoutPlans.reduce(
          (sum, plan) => sum + plan.workouts.length,
          0
        );
        
        const workoutLogs = program.workoutPlans.flatMap(plan =>
          plan.workouts.flatMap(workout => workout.workoutLogs)
        );
        
        const completedWorkouts = workoutLogs.filter(log => log.completedAt).length;
        
        // Calculate average intensity (if available in your data model)
        const averageIntensity = 0; // This would need to be calculated based on your specific metrics

        return {
          id: program.id,
          name: program.name,
          startDate: program.createdAt,
          endDate: program.updatedAt,
          completionRate: totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0,
          performance: {
            workoutsCompleted: completedWorkouts,
            averageIntensity,
            progressPhotos: program.userImages.length,
          },
        };
      }),
      ...(programId ? { programId } : {}),
    };

    return NextResponse.json(programHistory);
  } catch (error) {
    console.error('Error fetching user program history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user program history' },
      { status: 500 }
    );
  }
} 