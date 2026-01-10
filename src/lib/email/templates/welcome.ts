import { createEmailLayout } from './layout';

interface WelcomeEmailData {
  upgradeLink?: string;
  programLink?: string;
}

export const welcomeFreeTemplate = ({ upgradeLink, programLink }: WelcomeEmailData) => {
  const content = `
    <h1 style="color: #0F172A; font-size: 28px; font-weight: bold; margin: 0 0 24px;">
      You're in! Let's do this 💪
    </h1>
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Welcome to baisics – where fitness gets simple. No complicated routines, no confusing programs. Just you and your goals.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Your custom program is ready and waiting. Time to see what you're made of.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${programLink || 'https://baisics.app/dashboard'}" style="
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
        Start Your First Workout →
      </a>
    </div>
    <div style="background: #F8FAFC; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="color: #0F172A; font-weight: 600; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">
        What's next:
      </p>
      <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Check out your personalized workout program</li>
        <li style="margin-bottom: 8px;">Complete your first workout at your own pace</li>
        <li style="margin-bottom: 8px;">Track your progress and watch it compound</li>
      </ul>
    </div>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
      Questions? Just reply to this email – we read every one.
    </p>
  `;

  return createEmailLayout({
    subject: 'Welcome to baisics – let\'s get started!',
    preheader: 'Your custom fitness program is ready. Time to make some progress.',
    content,
  });
};

export const welcomePremiumTemplate = () => {
  const content = `
    <h1 style="color: #0F172A; font-size: 28px; font-weight: bold; margin: 0 0 24px;">
      Welcome to the crew 🔥
    </h1>
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      You just unlocked the full baisics experience. This is where real progress happens.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
      Premium means unlimited programs, personalized nutrition, and all the tools you need to hit your goals. No limits.
    </p>
    <div style="background: linear-gradient(135deg, #FFE5E5, #FFF5F5); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="color: #0F172A; font-weight: 600; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 0.5px;">
        Your premium perks:
      </p>
      <ul style="color: #475569; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Unlimited programs</strong> – switch it up anytime</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">AI meal planning</strong> – nutrition that fits your goals</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Advanced tracking</strong> – see every gain</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Priority support</strong> – we've got your back</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app'}/dashboard" style="
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
        Start Training →
      </a>
    </div>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
      Got questions? Reply anytime – real humans check this inbox.
    </p>
  `;

  return createEmailLayout({
    subject: 'Welcome to baisics premium – let\'s go!',
    preheader: 'You just unlocked everything. Time to make some serious progress.',
    content,
  });
};
