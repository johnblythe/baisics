import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { CloneButton } from './CloneButton';
import { SharePageWrapper, ErrorPageWrapper } from './SharePageWrapper';
import Link from 'next/link';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;

  const program = await prisma.program.findUnique({
    where: { shareId },
    select: { name: true, description: true },
  });

  if (!program) {
    return { title: 'Program Not Found - BAISICS' };
  }

  return {
    title: `${program.name} - BAISICS Program`,
    description: program.description || 'Check out this AI-generated fitness program on BAISICS!',
  };
}

export default async function SharedProgramPage({ params }: PageProps) {
  const { shareId } = await params;

  let program;
  try {
    program = await prisma.program.findUnique({
      where: { shareId },
      include: {
        createdByUser: { select: { name: true } },
        workoutPlans: {
          take: 1,
          include: {
            workouts: {
              orderBy: { dayNumber: 'asc' },
              include: {
                exercises: {
                  orderBy: { sortOrder: 'asc' },
                  take: 6
                }
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Failed to load shared program:', { error, shareId });
    return <ErrorState />;
  }

  if (!program) notFound();

  const session = await auth();
  const workoutPlan = program.workoutPlans[0];
  const totalExercises = workoutPlan?.workouts.reduce((acc, w) => acc + w.exercises.length, 0) || 0;

  return (
    <SharePageWrapper>
      <div className="share-page">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[var(--color-white)]/95 backdrop-blur-md border-b border-[var(--color-gray-100)]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-coral)] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[var(--color-navy)]">baisics</span>
              </Link>
              <div className="flex items-center gap-4">
                {!session && (
                  <Link
                    href="/auth/signin"
                    className="text-sm text-[var(--color-gray-600)] hover:text-[var(--color-navy)] transition-colors"
                  >
                    Sign in
                  </Link>
                )}
                <Link
                  href="/hi"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-navy)] rounded-lg hover:bg-[var(--color-navy-light)] transition-all"
                >
                  Get Your Program
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

            {/* Left: Program Details (3 cols) */}
            <div className="lg:col-span-3 space-y-8 animate-slide-up delay-1">
              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-coral-light)] text-[var(--color-coral-dark)] rounded-full text-sm font-semibold font-mono uppercase tracking-wide">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Shared Program
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-navy)] tracking-tight leading-tight mb-3">
                  {program.name}
                </h1>
                <p className="text-sm text-[var(--color-gray-400)] mb-4">
                  Shared by {program.createdByUser?.name || 'Anonymous'}
                </p>
                {program.description && (
                  <p className="text-lg text-[var(--color-gray-600)] leading-relaxed">
                    {program.description}
                  </p>
                )}
              </div>

              {/* Meta Tags */}
              <div className="flex flex-wrap gap-2">
                {program.difficulty && (
                  <span className="text-sm px-4 py-2 rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)] font-medium capitalize">
                    {program.difficulty}
                  </span>
                )}
                {program.daysPerWeek && (
                  <span className="text-sm px-4 py-2 rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)] font-medium">
                    {program.daysPerWeek} days/week
                  </span>
                )}
                {program.durationWeeks && (
                  <span className="text-sm px-4 py-2 rounded-full bg-[var(--color-gray-100)] text-[var(--color-gray-600)] font-medium">
                    {program.durationWeeks} weeks
                  </span>
                )}
                {program.category && (
                  <span className="text-sm px-4 py-2 rounded-full bg-[var(--color-coral-light)] text-[var(--color-coral-dark)] font-medium capitalize">
                    {program.category}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 animate-slide-up delay-2">
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-gray-100)] shadow-sm">
                  <div className="text-3xl font-bold text-[var(--color-navy)]">{workoutPlan?.workouts.length || 0}</div>
                  <div className="text-sm text-[var(--color-gray-400)] mt-1">Workouts</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-gray-100)] shadow-sm">
                  <div className="text-3xl font-bold text-[var(--color-coral)]">{totalExercises}</div>
                  <div className="text-sm text-[var(--color-gray-400)] mt-1">Exercises</div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[var(--color-gray-100)] shadow-sm">
                  <div className="text-3xl font-bold text-[var(--color-navy)]">{program.durationWeeks || '—'}</div>
                  <div className="text-sm text-[var(--color-gray-400)] mt-1">Weeks</div>
                </div>
              </div>

              {/* Workouts Preview */}
              {workoutPlan && workoutPlan.workouts.length > 0 && (
                <div className="animate-slide-up delay-3">
                  <div className="text-xs font-mono text-[var(--color-gray-400)] uppercase tracking-wider mb-4">
                    Workout Preview
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {workoutPlan.workouts.slice(0, 4).map((workout) => (
                      <div
                        key={workout.id}
                        className="bg-white rounded-2xl p-5 border border-[var(--color-gray-100)] shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-[var(--color-navy)]">{workout.name}</h3>
                          <span className="text-xs text-[var(--color-gray-400)] px-2 py-1 bg-[var(--color-gray-50)] rounded font-mono">
                            Day {workout.dayNumber}
                          </span>
                        </div>
                        {workout.focus && (
                          <p className="text-sm text-[var(--color-gray-400)] mb-3">{workout.focus}</p>
                        )}
                        <ul className="text-sm text-[var(--color-gray-600)] space-y-1.5">
                          {workout.exercises.slice(0, 5).map((ex) => (
                            <li key={ex.id} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[var(--color-coral)] rounded-full flex-shrink-0"></span>
                              <span className="truncate">{ex.name}</span>
                              {ex.sets && ex.reps && (
                                <span className="text-[var(--color-gray-400)] text-xs flex-shrink-0">
                                  {ex.sets}×{ex.reps}
                                </span>
                              )}
                            </li>
                          ))}
                          {workout.exercises.length > 5 && (
                            <li className="text-[var(--color-gray-400)] text-xs pl-3.5">
                              +{workout.exercises.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {workoutPlan.workouts.length > 4 && (
                    <p className="text-sm text-[var(--color-gray-400)] mt-4 text-center">
                      +{workoutPlan.workouts.length - 4} more workouts in this program
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: CTA Card (2 cols) */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl p-8 border border-[var(--color-gray-100)] shadow-xl animate-slide-up delay-2">
                {session ? (
                  /* Authenticated: Clone CTA */
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-2">
                      Use this program
                    </h2>
                    <p className="text-[var(--color-gray-600)] mb-6">
                      Clone it to your account and start tracking your workouts
                    </p>
                    <CloneButton
                      programId={program.id}
                      isAuthenticated={true}
                    />
                  </div>
                ) : (
                  /* Not authenticated: Sign up CTA */
                  <>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-coral-light)] rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--color-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-2">
                        Want to use this program?
                      </h2>
                      <p className="text-[var(--color-gray-600)]">
                        Create a free account to clone and track your progress
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {[
                        'Clone any shared program',
                        'Track your workouts',
                        'Get AI-powered adjustments',
                        'Free forever tier',
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[var(--color-gray-600)]">
                          <svg className="w-5 h-5 text-[var(--color-coral)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/hi"
                      className="block w-full px-8 py-4 text-center text-white font-bold text-lg bg-[var(--color-coral)] rounded-xl hover:bg-[var(--color-coral-dark)] transition-all shadow-lg shadow-[var(--color-coral)]/25 hover:shadow-xl hover:shadow-[var(--color-coral)]/30"
                    >
                      Get Started Free
                      <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>

                    <p className="text-center text-xs text-[var(--color-gray-400)] mt-4">
                      No credit card required
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-gray-100)] mt-12">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--color-coral)] rounded-md"></div>
              <span className="font-bold text-[var(--color-navy)]">baisics</span>
            </div>
            <p className="text-sm text-[var(--color-gray-400)]">
              &copy; {new Date().getFullYear()} baisics. AI-Powered Fitness Programs.
            </p>
          </div>
        </footer>
      </div>
    </SharePageWrapper>
  );
}

function ErrorState() {
  return (
    <ErrorPageWrapper>
      <div className="error-page min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-[#FFE5E5] rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Unable to load program
          </h1>
          <p className="text-[#475569] mb-8">
            There was a problem loading this shared program. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 text-white font-bold bg-[#FF6B6B] rounded-xl hover:bg-[#EF5350] transition-all shadow-lg shadow-[#FF6B6B]/25"
          >
            Go Home
          </Link>
        </div>
      </div>
    </ErrorPageWrapper>
  );
}
