import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { GenerateProgramRequest, ProgramData } from '@/types/program';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as GenerateProgramRequest;
    const { generationData, modifications } = body;

    // Here you would call your AI service to generate the full program
    // For now, we'll return a mock program similar to preview but with workouts
    const program: ProgramData = {
      programName: `${generationData.trainingPreferences.trainingGoal} Program`,
      programDescription: 'A personalized program designed to help you achieve your fitness goals',
      phases: [
        {
          phase: 1,
          durationWeeks: 4,
          bodyComposition: {
            bodyFatPercentage: generationData.currentStats.bodyFatLow || 15,
            muscleMassDistribution: generationData.currentStats.muscleMassDistribution || 'balanced',
          },
          trainingPlan: {
            daysPerWeek: modifications?.updateDays || generationData.trainingPreferences.daysAvailable,
            workouts: [
              {
                dayNumber: 1,
                name: 'Upper Body Strength',
                focus: 'Upper Body',
                exercises: [
                  {
                    name: 'Bench Press',
                    sets: 4,
                    measure: {
                      type: 'reps',
                      value: 8,
                    },
                    restPeriod: 90,
                    equipment: ['barbell', 'bench'],
                    alternatives: ['dumbbell press', 'push-ups'],
                  },
                  // Add more exercises as needed
                ],
                warmup: {
                  duration: 10,
                  activities: ['dynamic stretching', 'mobility work'],
                },
                cooldown: {
                  duration: 5,
                  activities: ['static stretching'],
                },
              },
              // Add more workouts based on daysPerWeek
            ],
          },
          nutrition: {
            dailyCalories: 2000,
            macros: {
              protein: 150,
              carbs: 200,
              fats: 70,
            },
            mealTiming: ['Pre-workout: 2 hours before', 'Post-workout: within 30 minutes'],
          },
          progressionProtocol: [
            'Progressive overload based on previous performance',
            'Increase weight when all sets are completed with good form',
            ...(modifications?.specificRequests ? [modifications.specificRequests] : []),
          ],
        },
      ],
    };

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error generating program:', error);
    return NextResponse.json(
      { error: 'Failed to generate program' },
      { status: 500 }
    );
  }
} 