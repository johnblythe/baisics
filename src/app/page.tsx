'use client';

import { useState, useEffect } from 'react';
import { getLandingVariant } from '@/utils/ab-testing';
import LandingPage from '@/app/components/LandingPage';
import VariantLandingPage from '@/app/components/VariantLandingPage';

export default function HomePage() {
  const [variant, setVariant] = useState<'control' | 'variant'>('control');

  useEffect(() => {
    // Get the variant on the client side
    const currentVariant = getLandingVariant();
    setVariant(currentVariant);
  }, []);
  
  return variant === 'control' ? <LandingPage /> : <VariantLandingPage />;
} 