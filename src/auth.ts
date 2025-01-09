import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import ForwardEmail from "next-auth/providers/forwardemail"
import CredentialsProvider from "next-auth/providers/credentials"

const development = process.env.NODE_ENV === "development"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    ForwardEmail({
      server: development ? {
        host: "localhost",
        port: 4000,
        auth: {
          user: "",
          pass: "",
        }
      } : {
        host: process.env.EMAIL_SERVER_HOST,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      },
      from: development ? "noreply@localhost" : process.env.EMAIL_FROM,
      sendVerificationRequest: development
        ? ({ url }) => {
            console.log("🔑 Login Link:", url)
          }
        : undefined
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