import { createEmailLayout } from './layout';

interface MagicLinkEmailData {
  signInLink: string;
}

export const magicLinkTemplate = ({ signInLink }: MagicLinkEmailData) => {
  const content = `
    <h1>Sign in to baisics</h1>
    <p>Click the button below to sign in to your account.</p>
    <p>This link will expire shortly for security reasons. Please do not share this link with anyone.</p>
  `;

  return createEmailLayout({
    subject: 'Sign in to Baisics',
    preheader: 'Your sign-in link is ready',
    content,
    callToAction: {
      text: 'Sign In',
      url: signInLink
    }
  });
}; 