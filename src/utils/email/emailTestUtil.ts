import { sendEmail, EmailOptions } from '@/lib/email';

export const testEmailService = async (testEmail: string) => {
  const testMessage: EmailOptions = {
    to: testEmail,
    subject: 'Test Email from Your App',
    text: 'This is a test email to verify the email service is working correctly.',
    html: `
      <h1>Test Email</h1>
      <p>This is a test email to verify the email service is working correctly.</p>
      <p>If you received this, the email service is properly configured!</p>
    `
  };

  console.log('Sending test email to:', testEmail);
  const result = await sendEmail(testMessage);
  
  if (result.success) {
    console.log('Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    return result;
  } else {
    console.error('Test email failed:', result.error);
    throw result.error;
  }
};

(async () => {
  await testEmailService('johnblythe@gmail.com');
})();
