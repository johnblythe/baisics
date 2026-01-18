import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach Dashboard | baisics',
};

export default function CoachDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
