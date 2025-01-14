import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth/tokens';

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json();

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