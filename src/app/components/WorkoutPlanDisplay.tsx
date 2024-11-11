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
    <div className="space-y-8 mt-4">
      {/* Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
  );
}
