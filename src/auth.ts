import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import ForwardEmail from "next-auth/providers/forwardemail"

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
        // port: Number(process.env.EMAIL_SERVER_PORT)
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
    })
  ],
  adapter: PrismaAdapter(prisma),
  // callbacks: {
  //   async redirect({ url, baseUrl }) {
  //     return url.startsWith(baseUrl) ? url : baseUrl
  //   }
  // },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  }
})