import nodemailer, { Transporter } from "nodemailer";

// Ensure this code only runs on the server
if (typeof window !== "undefined") {
  throw new Error("Email functionality can only be used on the server side");
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

let transporter: Transporter | null = null;

export const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST || "email-smtp.us-east-1.amazonaws.com",
  port: 587,
  secure: false, // Uses STARTTLS
  from: process.env.EMAIL_FROM || "noreply@baisics.app",
};

/**
 * Get singleton email transporter with connection pooling
 * Validates credentials in production
 */
export function getEmailTransporter(): Transporter {
  if (transporter) return transporter;

  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;

  // Validate credentials in production
  if (process.env.NODE_ENV === "production" && (!user || !pass)) {
    throw new Error(
      "EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD must be configured in production"
    );
  }

  transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: { user, pass },
    pool: true, // Enable connection pooling
    maxConnections: 5,
  });

  return transporter;
}

export const sendEmail = async ({ to, subject, text, html }: EmailOptions) => {
  try {
    const transport = getEmailTransporter();
    const info = await transport.sendMail({
      from: `"Baisics" <${emailConfig.from}>`,
      to: process.env.NODE_ENV === "production" ? to : "johnblythe@gmail.com",
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
}; 