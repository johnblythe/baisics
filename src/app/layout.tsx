import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import Providers from "@/components/Providers";
import { GoogleTagManager } from '@next/third-parties/google'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.baisics.app'),
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
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
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
  const gtmId = process.env.GTM_ID;

  return (
    <html lang="en">
      <head>
        {/* <JsonLd /> */}
      </head>
      <body className="antialiased">
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        <Providers>
          {children}
        </Providers>
      </body>
      <GoogleAnalytics gaId={process.env.GA_MEASUREMENT_ID || ""} />
    </html>
  );
}
