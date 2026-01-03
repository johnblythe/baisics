import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;

    const program = await prisma.program.findFirst({
      where: {
        id: programId,
      },
      include: {
        workoutPlans: {
          include: {
            workouts: {
              include: {
                exercises: { orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        createdByUser: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found or unauthorized access' }, { status: 404 });
    }

    // Transform the data for PDF generation
    const transformedProgram = {
      ...program,
      workoutPlans: program.workoutPlans.map(plan => ({
        ...plan,
        nutrition: {
          dailyCalories: plan.dailyCalories,
          macros: {
            protein: plan.proteinGrams,
            carbs: plan.carbGrams,
            fats: plan.fatGrams,
          },
        },
      })),
    };

    return NextResponse.json(transformedProgram);
  } catch (error) {
    console.error('Error fetching program data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 