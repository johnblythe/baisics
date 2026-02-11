'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type AppMode = 'coach' | 'consumer';

interface AppModeContextType {
  mode: AppMode;
  isCoach: boolean;
  isLoading: boolean;
  setMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType>({
  mode: 'consumer',
  isCoach: false,
  isLoading: true,
  setMode: () => {},
});

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
}

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCoach, setIsCoach] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setModeState] = useState<AppMode>('consumer');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const userIsCoach = !!data.isCoach;
        setIsCoach(userIsCoach);

        if (userIsCoach) {
          const cookieMode = getCookie('baisics-mode');
          if (cookieMode === 'coach' || cookieMode === 'consumer') {
            setModeState(cookieMode);
          } else if (pathname.startsWith('/coach')) {
            setModeState('coach');
          } else {
            setModeState('consumer');
          }
        } else {
          setModeState('consumer');
        }
      } catch {
        // Silently fail - user might not be authenticated
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update mode when pathname changes (e.g. navigating between coach and consumer pages)
  useEffect(() => {
    if (!isCoach) return;
    const cookieMode = getCookie('baisics-mode');
    if (!cookieMode) {
      // No explicit cookie — infer from path
      if (pathname.startsWith('/coach')) {
        setModeState('coach');
      } else {
        setModeState('consumer');
      }
    }
  }, [pathname, isCoach]);

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    setCookie('baisics-mode', newMode, 2592000); // 30 days

    if (newMode === 'coach') {
      router.push('/coach/dashboard');
    } else {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <AppModeContext.Provider value={{ mode, isCoach, isLoading, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
