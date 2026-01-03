import { createEmailLayout } from './layout';

interface WorkoutReminderData {
  userName: string;
  workoutName: string;
  streak: number;
}

export function createWorkoutReminderEmail(data: WorkoutReminderData): string {
  const { userName, workoutName, streak } = data;

  const streakText = streak > 0
    ? `<p style="color: #FF6B6B; font-size: 18px; font-weight: bold; margin: 0 0 20px;">
        🔥 ${streak} day streak
       </p>`
    : '';

  const content = `
    <h1 style="color: #0F172A; margin: 0 0 10px;">Hey ${userName}!</h1>
    ${streakText}
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      You've got <strong>${workoutName}</strong> on the schedule today.
    </p>
    <p style="color: #94A3B8; font-size: 14px; margin-top: 24px;">
      Don't feel like it? Even a light session keeps the momentum going.
    </p>
  `;

  return createEmailLayout({
    subject: `Time to train: ${workoutName}`,
    preheader: `Your workout for today: ${workoutName}`,
    content,
    callToAction: {
      text: 'Start Workout',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app'}/dashboard`
    }
  });
}
