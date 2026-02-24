'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import MainLayout from '@/app/components/layouts/MainLayout';
import { FoodLogPage } from '@/components/food-logging';

export default function NutritionPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#FF6B6B]" />
        </div>
      }>
        <FoodLogPage />
      </Suspense>
    </MainLayout>
  );
}
