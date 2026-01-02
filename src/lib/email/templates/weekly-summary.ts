import { createEmailLayout } from './layout';

export interface WeeklySummaryData {
  userName: string;
  weekNumber: number;
  programName: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  totalExercises: number;
  checkInCompleted: boolean;
  weightChange?: {
    current: number;
    previous: number;
    change: number;
  };
  nextWorkout?: {
    name: string;
    dayNumber: number;
    focus: string;
  };
  streak: number;
  motivationalMessage: string;
}

const getMotivationalMessage = (completionRate: number, streak: number): string => {
  if (completionRate === 100) {
    if (streak >= 4) return "You're on fire! Perfect week and an incredible streak. Keep dominating!";
    return "Perfect week! You crushed every single workout. Amazing dedication!";
  }
  if (completionRate >= 75) {
    return "Great progress this week! You're building solid habits. Keep pushing!";
  }
  if (completionRate >= 50) {
    return "You showed up and put in the work. Every workout counts toward your goals!";
  }
  if (completionRate > 0) {
    return "Life happens, but you still made progress. Let's make next week even stronger!";
  }
  return "A new week is a fresh start. Your program is waiting for you - let's get back at it!";
};

export const createWeeklySummaryEmail = (data: WeeklySummaryData) => {
  const completionRate = data.workoutsPlanned > 0
    ? Math.round((data.workoutsCompleted / data.workoutsPlanned) * 100)
    : 0;

  const motivationalMessage = data.motivationalMessage || getMotivationalMessage(completionRate, data.streak);

  const weightSection = data.weightChange ? `
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 12px; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Weight Progress</h3>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 28px; font-weight: bold; color: #1f2937;">${data.weightChange.current}</span>
          <span style="color: #6b7280; font-size: 14px;"> lbs</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 16px; color: ${data.weightChange.change < 0 ? '#10b981' : data.weightChange.change > 0 ? '#ef4444' : '#6b7280'}; font-weight: 600;">
            ${data.weightChange.change > 0 ? '+' : ''}${data.weightChange.change.toFixed(1)} lbs
          </span>
          <div style="color: #9ca3af; font-size: 12px;">vs last week</div>
        </div>
      </div>
    </div>
  ` : '';

  const nextWorkoutSection = data.nextWorkout ? `
    <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 12px; padding: 20px; margin: 20px 0; color: white;">
      <h3 style="margin: 0 0 8px; font-size: 14px; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Next Up</h3>
      <div style="font-size: 20px; font-weight: bold; margin-bottom: 4px;">
        Day ${data.nextWorkout.dayNumber}: ${data.nextWorkout.name}
      </div>
      <div style="opacity: 0.9; font-size: 14px;">${data.nextWorkout.focus}</div>
    </div>
  ` : '';

  const streakSection = data.streak > 1 ? `
    <div style="text-align: center; padding: 16px; background-color: #fef3c7; border-radius: 12px; margin: 20px 0;">
      <span style="font-size: 32px;">🔥</span>
      <div style="font-size: 24px; font-weight: bold; color: #92400e;">${data.streak} Week Streak!</div>
      <div style="color: #b45309; font-size: 14px;">Keep it going!</div>
    </div>
  ` : '';

  const content = `
    <h1>Week ${data.weekNumber} Summary</h1>
    <p>Hey ${data.userName}! Here's how you did on <strong>${data.programName}</strong> this week:</p>

    <!-- Stats Grid -->
    <table width="100%" style="margin: 24px 0; border-collapse: separate; border-spacing: 12px;">
      <tr>
        <td style="background-color: #FFE5E5; border-radius: 12px; padding: 20px; text-align: center; width: 50%;">
          <div style="font-size: 36px; font-weight: bold; color: #FF6B6B;">${data.workoutsCompleted}/${data.workoutsPlanned}</div>
          <div style="color: #EF5350; font-size: 14px; margin-top: 4px;">Workouts</div>
        </td>
        <td style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; text-align: center; width: 50%;">
          <div style="font-size: 36px; font-weight: bold; color: #16a34a;">${completionRate}%</div>
          <div style="color: #22c55e; font-size: 14px; margin-top: 4px;">Completion</div>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F1F5F9; border-radius: 12px; padding: 20px; text-align: center; width: 50%;">
          <div style="font-size: 36px; font-weight: bold; color: #0F172A;">${data.totalExercises}</div>
          <div style="color: #475569; font-size: 14px; margin-top: 4px;">Exercises Done</div>
        </td>
        <td style="background-color: ${data.checkInCompleted ? '#f0fdf4' : '#fef2f2'}; border-radius: 12px; padding: 20px; text-align: center; width: 50%;">
          <div style="font-size: 36px;">${data.checkInCompleted ? '✓' : '○'}</div>
          <div style="color: ${data.checkInCompleted ? '#16a34a' : '#dc2626'}; font-size: 14px; margin-top: 4px;">
            Check-in ${data.checkInCompleted ? 'Done' : 'Pending'}
          </div>
        </td>
      </tr>
    </table>

    ${weightSection}
    ${streakSection}
    ${nextWorkoutSection}

    <div style="background-color: #f9fafb; border-left: 4px solid #FF6B6B; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #374151; font-style: italic;">"${motivationalMessage}"</p>
    </div>
  `;

  return {
    subject: `Week ${data.weekNumber} Summary: ${data.workoutsCompleted}/${data.workoutsPlanned} workouts completed`,
    html: createEmailLayout({
      subject: `Week ${data.weekNumber} Summary`,
      preheader: `You completed ${data.workoutsCompleted} workouts this week!`,
      content,
      callToAction: data.nextWorkout ? {
        text: 'Start Next Workout',
        url: 'https://baisics.app/dashboard',
      } : {
        text: 'View Dashboard',
        url: 'https://baisics.app/dashboard',
      },
    }),
    text: `
Week ${data.weekNumber} Summary for ${data.programName}

Hi ${data.userName}!

Workouts: ${data.workoutsCompleted}/${data.workoutsPlanned} (${completionRate}%)
Exercises Completed: ${data.totalExercises}
Check-in: ${data.checkInCompleted ? 'Completed' : 'Pending'}
${data.weightChange ? `Weight: ${data.weightChange.current} lbs (${data.weightChange.change > 0 ? '+' : ''}${data.weightChange.change.toFixed(1)} lbs from last week)` : ''}
${data.streak > 1 ? `Streak: ${data.streak} weeks!` : ''}

${motivationalMessage}

${data.nextWorkout ? `Next workout: Day ${data.nextWorkout.dayNumber} - ${data.nextWorkout.name} (${data.nextWorkout.focus})` : ''}

Keep it up!
- The Baisics Team
    `.trim(),
  };
};
