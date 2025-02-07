import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import type { GenerationDataResponse } from '@/types/program';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get latest user stats
    const latestStats = await prisma.userStats.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        weight: true,
        bodyFatLow: true,
        bodyFatHigh: true,
        muscleMassDistribution: true,
        chest: true,
        waist: true,
        hips: true,
        bicepLeft: true,
        bicepRight: true,
        thighLeft: true,
        thighRight: true,
        calfLeft: true,
        calfRight: true,
      },
    });

    // Get latest training preferences and environment settings
    const latestIntake = await prisma.userIntake.findUnique({
      where: { userId },
      select: {
        trainingGoal: true,
        daysAvailable: true,
        experienceLevel: true,
        trainingPreferences: true,
      },
    });

    if (!latestIntake) {
      return NextResponse.json(
        { error: 'No intake data found for user' },
        { status: 404 }
      );
    }

    // Get program history
    const programs = await prisma.program.findMany({
      where: { createdBy: userId },
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
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate program completion rates and metrics
    const historicalData = {
      previousPrograms: programs.map(program => {
        const totalWorkouts = program.workoutPlans.reduce(
          (sum, plan) => sum + plan.workouts.length,
          0
        );
        const completedWorkouts = program.workoutPlans.reduce(
          (sum, plan) =>
            sum +
            plan.workouts.reduce(
              (wSum, workout) =>
                wSum + workout.workoutLogs.filter(log => log.completedAt).length,
              0
            ),
          0
        );
        
        return {
          programId: program.id,
          completionRate: totalWorkouts > 0 ? completedWorkouts / totalWorkouts : 0,
          startDate: program.createdAt,
          endDate: program.updatedAt,
        };
      }),
    };

    // Get latest check-in for context
    const latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        notes: true,
      },
    });

    const response: GenerationDataResponse = {
      currentStats: latestStats || {},
      trainingPreferences: {
        trainingGoal: latestIntake.trainingGoal,
        daysAvailable: latestIntake.daysAvailable,
        experienceLevel: latestIntake.experienceLevel || 'beginner',
        trainingPreferences: latestIntake.trainingPreferences,
        environment: 'gym', // Default values - these should be stored somewhere
        equipmentAccess: {
          type: 'full-gym',
          available: [],
        },
        style: {
          primary: 'strength',
        },
      },
      historicalData,
      context: {
        lastCheckInDate: latestCheckIn?.createdAt,
        specificRequests: latestCheckIn?.notes || undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching program generation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program generation data' },
      { status: 500 }
    );
  }
} 