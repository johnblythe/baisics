export interface ProgramTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'strength' | 'hypertrophy' | 'powerlifting' | 'athletic' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  durationWeeks: number;
  equipment: string[];
  goals: string[];
  structure: {
    phases: number;
    splitType: string;
    periodization?: string;
  };
  workoutPreview: {
    day: number;
    name: string;
    focus: string;
    exercises: string[];
  }[];
  features: string[];
  popularityScore: number;
  author?: string;
  sourceUrl?: string;
}

export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  {
    id: 'starting-strength',
    name: 'Starting Strength',
    slug: 'starting-strength',
    description:
      'The classic linear progression program for beginners. Focus on compound lifts with simple progression.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'squat rack', 'bench'],
    goals: ['Build strength', 'Learn compound lifts', 'Build muscle foundation'],
    structure: {
      phases: 1,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Workout A',
        focus: 'Full Body',
        exercises: ['Squat', 'Bench Press', 'Deadlift'],
      },
      {
        day: 2,
        name: 'Workout B',
        focus: 'Full Body',
        exercises: ['Squat', 'Overhead Press', 'Power Clean'],
      },
    ],
    features: [
      '3 days per week, full body',
      'Simple linear progression',
      'Focus on the big 4 compound lifts',
      'Minimal accessory work',
    ],
    popularityScore: 95,
    author: 'Mark Rippetoe',
  },
  {
    id: 'ppl',
    name: 'Push/Pull/Legs',
    slug: 'push-pull-legs',
    description:
      'Popular 6-day split that groups muscles by movement pattern. Great for hypertrophy.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 6,
    durationWeeks: 8,
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    goals: ['Build muscle', 'Improve aesthetics', 'Increase training volume'],
    structure: {
      phases: 2,
      splitType: 'Push/Pull/Legs',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Push A',
        focus: 'Chest & Shoulders',
        exercises: ['Bench Press', 'OHP', 'Incline DB Press', 'Lateral Raises', 'Triceps'],
      },
      {
        day: 2,
        name: 'Pull A',
        focus: 'Back & Biceps',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Face Pulls', 'Curls'],
      },
      {
        day: 3,
        name: 'Legs A',
        focus: 'Quads & Hamstrings',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
    ],
    features: [
      'High frequency per muscle group',
      'Balanced push and pull volume',
      'Great for intermediate lifters',
      'Flexible accessory selection',
    ],
    popularityScore: 90,
  },
  {
    id: '531',
    name: "5/3/1",
    slug: '531',
    description:
      "Jim Wendler's proven strength program. Slow, steady progression with submaximal training.",
    category: 'powerlifting',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 16,
    equipment: ['barbell', 'squat rack', 'bench'],
    goals: ['Build strength', 'Long-term progress', 'Avoid burnout'],
    structure: {
      phases: 4,
      splitType: 'Upper/Lower',
      periodization: 'Wave',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Squat Day',
        focus: 'Legs',
        exercises: ['Squat 5/3/1', 'BBB Squats', 'Leg Curl', 'Ab Work'],
      },
      {
        day: 2,
        name: 'Bench Day',
        focus: 'Chest',
        exercises: ['Bench 5/3/1', 'BBB Bench', 'Rows', 'Triceps'],
      },
      {
        day: 3,
        name: 'Deadlift Day',
        focus: 'Back',
        exercises: ['Deadlift 5/3/1', 'BBB Deadlift', 'Good Mornings', 'Ab Work'],
      },
      {
        day: 4,
        name: 'OHP Day',
        focus: 'Shoulders',
        exercises: ['OHP 5/3/1', 'BBB OHP', 'Chin-ups', 'Curls'],
      },
    ],
    features: [
      'Built-in deload weeks',
      'Sustainable long-term progress',
      'Works with various accessory templates',
      'Proven for strength gains',
    ],
    popularityScore: 88,
    author: 'Jim Wendler',
  },
  {
    id: 'phul',
    name: 'PHUL',
    slug: 'phul',
    description:
      'Power Hypertrophy Upper Lower. Combines strength and size training in a 4-day split.',
    category: 'general',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Build strength', 'Build muscle', 'Best of both worlds'],
    structure: {
      phases: 3,
      splitType: 'Upper/Lower',
      periodization: 'Undulating',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper Power',
        focus: 'Upper Body Strength',
        exercises: ['Bench Press', 'Rows', 'OHP', 'Curls', 'Triceps'],
      },
      {
        day: 2,
        name: 'Lower Power',
        focus: 'Lower Body Strength',
        exercises: ['Squat', 'Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 3,
        name: 'Upper Hypertrophy',
        focus: 'Upper Body Volume',
        exercises: ['Incline DB', 'Cable Rows', 'Lateral Raises', 'Curls', 'Triceps'],
      },
      {
        day: 4,
        name: 'Lower Hypertrophy',
        focus: 'Lower Body Volume',
        exercises: ['Front Squat', 'RDL', 'Leg Extensions', 'Leg Curls', 'Calf Raises'],
      },
    ],
    features: [
      'Power and hypertrophy in one program',
      '4 days per week - great recovery',
      'Ideal for intermediate lifters',
      'Balanced upper/lower volume',
    ],
    popularityScore: 85,
  },
  {
    id: 'bro-split',
    name: 'Classic Bro Split',
    slug: 'bro-split',
    description:
      'Traditional bodybuilding split. One muscle group per day with high volume.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 8,
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    goals: ['Build muscle', 'Bodybuilding', 'High volume training'],
    structure: {
      phases: 2,
      splitType: 'Body Part Split',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Chest Day',
        focus: 'Chest',
        exercises: ['Bench Press', 'Incline DB', 'Flyes', 'Cable Crossovers', 'Dips'],
      },
      {
        day: 2,
        name: 'Back Day',
        focus: 'Back',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Lat Pulldown', 'Face Pulls'],
      },
      {
        day: 3,
        name: 'Shoulder Day',
        focus: 'Shoulders',
        exercises: ['OHP', 'Lateral Raises', 'Front Raises', 'Rear Delts', 'Shrugs'],
      },
      {
        day: 4,
        name: 'Leg Day',
        focus: 'Legs',
        exercises: ['Squat', 'Leg Press', 'RDL', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 5,
        name: 'Arms Day',
        focus: 'Arms',
        exercises: ['Barbell Curls', 'Skull Crushers', 'Hammer Curls', 'Tricep Pushdowns', 'Forearms'],
      },
    ],
    features: [
      'Maximum volume per muscle group',
      'Great mind-muscle connection',
      'Popular among bodybuilders',
      'Flexible exercise selection',
    ],
    popularityScore: 75,
  },
  {
    id: 'gzclp',
    name: 'GZCLP',
    slug: 'gzclp',
    description:
      'Cody Lefever\'s beginner program with tiered exercise structure. Smart progression system.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 4,
    durationWeeks: 12,
    equipment: ['barbell', 'squat rack', 'bench'],
    goals: ['Build strength', 'Learn progression', 'Build work capacity'],
    structure: {
      phases: 1,
      splitType: 'Full Body Rotation',
      periodization: 'Linear with Auto-regulation',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Day 1',
        focus: 'Squat Focus',
        exercises: ['Squat (T1)', 'Bench (T2)', 'Lat Pulldown (T3)', 'Curls (T3)'],
      },
      {
        day: 2,
        name: 'Day 2',
        focus: 'OHP Focus',
        exercises: ['OHP (T1)', 'Deadlift (T2)', 'Rows (T3)', 'Face Pulls (T3)'],
      },
      {
        day: 3,
        name: 'Day 3',
        focus: 'Bench Focus',
        exercises: ['Bench (T1)', 'Squat (T2)', 'Lat Pulldown (T3)', 'Triceps (T3)'],
      },
      {
        day: 4,
        name: 'Day 4',
        focus: 'Deadlift Focus',
        exercises: ['Deadlift (T1)', 'OHP (T2)', 'Rows (T3)', 'Curls (T3)'],
      },
    ],
    features: [
      'Tiered exercise system (T1, T2, T3)',
      'Built-in progression failure protocol',
      'Includes accessory work',
      'Great for beginners transitioning',
    ],
    popularityScore: 82,
    author: 'Cody Lefever',
  },
  {
    id: 'nsuns',
    name: 'nSuns 5/3/1 LP',
    slug: 'nsuns',
    description:
      'High volume linear progression based on 5/3/1. Aggressive progression for intermediates.',
    category: 'powerlifting',
    difficulty: 'advanced',
    daysPerWeek: 5,
    durationWeeks: 8,
    equipment: ['barbell', 'squat rack', 'bench'],
    goals: ['Maximize strength', 'High volume', 'Fast progression'],
    structure: {
      phases: 2,
      splitType: '5-Day Split',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Bench/OHP',
        focus: 'Chest & Shoulders',
        exercises: ['Bench 9 sets', 'OHP 8 sets', 'Accessories'],
      },
      {
        day: 2,
        name: 'Squat/Sumo DL',
        focus: 'Legs',
        exercises: ['Squat 9 sets', 'Sumo DL 8 sets', 'Accessories'],
      },
      {
        day: 3,
        name: 'OHP/Incline',
        focus: 'Shoulders & Chest',
        exercises: ['OHP 9 sets', 'Incline Bench 8 sets', 'Accessories'],
      },
      {
        day: 4,
        name: 'Deadlift/Front Squat',
        focus: 'Back & Legs',
        exercises: ['Deadlift 9 sets', 'Front Squat 8 sets', 'Accessories'],
      },
      {
        day: 5,
        name: 'Bench/Close Grip',
        focus: 'Chest & Triceps',
        exercises: ['Bench 9 sets', 'CG Bench 8 sets', 'Accessories'],
      },
    ],
    features: [
      'Very high volume main lifts',
      'Weekly progression',
      'Based on training max percentage',
      'Choose your own accessories',
    ],
    popularityScore: 78,
  },
];

export function getTemplateBySlug(slug: string): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((t) => t.slug === slug);
}

export function getTemplatesByCategory(
  category: ProgramTemplate['category']
): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((t) => t.category === category).sort(
    (a, b) => b.popularityScore - a.popularityScore
  );
}

export function getTemplatesByDifficulty(
  difficulty: ProgramTemplate['difficulty']
): ProgramTemplate[] {
  return PROGRAM_TEMPLATES.filter((t) => t.difficulty === difficulty).sort(
    (a, b) => b.popularityScore - a.popularityScore
  );
}
