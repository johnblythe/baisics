interface Exercise {
  name: string;
  sets: number;
  reps: number;
  restPeriod: string;
}

interface WorkoutDetailsProps {
  workoutNumber: number;
  workoutSets: Exercise[];
}

export default function WorkoutDetails({
  workoutNumber,
  workoutSets,
}: WorkoutDetailsProps) {
  // Group exercises into sets of 3
  const groupedSets = workoutSets.reduce(
    (acc: Exercise[][], exercise: Exercise, index: number) => {
      const setIndex = Math.floor(index / 3);
      if (!acc[setIndex]) {
        acc[setIndex] = [];
      }
      acc[setIndex].push(exercise);
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 bg-white rounded-xl shadow-sm">
      <h2
        className={`text-3xl font-bold ${
          workoutNumber === 1
            ? "text-blue-600"
            : workoutNumber === 2
            ? "text-green-600"
            : "text-red-600"
        }`}
      >
        Workout {workoutNumber}
      </h2>

      <div className="flex flex-col gap-4">
        {groupedSets.map((exercises, setIndex) => (
          <div
            key={setIndex}
            className="flex flex-col bg-gray-50 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-gray-100">
              <h3 className="text-lg font-semibold">
                Set {String.fromCharCode(65 + setIndex)}
              </h3>
              <span className="text-sm text-gray-600">
                Rest {exercises[0].restPeriod} between exercises
              </span>
            </div>

            <div className="flex flex-col divide-y divide-gray-100">
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium">{exercise.name}</span>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500">Sets</span>
                      <span className="font-semibold">{exercise.sets}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500">Reps</span>
                      <span className="font-semibold">{exercise.reps}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-gray-500">Rest</span>
                      <span className="font-semibold">
                        {exercise.restPeriod}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
