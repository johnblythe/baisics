import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coach Settings | baisics',
};

export default function CoachSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
