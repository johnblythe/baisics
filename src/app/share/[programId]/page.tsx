import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

// v2a colors
const COLORS = {
  coral: '#FF6B6B',
  coralDark: '#EF5350',
  navy: '#0F172A',
  navyLight: '#1E293B',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray400: '#94A3B8',
  gray600: '#475569',
};

interface PageProps {
  params: Promise<{ programId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { programId } = await params;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { name: true, description: true },
  });

  if (!program) {
    return { title: 'Program Not Found - BAISICS' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';

  return {
    title: `${program.name} - BAISICS Program`,
    description: program.description || 'Check out this AI-generated fitness program on BAISICS!',
    openGraph: {
      title: `${program.name} - BAISICS Program`,
      description: program.description || 'Check out this AI-generated fitness program!',
      images: [`${baseUrl}/api/og?programId=${programId}`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${program.name} - BAISICS`,
      description: program.description || 'Check out this AI-generated fitness program!',
      images: [`${baseUrl}/api/og?programId=${programId}`],
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { programId } = await params;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      createdByUser: {
        select: { name: true },
      },
      workoutPlans: {
        include: {
          workouts: {
            include: {
              exercises: { orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
      workoutLogs: {
        where: { status: 'completed' },
      },
    },
  });

  if (!program) {
    notFound();
  }

  const totalWorkouts = program.workoutPlans.reduce(
    (acc, plan) => acc + plan.workouts.length,
    0
  );
  const completedWorkouts = program.workoutLogs.length;
  const totalExercises = program.workoutPlans.reduce(
    (acc, plan) =>
      acc + plan.workouts.reduce((w, workout) => w + workout.exercises.length, 0),
    0
  );
  const phases = program.workoutPlans.length;
  const completionRate = totalWorkouts > 0
    ? Math.round((completedWorkouts / totalWorkouts) * 100)
    : 0;

  const focusAreas = [
    ...new Set(
      program.workoutPlans.flatMap((plan) =>
        plan.workouts.map((w) => w.focus)
      )
    ),
  ].slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(to bottom right, ${COLORS.gray50}, ${COLORS.gray100})` }}>
      {/* Header */}
      <header
        className="backdrop-blur-lg border-b"
        style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderColor: COLORS.gray100 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: COLORS.coral }}
            >
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold" style={{ color: COLORS.navy }}>baisics</span>
          </Link>
          <Link
            href="/hi"
            className="px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: COLORS.coral }}
          >
            Get Your Program
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Program Card */}
        <div
          className="rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-8"
          style={{ background: `linear-gradient(to bottom right, ${COLORS.navy}, ${COLORS.navyLight})` }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              AI-Generated Program
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3">{program.name}</h1>
          {program.description && (
            <p className="text-white/70 text-lg mb-8">{program.description}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold">{totalWorkouts}</div>
              <div className="text-sm text-white/60 mt-1">Workouts</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-emerald-400">{completionRate}%</div>
              <div className="text-sm text-white/60 mt-1">Complete</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-amber-400">{phases}</div>
              <div className="text-sm text-white/60 mt-1">Phases</div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold" style={{ color: COLORS.coral }}>{totalExercises}</div>
              <div className="text-sm text-white/60 mt-1">Exercises</div>
            </div>
          </div>

          {/* Focus Areas */}
          {focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {focusAreas.map((focus) => (
                <span
                  key={focus}
                  className="text-sm px-4 py-2 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  {focus}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm text-white/40">
            <span>Created by {program.createdByUser?.name || 'BAISICS User'}</span>
            <span>{program.workoutPlans[0]?.daysPerWeek || 0} days/week</span>
          </div>
        </div>

        {/* CTA */}
        <div
          className="bg-white rounded-2xl p-8 text-center shadow-lg border"
          style={{ borderColor: COLORS.gray100 }}
        >
          <h2 className="text-2xl font-bold mb-3" style={{ color: COLORS.navy }}>
            Want your own personalized program?
          </h2>
          <p className="mb-6" style={{ color: COLORS.gray600 }}>
            BAISICS creates AI-powered fitness programs tailored to your goals, schedule, and equipment.
          </p>
          <Link
            href="/hi"
            className="inline-flex items-center gap-2 px-8 py-4 text-white rounded-xl font-bold text-lg transition-colors"
            style={{ backgroundColor: COLORS.coral }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm" style={{ color: COLORS.gray400 }}>
        <p>&copy; {new Date().getFullYear()} baisics. AI-Powered Fitness Programs.</p>
      </footer>
    </div>
  );
}
