import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/user/notifications - Get user notification preferences
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailReminders: true,
        weeklySummaryEnabled: true,
        weeklySummaryDay: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      emailReminders: user.emailReminders,
      weeklySummaryEnabled: user.weeklySummaryEnabled,
      weeklySummaryDay: user.weeklySummaryDay,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/notifications - Update user notification preferences
export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emailReminders, weeklySummaryEnabled, weeklySummaryDay } = body;

    // Validate weeklySummaryDay if provided
    if (weeklySummaryDay !== undefined) {
      if (!['sunday', 'monday'].includes(weeklySummaryDay)) {
        return NextResponse.json(
          { error: 'weeklySummaryDay must be "sunday" or "monday"' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: {
      emailReminders?: boolean;
      weeklySummaryEnabled?: boolean;
      weeklySummaryDay?: string;
    } = {};

    if (typeof emailReminders === 'boolean') {
      updateData.emailReminders = emailReminders;
    }
    if (typeof weeklySummaryEnabled === 'boolean') {
      updateData.weeklySummaryEnabled = weeklySummaryEnabled;
    }
    if (weeklySummaryDay) {
      updateData.weeklySummaryDay = weeklySummaryDay;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        emailReminders: true,
        weeklySummaryEnabled: true,
        weeklySummaryDay: true,
      },
    });

    return NextResponse.json({
      success: true,
      emailReminders: user.emailReminders,
      weeklySummaryEnabled: user.weeklySummaryEnabled,
      weeklySummaryDay: user.weeklySummaryDay,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
