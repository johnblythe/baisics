import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { WorkoutPlan } from '@/types/program';
import { Target, Brain, Activity, Key, Dumbbell, Apple, ChartLine, Info } from 'lucide-react';
import { formatExerciseMeasure, formatRestPeriod } from '@/utils/formatters';
import { Program } from '@/types/program';
import { User } from '@prisma/client';
import { generateWorkoutPDF } from '@/utils/pdf';
import { MacrosGuideModal } from './MacrosGuideModal';
import { getMacros } from '@/utils/formatting';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
// todo
interface ExtendedWorkoutPlan extends Omit<WorkoutPlan, 'phaseExplanation' | 'phaseExpectations' | 'phaseKeyPoints'> {
  phaseExplanation?: string;
  phaseExpectations?: string;
  phaseKeyPoints?: string[];
  bodyFatPercentage?: number;
  muscleMassDistribution?: string;
  name?: string;
  description?: string;
}

interface WorkoutPlanDisplayProps {
  program: Program;
  plan: ExtendedWorkoutPlan;
  userEmail?: string | null;
  onRequestUpsell?: () => void;
  user?: User | null;
}

export interface WorkoutPlanDisplayRef {
  generateWorkoutPDF: (programId: string, userId: string) => Promise<void>;
}

export const WorkoutPlanDisplay = forwardRef<WorkoutPlanDisplayRef, WorkoutPlanDisplayProps>(({
  program,
  plan,
  userEmail: initialUserEmail,
  onRequestUpsell,
  user
}, ref) => {
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isMacrosGuideOpen, setIsMacrosGuideOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize expandedNotes with first exercise's ID
  useEffect(() => {
    if (plan.workouts.length > 0 && plan.workouts[0].exercises.length > 0) {
      const firstExercise = plan.workouts[0].exercises[0];
      const firstExerciseId = firstExercise.id || `exercise-${plan.workouts[0].id}-${firstExercise.name}-0`;
      if (firstExercise.notes) {
        setExpandedNotes([firstExerciseId]);
      }
    }
  }, [plan.workouts]);

  // Keep userEmail in sync with prop changes
  useEffect(() => {
    setUserEmail(initialUserEmail);
  }, [initialUserEmail]);

  // Fetch user data when component mounts or when userEmail changes
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     const userId = new URLSearchParams(window.location.search).get('userId');
  //     if (userId) {
  //       const result = await getUser(userId);
  //       console.log("🚀 ~ fetchUser ~ result:", result)
  //       if (result.success && result.user) {
  //         setUser(result.user);
  //         setUserEmail(result.user.email);
  //       }
  //     }
  //   };

  //   fetchUser();
  // }, []);

  const handleUpsell = () => {
    setIsLoading(true);
    if (onRequestUpsell) {
      onRequestUpsell();
    }
    setIsUpsellOpen(true);
    setIsLoading(false);
  };


  const toggleNotes = (exerciseId: string) => {
    setExpandedNotes(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // @TODO come back and fix types
  // const nutrition = {
  //   // @ts-ignore
  //   dailyCalories: plan.dailyCalories,
  //   // @ts-ignore
  //   proteinGrams: plan.proteinGrams,
  //   // @ts-ignore
  //   carbGrams: plan.carbGrams,
  //   // @ts-ignore
  //   fatGrams: plan.fatGrams
  // }

  const nutrition = getMacros(plan as WorkoutPlan);  

  useImperativeHandle(ref, () => ({
    generateWorkoutPDF: async (programId: string, userId: string) => {
      try {
        await generateWorkoutPDF(programId);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  }));

  return (
    <div className="space-y-8">
      {/* Premium Upsell Banner */}
      {userEmail && !user?.isPremium && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-sm overflow-hidden">
          <div className="md:p-4 p-2 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-6 bg-white/10 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Unlock Your Full Potential</h3>
                <p className="text-white/80">Get more customization, more tracking, more features, and more results for <span className="text-white font-bold">$10/month</span></p>
              </div>
            </div>
            <button
              onClick={handleUpsell}
              className="whitespace-nowrap px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-white/90 transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative p-6 lg:p-8">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {program.name || "Your Program"}
              </h2>
              {program.description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                  {program.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              {userEmail ? (
                <button
                  onClick={() => generateWorkoutPDF(program.id)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              ) : (
                <button
                  onClick={handleUpsell}
                  className="px-6 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 max-w-xs"
                >
                  ✨ Download PDF, share via email, or upgrade for more value!
                </button>
              )}
              {userEmail && !user?.isPremium && (
                <button
                  onClick={handleUpsell}
                  className="px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  ✨ Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Phase Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white">Phase 1</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.phaseExplanation}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 px-1 lg:p-8">
          {/* Phase Overview Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-2 space-y-2 lg:p-6 lg:space-y-6">
              <div className="flex items-start space-x-3 hidden">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Why This Phase</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {plan?.phaseExplanation || "This phase focuses on building foundational strength and muscle mass through progressive overload and compound movements."}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">What to Expect</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {plan?.phaseExpectations || "You'll start with moderate weights to perfect form, gradually increasing intensity. Expect to feel challenged but not overwhelmed."}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Keys to Success</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(plan?.phaseKeyPoints || [
                      "Focus on form over weight",
                      "Track your progress each session",
                      "Ensure adequate rest between workouts"
                    ]).map((point, index) => (
                      <li key={`key-point-${index}`} className="flex items-center">
                        <Dumbbell className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-2 space-y-2 lg:p-6 lg:space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Nutrition</h3>
                </div>
                <button
                  onClick={() => setIsMacrosGuideOpen(true)}
                  className="group relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Nutrition information"
                >
                  <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 -top-12 w-64 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-normal z-10">
                    Click for a quick guide to counting macros
                  </div>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'calories', label: 'Daily Calories', value: `${nutrition?.calories} kcals` },
                  { id: 'protein', label: 'Protein', value: `${nutrition?.protein}g` },
                  { id: 'carbs', label: 'Carbs', value: `${nutrition?.carbs}g` },
                  { id: 'fats', label: 'Fats', value: `${nutrition?.fats}g` }
                ].map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}

                  
                {/* {!userEmail && (
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    ✨ <button onClick={handleUpsell} className="text-indigo-600 dark:text-indigo-400 hover:underline">Upgrade to premium</button> for detailed meal plans
                  </p>
                )} */}
              </div>
            </div>
          </div>

          {/* Body Composition Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 space-y-4 lg:p-6 lg:space-y-6">
              <div className="flex items-center gap-2">
                <ChartLine className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Body Composition</h3>
              </div>
              

              <div className="relative">
                <div className="filter blur-sm pointer-events-none">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Body Fat:</span>
                    <span className="font-medium text-gray-900 dark:text-white">---%</span>
                  </div>
                  <div className="mt-3 flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Muscle Distribution:</span>
                    <span className="font-medium text-gray-900 dark:text-white">---</span>
                  </div>
                  <div className="mt-6 h-[128px] bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700" />
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-sm">
                    <p className="font-semibold text-gray-900 dark:text-white mb-4">
                      See Your Body Change
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3 mb-6">
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Body fat tracking
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Muscle mass analysis
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Progress photos
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Body measurements
                      </li>
                    </ul>
                    <button
                      onClick={handleUpsell}
                      className="w-full px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      Let&apos;s do it!
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Progress Stats Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 space-y-4 lg:p-6 lg:space-y-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Progress Stats</h3>
              </div>
              
              <div className="relative">
                <div className="filter blur-sm pointer-events-none">
                  <div className="h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 mb-4" />
                  <div className="h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700" />
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full max-w-sm">
                    <p className="font-semibold text-gray-900 dark:text-white mb-4">
                      Track Your Progress
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3 mb-6">
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Weekly check-ins
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Consistency tracking
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Volume and intensity
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2 text-indigo-600 dark:text-indigo-400">✓</span> Macronutrient goals
                      </li>
                    </ul>
                    <button
                      onClick={handleUpsell}
                      className="w-full px-4 py-2 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                    >
                      I&apos;m ready!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Schedule */}
      <div className="space-y-4">
        {plan.workouts
          .sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0))
          .map((workout) => (
            <div
              key={workout.id || `workout-${workout.dayNumber}`}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              <div className="border-b border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{workout.name || "Workout"}</h3>
                {workout.focus && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workout.focus}</p>
                )}
              </div>

              <div className="p-2 space-y-2 lg:p-6 lg:space-y-6">
                {/* Warmup Section */}
                {workout.warmup && (() => {
                  const warmupData = typeof workout.warmup === 'string' 
                    ? JSON.parse(workout.warmup)
                    : workout.warmup;
                  
                  return (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-indigo-600 dark:text-indigo-400" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M12 2v4" />
                          <path d="M12 18v4" />
                          <path d="m4.93 4.93 2.83 2.83" />
                          <path d="m16.24 16.24 2.83 2.83" />
                          <path d="M2 12h4" />
                          <path d="M18 12h4" />
                          <path d="m4.93 19.07 2.83-2.83" />
                          <path d="m16.24 7.76 2.83-2.83" />
                        </svg>
                        Warmup {warmupData.duration ? `(${warmupData.duration} mins)` : ''}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {warmupData.activities?.length ? (
                          warmupData.activities.map((activity: string, idx: number) => (
                            <li key={`warmup-${workout.id}-${activity}-${idx}`}>{activity}</li>
                          ))
                        ) : (
                          <li key={`warmup-${workout.id}-default`}>General warmup</li>
                        )}
                      </ul>
                    </div>
                  );
                })()}

                {/* Main Workout */}
                <div>
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="col-span-6">Exercise</div>
                    <div className="col-span-1">Sets</div>
                    <div className="col-span-2">Reps</div>
                    <div className="col-span-3">Rest</div>
                  </div>

                  {/* Exercise Rows */}
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, exerciseIndex) => {
                      const exerciseId = exercise.id || `exercise-${workout.id}-${exercise.name}-${exerciseIndex}`;
                      const isExpanded = expandedNotes.includes(exerciseId);
                      
                      return (
                        <div
                          key={exerciseId}
                          className="group relative overflow-hidden rounded-lg border border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-900/30 dark:via-transparent dark:to-purple-900/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          <div className="relative grid grid-cols-12 gap-4 p-4">
                            <div className="col-span-6 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                              {exercise.name}
                              {exercise.notes && (
                                <button
                                  onClick={() => toggleNotes(exerciseId)}
                                  className="group relative p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  aria-label={isExpanded ? "Hide exercise notes" : "Show exercise notes"}
                                >
                                  <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 -top-10 w-64 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap">
                                    Click to view exercise notes and video
                                  </span>
                                </button>
                              )}
                            </div>
                            <div className="col-span-1 text-gray-600 dark:text-gray-400">{exercise.sets}</div>
                            <div className="col-span-2 text-gray-600 dark:text-gray-400">
                              {(() => {
                                const formatted = formatExerciseMeasure(exercise);
                                if (formatted.includes('reps')) {
                                  return formatted.replace('reps', '');
                                }
                                return formatted;
                              })()}
                            </div>
                            <div className="col-span-3 text-gray-600 dark:text-gray-400">{formatRestPeriod(typeof exercise.restPeriod === 'string' ? parseInt(exercise.restPeriod) : exercise.restPeriod)}</div>
                          </div>
                          
                          {/* Expandable Notes Section */}
                          {exercise.notes && isExpanded && (
                            <>
                              <div className="h-px bg-gray-100 dark:bg-gray-700" />
                              <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                {exercise.notes}<br/>
                                <a href={`https://www.youtube.com/results?search_query=${exercise.name} how to`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 hover:text-indigo-600 dark:text-indigo-400 underline underline-offset-4 gap-1">Need a video? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cooldown Section */}
                {workout.cooldown && (() => {
                  const cooldownData = typeof workout.cooldown === 'string'
                    ? JSON.parse(workout.cooldown)
                    : workout.cooldown;
                  
                  return (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5 text-indigo-600 dark:text-indigo-400" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                        </svg>
                        Cooldown {cooldownData.duration ? `(${cooldownData.duration} mins)` : ''}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {cooldownData.activities?.length ? (
                          cooldownData.activities.map((activity: string, idx: number) => (
                            <li key={`cooldown-${workout.id}-${activity}-${idx}`}>{activity}</li>
                          ))
                        ) : (
                          <li key={`cooldown-${workout.id}-default`}>General cooldown</li>
                        )}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
      </div>

      {/* Add the MacrosGuideModal */}
      <MacrosGuideModal 
        isOpen={isMacrosGuideOpen}
        onClose={() => setIsMacrosGuideOpen(false)}
      />
    </div>
  );
});

WorkoutPlanDisplay.displayName = 'WorkoutPlanDisplay';