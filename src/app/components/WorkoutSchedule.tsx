type WorkoutPlan = {
  daysPerWeek: number;
  workouts: Array<{
    day: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      restPeriod: string;
    }>;
  }>;
};

interface WorkoutScheduleProps {
  workoutPlan: WorkoutPlan;
}

export default function WorkoutSchedule({ workoutPlan }: WorkoutScheduleProps) {
  // Generate 4 weeks of schedule
  const weeks = [1, 2, 3, 4];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Map workout days to their respective days of the week
  const workoutMap = new Map();
  workoutPlan.workouts.forEach((workout, index) => {
    // Assuming workouts start on Monday, adjust as needed
    workoutMap.set(workout.day - 1, `Workout ${index + 1}`);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green-600 text-white">
            <th colSpan={8} className="p-2 text-center text-xl">
              Workout Schedule
            </th>
          </tr>
          <tr className="bg-gray-200">
            <th className="border p-2">Day</th>
            {days.map((day) => (
              <th key={day} className="border p-2">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week}>
              <td className="border p-2">Week {week}</td>
              {days.map((_, index) => (
                <td key={index} className="border p-2 text-center">
                  {workoutMap.has(index) ? (
                    <span
                      className={`font-bold ${
                        workoutMap.get(index) === "Workout 1"
                          ? "text-blue-600"
                          : workoutMap.get(index) === "Workout 2"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {workoutMap.get(index)}
                    </span>
                  ) : (
                    <span className="italic">rest</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
