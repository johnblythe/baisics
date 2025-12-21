import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWorkoutFocus } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure, WorkoutStructure } from '@/app/hi/services/programCreationSteps';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { ok } = checkRateLimit(request, 10, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intakeData, programStructure, workoutStructure, dayNumber } = await request.json();
    const workoutFocus = await getWorkoutFocus(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      workoutStructure as WorkoutStructure,
      dayNumber,
      session.user.id
    );
    return NextResponse.json({ success: true, workoutFocus });
  } catch (error) {
    console.error('Error getting workout focus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get workout focus' },
      { status: 500 }
    );
  }
} 