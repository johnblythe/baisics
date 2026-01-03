import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createWorkoutReminderEmail } from '@/lib/email/templates/workout-reminder';
import { startOfDay } from 'date-fns';

/**
 * Daily workout reminder cron endpoint
 * Sends reminders to users who:
 * 1. Have email reminders enabled
 * 2. Have a workout scheduled for today
 * 3. Haven't completed it yet
 *
 * Schedule: Run daily at 2pm UTC (configured in vercel.json)
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = startOfDay(new Date());
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find users with email reminders enabled who have workouts scheduled today
    const usersWithWorkouts = await prisma.user.findMany({
      where: {
        emailReminders: true,
        email: { not: null },
        programs: {
          some: {
            workoutPlans: {
              some: {
                workouts: {
                  some: {
                    dayNumber: dayOfWeek
                  }
                }
              }
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        streakCurrent: true,
        programs: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            workoutPlans: {
              take: 1,
              include: {
                workouts: {
                  where: { dayNumber: dayOfWeek },
                  take: 1
                }
              }
            }
          }
        },
        workoutLogs: {
          where: {
            completedAt: { gte: today }
          },
          take: 1
        }
      }
    });

    // Filter to users who haven't completed today's workout
    const usersNeedingReminder = usersWithWorkouts.filter(u =>
      u.workoutLogs.length === 0 &&
      u.programs[0]?.workoutPlans[0]?.workouts[0]
    );

    // Send emails with error handling
    const results = await Promise.allSettled(
      usersNeedingReminder.map(async (user) => {
        const workout = user.programs[0]?.workoutPlans[0]?.workouts[0];
        if (!workout || !user.email) return { skipped: true };

        const result = await sendEmail({
          to: user.email,
          subject: `Time to train: ${workout.name}`,
          html: createWorkoutReminderEmail({
            userName: user.name || 'there',
            workoutName: workout.name,
            streak: user.streakCurrent
          })
        });

        return result;
      })
    );

    const sent = results.filter(r =>
      r.status === 'fulfilled' &&
      r.value &&
      'success' in r.value &&
      r.value.success
    ).length;

    const failed = results.filter(r =>
      r.status === 'rejected' ||
      (r.status === 'fulfilled' && r.value && 'success' in r.value && !r.value.success)
    ).length;

    console.log(`Daily workout reminders: ${sent} sent, ${failed} failed out of ${usersNeedingReminder.length} users`);

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: usersNeedingReminder.length,
      dayOfWeek
    });
  } catch (error) {
    console.error('Error sending daily reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send daily reminders' },
      { status: 500 }
    );
  }
}
