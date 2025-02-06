'use client'

import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-2X1L89GZHR'

export default function GoogleAnalytics() {
  const isDevelopment = process.env.NODE_ENV === 'development'

  if (isDevelopment) {
    // console.log('Google Analytics is disabled in development mode')
    // console.log(GA_MEASUREMENT_ID)
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
} 