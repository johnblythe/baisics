import { createEmailLayout } from './layout';

interface WelcomeEmailData {
  upgradeLink?: string;
  programLink?: string;
}

export const welcomeFreeTemplate = ({ upgradeLink, programLink }: WelcomeEmailData) => {
  const content = `
    <h1>Welcome to Baisics!</h1>
    <p>Thank you for joining us! We're excited to help you start your fitness journey.</p>
    <p><a style="color: #cdcdcd; text-decoration: underline;" href="${programLink}">Your custom program's first phase</a> is ready for you to begin.</p>
  `;

  return createEmailLayout({
    subject: 'Welcome to Baisics!',
    preheader: 'Your fitness journey begins now',
    content,
    callToAction: upgradeLink ? {
      text: 'Upgrade to Premium',
      url: upgradeLink
    } : undefined
  });
};

export const welcomePremiumTemplate = () => {
  const content = `
    <h1>Welcome to Baisics Premium!</h1>
    <p>Thank you for starting your premium journey with us. We're excited to help you achieve your fitness goals!</p>
    <p>Here's what you can expect next:</p>
    <ul style="color: #4b5563; padding-left: 20px; margin-bottom: 24px;">
      <li style="list-style-type: disc; margin-bottom: 4px;">Access to unlimited custom programs</li>
      <li style="list-style-type: disc; margin-bottom: 4px;">Personalized nutrition and meal planning</li>
      <li style="list-style-type: disc; margin-bottom: 4px;">Advanced progress tracking</li>
      <li style="list-style-type: disc; margin-bottom: 4px;">Priority support</li>
    </ul>
    <p>Let's <a style="color: #cdcdcd; text-decoration: underline;" href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">get started</a> on your fitness journey!</p>
  `;

  return createEmailLayout({
    subject: 'Welcome to Baisics Premium!',
    preheader: 'Your premium fitness journey begins now',
    content,
    callToAction: {
      text: 'Start Your Journey',
      url: 'https://baisics.app/dashboard'
    }
  });
}; 