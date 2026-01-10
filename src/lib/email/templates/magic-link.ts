import { createEmailLayout } from './layout';

interface MagicLinkEmailData {
  signInLink: string;
}

export const magicLinkTemplate = ({ signInLink }: MagicLinkEmailData) => {
  const content = `
    <h1 style="color: #0F172A; font-size: 28px; font-weight: bold; margin: 0 0 24px;">
      Your sign-in link is ready
    </h1>
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Click the button below to securely sign in to your baisics account.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${signInLink}" style="
        display: inline-block;
        padding: 16px 40px;
        background: linear-gradient(to right, #FF6B6B, #FF8E8E);
        color: #ffffff;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 18px;
        box-shadow: 0 10px 15px -3px rgba(255, 107, 107, 0.25);
      ">
        Sign In to baisics →
      </a>
    </div>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #F1F5F9;">
      This link expires in 24 hours for your security. If you didn't request this email, you can safely ignore it.
    </p>
  `;

  return createEmailLayout({
    subject: 'Sign in to baisics',
    preheader: 'Your secure sign-in link is ready - click to access your account',
    content,
  });
}; 