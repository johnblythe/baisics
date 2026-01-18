import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exercise Library | baisics',
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
