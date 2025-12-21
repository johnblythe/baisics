import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getPhaseNutrition } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure } from '@/app/hi/services/programCreationSteps';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { ok } = checkRateLimit(request, 5, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { intakeData, programStructure, phase } = await request.json();
    const nutrition = await getPhaseNutrition(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      phase,
      session.user.id
    );
    return NextResponse.json({ success: true, nutrition });
  } catch (error) {
    console.error('Error getting phase nutrition:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get phase nutrition' },
      { status: 500 }
    );
  }
} 