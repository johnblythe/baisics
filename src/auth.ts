import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"

// Wrap adapter to debug token operations
const baseAdapter = PrismaAdapter(prisma)
const debugAdapter = {
  ...baseAdapter,
  getUserByEmail: async (email: string) => {
    console.log("👤 getUserByEmail:", email);
    const result = await baseAdapter.getUserByEmail!(email);
    console.log("👤 getUserByEmail result:", result ? { id: result.id, email: result.email } : null);
    return result;
  },
  createVerificationToken: async (data: { identifier: string; token: string; expires: Date }) => {
    console.log("📝 createVerificationToken:", { identifier: data.identifier, tokenLength: data.token?.length, expires: data.expires });
    try {
      const result = await baseAdapter.createVerificationToken!(data);
      console.log("📝 createVerificationToken result:", result);
      return result;
    } catch (err) {
      console.error("📝 createVerificationToken ERROR:", err);
      throw err;
    }
  },
  useVerificationToken: async (params: { identifier: string; token: string }) => {
    console.log("🔍 useVerificationToken:", { identifier: params.identifier, tokenLength: params.token?.length });
    const result = await baseAdapter.useVerificationToken!(params);
    console.log("🔍 useVerificationToken result:", result);
    return result;
  },
}
import Email from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { sendEmail, emailConfig } from "./lib/email"
import { magicLinkTemplate } from "./lib/email/templates/magic-link"
import { cookies } from "next/headers"

const development = process.env.NODE_ENV === "development"

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true, // Enable debug logging
  providers: [
    Email({
      server: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: false,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      },
      from: emailConfig.from,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        console.log("🔑 Login Link:", url)

        if (development) {
          // Store in cookie for dev-only display on verify page
          const cookieStore = await cookies()
          cookieStore.set("__dev_magic_link", url, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 3, // 3 days
            path: "/",
          })
          cookieStore.set("__dev_magic_email", email, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 3, // 3 days
            path: "/",
          })
          return // Skip sending email in dev
        }

        const emailHtml = magicLinkTemplate({ signInLink: url })
        await sendEmail({
          to: email,
          subject: 'Sign in to Baisics',
          html: emailHtml
        })
      }
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
          where: { 
            id: credentials.userId as string,
          },
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
  adapter: debugAdapter,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("🔐 signIn callback:", {
        userId: user?.id,
        userEmail: user?.email,
        accountProvider: account?.provider,
        emailVerificationRequest: email?.verificationRequest
      });
      return true; // Allow sign in
    },
    async redirect({ url, baseUrl }) {
      console.log("🔄 redirect callback:", { url, baseUrl });
      // After magic link auth, redirect to dashboard (not back to signin)
      if (url.includes('/auth/signin')) {
        return new URL('/dashboard', baseUrl).toString()
      }
      if (url.startsWith("http")) return url
      if (url.startsWith("/")) return new URL(url, baseUrl).toString()
      return baseUrl
    },
    async jwt({ token, user, account }) {
      if (development) {
        console.log("🔐 JWT callback:", { hasUser: !!user, sub: token.sub, id: token.id });
      }
      if (user) {
        token.id = user.id;
        token.sub = user.id; // Ensure sub is set for middleware
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  }
})