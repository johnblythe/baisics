import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meal Prep | baisics',
};

export default function MealPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
