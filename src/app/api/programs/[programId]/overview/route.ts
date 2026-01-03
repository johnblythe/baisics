import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
// Response type
interface ProgramOverview {
  id: string;
  name: string;
  description: string | null;
  startDate: Date; // For week calculation
  isTemplate: boolean;
  createdBy: string;
  workoutPlans: {
    id: string;
    proteinGrams: number;
    carbGrams: number;
    fatGrams: number;
    dailyCalories: number;
    workouts: {
      id: string;
      name: string;
      dayNumber: number;
      focus: string;
      exercises: {
        id: string;
        name: string;
        sets: number;
        reps: number | null;
        restPeriod: number;
        notes: string | null;
        measureType: string | null;
        measureUnit: string | null;
        measureValue: number | null;
      }[];
    }[];
  }[];
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        // Allow access if user is author OR owner
        OR: [
          { createdBy: session.user.id },
          { userId: session.user.id },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        isTemplate: true,
        createdBy: true,
        workoutPlans: {
          select: {
            id: true,
            proteinGrams: true,
            carbGrams: true,
            fatGrams: true,
            dailyCalories: true,
            workouts: {
              select: {
                id: true,
                name: true,
                dayNumber: true,
                focus: true,
                exercises: {
                  select: {
                    id: true,
                    name: true,
                    sets: true,
                    reps: true,
                    restPeriod: true,
                    notes: true,
                    measureType: true,
                    measureUnit: true,
                    measureValue: true,
                  },
                  orderBy: { sortOrder: 'asc' },
                }
              }
            }
          }
        }
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const overview: ProgramOverview = {
      ...program,
      startDate: program.createdAt,
      isTemplate: program.isTemplate,
      createdBy: program.createdBy,
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Error fetching program overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 