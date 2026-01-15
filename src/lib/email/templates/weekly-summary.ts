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
    if (streak >= 4) return "Unstoppable. Perfect week AND a killer streak. You're built different. 🔥";
    return "PERFECT WEEK. You showed up every single time. That's how champions are made.";
  }
  if (completionRate >= 75) {
    return "Strong showing! You're building serious momentum. Keep stacking those wins.";
  }
  if (completionRate >= 50) {
    return "You put in the work when it counted. Every rep is progress. Next week? Let's go harder.";
  }
  if (completionRate > 0) {
    return "Life threw punches but you still showed up. That's what counts. Next week is yours.";
  }
  return "Fresh week, fresh start. Your program is ready when you are. Let's make it happen.";
};

export const createWeeklySummaryEmail = (data: WeeklySummaryData) => {
  const completionRate = data.workoutsPlanned > 0
    ? Math.round((data.workoutsCompleted / data.workoutsPlanned) * 100)
    : 0;

  const motivationalMessage = data.motivationalMessage || getMotivationalMessage(completionRate, data.streak);

  const weightSection = data.weightChange ? `
    <div style="background: linear-gradient(135deg, #F8FAFC, #FFFFFF); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #FF6B6B;">
      <h3 style="margin: 0 0 16px; color: #0F172A; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📊 Weight Progress</h3>
      <table width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="vertical-align: bottom;">
            <span style="font-size: 36px; font-weight: 800; color: #0F172A;">${data.weightChange.current}</span>
            <span style="color: #94A3B8; font-size: 16px; font-weight: 500;"> lbs</span>
          </td>
          <td style="text-align: right; vertical-align: bottom;">
            <span style="font-size: 18px; color: ${data.weightChange.change < 0 ? '#10b981' : data.weightChange.change > 0 ? '#FF6B6B' : '#94A3B8'}; font-weight: 700;">
              ${data.weightChange.change > 0 ? '+' : ''}${data.weightChange.change.toFixed(1)} lbs
            </span>
            <div style="color: #94A3B8; font-size: 13px; margin-top: 2px;">vs last week</div>
          </td>
        </tr>
      </table>
    </div>
  ` : '';

  const nextWorkoutSection = data.nextWorkout ? `
    <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 12px; padding: 24px; margin: 24px 0; color: white;">
      <h3 style="margin: 0 0 12px; font-size: 14px; color: #FF6B6B; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">🎯 Next Up</h3>
      <div style="font-size: 22px; font-weight: 800; margin-bottom: 6px; color: #FFFFFF;">
        Day ${data.nextWorkout.dayNumber}: ${data.nextWorkout.name}
      </div>
      <div style="color: rgba(255,255,255,0.8); font-size: 15px;">${data.nextWorkout.focus}</div>
    </div>
  ` : '';

  const streakSection = data.streak > 1 ? `
    <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #FFE5E5, #FFF5F5); border-radius: 12px; margin: 24px 0; border: 2px solid #FF6B6B;">
      <span style="font-size: 40px;">🔥</span>
      <div style="font-size: 28px; font-weight: 800; color: #FF6B6B; margin-top: 8px;">${data.streak} WEEK STREAK!</div>
      <div style="color: #0F172A; font-size: 15px; font-weight: 500; margin-top: 4px;">You're absolutely crushing it.</div>
    </div>
  ` : '';

  const content = `
    <h1 style="color: #0F172A; font-size: 32px; font-weight: 800; margin: 0 0 16px; line-height: 1.2;">
      Week ${data.weekNumber}: <span style="color: #FF6B6B;">The Recap</span> 📈
    </h1>
    <p style="color: #475569; font-size: 17px; line-height: 1.7; margin: 0 0 28px;">
      ${data.userName}, here's how you crushed <span style="color: #FF6B6B; font-weight: 600;">${data.programName}</span> this week:
    </p>

    <!-- Stats Grid -->
    <table width="100%" style="margin: 24px 0; border-collapse: separate; border-spacing: 12px;">
      <tr>
        <td style="background: linear-gradient(135deg, #FFE5E5, #FFF5F5); border-radius: 12px; padding: 24px; text-align: center; width: 50%;">
          <div style="font-size: 40px; font-weight: 800; color: #FF6B6B;">${data.workoutsCompleted}/${data.workoutsPlanned}</div>
          <div style="color: #0F172A; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Workouts</div>
        </td>
        <td style="background: linear-gradient(135deg, #ECFDF5, #F0FDF4); border-radius: 12px; padding: 24px; text-align: center; width: 50%;">
          <div style="font-size: 40px; font-weight: 800; color: #10b981;">${completionRate}%</div>
          <div style="color: #0F172A; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Completion</div>
        </td>
      </tr>
      <tr>
        <td style="background: linear-gradient(135deg, #F8FAFC, #F1F5F9); border-radius: 12px; padding: 24px; text-align: center; width: 50%;">
          <div style="font-size: 40px; font-weight: 800; color: #0F172A;">${data.totalExercises}</div>
          <div style="color: #475569; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Exercises Done</div>
        </td>
        <td style="background: ${data.checkInCompleted ? 'linear-gradient(135deg, #ECFDF5, #F0FDF4)' : 'linear-gradient(135deg, #FEF2F2, #FFF5F5)'}; border-radius: 12px; padding: 24px; text-align: center; width: 50%;">
          <div style="font-size: 40px;">${data.checkInCompleted ? '✓' : '○'}</div>
          <div style="color: ${data.checkInCompleted ? '#10b981' : '#EF5350'}; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            Check-in ${data.checkInCompleted ? 'Done' : 'Pending'}
          </div>
        </td>
      </tr>
    </table>

    ${weightSection}
    ${streakSection}
    ${nextWorkoutSection}

    <div style="background: linear-gradient(135deg, #F8FAFC, #FFFFFF); border-left: 4px solid #FF6B6B; padding: 20px 24px; margin: 28px 0; border-radius: 0 12px 12px 0;">
      <p style="margin: 0; color: #0F172A; font-size: 16px; font-weight: 500; line-height: 1.6;">"${motivationalMessage}"</p>
    </div>
  `;

  return {
    subject: completionRate === 100
      ? `🔥 Week ${data.weekNumber}: Perfect Score!`
      : `📈 Week ${data.weekNumber}: ${data.workoutsCompleted}/${data.workoutsPlanned} workouts crushed`,
    html: createEmailLayout({
      subject: `Week ${data.weekNumber} Summary`,
      preheader: completionRate === 100
        ? `Perfect week! You crushed all ${data.workoutsPlanned} workouts.`
        : `You completed ${data.workoutsCompleted} workouts this week. Let's keep the momentum going!`,
      content,
      callToAction: data.nextWorkout ? {
        text: 'CRUSH YOUR NEXT WORKOUT →',
        url: 'https://baisics.app/dashboard',
      } : {
        text: 'VIEW YOUR PROGRESS →',
        url: 'https://baisics.app/dashboard',
      },
    }),
    text: `
WEEK ${data.weekNumber} RECAP - ${data.programName}

${data.userName}, here's how you crushed it:

📊 THE NUMBERS:
• Workouts: ${data.workoutsCompleted}/${data.workoutsPlanned} (${completionRate}%)
• Exercises Done: ${data.totalExercises}
• Check-in: ${data.checkInCompleted ? '✓ Done' : '○ Pending'}
${data.weightChange ? `• Weight: ${data.weightChange.current} lbs (${data.weightChange.change > 0 ? '+' : ''}${data.weightChange.change.toFixed(1)} from last week)` : ''}
${data.streak > 1 ? `\n🔥 ${data.streak} WEEK STREAK! Keep it going!` : ''}

"${motivationalMessage}"

${data.nextWorkout ? `🎯 NEXT UP: Day ${data.nextWorkout.dayNumber} - ${data.nextWorkout.name} (${data.nextWorkout.focus})` : ''}

Let's keep crushing it.
- The Baisics Team

https://baisics.app/dashboard
    `.trim(),
  };
};
