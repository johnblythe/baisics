import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Macro Calculator | Calculate Your Daily Macros | baisics',
  description: 'Calculate your daily macros for weight loss, muscle gain, or maintenance. Free macro calculator based on your body stats, activity level, and goals. Get personalized protein, carbs, and fat targets.',
  keywords: [
    'macro calculator',
    'calculate macros',
    'macros for weight loss',
    'protein calculator',
    'tdee calculator',
    'calorie calculator',
    'macronutrient calculator',
    'fitness calculator',
  ],
  openGraph: {
    title: 'Free Macro Calculator | baisics',
    description: 'Calculate your daily macros for weight loss, muscle gain, or maintenance. Get personalized protein, carbs, and fat targets.',
    type: 'website',
    url: 'https://baisics.co/tools/macros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Macro Calculator | baisics',
    description: 'Calculate your daily macros for weight loss, muscle gain, or maintenance.',
  },
  alternates: {
    canonical: 'https://baisics.co/tools/macros',
  },
};

// Structured data for SEO (static, safe content)
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Macro Calculator',
  description: 'Free macro calculator to determine your daily protein, carbs, and fat intake based on your goals.',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  provider: {
    '@type': 'Organization',
    name: 'baisics',
    url: 'https://baisics.co',
  },
});

export default function MacrosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="macro-calculator-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {structuredData}
      </Script>
      {children}
    </>
  );
}
