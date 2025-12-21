import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';
import {
  generateProgram,
  saveProgramToDatabase,
  convertIntakeToProfile,
  type UserProfile,
  type GenerationContext,
} from '@/services/programGeneration';

/**
 * POST /api/programs/generate
 *
 * Unified endpoint for program generation.
 * Accepts either:
 * - Full UserProfile object
 * - Legacy IntakeFormData (auto-converted)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 program generations per minute
    const { ok } = checkRateLimit(request, 5, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { profile, intakeData, context, saveToDb = true } = body;

    // Convert legacy intake format if needed
    let userProfile: UserProfile;
    if (profile) {
      userProfile = profile;
    } else if (intakeData) {
      userProfile = convertIntakeToProfile(intakeData);
    } else {
      return NextResponse.json(
        { error: 'Missing profile or intakeData' },
        { status: 400 }
      );
    }

    // Build generation context
    const generationContext: GenerationContext = {
      generationType: context?.generationType || 'new',
      previousPrograms: context?.previousPrograms,
      recentCheckIn: context?.recentCheckIn,
      modifications: context?.modifications,
    };

    // Generate the program
    const result = await generateProgram({
      userId: session.user.id,
      profile: userProfile,
      context: generationContext,
    });

    if (!result.success || !result.program) {
      return NextResponse.json(
        { error: result.error || 'Generation failed' },
        { status: 500 }
      );
    }

    // Optionally save to database
    let savedProgram = null;
    if (saveToDb) {
      savedProgram = await saveProgramToDatabase(result.program, session.user.id);
    }

    return NextResponse.json({
      success: true,
      program: result.program,
      savedProgram,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('Program generation API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
