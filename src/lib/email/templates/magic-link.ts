import { createEmailLayout } from './layout';

interface MagicLinkEmailData {
  signInLink: string;
}

export const magicLinkTemplate = ({ signInLink }: MagicLinkEmailData) => {
  const content = `
    <h1 style="color: #0F172A; font-size: 32px; font-weight: 800; margin: 0 0 16px; line-height: 1.2;">
      Ready to crush it? 💪
    </h1>
    <p style="color: #475569; font-size: 18px; line-height: 1.6; margin: 0 0 32px;">
      Your <span style="color: #FF6B6B; font-weight: 600;">one-click login</span> is waiting.
      No passwords, no hassle—just you and your goals.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${signInLink}" style="
        display: inline-block;
        padding: 18px 48px;
        background-color: #FF6B6B;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 18px;
        box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);
        text-transform: uppercase;
        letter-spacing: 1px;
      ">
        Let's Go →
      </a>
    </div>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 32px 0 0; padding-top: 24px; border-top: 1px solid #F1F5F9;">
      <strong style="color: #0F172A;">Heads up:</strong> This link expires in 24 hours.
      Didn't request this? No worries—just ignore this email.
    </p>
  `;

  return createEmailLayout({
    subject: 'Your login link is ready! 🚀',
    preheader: 'One click and you\'re in—let\'s get back to your fitness journey',
    content,
  });
}; 