import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

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
      user: {
        select: { name: true },
      },
      workoutPlans: {
        include: {
          workouts: {
            include: {
              exercises: true,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xl font-bold text-gray-900 dark:text-white">BAISICS</span>
          </Link>
          <Link
            href="/hi"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Get Your Program
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Program Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">
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
              <div className="text-4xl font-bold text-pink-400">{totalExercises}</div>
              <div className="text-sm text-white/60 mt-1">Exercises</div>
            </div>
          </div>

          {/* Focus Areas */}
          {focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {focusAreas.map((focus) => (
                <span
                  key={focus}
                  className="text-sm bg-white/10 px-4 py-2 rounded-full"
                >
                  {focus}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-sm text-white/40">
            <span>Created by {program.user.name || 'BAISICS User'}</span>
            <span>{program.workoutPlans[0]?.daysPerWeek || 0} days/week</span>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Want your own personalized program?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            BAISICS creates AI-powered fitness programs tailored to your goals, schedule, and equipment.
          </p>
          <Link
            href="/hi"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Get Started Free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} BAISICS. AI-Powered Fitness Programs.</p>
      </footer>
    </div>
  );
}
