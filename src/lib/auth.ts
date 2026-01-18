import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { sendEmail, emailConfig } from "./email";
import { magicLinkTemplate } from "./email/templates/magic-link";

// Helper to get session (v4 pattern that mimics v5's auth())
export async function auth() {
  return getServerSession(authOptions);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  // Use project-specific cookie names to avoid collision with other localhost apps
  cookies: {
    sessionToken: {
      name: 'baisics.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: 'baisics.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: 'baisics.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  providers: [
    EmailProvider({
      server: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: emailConfig.from,
      sendVerificationRequest: async ({ identifier, url }) => {
        // Dev mode: store in cookie for display on verify page
        if (process.env.NODE_ENV !== "production") {
          console.log(`\n🔗 MAGIC LINK for ${identifier}:\n${url}\n`);

          const cookieStore = await cookies();
          cookieStore.set("baisics.__dev_magic_link", url, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 10, // 10 minutes
            path: "/",
          });
          cookieStore.set("baisics.__dev_magic_email", identifier, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 10,
            path: "/",
          });
          return;
        }

        // Production: send email via SES
        const emailHtml = magicLinkTemplate({ signInLink: url });
        await sendEmail({
          to: identifier,
          subject: "Sign in to Baisics",
          html: emailHtml,
        });
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        userId: { label: "User ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.userId) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { id: credentials.userId },
        });

        if (!user || user.email !== credentials.email) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    signIn: async () => {
      // Coach signup is handled in /api/coaches/signup before magic link is sent
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
};
