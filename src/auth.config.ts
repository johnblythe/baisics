// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { prisma } from "@/lib/prisma"
// import Google from "next-auth/providers/google"
// import Twitter from "next-auth/providers/twitter"
// import Email from "next-auth/providers/email"
// import nodemailer from "nodemailer"

// export const authConfig = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     Google({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//     Twitter({
//       clientId: process.env.TWITTER_CLIENT_ID!,
//       clientSecret: process.env.TWITTER_CLIENT_SECRET!,
//     }),
//     Email({
//       async generateVerificationToken() {
//         // Make it easier to type during development
//         return process.env.NODE_ENV === "production" 
//           ? crypto.randomUUID()
//           : "1234";
//       },
//       async sendVerificationRequest({ identifier, url }) {
//         if (process.env.NODE_ENV === "production") {
//           // Production email configuration
//           const transport = nodemailer.createTransport({
//             host: process.env.EMAIL_SERVER_HOST,
//             port: Number(process.env.EMAIL_SERVER_PORT),
//             auth: {
//               user: process.env.EMAIL_SERVER_USER,
//               pass: process.env.EMAIL_SERVER_PASSWORD,
//             },
//           });
//           await transport.sendMail({
//             to: identifier,
//             from: process.env.EMAIL_FROM,
//             subject: "Sign in to Your App",
//             text: `Click here to sign in: ${url}`,
//             html: `<p>Click here to sign in: <a href="${url}">${url}</a></p>`,
//           });
//         } else {
//           // Development - use Ethereal
//           const testAccount = await nodemailer.createTestAccount();
//           const transport = nodemailer.createTransport({
//             host: "smtp.ethereal.email",
//             port: 587,
//             secure: false,
//             auth: {
//               user: testAccount.user,
//               pass: testAccount.pass,
//             },
//           });
//           const info = await transport.sendMail({
//             to: identifier,
//             from: "test@ethereal.email",
//             subject: "Sign in to Your App",
//             text: `Click here to sign in: ${url}`,
//             html: `<p>Click here to sign in: <a href="${url}">${url}</a></p>`,
//           });
//           // Log the Ethereal URL where you can view the email
//           console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//     verifyRequest: "/verify-request",
//   },
//   callbacks: {
//     async session({ session, user }: { session: any, user: any }) {
//       if (session.user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
// }); 