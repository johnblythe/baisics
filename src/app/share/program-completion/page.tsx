import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { Trophy, Dumbbell, TrendingUp, Calendar } from 'lucide-react';

interface ShareProgramCompletionPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getProgramCompletionData(programId: string) {
  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      ownerUser: {
        select: { name: true },
      },
      workoutPlans: {
        include: {
          workouts: true,
        },
      },
    },
  });

  if (!program || !program.userId) return null;

  // Get completed workouts
  const completedWorkouts = await prisma.workoutLog.findMany({
    where: {
      programId,
      userId: program.userId,
      status: 'completed',
    },
    include: {
      exerciseLogs: {
        include: {
          setLogs: true,
        },
      },
    },
    orderBy: { completedAt: 'asc' },
  });

  if (completedWorkouts.length === 0) return null;

  // Calculate stats
  let totalVolume = 0;
  let totalSets = 0;

  for (const log of completedWorkouts) {
    for (const exerciseLog of log.exerciseLogs) {
      for (const setLog of exerciseLog.setLogs) {
        totalSets++;
        totalVolume += (setLog.weight || 0) * setLog.reps;
      }
    }
  }

  const firstWorkout = completedWorkouts[0];
  const lastWorkout = completedWorkouts[completedWorkouts.length - 1];
  const startDate = firstWorkout?.startedAt || program.createdAt;
  const completionDate = lastWorkout?.completedAt || new Date();

  const durationMs = completionDate.getTime() - startDate.getTime();
  const durationWeeks = Math.max(1, Math.ceil(durationMs / (7 * 24 * 60 * 60 * 1000)));

  return {
    programName: program.name,
    userName: program.ownerUser?.name || 'Athlete',
    totalWorkouts: completedWorkouts.length,
    totalVolume: Math.round(totalVolume),
    totalSets,
    durationWeeks,
  };
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M lbs`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K lbs`;
  }
  return `${Math.round(volume)} lbs`;
}

export async function generateMetadata({ searchParams }: ShareProgramCompletionPageProps): Promise<Metadata> {
  const params = await searchParams;
  const programId = params.programId as string | undefined;

  if (!programId) {
    return {
      title: 'Program Completed - BAISICS',
      description: 'Check out this completed fitness program on BAISICS!',
    };
  }

  const data = await getProgramCompletionData(programId);

  if (!data) {
    return {
      title: 'Program Completed - BAISICS',
      description: 'Check out this completed fitness program on BAISICS!',
    };
  }

  return {
    title: `${data.programName} Complete! - BAISICS`,
    description: `${data.userName} completed ${data.programName}: ${data.totalWorkouts} workouts, ${formatVolume(data.totalVolume)} total volume over ${data.durationWeeks} weeks!`,
    openGraph: {
      title: `${data.programName} Complete!`,
      description: `${data.totalWorkouts} workouts \u2022 ${formatVolume(data.totalVolume)} volume \u2022 ${data.durationWeeks} weeks`,
      type: 'website',
      siteName: 'BAISICS',
      images: [
        {
          url: `/api/og/program-completion?programId=${programId}`,
          width: 1200,
          height: 630,
          alt: `${data.programName} Completed`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.programName} Complete!`,
      description: `${data.totalWorkouts} workouts \u2022 ${formatVolume(data.totalVolume)} volume \u2022 ${data.durationWeeks} weeks`,
      images: [`/api/og/program-completion?programId=${programId}`],
    },
  };
}

export default async function ShareProgramCompletionPage({ searchParams }: ShareProgramCompletionPageProps) {
  const params = await searchParams;
  const programId = params.programId as string | undefined;

  if (!programId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Invalid Link</h1>
          <p className="text-[#64748B]">This completion link is invalid.</p>
          <a
            href="https://baisics.app"
            className="inline-block mt-4 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            Go to BAISICS
          </a>
        </div>
      </div>
    );
  }

  const data = await getProgramCompletionData(programId);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Program Not Found</h1>
          <p className="text-[#64748B]">This program could not be found or is not complete.</p>
          <a
            href="https://baisics.app"
            className="inline-block mt-4 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            Go to BAISICS
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Completion Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#FF6B6B] to-[#0F172A] p-8 text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
              <Trophy className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-80">
              Program Complete!
            </h2>
            <h1 className="text-2xl font-bold mb-2">{data.programName}</h1>
            <p className="text-white/80">Completed by {data.userName}</p>
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#FFE5E5] rounded-xl p-4 text-center">
                <Dumbbell className="w-5 h-5 mx-auto text-[#FF6B6B] mb-2" />
                <div className="text-xl font-bold text-[#0F172A]">{data.totalWorkouts}</div>
                <div className="text-xs text-[#64748B] font-medium">Workouts</div>
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-4 text-center">
                <TrendingUp className="w-5 h-5 mx-auto text-[#0F172A] mb-2" />
                <div className="text-xl font-bold text-[#0F172A]">{formatVolume(data.totalVolume)}</div>
                <div className="text-xs text-[#64748B] font-medium">Volume</div>
              </div>
              <div className="bg-[#F0FDF4] rounded-xl p-4 text-center">
                <Calendar className="w-5 h-5 mx-auto text-emerald-600 mb-2" />
                <div className="text-xl font-bold text-[#0F172A]">{data.durationWeeks}</div>
                <div className="text-xs text-[#64748B] font-medium">Weeks</div>
              </div>
              <div className="bg-[#EEF2FF] rounded-xl p-4 text-center">
                <div className="w-5 h-5 mx-auto text-indigo-600 mb-2 flex items-center justify-center font-bold">
                  #
                </div>
                <div className="text-xl font-bold text-[#0F172A]">{data.totalSets}</div>
                <div className="text-xs text-[#64748B] font-medium">Sets</div>
              </div>
            </div>

            {/* CTA */}
            <a
              href="https://baisics.app"
              className="inline-block w-full px-6 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium text-center hover:bg-[#EF5350] transition-colors"
            >
              Start Your Own Journey on BAISICS
            </a>

            {/* Branding */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>baisics.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
