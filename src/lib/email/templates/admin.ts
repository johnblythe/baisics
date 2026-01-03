export const adminSignupNotificationTemplate = (data: { 
  userEmail: string, 
  isPremium: boolean, 
  userId: string,
  programId?: string 
}) => {
  // const userLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${data.userId}`;
  // <p>👤 <a href="${userLink}" style="color: #FF6B6B;">View User Profile</a></p>

  const programLink = data.programId ? `${process.env.NEXT_PUBLIC_APP_URL}/program/review?userId=${data.userId}&programId=${data.programId}` : 'No program';

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🎉 New User Signup!</h2>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <p><strong>User Details:</strong></p>
        <ul style="list-style: none; padding: 0;">
          <li>📧 Email: ${data.userEmail}</li>
          <li>⭐ Plan: ${data.isPremium ? 'Premium' : 'Free'}</li>
          <li>🆔 User ID: ${data.userId}</li>
          <li>📋 Program: ${data.programId || 'No program'}</li>
        </ul>
      </div>

      <div style="margin-top: 20px;">
        <p><strong>Quick Links:</strong></p>
        <p>📊 <a href="${programLink}" style="color: #FF6B6B;">View Program</a></p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
      
      <p style="color: #64748b; font-size: 14px;">
        This is an automated notification from Baisics.
      </p>
    </div>
  `;
}; 

export const adminToolUsageTemplate = (data: {
  toolName: string;
  userId?: string;
  userEmail?: string | null;
  details?: Record<string, unknown>;
}) => {
  const detailsHtml = data.details
    ? Object.entries(data.details)
        .map(([key, value]) => `<li>${key}: ${JSON.stringify(value)}</li>`)
        .join('')
    : '';

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🛠️ Free Tool Used: ${data.toolName}</h2>

      <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <p><strong>Usage Details:</strong></p>
        <ul style="list-style: none; padding: 0;">
          <li>🛠️ Tool: ${data.toolName}</li>
          <li>👤 User: ${data.userEmail || data.userId || 'Anonymous'}</li>
          <li>🕐 Time: ${new Date().toISOString()}</li>
        </ul>
        ${detailsHtml ? `<p><strong>Additional Details:</strong></p><ul>${detailsHtml}</ul>` : ''}
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />

      <p style="color: #64748b; font-size: 14px;">
        This is an automated notification from Baisics.
      </p>
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

  const formatWorkout = (workout: typeof data.workoutPlans[0]['workouts'][0]) => {
    return `
      <div style="margin-left: 20px; margin-bottom: 10px;">
        <p style="margin: 5px 0;"><strong>${workout.name || 'Unnamed Workout'}</strong> (${workout.focus})</p>
        <ul style="margin: 5px 0; padding-left: 20px;">
          ${workout.exercises.map(ex => {
            const measure = ex.measureType === 'REPS' 
              ? `${ex.reps} reps`
              : `${ex.measureValue}${ex.measureUnit?.toLowerCase() || ''}`;
            return `<li>${ex.name}: ${ex.sets} sets × ${measure}</li>`;
          }).join('')}
        </ul>
      </div>
    `;
  };

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>🏋️‍♂️ New Program Created!</h2>
      
      <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
        <p><strong>Program Details:</strong></p>
        <ul style="list-style: none; padding: 0;">
          <li>📝 Name: ${data.programName}</li>
          <li>📋 Description: ${data.programDescription}</li>
          <li>👤 User: ${data.userEmail || data.userId}</li>
          <li>🆔 Program ID: ${data.programId}</li>
        </ul>
      </div>

      <div style="margin: 20px 0;">
        <p><strong>Program Structure:</strong></p>
        ${data.workoutPlans.map(phase => `
          <div style="margin: 15px 0; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
            <p><strong>Phase ${phase.phase}</strong></p>
            <ul style="list-style: none; padding: 0;">
              <li>🗓 Days per week: ${phase.daysPerWeek}</li>
              <li>🍽 Daily calories: ${phase.dailyCalories}</li>
              <li>🥩 Protein: ${phase.proteinGrams}g</li>
              <li>🍚 Carbs: ${phase.carbGrams}g</li>
              <li>🥑 Fats: ${phase.fatGrams}g</li>
            </ul>
            ${phase.phaseExplanation ? `<p><em>${phase.phaseExplanation}</em></p>` : ''}
            <div style="margin-top: 10px;">
              <p><strong>Workouts:</strong></p>
              ${phase.workouts.map(formatWorkout).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 20px;">
        <p><strong>Quick Links:</strong></p>
        <p>📊 <a href="${programLink}" style="color: #FF6B6B;">View Program</a></p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
      
      <p style="color: #64748b; font-size: 14px;">
        This is an automated notification from Baisics.
      </p>
    </div>
  `;
}; 