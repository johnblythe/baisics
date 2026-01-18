import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CoachTier } from '@prisma/client';

interface CoachSignupRequest {
  name: string;
  email: string;
  coachType: string;
}

/**
 * Create or update a user as a coach before sending the magic link.
 * This way when they click the link, they're already a coach.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CoachSignupRequest = await req.json();
    const { name, email, coachType } = body;

    // Validate required fields
    if (!name || !email || !coachType) {
      return NextResponse.json(
        { error: 'Name, email, and coach type are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser?.isCoach) {
      // Already a coach - just sign in
      return NextResponse.json({ success: true, existing: true });
    }

    if (existingUser) {
      // Existing user, upgrade to coach (preserve existing name if set)
      await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name: existingUser.name || name.trim(),
          isCoach: true,
          coachType: coachType.trim(),
          coachTier: CoachTier.FREE,
          coachOnboardedAt: null, // triggers onboarding wizard
        },
      });
    } else {
      // New user - create as coach
      await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          isCoach: true,
          coachType: coachType.trim(),
          coachTier: CoachTier.FREE,
          coachOnboardedAt: null, // triggers onboarding wizard
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coach signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
