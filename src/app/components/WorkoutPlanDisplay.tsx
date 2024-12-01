import { useState, useEffect } from 'react';
import { UpsellModal } from './UpsellModal';
import ReactConfetti from "react-confetti";
import { createNewUser } from '../start/actions';
import { WorkoutPlanDisplayProps } from '../start/types';


export function WorkoutPlanDisplay({ userEmail: initialUserEmail, plan }: WorkoutPlanDisplayProps) {
  console.log("Plan structure:", JSON.stringify(plan, null, 2));
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(initialUserEmail);
  const [showConfetti, setShowConfetti] = useState(false);

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
    const response = await createNewUser(email);
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Training Program Overview - Phase {plan.phase}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Body Composition</h3>
              <p>Body Fat: {plan.bodyFatPercentage}%</p>
              <p>Muscle Distribution: {plan.muscleMassDistribution}</p>
            </div>
            <div>
              <h3 className="font-medium">Nutrition</h3>
              <p>Daily Calories: {plan.dailyCalories}</p>
              <p>Protein: {plan.proteinGrams}g</p>
              <p>Carbs: {plan.carbGrams}g</p>
              <p>Fats: {plan.fatGrams}g</p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Meal Timing</h3>
            <ul className="list-disc list-inside">
              {plan.mealTiming.map((timing, index) => (
                <li key={`meal-timing-${index}`}>{timing}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Progression Protocol</h3>
            <ul className="list-disc list-inside">
              {plan.progressionProtocol.map((protocol, index) => (
                <li key={`progression-${index}`}>{protocol}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Workouts Section */}
        <div className="space-y-6 relative">
          <h2 className="text-xl font-semibold">Training Schedule</h2>
          {plan.workouts
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((workout) => (
            <div
              key={workout.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h3 className="font-semibold mb-4">Day {workout.dayNumber}</h3>
              <div className="w-full">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 text-left font-medium mb-2">
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
                      className="grid grid-cols-12 gap-4 py-2 border-t"
                    >
                      <div className="col-span-6">{exercise.name}</div>
                      <div className="col-span-1">{exercise.sets}</div>
                      <div className="col-span-2">{exercise.reps}</div>
                      <div className="col-span-3">{exercise.restPeriod}</div>
                    </div>
                  ))}
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
