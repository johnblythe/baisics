interface WorkoutPlanProps {
  aiResponse: {
    workoutPlan: {
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
  };
}

export default function WorkoutPlan({ aiResponse }: WorkoutPlanProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <WorkoutSchedule workoutPlan={aiResponse.workoutPlan} />

      <div className="grid gap-8">
        {aiResponse.workoutPlan.workouts.map((workout, index) => (
          <WorkoutDetails
            key={workout.day}
            workoutNumber={index + 1}
            workoutSets={workout.exercises}
          />
        ))}
      </div>
    </div>
  );
}
