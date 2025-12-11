'use client';

import { useState } from 'react';
import { GeneratingProgramTransition } from '../components/GeneratingProgramTransition';
import type { ValidatedPhase } from '@/services/programGeneration/schema';

// Mock data for design preview
const MOCK_PHASES: ValidatedPhase[] = [
  {
    phaseNumber: 1,
    name: 'Foundation & Movement Mastery',
    durationWeeks: 4,
    focus: 'Building movement patterns and establishing training consistency while developing work capacity',
    explanation: 'This phase focuses on building a solid foundation.',
    expectations: 'Expect to feel more comfortable with the exercises by week 3.',
    keyPoints: [
      'Master fundamental movement patterns',
      'Build work capacity and conditioning base',
      'Establish consistent training habits',
      'Learn proper breathing and bracing techniques',
    ],
    splitType: 'Full Body 3x/week',
    workouts: [
      {
        dayNumber: 1,
        name: 'Full Body A',
        focus: 'Push emphasis with compound movements',
        warmup: { duration: 10, activities: ['Dynamic stretching', 'Light cardio'] },
        cooldown: { duration: 5, activities: ['Static stretching'] },
        exercises: [
          { name: 'Barbell Back Squat', sets: 4, measure: { type: 'reps', value: 8 }, restPeriod: 120, equipment: ['barbell', 'rack'], alternatives: ['Goblet Squat'], category: 'primary', intensity: 'RPE 7-8' },
          { name: 'Bench Press', sets: 4, measure: { type: 'reps', value: 8 }, restPeriod: 90, equipment: ['barbell', 'bench'], alternatives: ['Dumbbell Press'], category: 'primary', intensity: 'RPE 7-8' },
          { name: 'Bent Over Row', sets: 3, measure: { type: 'reps', value: 10 }, restPeriod: 90, equipment: ['barbell'], alternatives: ['Cable Row'], category: 'secondary', intensity: 'RPE 7' },
          { name: 'Romanian Deadlift', sets: 3, measure: { type: 'reps', value: 10 }, restPeriod: 90, equipment: ['barbell'], alternatives: ['Dumbbell RDL'], category: 'secondary', intensity: 'RPE 7' },
          { name: 'Lateral Raises', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: ['dumbbells'], alternatives: ['Cable Laterals'], category: 'isolation', intensity: 'RPE 8' },
          { name: 'Plank Hold', sets: 3, measure: { type: 'time', value: 45, unit: 'seconds' }, restPeriod: 45, equipment: [], alternatives: ['Dead Bug'], category: 'isolation' },
        ],
      },
      {
        dayNumber: 2,
        name: 'Full Body B',
        focus: 'Pull emphasis with hinge patterns',
        warmup: { duration: 10, activities: ['Band pull-aparts', 'Hip circles'] },
        cooldown: { duration: 5, activities: ['Foam rolling'] },
        exercises: [
          { name: 'Deadlift', sets: 4, measure: { type: 'reps', value: 6 }, restPeriod: 150, equipment: ['barbell'], alternatives: ['Trap Bar Deadlift'], category: 'primary', intensity: 'RPE 8' },
          { name: 'Overhead Press', sets: 4, measure: { type: 'reps', value: 8 }, restPeriod: 90, equipment: ['barbell'], alternatives: ['Dumbbell Press'], category: 'primary', intensity: 'RPE 7-8' },
          { name: 'Pull-ups', sets: 3, measure: { type: 'reps', value: 8 }, restPeriod: 90, equipment: ['pull-up bar'], alternatives: ['Lat Pulldown'], category: 'secondary', intensity: 'RPE 8' },
          { name: 'Walking Lunges', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: ['dumbbells'], alternatives: ['Split Squats'], category: 'secondary' },
          { name: 'Face Pulls', sets: 3, measure: { type: 'reps', value: 15 }, restPeriod: 45, equipment: ['cable'], alternatives: ['Band Pull-aparts'], category: 'isolation' },
        ],
      },
      {
        dayNumber: 3,
        name: 'Full Body C',
        focus: 'Volume and conditioning',
        warmup: { duration: 10, activities: ['Jump rope', 'Dynamic mobility'] },
        cooldown: { duration: 5, activities: ['Stretching'] },
        exercises: [
          { name: 'Front Squat', sets: 4, measure: { type: 'reps', value: 8 }, restPeriod: 90, equipment: ['barbell'], alternatives: ['Goblet Squat'], category: 'primary', intensity: 'RPE 7' },
          { name: 'Incline Dumbbell Press', sets: 3, measure: { type: 'reps', value: 10 }, restPeriod: 75, equipment: ['dumbbells', 'bench'], alternatives: [], category: 'secondary' },
          { name: 'Cable Row', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: ['cable'], alternatives: [], category: 'secondary' },
          { name: 'Leg Press', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: ['leg press'], alternatives: [], category: 'secondary' },
          { name: 'Tricep Pushdowns', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 45, equipment: ['cable'], alternatives: [], category: 'isolation' },
          { name: 'Bicep Curls', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 45, equipment: ['dumbbells'], alternatives: [], category: 'isolation' },
        ],
      },
    ],
    nutrition: {
      dailyCalories: 2400,
      macros: { protein: 180, carbs: 260, fats: 80 },
      mealTiming: ['Pre-workout: 2 hours before', 'Post-workout: within 1 hour'],
    },
    progressionProtocol: ['Add 5lbs to compound lifts weekly', 'Increase reps before weight on isolation'],
  },
  {
    phaseNumber: 2,
    name: 'Strength & Hypertrophy',
    durationWeeks: 4,
    focus: 'Progressive overload with increased volume and intensity for muscle growth',
    explanation: 'Building on your foundation with more advanced techniques.',
    expectations: 'Noticeable strength gains and muscle definition.',
    keyPoints: [
      'Progressive overload on all major lifts',
      'Introduce intensity techniques',
      'Optimize training frequency',
      'Focus on mind-muscle connection',
    ],
    splitType: 'Upper/Lower 4x/week',
    workouts: [
      {
        dayNumber: 1,
        name: 'Upper A - Push Focus',
        focus: 'Horizontal and vertical pushing',
        warmup: { duration: 8, activities: ['Shoulder rotations', 'Light pressing'] },
        cooldown: { duration: 5, activities: ['Stretching'] },
        exercises: [
          { name: 'Bench Press', sets: 5, measure: { type: 'reps', value: 5 }, restPeriod: 180, equipment: ['barbell'], alternatives: [], category: 'primary', intensity: 'RPE 8-9' },
          { name: 'Overhead Press', sets: 4, measure: { type: 'reps', value: 6 }, restPeriod: 120, equipment: ['barbell'], alternatives: [], category: 'primary' },
          { name: 'Incline DB Press', sets: 3, measure: { type: 'reps', value: 10 }, restPeriod: 90, equipment: ['dumbbells'], alternatives: [], category: 'secondary' },
          { name: 'Cable Flyes', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: ['cable'], alternatives: [], category: 'isolation' },
          { name: 'Lateral Raises', sets: 4, measure: { type: 'reps', value: 15 }, restPeriod: 45, equipment: ['dumbbells'], alternatives: [], category: 'isolation' },
        ],
      },
      {
        dayNumber: 2,
        name: 'Lower A - Quad Focus',
        focus: 'Squat patterns and quad development',
        warmup: { duration: 10, activities: ['Hip mobility', 'Bodyweight squats'] },
        cooldown: { duration: 5, activities: ['Quad stretching'] },
        exercises: [
          { name: 'Back Squat', sets: 5, measure: { type: 'reps', value: 5 }, restPeriod: 180, equipment: ['barbell'], alternatives: [], category: 'primary', intensity: 'RPE 8-9' },
          { name: 'Leg Press', sets: 4, measure: { type: 'reps', value: 10 }, restPeriod: 90, equipment: [], alternatives: [], category: 'secondary' },
          { name: 'Walking Lunges', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: ['dumbbells'], alternatives: [], category: 'secondary' },
          { name: 'Leg Extensions', sets: 3, measure: { type: 'reps', value: 15 }, restPeriod: 45, equipment: [], alternatives: [], category: 'isolation' },
          { name: 'Standing Calf Raises', sets: 4, measure: { type: 'reps', value: 15 }, restPeriod: 45, equipment: [], alternatives: [], category: 'isolation' },
        ],
      },
      {
        dayNumber: 3,
        name: 'Upper B - Pull Focus',
        focus: 'Back development and biceps',
        warmup: { duration: 8, activities: ['Band work', 'Light rows'] },
        cooldown: { duration: 5, activities: ['Lat stretching'] },
        exercises: [
          { name: 'Weighted Pull-ups', sets: 4, measure: { type: 'reps', value: 6 }, restPeriod: 120, equipment: [], alternatives: [], category: 'primary', intensity: 'RPE 8' },
          { name: 'Barbell Row', sets: 4, measure: { type: 'reps', value: 8 }, restPeriod: 90, equipment: ['barbell'], alternatives: [], category: 'primary' },
          { name: 'Seated Cable Row', sets: 3, measure: { type: 'reps', value: 10 }, restPeriod: 75, equipment: ['cable'], alternatives: [], category: 'secondary' },
          { name: 'Face Pulls', sets: 3, measure: { type: 'reps', value: 15 }, restPeriod: 45, equipment: ['cable'], alternatives: [], category: 'isolation' },
          { name: 'Barbell Curls', sets: 3, measure: { type: 'reps', value: 10 }, restPeriod: 60, equipment: ['barbell'], alternatives: [], category: 'isolation' },
        ],
      },
      {
        dayNumber: 4,
        name: 'Lower B - Hinge Focus',
        focus: 'Posterior chain development',
        warmup: { duration: 10, activities: ['Hip hinges', 'Glute activation'] },
        cooldown: { duration: 5, activities: ['Hamstring stretching'] },
        exercises: [
          { name: 'Romanian Deadlift', sets: 4, measure: { type: 'reps', value: 8 }, restPeriod: 120, equipment: ['barbell'], alternatives: [], category: 'primary', intensity: 'RPE 8' },
          { name: 'Hip Thrust', sets: 4, measure: { type: 'reps', value: 10 }, restPeriod: 90, equipment: ['barbell'], alternatives: [], category: 'secondary' },
          { name: 'Leg Curl', sets: 3, measure: { type: 'reps', value: 12 }, restPeriod: 60, equipment: [], alternatives: [], category: 'isolation' },
          { name: 'Back Extensions', sets: 3, measure: { type: 'reps', value: 15 }, restPeriod: 45, equipment: [], alternatives: [], category: 'isolation' },
          { name: 'Seated Calf Raises', sets: 4, measure: { type: 'reps', value: 20 }, restPeriod: 45, equipment: [], alternatives: [], category: 'isolation' },
        ],
      },
    ],
    nutrition: {
      dailyCalories: 2600,
      macros: { protein: 200, carbs: 290, fats: 85 },
      mealTiming: ['4-5 meals spread throughout the day'],
    },
    progressionProtocol: ['Increase weight when hitting top of rep range', 'Add sets every 2 weeks'],
  },
];

const MOCK_PROGRAM_META = {
  name: '12-Week Strength & Hypertrophy Program',
  description: 'A comprehensive program designed to build strength and muscle mass through progressive overload and intelligent periodization.',
  totalWeeks: 8,
};

type DesignState = 'initial' | 'analyzing' | 'generating' | 'one-phase' | 'two-phases' | 'complete';

export default function DesignPreviewPage() {
  const [currentState, setCurrentState] = useState<DesignState>('initial');

  const getProgressForState = (state: DesignState) => {
    switch (state) {
      case 'initial':
        return { stage: 'idle', message: 'Starting...', progress: 0 };
      case 'analyzing':
        return { stage: 'analyzing', message: 'Analyzing your profile...', progress: 15 };
      case 'generating':
        return { stage: 'generating', message: 'Designing your program...', progress: 35 };
      case 'one-phase':
        return { stage: 'generating', message: 'Generating more phases...', progress: 55 };
      case 'two-phases':
        return { stage: 'generating', message: 'Finalizing program...', progress: 85 };
      case 'complete':
        return { stage: 'complete', message: 'Your program is ready!', progress: 100 };
      default:
        return { stage: 'idle', message: '', progress: 0 };
    }
  };

  const getPhasesForState = (state: DesignState): ValidatedPhase[] => {
    switch (state) {
      case 'one-phase':
        return [MOCK_PHASES[0]];
      case 'two-phases':
      case 'complete':
        return MOCK_PHASES;
      default:
        return [];
    }
  };

  const states: { id: DesignState; label: string; description: string }[] = [
    { id: 'initial', label: 'Initial', description: 'Just started' },
    { id: 'analyzing', label: 'Analyzing', description: 'Reading profile' },
    { id: 'generating', label: 'Generating', description: 'Creating program' },
    { id: 'one-phase', label: '1 Phase', description: 'First phase ready' },
    { id: 'two-phases', label: '2 Phases', description: 'Both phases ready' },
    { id: 'complete', label: 'Complete', description: 'All done' },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      <div className="min-h-screen bg-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
        {/* State selector - fixed at top */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#F1F5F9] p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-sm font-medium text-[#94A3B8] mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
              Design Preview - Select State:
            </h1>
            <div className="flex flex-wrap gap-2">
              {states.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setCurrentState(state.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentState === state.id
                      ? 'bg-[#FF6B6B] text-white shadow-lg shadow-[#FF6B6B]/25'
                      : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                  }`}
                >
                  <span className="block">{state.label}</span>
                  <span className="text-[10px] opacity-70">{state.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview content */}
        <div className="max-w-3xl mx-auto">
          <GeneratingProgramTransition
            progress={getProgressForState(currentState)}
            phases={getPhasesForState(currentState)}
            programMeta={currentState === 'complete' || currentState === 'two-phases' ? MOCK_PROGRAM_META : null}
          />
        </div>
      </div>
    </>
  );
}
