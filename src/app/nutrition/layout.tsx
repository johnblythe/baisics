import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nutrition | baisics',
};

export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
