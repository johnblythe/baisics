'use client';

import { SessionProvider } from 'next-auth/react';
import { AppModeProvider } from '@/contexts/AppModeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppModeProvider>
        {children}
      </AppModeProvider>
    </SessionProvider>
  );
} 