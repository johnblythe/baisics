import { createEmailLayout } from './layout';

export interface ProgramCompletionEmailData {
  userName: string;
  programName: string;
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  durationWeeks: number;
  firstWeekVolume: number;
  finalWeekVolume: number;
  volumeGrowth: number;
  completionDate: string;
  programId: string;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M lbs`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K lbs`;
  }
  return `${Math.round(volume)} lbs`;
}

function getCompletionMessage(volumeGrowth: number, durationWeeks: number): string {
  if (volumeGrowth >= 50) {
    return `${volumeGrowth}% volume growth. You literally got stronger week after week. That's elite-level progress.`;
  }
  if (volumeGrowth >= 20) {
    return `+${volumeGrowth}% volume growth! Your consistency paid off with real, measurable gains.`;
  }
  if (durationWeeks >= 8) {
    return `${durationWeeks} weeks of dedicated training. You showed up when it mattered. That's what champions do.`;
  }
  return `You committed. You showed up. You finished. Most people can't say that. Now you can.`;
}

export const createProgramCompletionEmail = (data: ProgramCompletionEmailData) => {
  const completionMessage = getCompletionMessage(data.volumeGrowth, data.durationWeeks);

  const volumeComparisonSection = data.volumeGrowth !== 0 ? `
    <div style="background: linear-gradient(135deg, #F8FAFC, #FFFFFF); border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #FF6B6B;">
      <h3 style="margin: 0 0 16px; color: #0F172A; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">📊 Your Growth</h3>
      <table width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="text-align: center; padding: 12px;">
            <div style="color: #94A3B8; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Week 1</div>
            <div style="font-size: 24px; font-weight: 700; color: #0F172A;">${formatVolume(data.firstWeekVolume)}</div>
          </td>
          <td style="text-align: center; padding: 12px;">
            <div style="font-size: 32px; color: ${data.volumeGrowth > 0 ? '#10b981' : '#94A3B8'};">→</div>
          </td>
          <td style="text-align: center; padding: 12px;">
            <div style="color: #94A3B8; font-size: 12px; text-transform: uppercase; margin-bottom: 4px;">Final Week</div>
            <div style="font-size: 24px; font-weight: 700; color: #FF6B6B;">${formatVolume(data.finalWeekVolume)}</div>
          </td>
        </tr>
      </table>
      <div style="text-align: center; margin-top: 12px;">
        <span style="font-size: 18px; font-weight: 700; color: ${data.volumeGrowth > 0 ? '#10b981' : '#94A3B8'};">
          ${data.volumeGrowth > 0 ? '+' : ''}${data.volumeGrowth}% volume growth
        </span>
      </div>
    </div>
  ` : '';

  const content = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
      <h1 style="color: #0F172A; font-size: 36px; font-weight: 800; margin: 0 0 12px; line-height: 1.2;">
        Program Complete!
      </h1>
      <p style="color: #FF6B6B; font-size: 24px; font-weight: 700; margin: 0;">
        ${data.programName}
      </p>
    </div>

    <p style="color: #475569; font-size: 18px; line-height: 1.7; margin: 0 0 28px; text-align: center;">
      ${data.userName}, you did it. You finished what you started.
    </p>

    <!-- Stats Grid -->
    <table width="100%" style="margin: 24px 0; border-collapse: separate; border-spacing: 12px;">
      <tr>
        <td style="background: linear-gradient(135deg, #FFE5E5, #FFF5F5); border-radius: 12px; padding: 24px; text-align: center; width: 33%;">
          <div style="font-size: 40px; font-weight: 800; color: #FF6B6B;">${data.totalWorkouts}</div>
          <div style="color: #0F172A; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Workouts</div>
        </td>
        <td style="background: linear-gradient(135deg, #F8FAFC, #F1F5F9); border-radius: 12px; padding: 24px; text-align: center; width: 33%;">
          <div style="font-size: 40px; font-weight: 800; color: #0F172A;">${formatVolume(data.totalVolume)}</div>
          <div style="color: #475569; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Total Volume</div>
        </td>
        <td style="background: linear-gradient(135deg, #ECFDF5, #F0FDF4); border-radius: 12px; padding: 24px; text-align: center; width: 33%;">
          <div style="font-size: 40px; font-weight: 800; color: #10b981;">${data.durationWeeks}</div>
          <div style="color: #0F172A; font-size: 14px; font-weight: 600; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Weeks</div>
        </td>
      </tr>
    </table>

    ${volumeComparisonSection}

    <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 12px; padding: 28px; margin: 28px 0; text-align: center;">
      <p style="margin: 0; color: white; font-size: 18px; font-weight: 500; line-height: 1.6;">
        "${completionMessage}"
      </p>
    </div>

    <div style="background: linear-gradient(135deg, #FF6B6B, #EF5350); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <h3 style="margin: 0 0 12px; color: white; font-size: 18px; font-weight: 700;">What's Next?</h3>
      <p style="margin: 0 0 16px; color: rgba(255,255,255,0.9); font-size: 16px;">
        You've built momentum. Don't let it go to waste.
      </p>
    </div>
  `;

  return {
    subject: `🏆 You completed ${data.programName}!`,
    html: createEmailLayout({
      subject: `Program Complete: ${data.programName}`,
      preheader: `${data.totalWorkouts} workouts, ${formatVolume(data.totalVolume)} volume, ${data.durationWeeks} weeks. You crushed it.`,
      content,
      callToAction: {
        text: 'START YOUR NEXT PROGRAM →',
        url: `https://baisics.app/dashboard/${data.programId}`,
      },
    }),
    text: `
🏆 PROGRAM COMPLETE: ${data.programName}

${data.userName}, you did it. You finished what you started.

📊 YOUR STATS:
• Workouts: ${data.totalWorkouts}
• Total Volume: ${formatVolume(data.totalVolume)}
• Duration: ${data.durationWeeks} weeks
• Sets Logged: ${data.totalSets}
${data.volumeGrowth !== 0 ? `
📈 YOUR GROWTH:
Week 1: ${formatVolume(data.firstWeekVolume)} → Final Week: ${formatVolume(data.finalWeekVolume)}
${data.volumeGrowth > 0 ? '+' : ''}${data.volumeGrowth}% volume growth!
` : ''}

"${completionMessage}"

🚀 What's next? You've built momentum. Don't let it go to waste.

Start your next program: https://baisics.app/dashboard/${data.programId}

- The Baisics Team
    `.trim(),
  };
};
