import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPhaseDetails } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure, WorkoutStructure } from '@/app/hi/services/programCreationSteps';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { ok } = checkRateLimit(request, 5, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intakeData, programStructure, workoutStructure, phase } = await request.json();
    const phaseDetails = await getPhaseDetails(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      workoutStructure as WorkoutStructure,
      phase,
      session.user.id
    );
    return NextResponse.json({ success: true, phaseDetails });
  } catch (error) {
    console.error('Error getting phase details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get phase details' },
      { status: 500 }
    );
  }
} 