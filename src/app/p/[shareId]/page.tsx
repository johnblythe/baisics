import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { CloneButton } from './CloneButton';
import Link from 'next/link';

export default async function SharedProgramPage({
  params
}: {
  params: Promise<{ shareId: string }>
}) {
  const { shareId } = await params;

  const program = await prisma.program.findUnique({
    where: { shareId },
    include: {
      user: { select: { name: true } },
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

  if (!program) notFound();

  const session = await auth();
  const workoutPlan = program.workoutPlans[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">baisics</Link>
          {!session && (
            <Link
              href="/auth/signin"
              className="text-sm text-gray-300 hover:text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Program Header */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">{program.name}</h1>
              <p className="text-gray-500 text-sm mb-4">
                Shared by {program.user?.name || 'Anonymous'}
              </p>
              {program.description && (
                <p className="text-gray-600 mb-4">{program.description}</p>
              )}

              {/* Program Meta */}
              <div className="flex flex-wrap gap-3 text-sm">
                {program.difficulty && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                    {program.difficulty}
                  </span>
                )}
                {program.daysPerWeek && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {program.daysPerWeek} days/week
                  </span>
                )}
                {program.durationWeeks && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {program.durationWeeks} weeks
                  </span>
                )}
                {program.category && (
                  <span className="px-3 py-1 bg-coral-50 text-coral-600 rounded-full capitalize">
                    {program.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <CloneButton
                programId={program.id}
                isAuthenticated={!!session}
              />
            </div>
          </div>
        </div>

        {/* Workouts Preview */}
        {workoutPlan && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#0F172A]">Workout Preview</h2>

            <div className="grid gap-4 md:grid-cols-2">
              {workoutPlan.workouts.map((workout) => (
                <div key={workout.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#0F172A]">{workout.name}</h3>
                    <span className="text-xs text-gray-400 px-2 py-1 bg-gray-50 rounded">
                      Day {workout.dayNumber}
                    </span>
                  </div>
                  {workout.focus && (
                    <p className="text-sm text-gray-500 mb-3">{workout.focus}</p>
                  )}
                  <ul className="text-sm text-gray-600 space-y-1.5">
                    {workout.exercises.slice(0, 5).map((ex) => (
                      <li key={ex.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-coral-400 rounded-full flex-shrink-0"></span>
                        <span>{ex.name}</span>
                        {ex.sets && ex.reps && (
                          <span className="text-gray-400 text-xs">
                            {ex.sets}x{ex.reps}
                          </span>
                        )}
                      </li>
                    ))}
                    {workout.exercises.length > 5 && (
                      <li className="text-gray-400 text-xs pl-3">
                        +{workout.exercises.length - 5} more exercises
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA for non-auth users */}
        {!session && (
          <div className="mt-8 text-center bg-gradient-to-r from-coral-50 to-white rounded-xl p-8 border border-coral-100">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
              Want to use this program?
            </h3>
            <p className="text-gray-600 mb-6">
              Create a free account to clone this program and start tracking your workouts.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
