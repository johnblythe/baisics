import { Organization, WebSite } from 'schema-dts'

export default function JsonLd() {
  const websiteSchema: WebSite = {
    '@type': 'WebSite',
    // '@context': 'https://schema.org',
    name: 'baisics',
    url: 'https://baisics.app',
    description: 'AI-powered personalized fitness and nutrition planning',
    potentialAction: {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://baisics.app/search?q={search_term_string}'
      },
      // 'query-input': 'required name=search_term_string'
    }
  }

  const organizationSchema: Organization = {
    '@type': 'Organization',
    // '@context': 'https://schema.org',
    name: 'baisics',
    url: 'https://baisics.app',
    logo: 'https://baisics.app/logo.png',
    // sameAs: [
    //   'https://twitter.com/baisicsapp',
    //   'https://www.instagram.com/baisicsapp'
    // ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'john@baisics.app',
      contactType: 'customer service'
    }
  }

  // const appSchema: SoftwareApplication = {
  //   '@type': 'SoftwareApplication',
  //   '@context': 'https://schema.org',
  //   name: 'baisics',
  //   applicationCategory: 'HealthAndFitnessApplication',
  //   operatingSystem: 'Web',
  //   offers: {
  //     '@type': 'Offer',
  //     price: '0',
  //     priceCurrency: 'USD',
  //     priceValidUntil: '2025-12-31',
  //     availability: 'https://schema.org/InStock'
  //   },
  //   aggregateRating: {
  //     '@type': 'AggregateRating',
  //     ratingValue: '4.8',
  //     ratingCount: '150'
  //   }
  // }

  // const premiumOfferSchema: Offer = {
  //   '@type': 'Offer',
  //   '@context': 'https://schema.org',
  //   name: 'baisics Premium',
  //   description: 'Unlimited AI-powered personalized workout and nutrition plans',
  //   price: '10.00',
  //   priceCurrency: 'USD',
  //   priceValidUntil: '2025-12-31',
  //   availability: 'https://schema.org/InStock',
  //   priceSpecification: {
  //     '@type': 'UnitPriceSpecification',
  //     price: '10.00',
  //     priceCurrency: 'USD',
  //     unitText: 'Monthly'
  //   }
  // }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(premiumOfferSchema) }}
      /> */}
    </>
  )
} 