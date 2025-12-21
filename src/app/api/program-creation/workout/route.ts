import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getWorkoutStructure, ProgramStructure } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { ok } = checkRateLimit(request, 5, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intakeData, programStructure } = await request.json();
    const workoutStructure = await getWorkoutStructure(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      session.user.id
    );
    return NextResponse.json({ success: true, workoutStructure });
  } catch (error) {
    console.error('Error in workout structure creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workout structure' },
      { status: 500 }
    );
  }
} 