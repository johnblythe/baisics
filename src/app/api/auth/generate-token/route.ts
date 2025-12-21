import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateToken } from '@/lib/auth/tokens';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 token requests per 15 minutes
    const { ok } = checkRateLimit(request, 5, 900_000);
    if (!ok) return rateLimitedResponse();

    // Must be authenticated and can only generate token for self
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, email } = await request.json();

    // Ensure user can only generate tokens for themselves
    if (userId !== session.user.id || email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const token = await generateToken({
      userId,
      email,
      type: 'stripe_return',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
} 