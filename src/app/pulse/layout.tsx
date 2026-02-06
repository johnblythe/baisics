import type { Metadata } from 'next';
import MainLayout from '@/app/components/layouts/MainLayout';

export const metadata: Metadata = {
  title: 'Daily Pulse | baisics',
  description: 'Track your weight and progress daily with a quick 30-second check-in.',
};

export default function PulseLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
