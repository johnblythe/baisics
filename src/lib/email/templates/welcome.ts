import { createEmailLayout } from './layout';

interface WelcomeEmailData {
  userName?: string;
  upgradeLink?: string;
  programLink?: string;
}

export const welcomeFreeTemplate = ({ userName, upgradeLink, programLink }: WelcomeEmailData) => {
  const greeting = userName ? `${userName}, you're in!` : "You're in!";

  const content = `
    <h1 style="color: #0F172A; font-size: 32px; font-weight: 800; margin: 0 0 24px; line-height: 1.2;">
      ${greeting} <span style="color: #FF6B6B;">Let's crush it.</span> 💪
    </h1>
    <p style="color: #475569; font-size: 17px; line-height: 1.7; margin: 0 0 20px;">
      Welcome to baisics – <span style="color: #FF6B6B; font-weight: 600;">fitness for the rest of us</span>. No gym intimidation. No complicated routines. Just you, your goals, and a program built to actually work.
    </p>
    <p style="color: #0F172A; font-size: 18px; font-weight: 600; line-height: 1.6; margin: 0 0 24px;">
      Your personalized program is locked and loaded. Time to show up for yourself.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${programLink || 'https://baisics.app/dashboard'}" style="
        display: inline-block;
        padding: 18px 48px;
        background: #FF6B6B;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);
      ">
        START YOUR FIRST WORKOUT →
      </a>
    </div>
    <div style="background: linear-gradient(135deg, #F8FAFC, #FFFFFF); border-radius: 12px; padding: 28px; margin: 28px 0; border-left: 4px solid #FF6B6B;">
      <p style="color: #0F172A; font-weight: 700; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
        Your Game Plan:
      </p>
      <ul style="color: #475569; font-size: 16px; line-height: 2; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Explore your program</strong> – it's built around YOU</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Knock out workout #1</strong> – go at your own pace</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Track your wins</strong> – progress compounds fast</li>
      </ul>
    </div>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
      Questions? Hit reply – <span style="color: #FF6B6B;">real humans</span> check this inbox.
    </p>
  `;

  return createEmailLayout({
    subject: userName ? `${userName}, welcome to baisics! 🎉` : 'Welcome to baisics! 🎉',
    preheader: 'Your personalized fitness program is ready. Time to crush it.',
    content,
  });
};

export const welcomePremiumTemplate = ({ userName }: { userName?: string } = {}) => {
  const greeting = userName ? `${userName}, you're all in!` : "You're all in!";

  const content = `
    <h1 style="color: #0F172A; font-size: 32px; font-weight: 800; margin: 0 0 24px; line-height: 1.2;">
      ${greeting} <span style="color: #FF6B6B;">Welcome to the crew.</span> 🔥
    </h1>
    <p style="color: #475569; font-size: 17px; line-height: 1.7; margin: 0 0 20px;">
      You just unlocked the <span style="color: #FF6B6B; font-weight: 600;">full baisics experience</span>. This is where real progress happens – no compromises, no limits.
    </p>
    <p style="color: #0F172A; font-size: 18px; font-weight: 600; line-height: 1.6; margin: 0 0 24px;">
      Unlimited programs. Personalized nutrition. Everything you need to crush your goals.
    </p>
    <div style="background: linear-gradient(135deg, #FFE5E5, #FFF5F5); border-radius: 12px; padding: 28px; margin: 28px 0; border-left: 4px solid #FF6B6B;">
      <p style="color: #0F172A; font-weight: 700; font-size: 14px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
        Your Premium Arsenal:
      </p>
      <ul style="color: #475569; font-size: 16px; line-height: 2; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Unlimited programs</strong> – mix it up whenever you want</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">AI-powered nutrition</strong> – meals that match your goals</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Advanced tracking</strong> – see every win, every gain</li>
        <li style="margin-bottom: 8px;"><strong style="color: #0F172A;">Priority support</strong> – we've got your back, always</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app'}/dashboard" style="
        display: inline-block;
        padding: 18px 48px;
        background: #FF6B6B;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 14px 0 rgba(255, 107, 107, 0.39);
      ">
        LET'S GO →
      </a>
    </div>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 24px 0 0; text-align: center;">
      Questions? Hit reply – <span style="color: #FF6B6B;">real humans</span> check this inbox.
    </p>
  `;

  return createEmailLayout({
    subject: userName ? `${userName}, welcome to baisics premium! 🚀` : 'Welcome to baisics premium! 🚀',
    preheader: 'You just unlocked everything. Time to make serious moves.',
    content,
  });
};
