import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/email';

// POST - Send invite to client
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { coachClientId, resend } = await request.json();

    if (!coachClientId) {
      return NextResponse.json(
        { error: 'coachClientId is required' },
        { status: 400 }
      );
    }

    const coachClient = await prisma.coachClient.findFirst({
      where: {
        id: coachClientId,
        coachId: session.user.id,
        inviteStatus: 'PENDING',
      },
      include: {
        coach: {
          select: { name: true, email: true },
        },
      },
    });

    if (!coachClient) {
      return NextResponse.json(
        { error: 'Invite not found or already accepted' },
        { status: 404 }
      );
    }

    // Generate new token if resending
    let inviteToken = coachClient.inviteToken;
    if (resend || !inviteToken) {
      inviteToken = crypto.randomUUID();
      await prisma.coachClient.update({
        where: { id: coachClientId },
        data: {
          inviteToken,
          inviteSentAt: new Date(),
        },
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';
    const inviteUrl = `${baseUrl}/coach/invite/${inviteToken}`;

    // Send invite email
    await sendEmail({
      to: coachClient.inviteEmail!,
      subject: `${coachClient.coach.name || 'A coach'} invited you to BAISICS`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; margin: 0; color: #111;">You've been invited!</h1>
          </div>

          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            <strong>${coachClient.coach.name || 'A fitness coach'}</strong> has invited you to join them on BAISICS -
            an AI-powered fitness platform.
          </p>

          <p style="font-size: 16px; color: #444; line-height: 1.6;">
            By accepting this invite, you'll get access to personalized workout programs and your coach
            will be able to track your progress and provide guidance.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${inviteUrl}"
               style="display: inline-block; background: #4f46e5; color: white; padding: 14px 32px;
                      border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 16px;">
              Accept Invite
            </a>
          </div>

          <p style="font-size: 14px; color: #888; text-align: center;">
            Or copy this link: ${inviteUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;">

          <p style="font-size: 12px; color: #888; text-align: center;">
            This invite was sent by BAISICS on behalf of ${coachClient.coach.name || 'a coach'}.
            <br>If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Invite sent successfully',
    });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}

// GET - Accept invite (by token)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const coachClient = await prisma.coachClient.findUnique({
      where: { inviteToken: token },
      include: {
        coach: {
          select: { name: true, email: true },
        },
      },
    });

    if (!coachClient) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (coachClient.inviteStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invite already used or expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coach: coachClient.coach,
      inviteEmail: coachClient.inviteEmail,
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
