import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Cookie name for pending coach signup data - must match the one in src/lib/auth.ts
const PENDING_COACH_SIGNUP_COOKIE = 'baisics.pending-coach-signup';

interface CoachSignupRequest {
  name: string;
  email: string;
  coachType: string;
}

/**
 * Store pending coach signup data in a cookie before the magic link is sent.
 * The frontend calls this API first, then triggers NextAuth's signIn('email').
 * When the user clicks the magic link, the signIn callback reads this cookie
 * and applies the coach data to the user.
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

    // Check if user already exists and is already a coach
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser?.isCoach) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Store pending coach signup data in a cookie (expires in 1 hour)
    const cookieStore = await cookies();
    const pendingData = JSON.stringify({
      name: name.trim(),
      email: normalizedEmail,
      coachType: coachType.trim(),
      timestamp: Date.now(),
    });

    cookieStore.set(PENDING_COACH_SIGNUP_COOKIE, pendingData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Coach signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
