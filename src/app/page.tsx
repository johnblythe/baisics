'use client';

import { useState, useEffect } from 'react';
import { getLandingVariant } from '@/utils/ab-testing';
import LandingPage from '@/app/components/LandingPage';
import VariantLandingPage from '@/app/components/VariantLandingPage';
import { sendGTMEvent } from '@next/third-parties/google';

export default function HomePage() {
  const [variant, setVariant] = useState<'control' | 'variant'>('control');

  useEffect(() => {
    // Get the variant on the client side
    const currentVariant = getLandingVariant();
    setVariant(currentVariant);
    sendGTMEvent({ event: 'landing page variant', value: currentVariant })
  }, []);
  
  return variant === 'control' ? <LandingPage /> : <VariantLandingPage />;
} 