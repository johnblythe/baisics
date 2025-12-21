import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProgramStructure } from '@/app/hi/services/programCreationSteps';
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

    const { intakeData } = await request.json();
    const programStructure = await getProgramStructure(intakeData as IntakeFormData, session.user.id);
    return NextResponse.json({ success: true, programStructure });
  } catch (error) {
    console.error('Error in program structure creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create program structure' },
      { status: 500 }
    );
  }
} 