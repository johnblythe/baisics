import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Program Templates | baisics',
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
