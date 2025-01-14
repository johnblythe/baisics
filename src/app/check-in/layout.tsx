import { SessionProvider } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <Header />
        {children}
        <Footer />
      </div>
    </SessionProvider>
  );
} 