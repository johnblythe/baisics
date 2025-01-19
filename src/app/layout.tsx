import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import Providers from "@/components/Providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app'),
  title: "baisics | Your Personal AI Fitness Trainer",
  description: "Get your personalized workout and nutrition plan in 2 minutes. No cookie-cutter programs, no expensive trainers. Start free or unlock premium features. AI-powered fitness training and meal plans customized for your goals.",
  keywords: [
    "AI fitness",
    "AI personal trainer",
    "AI nutrition",
    "AI workout",
    "free personalized workout plan",
    "free personalized nutrition plan",
    "personalized workout and nutrition plans",
    "custom meal plans",
    "affordable personal trainer",
    "free fitness app",
    "fitness app",
    "workout tracking",
    "nutrition planning",
    "AI workout generator",
    "custom exercise program",
    "fitness goals",
    "personal training",
    "diet planning",
    "lose weight",
    "build muscle",
    "improve health",
  ],
  openGraph: {
    title: "baisics | Yoursonal training with AI",
    description: "Get your free personalized workout and nutrition plan in less than 2 minutes. Start for free. Upgrade to premium and save 50% on all the amazing features today.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "baisics AI Fitness Training"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "baisics | Yoursonal training with AI",
    description: "Get your free personalized workout and nutrition plan in less than 2 minutes. Start for free. Upgrade to premium and save 50% on all the amazing features today.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION!,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
