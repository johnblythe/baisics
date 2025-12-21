import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveProgramToDatabase } from '@/app/hi/services/programCreationSteps';
import { Program } from '@/types';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 saves per minute
    const { ok } = checkRateLimit(request, 10, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const program = await request.json() as Program;

    // Ensure user can only save programs for themselves
    if (program.user?.id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const savedProgram = await saveProgramToDatabase(program);
    return NextResponse.json({ success: true, program, programId: savedProgram.id });
  } catch (error) {
    console.error('Error saving program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save program' },
      { status: 500 }
    );
  }
} 