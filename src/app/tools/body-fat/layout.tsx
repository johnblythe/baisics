import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Body Fat Calculator | AI Body Fat Estimator | baisics',
  description: 'Estimate your body fat percentage with our free AI-powered tool. Upload a photo for instant analysis or use our visual comparison chart. No calipers or equipment needed.',
  keywords: [
    'body fat calculator',
    'body fat percentage',
    'body fat estimator',
    'how to measure body fat',
    'body fat percentage calculator',
    'body composition',
    'body fat test',
    'estimate body fat',
    'body fat analyzer',
  ],
  openGraph: {
    title: 'Free Body Fat Calculator | AI Estimator | baisics',
    description: 'Estimate your body fat percentage instantly with AI. Upload a photo or compare to reference images.',
    type: 'website',
    url: 'https://baisics.co/tools/body-fat',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Body Fat Calculator | baisics',
    description: 'Estimate your body fat percentage instantly with AI. No equipment needed.',
  },
  alternates: {
    canonical: 'https://baisics.co/tools/body-fat',
  },
};

// Structured data for SEO
const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Body Fat Estimator',
  description: 'AI-powered body fat percentage estimator. Upload a photo or use visual comparison to estimate your body fat.',
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

export default function BodyFatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        id="body-fat-estimator-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {structuredData}
      </Script>
      {children}
    </>
  );
}
