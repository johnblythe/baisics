import { createEmailLayout } from './layout';

interface WorkoutReminderData {
  userName: string;
  workoutName: string;
  streak: number;
}

export function createWorkoutReminderEmail(data: WorkoutReminderData): string {
  const { userName, workoutName, streak } = data;

  // Dynamic motivational messages based on streak
  const getMotivationalMessage = (streakDays: number): string => {
    if (streakDays >= 14) return "You're on fire! Keep that momentum going.";
    if (streakDays >= 7) return "A week strong! Champions are made in moments like this.";
    if (streakDays >= 3) return "You're building something great. Don't stop now!";
    return "Every rep counts. Let's make today count.";
  };

  // Streak badge for users with active streaks
  const streakBadge = streak > 0
    ? `<div style="
        display: inline-block;
        background: linear-gradient(135deg, #FF6B6B 0%, #EF5350 100%);
        color: #FFFFFF;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 700;
        margin: 0 0 24px;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);
      ">
        🔥 ${streak} DAY STREAK
      </div>`
    : '';

  const content = `
    <h1 style="
      color: #0F172A;
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 8px;
      line-height: 1.2;
    ">
      Time to crush it, ${userName}! 💪
    </h1>

    <p style="color: #94A3B8; font-size: 14px; margin: 0 0 24px; text-transform: uppercase; letter-spacing: 1px;">
      Your workout is ready
    </p>

    ${streakBadge}

    <div style="
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    ">
      <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
        Today's Workout
      </p>
      <p style="
        color: #FFFFFF;
        font-size: 24px;
        font-weight: 800;
        margin: 0;
      ">
        <span style="color: #FF6B6B;">${workoutName}</span>
      </p>
    </div>

    <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0 0 16px;">
      ${getMotivationalMessage(streak)}
    </p>

    <p style="
      color: #94A3B8;
      font-size: 14px;
      line-height: 1.6;
      margin: 24px 0 0;
      padding-top: 16px;
      border-top: 1px solid #F1F5F9;
    ">
      <strong style="color: #0F172A;">Not feeling 100%?</strong> That's okay—even a light session keeps the momentum going. Show up, do what you can, and call it a win. 🏆
    </p>
  `;

  // Dynamic subject line based on streak
  const subject = streak > 0
    ? `🔥 ${streak}-day streak! Time for ${workoutName}`
    : `💪 Let's go, ${userName}! ${workoutName} awaits`;

  const preheader = streak > 0
    ? `Keep your ${streak}-day streak alive with today's workout`
    : `Your workout is ready and waiting. Let's crush it!`;

  return createEmailLayout({
    subject,
    preheader,
    content,
    callToAction: {
      text: "LET'S GO →",
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app'}/dashboard`
    }
  });
}
