'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/app/components/layouts/MainLayout';

export default function ProgramRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    async function fetchCurrentProgram() {
      try {
        const [programRes, userRes] = await Promise.all([fetch('/api/programs/current'), fetch('/api/user')]);
        if (programRes.ok) {
          const program = await programRes.json();
          if (program?.id) {
            router.replace(`/program/${program.id}`);
            return;
          }
        }
        // No program found - coaches go to coach dashboard, others to /hi
        if (userRes.ok) {
          const user = await userRes.json();
          if (user?.isCoach) {
            router.replace('/coach/dashboard');
            return;
          }
        }

        router.replace('/hi');
      } catch (error) {
        console.error('Failed to fetch current program:', error);
        router.replace('/hi');
      }
    }

    fetchCurrentProgram();
  }, [router]);

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-[#F1F5F9] border-t-[#FF6B6B] rounded-full animate-spin"></div>
      </div>
    </MainLayout>
  );
}
