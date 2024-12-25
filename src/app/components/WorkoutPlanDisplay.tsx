import { useState } from 'react';
import { WorkoutPlan } from '@/types/program';
import { UpsellModal } from './UpsellModal';
import { Target, Brain, Activity, Key, Dumbbell, Apple, ChartLine } from 'lucide-react';
import { formatRestPeriod } from '@/utils/formatters';

interface ExtendedWorkoutPlan extends WorkoutPlan {
  phaseExplanation?: string;
  phaseExpectations?: string;
  phaseKeyPoints?: string[];
  bodyFatPercentage?: number;
  muscleMassDistribution?: string;
}

interface WorkoutPlanDisplayProps {
  plan: ExtendedWorkoutPlan;
  userEmail?: string | null;
  onRequestUpsell?: () => void;
}

export function WorkoutPlanDisplay({ userEmail: initialUserEmail, plan, onRequestUpsell }: WorkoutPlanDisplayProps) {
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);

  const handleUpsell = () => {
    if (onRequestUpsell) {
      onRequestUpsell();
    }
  };

  const nutrition = plan.nutrition;

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Phase Overview Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Phase Overview</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mt-1">
                  <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">Why This Phase</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {plan?.phaseExplanation || "This phase focuses on building foundational strength and muscle mass through progressive overload and compound movements."}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mt-1">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">What to Expect</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {plan?.phaseExpectations || "You'll start with moderate weights to perfect form, gradually increasing intensity. Expect to feel challenged but not overwhelmed."}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg mt-1">
                  <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-gray-100 mb-2 font-semibold">Keys to Success</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(plan?.phaseKeyPoints || [
                      "Focus on form over weight",
                      "Track your progress each session",
                      "Ensure adequate rest between workouts"
                    ]).map((point, index) => (
                      <li key={`key-point-${index}`} className="flex items-center">
                        <Dumbbell className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Apple className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold">Nutrition</h3>
            </div>
            <div className="space-y-3">
              {[
                { id: 'calories', label: 'Daily Calories', value: `${nutrition?.dailyCalories} kcals` },
                { id: 'protein', label: 'Protein', value: `${nutrition?.macros?.protein}g` },
                { id: 'carbs', label: 'Carbs', value: `${nutrition?.macros?.carbs}g` },
                { id: 'fats', label: 'Fats', value: `${nutrition?.macros?.fats}g` }
              ].map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Body Composition Section */}
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Body Composition</h3>
            </div>
            
            {!userEmail ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                <div className="bg-white/90 dark:bg-gray-800/95 p-4 rounded-xl shadow-lg w-full max-w-sm">
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">
                    Unlock Your Custom Analysis
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> Precise body fat calculations
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> Muscle mass distribution insights
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span> Personalized nutrition adjustments
                    </li>
                  </ul>
                  <button
                    onClick={handleUpsell}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Get Custom Analysis
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Body Fat:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{plan?.bodyFatPercentage}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Muscle Distribution:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{plan?.muscleMassDistribution}</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Stats Section */}
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                <ChartLine className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold">Body & Progress Stats</h3>
            </div>
            
            {!userEmail ? (
              <div>
                <div className="filter blur-sm pointer-events-none">
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg mb-4" />
                  <div className="h-32 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-lg" />
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="bg-white/90 dark:bg-gray-800/95 p-4 rounded-xl shadow-lg w-full max-w-sm">
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">
                      Transform Your Journey
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Weekly progress photos
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Body measurements tracking
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Strength progression analytics
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Smart goal adjustments
                      </li>
                    </ul>
                    <button
                      onClick={handleUpsell}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                      Unlock Progress Tracking
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg" />
                <div className="h-32 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Training Schedule */}
      <div className="space-y-6">
        {/* <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Training Schedule
        </h2> */}
        {plan.workouts
          .sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0))
          .map((workout) => (
            <div
              key={workout.id || `workout-${workout.dayNumber}`}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-bold text-xl">{workout.name ? `${workout.name}` : ``}</h3>
                {workout.focus && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workout.focus}</p>
                )}
              </div>
              <div className="p-6 space-y-6">
                {/* Warmup Section */}
                {workout.warmup && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
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
                      Warmup {workout.warmup.duration ? `(${workout.warmup.duration} mins)` : ''}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      {workout.warmup.activities?.map((activity, idx) => (
                        <li key={`warmup-${workout.id}-${activity}-${idx}`}>{activity}</li>
                      )) || <li key={`warmup-${workout.id}-default`}>General warmup</li>}
                    </ul>
                  </div>
                )}

                {/* Main Workout */}
                <div>
                  {/* Header */}
                  <div className="grid font-bold grid-cols-12 gap-4 text-sm text-left mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="col-span-6">Exercise</div>
                    <div className="col-span-1">Sets</div>
                    <div className="col-span-2">Reps</div>
                    <div className="col-span-3">Rest</div>
                  </div>
                  {/* Exercise Rows */}
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, exerciseIndex) => (
                      <div
                        key={`exercise-${workout.id}-${exercise.name}-${exerciseIndex}`}
                        className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg px-3"
                      >
                        <div className="col-span-6 font-medium">{exercise.name}</div>
                        <div className="col-span-1">{exercise.sets}</div>
                        <div className="col-span-2">{exercise.reps}</div>
                        <div className="col-span-3">{formatRestPeriod(typeof exercise.restPeriod === 'string' ? parseInt(exercise.restPeriod) : exercise.restPeriod)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cooldown Section */}
                {workout.cooldown && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                      </svg>
                      Cooldown {workout.cooldown.duration ? `(${workout.cooldown.duration} mins)` : ''}
                    </h4>
                    <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                      {workout.cooldown.activities?.map((activity, idx) => (
                        <li key={`cooldown-${workout.id}-${activity}-${idx}`}>{activity}</li>
                      )) || <li key={`cooldown-${workout.id}-default`}>General cooldown</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => setIsUpsellOpen(false)}
        onEmailSubmit={(email: string) => {
          setUserEmail(email);
          setIsUpsellOpen(false);
        }}
        onPurchase={() => setIsUpsellOpen(false)}
        userEmail={userEmail}
      />
    </div>
  );
}
