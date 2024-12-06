import { useState, useEffect } from 'react';
import { UpsellModal } from './UpsellModal';
import ReactConfetti from "react-confetti";
import { createNewUser } from '../start/actions';
import { WorkoutPlanDisplayProps } from '../start/types';


export function WorkoutPlanDisplay({ userEmail: initialUserEmail, plan }: WorkoutPlanDisplayProps) {
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleEmailSubmit = (email: string) => {
    setUserEmail(email);
    setIsUpsellOpen(false);
    setShowConfetti(true);
    handleCreateNewUser(email);
  };

  const handleCreateNewUser = async (email: string) => {
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (!userId) {
      throw new Error("No user ID found in URL");
    }
    const response = await createNewUser({ userId, email });
    if (response.success) {
      setUserEmail(email);
    }
  };

  const handlePurchase = () => {
    // TODO: Implement purchase flow
    console.log('Purchase clicked');
    setIsUpsellOpen(false);
  };

  return (
    <>
      {showConfetti && <ReactConfetti />}
      <div className="space-y-8">
        {/* Overview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              Phase {plan.phase} Overview
            </h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition"
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </button>
          </div>

          {isExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Body Composition</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between"><span>Body Fat:</span> <span className="font-medium">{plan.bodyFatPercentage}%</span></p>
                    <p className="flex justify-between"><span>Muscle Distribution:</span> <span className="font-medium">{plan.muscleMassDistribution}</span></p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Nutrition</h3>
                  <div className="space-y-2">
                    <p className="flex justify-between"><span>Daily Calories:</span> <span className="font-medium">{plan.dailyCalories}</span></p>
                    <p className="flex justify-between"><span>Protein:</span> <span className="font-medium">{plan.proteinGrams}g</span></p>
                    <p className="flex justify-between"><span>Carbs:</span> <span className="font-medium">{plan.carbGrams}g</span></p>
                    <p className="flex justify-between"><span>Fats:</span> <span className="font-medium">{plan.fatGrams}g</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Meal Timing</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {plan.mealTiming.map((timing, index) => (
                      <li key={`meal-timing-${index}`}>{timing}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Progression Protocol</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {plan.progressionProtocol.map((protocol, index) => (
                      <li key={`progression-${index}`}>{protocol}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workouts Section */}
        <div className="space-y-6 relative">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Training Schedule</h2>
          {plan.workouts
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((workout) => (
            <div
              key={workout.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-bold text-xl">Session {workout.dayNumber}</h3>
              </div>
              <div className="p-6">
                {/* Header */}
                <div className="grid font-semibold grid-cols-12 gap-4 text-sm text-left mb-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="col-span-6">Exercise</div>
                  <div className="col-span-1">Sets</div>
                  <div className="col-span-2">Reps</div>
                  <div className="col-span-3">Rest</div>
                </div>
                {/* Exercise Rows */}
                <div className="space-y-2">
                  {workout.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg px-3"
                    >
                      <div className="col-span-6 font-medium">{exercise.name}</div>
                      <div className="col-span-1">{exercise.sets}</div>
                      <div className="col-span-2">{exercise.reps}</div>
                      <div className="col-span-3">{exercise.restPeriod}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Have questions?{' '}
                    <span 
                      onClick={() => setIsUpsellOpen(true)} 
                      className="cursor-pointer font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      Upgrade to get full access
                    </span>{' '}
                    to your trainer. No limits, no ads, just success.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <UpsellModal
        isOpen={isUpsellOpen}
        onClose={() => setIsUpsellOpen(false)}
        onEmailSubmit={handleEmailSubmit}
        onPurchase={handlePurchase}
        userEmail={userEmail}
      />
    </>
  );
}
