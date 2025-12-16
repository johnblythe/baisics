'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BodyFatEstimator } from '@/components/tools/BodyFatEstimator';
import { BODY_FAT_RANGES, type BodyFatEstimate } from '@/utils/bodyFat';

export default function BodyFatEstimatorPage() {
  const router = useRouter();

  const handleCtaSubmit = (email: string, estimate: BodyFatEstimate) => {
    // Store lead data
    const lead = {
      email,
      bodyFat: estimate,
      source: 'body-fat-estimator',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('body_fat_lead', JSON.stringify(lead));

    // Redirect to /hi with context
    router.push(`/hi?source=body-fat&goal=${estimate.recommendation}`);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        .body-fat-estimator-page {
          --color-white: #FFFFFF;
          --color-gray-50: #F8FAFC;
          --color-gray-100: #F1F5F9;
          --color-gray-400: #94A3B8;
          --color-gray-600: #475569;
          --color-navy: #0F172A;
          --color-navy-light: #1E293B;
          --color-coral: #FF6B6B;
          --color-coral-dark: #EF5350;
          --color-coral-light: #FFE5E5;

          font-family: 'Outfit', sans-serif;
          background-color: var(--color-white);
          color: var(--color-navy);
        }

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
      `}</style>

      <div className="body-fat-estimator-page min-h-screen">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-20">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="/tools/macros" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">
                  Macro Calculator
                </Link>
                <Link href="/tools/body-fat" className="text-sm font-medium text-[var(--color-coral)]">
                  Body Fat Estimator
                </Link>
                <Link href="/blog" className="text-sm font-medium text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors">
                  Blog
                </Link>
              </nav>

              <Link
                href="/hi"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-28 lg:pt-36 pb-12 px-6 lg:px-8 bg-gradient-to-b from-[var(--color-gray-50)] to-white">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-mono text-sm text-[var(--color-coral)] uppercase tracking-wider mb-4">Free Tool</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Body Fat Estimator
            </h1>
            <p className="text-lg lg:text-xl text-[var(--color-gray-600)] max-w-2xl mx-auto">
              Get an AI-powered body fat estimate from a photo, or compare yourself to reference images. No calipers needed.
            </p>
          </div>
        </section>

        {/* Main Tool Section */}
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Estimator - takes more space */}
              <div className="lg:col-span-3">
                <BodyFatEstimator
                  onCtaSubmit={handleCtaSubmit}
                  showCta={true}
                />
              </div>

              {/* Reference Chart - sidebar */}
              <div className="lg:col-span-2 lg:sticky lg:top-28 lg:self-start">
                <div className="bg-[var(--color-gray-50)] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[var(--color-navy)] mb-4">
                    Body Fat Reference
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-gray-600)] mb-3">Men</h4>
                      <div className="space-y-2">
                        {BODY_FAT_RANGES.male.map((range) => (
                          <div key={range.category} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-16 font-mono text-sm text-[var(--color-navy)]">
                              {range.min}-{range.max}%
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[var(--color-navy)]">
                                {range.label}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[var(--color-gray-100)] pt-6">
                      <h4 className="text-sm font-semibold text-[var(--color-gray-600)] mb-3">Women</h4>
                      <div className="space-y-2">
                        {BODY_FAT_RANGES.female.map((range) => (
                          <div key={range.category} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-16 font-mono text-sm text-[var(--color-navy)]">
                              {range.min}-{range.max}%
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-[var(--color-navy)]">
                                {range.label}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-green-800">Privacy First</p>
                      <p className="text-xs text-green-700 mt-1">
                        Your photos are analyzed instantly and never stored. We don&apos;t save or share your images.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 px-6 lg:px-8 bg-[var(--color-gray-50)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">
              How Body Fat % Affects Your Goals
            </h2>

            <div className="prose prose-lg max-w-none text-[var(--color-gray-600)]">
              <p>
                Body fat percentage is one of the most useful metrics for understanding your physique and planning your training. Unlike scale weight alone, it tells you about your body <em>composition</em>.
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">
                Why It Matters
              </h3>
              <ul className="space-y-2">
                <li><strong>For cutting:</strong> Knowing your starting point helps set realistic fat loss targets</li>
                <li><strong>For bulking:</strong> Staying too high makes future cuts harder; staying too lean limits muscle gain</li>
                <li><strong>For health:</strong> Both extremes (very low or very high) carry health risks</li>
                <li><strong>For aesthetics:</strong> Most people want visible muscle definition, which requires specific BF% ranges</li>
              </ul>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">
                About This Tool
              </h3>
              <p>
                Photo-based estimation uses AI vision to analyze your physique. It&apos;s not as accurate as DEXA scans or hydrostatic weighing, but it&apos;s free, instant, and good enough for most training decisions.
              </p>
              <p>
                For best results: use good lighting, take a front-facing photo of your torso, and stand relaxed (not flexed or tensed).
              </p>

              <h3 className="text-lg font-semibold text-[var(--color-navy)] mt-6 mb-3">
                What&apos;s Next?
              </h3>
              <p>
                Once you know your approximate body fat, you can make informed decisions about whether to cut, bulk, or maintain. Our AI can create a personalized program based on your estimate and goals.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 lg:px-8 border-t border-[var(--color-gray-100)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--color-coral)] rounded-md"></div>
              <span className="font-bold text-[var(--color-navy)]">baisics</span>
            </div>
            <p className="text-sm text-[var(--color-gray-400)]">
              &copy; {new Date().getFullYear()} baisics. Made in Indianapolis.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
