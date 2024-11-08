type Exercise = {
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
};

type Workout = {
  dayNumber: number;
  exercises: Exercise[];
};

type WorkoutPlan = {
  bodyFatPercentage: number;
  muscleMassDistribution: string;
  daysPerWeek: number;
  dailyCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  mealTiming: string[];
  progressionProtocol: string[];
  workouts: Workout[];
};

export function WorkoutPlanDisplay({ plan }: { plan: WorkoutPlan }) {
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Training Program Overview
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
              <li key={index}>{timing}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <h3 className="font-medium">Progression Protocol</h3>
          <ul className="list-disc list-inside">
            {plan.progressionProtocol.map((protocol, index) => (
              <li key={index}>{protocol}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Workouts Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Weekly Workout Schedule</h2>
        {plan.workouts
          .sort((a, b) => a.dayNumber - b.dayNumber)
          .map((workout) => (
            <div
              key={workout.dayNumber}
              className="bg-white rounded-lg shadow p-6"
            >
              <h3 className="font-semibold mb-4">Day {workout.dayNumber}</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-2">Exercise</th>
                    <th className="pb-2">Sets</th>
                    <th className="pb-2">Reps</th>
                    <th className="pb-2">Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {workout.exercises.map((exercise, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-2">{exercise.name}</td>
                      <td className="py-2">{exercise.sets}</td>
                      <td className="py-2">{exercise.reps}</td>
                      <td className="py-2">{exercise.restPeriod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </div>
    </div>
  );
}
