export const adminSignupNotificationTemplate = (data: { 
  userEmail: string, 
  isPremium: boolean, 
  userId: string,
  programId?: string 
}) => {
  // const userLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${data.userId}`;
  // <p>👤 <a href="${userLink}" style="color: #4f46e5;">View User Profile</a></p>

  const programLink = data.programId ? `${process.env.NEXT_PUBLIC_APP_URL}/hi?userId=${data.userId}&programId=${data.programId}` : 'No program';

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
        <p>📊 <a href="${programLink}" style="color: #4f46e5;">View Program</a></p>
      </div>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
      
      <p style="color: #64748b; font-size: 14px;">
        This is an automated notification from Baisics.
      </p>
    </div>
  `;
}; 