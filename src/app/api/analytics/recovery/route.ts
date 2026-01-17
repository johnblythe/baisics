import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface RecoveryAnalyticsPayload {
  programId: string;
  action: 'screen_shown' | 'option_selected' | 'workout_completed';
  option?: 'full' | 'quick' | 'not_today';
  daysMissed: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body: RecoveryAnalyticsPayload = await req.json();

    // Log to app_logs table for analytics
    await prisma.appLog.create({
      data: {
        level: 'INFO',
        category: 'recovery_flow',
        type: body.action,
        message: `Recovery flow: ${body.action}${body.option ? ` - ${body.option}` : ''}`,
        metadata: {
          programId: body.programId,
          daysMissed: body.daysMissed,
          option: body.option,
        },
        userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging recovery analytics:', error);
    return NextResponse.json(
      { error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}
