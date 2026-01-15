/**
 * Admin Email Templates (v2a Design System)
 * Clean, scannable layouts with coral highlights for important data
 * Colors: Navy (#0F172A), Coral (#FF6B6B), White (#FFFFFF)
 * Font: Outfit (inherited from base layout)
 */

export const adminSignupNotificationTemplate = (data: {
  userEmail: string,
  isPremium: boolean,
  userId: string,
  programId?: string
}) => {
  const programLink = data.programId
    ? `${process.env.NEXT_PUBLIC_APP_URL}/program/review?userId=${data.userId}&programId=${data.programId}`
    : null;

  return `
    <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #FFFFFF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-radius: 20px;">
          NEW SIGNUP
        </span>
      </div>

      <!-- Main Card -->
      <div style="background: linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%); border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden;">
        <!-- Card Header -->
        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 20px 24px; border-bottom: 3px solid #FF6B6B;">
          <h2 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800;">
            ${data.isPremium ? 'Premium' : 'Free'} User Joined
          </h2>
        </div>

        <!-- User Details Grid -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
            <tr>
              <td style="padding: 16px; background: #F8FAFC; border-radius: 8px; width: 50%;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">EMAIL</div>
                <div style="font-size: 14px; font-weight: 600; color: #0F172A; word-break: break-all;">${data.userEmail}</div>
              </td>
              <td style="width: 12px;"></td>
              <td style="padding: 16px; background: ${data.isPremium ? 'linear-gradient(135deg, #FF6B6B 0%, #EF5350 100%)' : '#F8FAFC'}; border-radius: 8px; width: 50%;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${data.isPremium ? 'rgba(255,255,255,0.8)' : '#94A3B8'}; margin-bottom: 4px;">PLAN</div>
                <div style="font-size: 14px; font-weight: 700; color: ${data.isPremium ? '#FFFFFF' : '#0F172A'};">${data.isPremium ? 'PREMIUM' : 'FREE'}</div>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px; background: #F8FAFC; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">USER ID</div>
                <div style="font-size: 12px; font-family: 'Space Mono', monospace; color: #475569;">${data.userId}</div>
              </td>
              <td style="width: 12px;"></td>
              <td style="padding: 16px; background: #F8FAFC; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">PROGRAM</div>
                <div style="font-size: 12px; font-family: 'Space Mono', monospace; color: #475569;">${data.programId || '—'}</div>
              </td>
            </tr>
          </table>
        </div>

        ${programLink ? `
        <!-- Quick Action -->
        <div style="padding: 0 24px 24px; text-align: center;">
          <a href="${programLink}" style="display: inline-block; padding: 14px 28px; background: #FF6B6B; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);">
            VIEW PROGRAM &rarr;
          </a>
        </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          Automated notification from <span style="color: #FF6B6B; font-weight: 600;">baisics</span>
        </p>
      </div>
    </div>
  `;
};

export const adminToolUsageTemplate = (data: {
  toolName: string;
  userId?: string;
  userEmail?: string | null;
  details?: Record<string, unknown>;
}) => {
  const detailsRows = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `
          <tr>
            <td style="padding: 8px 12px; font-size: 12px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #F1F5F9;">${key}</td>
            <td style="padding: 8px 12px; font-size: 13px; font-family: 'Space Mono', monospace; color: #0F172A; border-bottom: 1px solid #F1F5F9;">${JSON.stringify(value)}</td>
          </tr>
        `)
        .join('')
    : '';

  return `
    <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #475569 0%, #64748B 100%); color: #FFFFFF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-radius: 20px;">
          TOOL USAGE
        </span>
      </div>

      <!-- Main Card -->
      <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden;">
        <!-- Tool Name Header -->
        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 20px 24px; border-bottom: 3px solid #FF6B6B;">
          <h2 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800;">
            <span style="color: #FF6B6B;">${data.toolName}</span>
          </h2>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.7); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Free Tool Used</p>
        </div>

        <!-- Usage Details -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
            <tr>
              <td style="padding: 16px; background: #F8FAFC; border-radius: 8px; width: 33%;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">USER</div>
                <div style="font-size: 14px; font-weight: 600; color: #0F172A; word-break: break-all;">${data.userEmail || data.userId || 'Anonymous'}</div>
              </td>
              <td style="width: 8px;"></td>
              <td style="padding: 16px; background: #F8FAFC; border-radius: 8px; width: 33%;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">TIMESTAMP</div>
                <div style="font-size: 13px; font-family: 'Space Mono', monospace; color: #0F172A;">${new Date().toISOString()}</div>
              </td>
            </tr>
          </table>

          ${data.details && Object.keys(data.details).length > 0 ? `
          <!-- Additional Details -->
          <div style="margin-top: 20px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0F172A; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #FF6B6B;">Additional Details</div>
            <table style="width: 100%; border-collapse: collapse;">
              ${detailsRows}
            </table>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          Automated notification from <span style="color: #FF6B6B; font-weight: 600;">baisics</span>
        </p>
      </div>
    </div>
  `;
};

export const adminProgramCreationTemplate = (data: {
  programId: string,
  programName: string,
  programDescription: string,
  userId: string,
  userEmail: string | null,
  workoutPlans: Array<{
    phase: number,
    daysPerWeek: number,
    dailyCalories: number,
    proteinGrams: number,
    carbGrams: number,
    fatGrams: number,
    phaseExplanation?: string,
    workouts: Array<{
      name: string,
      focus: string,
      exercises: Array<{
        name: string,
        sets: number,
        reps?: number,
        measureType?: string,
        measureValue?: number,
        measureUnit?: string
      }>
    }>
  }>
}) => {
  const programLink = `${process.env.NEXT_PUBLIC_APP_URL}/hi?userId=${data.userId}&programId=${data.programId}`;

  const formatWorkout = (workout: typeof data.workoutPlans[0]['workouts'][0], index: number) => {
    return `
      <div style="margin-bottom: 16px; padding: 16px; background: #FFFFFF; border-radius: 8px; border-left: 4px solid #FF6B6B;">
        <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">
          ${workout.name || `Workout ${index + 1}`}
          <span style="font-size: 12px; font-weight: 500; color: #94A3B8; margin-left: 8px;">${workout.focus}</span>
        </div>
        <div style="font-size: 12px; color: #475569;">
          ${workout.exercises.slice(0, 5).map(ex => {
            const measure = ex.measureType === 'REPS'
              ? `${ex.reps} reps`
              : `${ex.measureValue}${ex.measureUnit?.toLowerCase() || ''}`;
            return `<span style="display: inline-block; padding: 4px 8px; background: #F1F5F9; border-radius: 4px; margin: 2px 4px 2px 0;">${ex.name}: ${ex.sets}×${measure}</span>`;
          }).join('')}
          ${workout.exercises.length > 5 ? `<span style="color: #94A3B8;">+${workout.exercises.length - 5} more</span>` : ''}
        </div>
      </div>
    `;
  };

  return `
    <div style="font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Header Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, #FF6B6B 0%, #EF5350 100%); color: #FFFFFF; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-radius: 20px; box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);">
          NEW PROGRAM
        </span>
      </div>

      <!-- Main Card -->
      <div style="background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden;">
        <!-- Program Header -->
        <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 24px; border-bottom: 3px solid #FF6B6B;">
          <h2 style="margin: 0 0 8px 0; color: #FFFFFF; font-size: 24px; font-weight: 800;">
            ${data.programName}
          </h2>
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 14px; line-height: 1.5;">
            ${data.programDescription.substring(0, 150)}${data.programDescription.length > 150 ? '...' : ''}
          </p>
        </div>

        <!-- User & Program Info -->
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
            <tr>
              <td style="padding: 12px 16px; background: #F8FAFC; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">USER</div>
                <div style="font-size: 14px; font-weight: 600; color: #0F172A;">${data.userEmail || data.userId}</div>
              </td>
              <td style="width: 8px;"></td>
              <td style="padding: 12px 16px; background: #F8FAFC; border-radius: 8px;">
                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; margin-bottom: 4px;">PROGRAM ID</div>
                <div style="font-size: 12px; font-family: 'Space Mono', monospace; color: #475569;">${data.programId}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Phase Breakdown -->
        ${data.workoutPlans.map(phase => `
        <div style="padding: 0 24px 24px;">
          <!-- Phase Header -->
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <div style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #FFFFFF; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 14px;">
              PHASE ${phase.phase}
            </div>
            <div style="flex: 1; height: 2px; background: linear-gradient(to right, #0F172A, transparent); margin-left: 12px;"></div>
          </div>

          <!-- Phase Stats -->
          <table style="width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 16px;">
            <tr>
              <td style="padding: 12px; background: #F8FAFC; border-radius: 8px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #FF6B6B;">${phase.daysPerWeek}</div>
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8;">DAYS/WK</div>
              </td>
              <td style="padding: 12px; background: #F8FAFC; border-radius: 8px; text-align: center;">
                <div style="font-size: 20px; font-weight: 800; color: #0F172A;">${phase.dailyCalories}</div>
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8;">KCAL</div>
              </td>
              <td style="padding: 12px; background: #F8FAFC; border-radius: 8px; text-align: center;">
                <div style="font-size: 14px; font-weight: 700; color: #0F172A;">
                  <span style="color: #FF6B6B;">${phase.proteinGrams}P</span> / ${phase.carbGrams}C / ${phase.fatGrams}F
                </div>
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8;">MACROS (G)</div>
              </td>
            </tr>
          </table>

          ${phase.phaseExplanation ? `
          <div style="padding: 12px 16px; background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%); border-radius: 8px; border-left: 3px solid #94A3B8; margin-bottom: 16px;">
            <p style="margin: 0; font-size: 13px; color: #475569; font-style: italic; line-height: 1.5;">${phase.phaseExplanation}</p>
          </div>
          ` : ''}

          <!-- Workouts -->
          <div style="background: #F8FAFC; border-radius: 8px; padding: 16px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #0F172A; margin-bottom: 12px;">
              Workouts <span style="color: #FF6B6B;">(${phase.workouts.length})</span>
            </div>
            ${phase.workouts.map((workout, idx) => formatWorkout(workout, idx)).join('')}
          </div>
        </div>
        `).join('')}

        <!-- Quick Action -->
        <div style="padding: 0 24px 24px; text-align: center;">
          <a href="${programLink}" style="display: inline-block; padding: 14px 28px; background: #FF6B6B; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);">
            VIEW FULL PROGRAM &rarr;
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          Automated notification from <span style="color: #FF6B6B; font-weight: 600;">baisics</span>
        </p>
      </div>
    </div>
  `;
};
