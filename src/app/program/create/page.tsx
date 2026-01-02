import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ProgramBuilder } from './components/ProgramBuilder';

export const metadata = {
  title: 'Create Program | Baisics',
  description: 'Create your own custom workout program',
};

export default async function CreateProgramPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/program/create');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold text-[#0F172A]">Create Program</h1>
          <p className="text-[#64748B] mt-2">Build your own custom workout program</p>
        </div>

        <ProgramBuilder />
      </div>
    </div>
  );
}
