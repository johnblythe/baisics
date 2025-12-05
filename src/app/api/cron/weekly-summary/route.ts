import { NextResponse } from 'next/server';
import { sendAllWeeklySummaries, sendWeeklySummaryEmail } from '@/services/weeklySummary';

// Vercel cron or external cron service should call this endpoint
// Recommended: Run on Monday mornings at 8am

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await sendAllWeeklySummaries();

    console.log(`Weekly summary emails: ${results.sent} sent, ${results.failed} failed`);

    if (results.errors.length > 0) {
      console.error('Weekly summary errors:', results.errors);
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
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
