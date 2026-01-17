import { NextResponse } from 'next/server';
import { sendAllWeeklySummaries, sendWeeklySummaryEmail } from '@/services/weeklySummary';

// Vercel cron service calls this endpoint
// Runs daily at 8am UTC - service filters by user's preferred day (Sunday or Monday)
// Does not stack with daily reminders (daily reminders run at 2pm UTC)

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access - fail closed if not configured
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('CRON_SECRET not configured - rejecting request');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get current day for logging
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[new Date().getDay()];

    const results = await sendAllWeeklySummaries();

    console.log(`Weekly summary emails (${currentDay}): ${results.sent} sent, ${results.failed} failed`);

    if (results.errors.length > 0) {
      console.error('Weekly summary errors:', results.errors);
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
      day: currentDay,
    });
  } catch (error) {
    console.error('Error sending weekly summaries:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send weekly summaries' },
      { status: 500 }
    );
  }
}

// POST endpoint for sending to a specific user (for testing or manual triggers)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, programId } = body;

    if (!userId || !programId) {
      return NextResponse.json(
        { error: 'userId and programId are required' },
        { status: 400 }
      );
    }

    const result = await sendWeeklySummaryEmail(userId, programId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending weekly summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send weekly summary' },
      { status: 500 }
    );
  }
}
