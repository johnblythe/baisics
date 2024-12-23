import { useState } from 'react';
import { WorkoutPlan } from '@/types/program';
import { UpsellModal } from './UpsellModal';

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  userEmail?: string | null;
}

export function WorkoutPlanDisplay({ userEmail: initialUserEmail, plan }: WorkoutPlanDisplayProps) {
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);

  const handleUpsell = () => {
    setIsUpsellOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Phase Overview Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Phase Overview</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Why This Phase</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {plan.phaseExplanation || "This phase focuses on building foundational strength and muscle mass through progressive overload and compound movements."}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">What to Expect</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {plan.phaseExpectations || "You'll start with moderate weights to perfect form, gradually increasing intensity. Expect to feel challenged but not overwhelmed."}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Keys to Success</h4>
                <ul className="list-disc pl-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {(plan.phaseKeyPoints || [
                    "Focus on form over weight",
                    "Track your progress each session",
                    "Ensure adequate rest between workouts"
                  ]).map((point, index) => (
                    <li key={`key-point-${index}`}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Combined Nutrition & Progression Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="space-y-6">
              {/* Nutrition Part */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Nutrition</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Daily Calories:</span>
                    <span className="font-medium">{plan.dailyCalories}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Protein:</span>
                    <span className="font-medium">{plan.proteinGrams}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Carbs:</span>
                    <span className="font-medium">{plan.carbGrams}g</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Fats:</span>
                    <span className="font-medium">{plan.fatGrams}g</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Progression Part */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Progression Protocol</h3>
                <ul className="space-y-2">
                  {plan.progressionProtocol?.map((protocol: string, index: number) => (
                    <li key={`protocol-${index}`} className="text-gray-600 dark:text-gray-400">
                      {protocol}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Body Composition Section */}
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Body Composition</h3>
            </div>
            
            {!userEmail ? (
              <div className="flex flex-col items-center justify-center text-center py-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Add photos or measurements to get custom analysis & nutrition
                </p>
                <button
                  onClick={handleUpsell}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Get Custom Analysis
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 dark:text-gray-400">Body Fat:</span>
                  <span className="font-medium">{plan.bodyFatPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Muscle Distribution:</span>
                  <span className="font-medium">{plan.muscleMassDistribution}</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Stats Section */}
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Body & Progress Stats</h3>
            </div>
            
            {!userEmail ? (
              <div>
                {/* Blurred Charts */}
                <div className="filter blur-sm pointer-events-none">
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg mb-4">
                    {/* Placeholder for body measurements chart */}
                  </div>
                  <div className="h-32 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-lg">
                    {/* Placeholder for progress tracking chart */}
                  </div>
                </div>
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Track your progress with detailed body measurements and performance metrics
                  </p>
                  <button
                    onClick={handleUpsell}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Unlock Progress Tracking
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                  {/* Actual body measurements chart would go here */}
                </div>
                <div className="h-32 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 rounded-lg">
                  {/* Actual progress tracking chart would go here */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Training Schedule */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Training Schedule
        </h2>
        {console.log("Full plan:", plan)}
        {console.log("Workouts array:", plan.workouts)}
        {plan.workouts
          .sort((a, b) => {
            console.log("Sorting workouts:", { a, b });
            return (a.dayNumber || a.day) - (b.dayNumber || b.day);
          })
          .map((workout, index) => {
            console.log("Workout details:", {
              id: workout.id,
              focus: workout.focus,
              warmup: workout.warmup,
              cooldown: workout.cooldown,
              exercises: workout.exercises.map(ex => ({
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                restPeriod: ex.restPeriod
              }))
            });
            return (
              <div
                key={workout.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="font-bold text-xl">{workout.focus ? ` - ${workout.focus}` : `${workout.name}`}</h3>
                  {workout.name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{workout.name}</p>
                  )}
                </div>
                <div className="p-6 space-y-6">
                  {/* Warmup Section */}
                  {workout.warmup && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                        </svg>
                        Warmup {workout.warmup.duration ? `(${workout.warmup.duration} mins)` : ''}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        {workout.warmup.activities?.map((activity, index) => (
                          <li key={`warmup-${index}`}>{activity}</li>
                        )) || <li>General warmup</li>}
                      </ul>
                    </div>
                  )}

                  {/* Main Workout */}
                  <div>
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 text-sm text-left mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg font-medium">
                      <div className="col-span-6">Exercise</div>
                      <div className="col-span-1">Sets</div>
                      <div className="col-span-2">Reps</div>
                      <div className="col-span-3">Rest</div>
                    </div>
                    {/* Exercise Rows */}
                    <div className="space-y-2">
                      {workout.exercises.map((exercise, index) => {
                        console.log("Exercise details:", exercise);
                        return (
                          <div
                            key={`exercise-${workout.id}-${index}`}
                            className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg px-3"
                          >
                            <div className="col-span-6 font-medium">{exercise.name}</div>
                            <div className="col-span-1">{exercise.sets}</div>
                            <div className="col-span-2">{exercise.reps}</div>
                            <div className="col-span-3">{exercise.restPeriod || '60s'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cooldown Section */}
                  {workout.cooldown && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                        </svg>
                        Cooldown {workout.cooldown.duration ? `(${workout.cooldown.duration} mins)` : ''}
                      </h4>
                      <ul className="list-disc list-inside text-sm text-green-800 dark:text-green-200 space-y-1">
                        {workout.cooldown.activities?.map((activity, index) => (
                          <li key={`cooldown-${index}`}>{activity}</li>
                        )) || <li>General cooldown</li>}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
