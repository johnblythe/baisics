'use client';

import dynamic from 'next/dynamic';

// Dynamic import with ssr: false must be in a client component
const DebugPanel = dynamic(() => import('./DebugPanel'), {
  ssr: false,
});

export function DebugPanelWrapper() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <DebugPanel />;
}
