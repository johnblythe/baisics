import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';
import { checkRateLimit, rateLimitedResponse } from '@/utils/security/rateLimit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 emails per minute
    const { ok } = checkRateLimit(request, 5, 60_000);
    if (!ok) return rateLimitedResponse();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, text, html } = body;

    // Users can only send emails to themselves (for receipts, etc)
    if (to !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await sendEmail({ to, subject, text, html });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 