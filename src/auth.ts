import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import ForwardEmail from "next-auth/providers/forwardemail"
import CredentialsProvider from "next-auth/providers/credentials"
import { sendEmail } from "./lib/email"
import { magicLinkTemplate } from "./lib/email/templates/magic-link"

const development = process.env.NODE_ENV === "development"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ForwardEmail({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      },
      from: development ? "noreply@localhost" : process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        if (development) {
          console.log("🔑 Login Link:", url)
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
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
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