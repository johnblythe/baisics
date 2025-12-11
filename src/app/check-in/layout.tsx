import { SessionProvider } from 'next-auth/react';
import MainLayout from '@/app/components/layouts/MainLayout';

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <MainLayout>
        {children}
      </MainLayout>
    </SessionProvider>
  );
}
