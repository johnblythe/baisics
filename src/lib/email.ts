import nodemailer from 'nodemailer';

// Ensure this code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('Email functionality can only be used on the server side');
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

const emailConfig = {
  host: 'smtp.forwardemail.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// Only verify in development
if (process.env.NODE_ENV !== 'production') {
  transporter.verify(function(error, success) {
    if (error) {
      console.log('SMTP connection error:', error);
    } else {
      console.log('Server is ready to take our messages');
      // Log auth config (remove in production)
      console.log('Auth config:', {
        user: emailConfig.auth.user,
        passLength: emailConfig.auth.pass ? emailConfig.auth.pass.length : 0
      });
    }
  });
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: '"Baisics" <john@baisics.app>',
      to: process.env.NODE_ENV === 'production' ? to : 'johnblythe@gmail.com',
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}; 