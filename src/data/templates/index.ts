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

  // ============================================
  // GOAL-BASED PROGRAMS
  // ============================================
  {
    id: 'fat-loss-12-week',
    name: 'Fat Loss 12-Week Shred',
    slug: 'fat-loss-12-week',
    description:
      'Strategic fat loss program combining resistance training with metabolic conditioning. Preserve muscle while dropping body fat.',
    category: 'general',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Lose fat', 'Preserve muscle', 'Improve conditioning'],
    structure: {
      phases: 3,
      splitType: 'Upper/Lower',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper A',
        focus: 'Upper Body + Conditioning',
        exercises: ['Bench Press', 'Rows', 'OHP', 'Face Pulls', 'Finisher Circuit'],
      },
      {
        day: 2,
        name: 'Lower A',
        focus: 'Lower Body + Conditioning',
        exercises: ['Squat', 'RDL', 'Walking Lunges', 'Leg Curls', 'Finisher Circuit'],
      },
      {
        day: 3,
        name: 'Upper B',
        focus: 'Upper Body + Conditioning',
        exercises: ['Incline Press', 'Pull-ups', 'Lateral Raises', 'Triceps', 'Finisher Circuit'],
      },
      {
        day: 4,
        name: 'Lower B',
        focus: 'Lower Body + Conditioning',
        exercises: ['Deadlift', 'Bulgarian Split Squats', 'Leg Press', 'Calf Raises', 'Finisher Circuit'],
      },
    ],
    features: [
      'Built-in metabolic finishers',
      'Progressive calorie reduction phases',
      'Muscle-preserving rep ranges',
      'Cardio recommendations included',
    ],
    popularityScore: 92,
  },
  {
    id: 'muscle-building-beginner',
    name: 'Muscle Building: Beginner',
    slug: 'muscle-building-beginner',
    description:
      'Perfect first muscle-building program. Learn proper form while building foundational size and strength.',
    category: 'hypertrophy',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Build muscle', 'Learn technique', 'Build foundation'],
    structure: {
      phases: 2,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Full Body A',
        focus: 'Push Emphasis',
        exercises: ['Bench Press', 'Squat', 'Rows', 'Lateral Raises', 'Tricep Pushdowns'],
      },
      {
        day: 2,
        name: 'Full Body B',
        focus: 'Pull Emphasis',
        exercises: ['Deadlift', 'OHP', 'Lat Pulldown', 'Leg Curls', 'Curls'],
      },
      {
        day: 3,
        name: 'Full Body C',
        focus: 'Legs Emphasis',
        exercises: ['Leg Press', 'Incline DB Press', 'Cable Rows', 'RDL', 'Face Pulls'],
      },
    ],
    features: [
      'Full body 3x per week',
      'Focus on compound movements',
      'Gradual volume increase',
      'Built-in deload weeks',
    ],
    popularityScore: 89,
  },
  {
    id: 'muscle-building-intermediate',
    name: 'Muscle Building: Intermediate',
    slug: 'muscle-building-intermediate',
    description:
      'Take your gains to the next level. Higher volume and frequency for experienced lifters ready to grow.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 10,
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    goals: ['Maximize muscle growth', 'Increase training volume', 'Target weak points'],
    structure: {
      phases: 2,
      splitType: 'Push/Pull/Legs',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Push',
        focus: 'Chest, Shoulders, Triceps',
        exercises: ['Bench Press', 'Incline DB', 'OHP', 'Lateral Raises', 'Triceps'],
      },
      {
        day: 2,
        name: 'Pull',
        focus: 'Back, Rear Delts, Biceps',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Face Pulls', 'Curls'],
      },
      {
        day: 3,
        name: 'Legs',
        focus: 'Quads, Hamstrings, Calves',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 4,
        name: 'Upper',
        focus: 'Chest & Back Focus',
        exercises: ['Incline Press', 'Cable Rows', 'Flyes', 'Pulldowns', 'Arms'],
      },
      {
        day: 5,
        name: 'Lower',
        focus: 'Quads & Glutes Focus',
        exercises: ['Front Squat', 'Hip Thrust', 'Lunges', 'Leg Extensions', 'Calves'],
      },
    ],
    features: [
      '5-day hybrid split',
      'Higher volume per muscle',
      'Varied rep ranges',
      'Progressive overload focus',
    ],
    popularityScore: 87,
  },
  {
    id: 'strength-foundation',
    name: 'Strength Foundation',
    slug: 'strength-foundation',
    description:
      'Build a solid strength base with the fundamental compound lifts. Simple, effective, proven.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'squat rack', 'bench'],
    goals: ['Build strength', 'Master the basics', 'Linear progression'],
    structure: {
      phases: 1,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Workout A',
        focus: 'Squat Day',
        exercises: ['Squat', 'Bench Press', 'Barbell Rows', 'Plank'],
      },
      {
        day: 2,
        name: 'Workout B',
        focus: 'Deadlift Day',
        exercises: ['Deadlift', 'OHP', 'Pull-ups', 'Ab Wheel'],
      },
      {
        day: 3,
        name: 'Workout C',
        focus: 'Squat Day',
        exercises: ['Squat', 'Bench Press', 'Barbell Rows', 'Farmer Walks'],
      },
    ],
    features: [
      'Simple A/B/C rotation',
      'Add weight each session',
      'Focus on form first',
      'Minimal accessories',
    ],
    popularityScore: 86,
  },
  {
    id: 'recomp-8-week',
    name: 'Body Recomposition 8-Week',
    slug: 'recomp-8-week',
    description:
      'Lose fat while building muscle simultaneously. Strategic training and nutrition timing for body transformation.',
    category: 'general',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 8,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Lose fat', 'Build muscle', 'Improve body composition'],
    structure: {
      phases: 2,
      splitType: 'Upper/Lower',
      periodization: 'Undulating',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper Strength',
        focus: 'Heavy Upper',
        exercises: ['Bench Press', 'Rows', 'OHP', 'Weighted Pull-ups', 'Curls'],
      },
      {
        day: 2,
        name: 'Lower Strength',
        focus: 'Heavy Lower',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 3,
        name: 'Upper Volume',
        focus: 'High Rep Upper',
        exercises: ['Incline DB', 'Cable Rows', 'Lateral Raises', 'Triceps', 'Biceps'],
      },
      {
        day: 4,
        name: 'Lower Volume',
        focus: 'High Rep Lower',
        exercises: ['Front Squat', 'Good Mornings', 'Walking Lunges', 'Leg Curls', 'Calves'],
      },
    ],
    features: [
      'Mixed strength and volume days',
      'Optimized for body recomposition',
      'Nutrient timing guidelines',
      'Strategic cardio recommendations',
    ],
    popularityScore: 84,
  },
  {
    id: 'athletic-performance',
    name: 'Athletic Performance',
    slug: 'athletic-performance',
    description:
      'Train like an athlete. Build explosive power, speed, and functional strength for sports performance.',
    category: 'athletic',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'kettlebells', 'plyo box'],
    goals: ['Improve athleticism', 'Build power', 'Increase speed'],
    structure: {
      phases: 3,
      splitType: 'Full Body',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Power Day',
        focus: 'Explosive Movements',
        exercises: ['Power Cleans', 'Box Jumps', 'Med Ball Throws', 'Squat', 'Pull-ups'],
      },
      {
        day: 2,
        name: 'Strength Day',
        focus: 'Heavy Compound Lifts',
        exercises: ['Deadlift', 'Bench Press', 'Rows', 'Lunges', 'Core Work'],
      },
      {
        day: 3,
        name: 'Speed Day',
        focus: 'Velocity & Agility',
        exercises: ['Sprint Drills', 'Agility Ladder', 'Jump Squats', 'Push Press', 'Plyo Push-ups'],
      },
      {
        day: 4,
        name: 'Conditioning',
        focus: 'Work Capacity',
        exercises: ['Kettlebell Complex', 'Sled Push', 'Battle Ropes', 'Carries', 'Core Circuit'],
      },
    ],
    features: [
      'Power development focus',
      'Speed and agility work',
      'Sport-specific conditioning',
      'Injury prevention exercises',
    ],
    popularityScore: 80,
  },
  {
    id: 'functional-fitness',
    name: 'Functional Fitness',
    slug: 'functional-fitness',
    description:
      'Build real-world strength and mobility. Move better, feel better, perform better in daily life.',
    category: 'athletic',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 8,
    equipment: ['kettlebells', 'dumbbells', 'resistance bands'],
    goals: ['Improve mobility', 'Functional strength', 'Better movement'],
    structure: {
      phases: 2,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Push & Core',
        focus: 'Pushing Movements',
        exercises: ['Goblet Squat', 'Push-ups', 'DB OHP', 'Turkish Get-ups', 'Plank'],
      },
      {
        day: 2,
        name: 'Pull & Hinge',
        focus: 'Pulling Movements',
        exercises: ['KB Deadlift', 'Rows', 'Face Pulls', 'Hip Bridges', 'Bird Dogs'],
      },
      {
        day: 3,
        name: 'Full Body Flow',
        focus: 'Movement Integration',
        exercises: ['KB Swings', 'Lunges', 'Pull-ups', 'Carries', 'Core Circuit'],
      },
    ],
    features: [
      'Movement quality focus',
      'Mobility work included',
      'Minimal equipment needed',
      'Scalable for all levels',
    ],
    popularityScore: 77,
  },
  {
    id: 'bodyweight-only',
    name: 'Bodyweight Only',
    slug: 'bodyweight-only',
    description:
      'No gym, no problem. Build impressive strength and muscle using nothing but your own bodyweight.',
    category: 'general',
    difficulty: 'beginner',
    daysPerWeek: 4,
    durationWeeks: 8,
    equipment: ['pull-up bar'],
    goals: ['Build muscle', 'No equipment needed', 'Train anywhere'],
    structure: {
      phases: 2,
      splitType: 'Upper/Lower',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper Push',
        focus: 'Push Movements',
        exercises: ['Push-ups', 'Pike Push-ups', 'Diamond Push-ups', 'Dips', 'Plank'],
      },
      {
        day: 2,
        name: 'Lower',
        focus: 'Legs & Core',
        exercises: ['Squats', 'Lunges', 'Glute Bridges', 'Calf Raises', 'Leg Raises'],
      },
      {
        day: 3,
        name: 'Upper Pull',
        focus: 'Pull Movements',
        exercises: ['Pull-ups', 'Chin-ups', 'Inverted Rows', 'Face Pulls', 'Bicep Curls'],
      },
      {
        day: 4,
        name: 'Full Body',
        focus: 'Total Body',
        exercises: ['Burpees', 'Mountain Climbers', 'Bear Crawls', 'Jump Squats', 'Core Circuit'],
      },
    ],
    features: [
      'No equipment required',
      'Train anywhere',
      'Progressive difficulty',
      'Includes regression/progression options',
    ],
    popularityScore: 83,
  },
  {
    id: 'home-gym-essentials',
    name: 'Home Gym Essentials',
    slug: 'home-gym-essentials',
    description:
      'Maximize your home gym setup. Effective training with basic equipment - dumbbells, bench, and pull-up bar.',
    category: 'general',
    difficulty: 'beginner',
    daysPerWeek: 4,
    durationWeeks: 10,
    equipment: ['dumbbells', 'bench', 'pull-up bar'],
    goals: ['Build muscle', 'Home training', 'Efficient workouts'],
    structure: {
      phases: 2,
      splitType: 'Upper/Lower',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper A',
        focus: 'Chest & Back',
        exercises: ['DB Bench Press', 'Pull-ups', 'DB Rows', 'DB Flyes', 'Face Pulls'],
      },
      {
        day: 2,
        name: 'Lower A',
        focus: 'Quads & Glutes',
        exercises: ['Goblet Squat', 'DB RDL', 'Bulgarian Split Squats', 'Calf Raises', 'Plank'],
      },
      {
        day: 3,
        name: 'Upper B',
        focus: 'Shoulders & Arms',
        exercises: ['DB OHP', 'Chin-ups', 'Lateral Raises', 'Curls', 'Tricep Extensions'],
      },
      {
        day: 4,
        name: 'Lower B',
        focus: 'Hamstrings & Glutes',
        exercises: ['DB Lunges', 'Single Leg RDL', 'Hip Thrusts', 'Leg Curls', 'Ab Circuit'],
      },
    ],
    features: [
      'Minimal equipment needed',
      'Space-efficient exercises',
      'Dumbbell-focused program',
      'No gym membership required',
    ],
    popularityScore: 81,
  },
  {
    id: 'busy-professional',
    name: 'Busy Professional 3x/Week',
    slug: 'busy-professional',
    description:
      'Maximum results, minimum time. Efficient full-body workouts designed for busy schedules.',
    category: 'general',
    difficulty: 'intermediate',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Time-efficient', 'Build muscle', 'Maintain fitness'],
    structure: {
      phases: 3,
      splitType: 'Full Body',
      periodization: 'Undulating',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Strength Focus',
        focus: 'Heavy Compound Lifts',
        exercises: ['Squat', 'Bench Press', 'Rows', 'RDL', 'Core'],
      },
      {
        day: 2,
        name: 'Hypertrophy Focus',
        focus: 'Higher Volume',
        exercises: ['Leg Press', 'DB Bench', 'Pull-ups', 'Lateral Raises', 'Arms'],
      },
      {
        day: 3,
        name: 'Power & Conditioning',
        focus: 'Explosive + Finisher',
        exercises: ['Deadlift', 'Push Press', 'Chin-ups', 'Lunges', 'Conditioning Circuit'],
      },
    ],
    features: [
      '45-60 minute sessions',
      'High-efficiency exercises',
      'Flexible scheduling',
      '3 days per week only',
    ],
    popularityScore: 88,
  },

  // ============================================
  // STYLE-BASED PROGRAMS
  // ============================================
  {
    id: 'upper-lower-4-day',
    name: 'Upper/Lower 4-Day Split',
    slug: 'upper-lower-4-day',
    description:
      'Classic upper/lower split hitting each muscle group twice per week. Perfect balance of frequency and recovery.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 10,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Build muscle', 'Balanced development', '2x frequency'],
    structure: {
      phases: 2,
      splitType: 'Upper/Lower',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper A',
        focus: 'Horizontal Push/Pull',
        exercises: ['Bench Press', 'Rows', 'OHP', 'Face Pulls', 'Curls', 'Triceps'],
      },
      {
        day: 2,
        name: 'Lower A',
        focus: 'Quad Dominant',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 3,
        name: 'Upper B',
        focus: 'Vertical Push/Pull',
        exercises: ['OHP', 'Pull-ups', 'Incline DB', 'Cable Rows', 'Lateral Raises', 'Arms'],
      },
      {
        day: 4,
        name: 'Lower B',
        focus: 'Hip Dominant',
        exercises: ['Deadlift', 'Bulgarian Split Squats', 'Hip Thrust', 'Leg Curls', 'Calves'],
      },
    ],
    features: [
      'Hit each muscle 2x per week',
      'Great for intermediates',
      'Optimal recovery between sessions',
      'Balanced push/pull volume',
    ],
    popularityScore: 86,
  },
  {
    id: 'full-body-3x',
    name: 'Full Body 3x/Week',
    slug: 'full-body-3x',
    description:
      'Train your whole body every session. High frequency, efficient workouts for maximum muscle stimulation.',
    category: 'hypertrophy',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Build muscle', 'High frequency', 'Time efficient'],
    structure: {
      phases: 3,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Full Body A',
        focus: 'Squat Emphasis',
        exercises: ['Squat', 'Bench Press', 'Rows', 'Lateral Raises', 'Curls'],
      },
      {
        day: 2,
        name: 'Full Body B',
        focus: 'Hinge Emphasis',
        exercises: ['Deadlift', 'OHP', 'Pull-ups', 'Leg Curls', 'Triceps'],
      },
      {
        day: 3,
        name: 'Full Body C',
        focus: 'Variety Day',
        exercises: ['Front Squat', 'Incline Press', 'Cable Rows', 'RDL', 'Face Pulls'],
      },
    ],
    features: [
      'Train everything 3x per week',
      'Perfect for beginners',
      'Efficient use of gym time',
      'Great strength and size gains',
    ],
    popularityScore: 84,
  },
  {
    id: 'phat-style',
    name: 'PHAT Style Training',
    slug: 'phat-style',
    description:
      "Power Hypertrophy Adaptive Training. Layne Norton's approach combining heavy power days with high-volume hypertrophy days.",
    category: 'hypertrophy',
    difficulty: 'advanced',
    daysPerWeek: 5,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    goals: ['Build muscle', 'Build strength', 'Advanced training'],
    structure: {
      phases: 2,
      splitType: 'Power/Hypertrophy',
      periodization: 'Daily Undulating',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper Power',
        focus: 'Heavy Upper',
        exercises: ['Bench Press', 'Rows', 'Weighted Dips', 'Weighted Pull-ups', 'Curls'],
      },
      {
        day: 2,
        name: 'Lower Power',
        focus: 'Heavy Lower',
        exercises: ['Squat', 'Hack Squat', 'Leg Curls', 'Calf Raises', 'Ab Work'],
      },
      {
        day: 3,
        name: 'Back & Shoulders Hyper',
        focus: 'High Volume Back',
        exercises: ['Rows', 'Pulldowns', 'OHP', 'Lateral Raises', 'Rear Delts'],
      },
      {
        day: 4,
        name: 'Lower Hypertrophy',
        focus: 'High Volume Legs',
        exercises: ['Squat', 'Leg Press', 'Walking Lunges', 'Leg Extensions', 'Leg Curls'],
      },
      {
        day: 5,
        name: 'Chest & Arms Hyper',
        focus: 'High Volume Chest/Arms',
        exercises: ['Incline Press', 'Flyes', 'Cable Crossovers', 'Curls', 'Triceps'],
      },
    ],
    features: [
      'Power and hypertrophy combined',
      '5-day advanced split',
      'High frequency per muscle',
      'Great for experienced lifters',
    ],
    popularityScore: 76,
    author: 'Layne Norton',
  },
  {
    id: '5x5-strength',
    name: 'Classic 5x5 Strength',
    slug: '5x5-strength',
    description:
      'The time-tested 5 sets of 5 reps approach. Simple, brutal, effective for building raw strength.',
    category: 'strength',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'squat rack', 'bench'],
    goals: ['Build strength', 'Simple progression', 'Master basics'],
    structure: {
      phases: 1,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Workout A',
        focus: 'Squat Focus',
        exercises: ['Squat 5x5', 'Bench Press 5x5', 'Barbell Rows 5x5'],
      },
      {
        day: 2,
        name: 'Workout B',
        focus: 'Deadlift Focus',
        exercises: ['Squat 5x5', 'OHP 5x5', 'Deadlift 1x5'],
      },
    ],
    features: [
      'Simple A/B alternation',
      'Add 5lbs each session',
      'Focus on the big lifts',
      'Proven for 60+ years',
    ],
    popularityScore: 91,
  },
  {
    id: 'german-volume-training',
    name: 'German Volume Training',
    slug: 'german-volume-training',
    description:
      '10 sets of 10 reps. The ultimate hypertrophy shock program for breaking through plateaus.',
    category: 'hypertrophy',
    difficulty: 'advanced',
    daysPerWeek: 4,
    durationWeeks: 6,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Maximum muscle growth', 'Break plateaus', 'High volume shock'],
    structure: {
      phases: 1,
      splitType: 'Antagonist Pairs',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Chest & Back',
        focus: 'Push/Pull Superset',
        exercises: ['Bench Press 10x10', 'Rows 10x10', 'Flyes 3x12', 'Pulldowns 3x12'],
      },
      {
        day: 2,
        name: 'Legs & Abs',
        focus: 'Lower Body',
        exercises: ['Squat 10x10', 'Leg Curls 10x10', 'Calf Raises 3x15', 'Weighted Crunches 3x15'],
      },
      {
        day: 3,
        name: 'Arms & Shoulders',
        focus: 'Upper Body Detail',
        exercises: ['Dips 10x10', 'Curls 10x10', 'Lateral Raises 3x12', 'Rear Delts 3x12'],
      },
    ],
    features: [
      '10x10 main lift protocol',
      '60 second rest periods',
      'Start with 60% 1RM',
      'NOT for beginners',
    ],
    popularityScore: 74,
  },
  {
    id: 'rest-pause-intensity',
    name: 'Rest-Pause Intensity',
    slug: 'rest-pause-intensity',
    description:
      'High intensity rest-pause sets for maximum muscle fiber recruitment. Short workouts, massive pumps.',
    category: 'hypertrophy',
    difficulty: 'advanced',
    daysPerWeek: 4,
    durationWeeks: 6,
    equipment: ['barbell', 'dumbbells', 'machines'],
    goals: ['Muscle growth', 'Time efficient', 'High intensity'],
    structure: {
      phases: 1,
      splitType: 'Upper/Lower',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper A',
        focus: 'Chest & Back',
        exercises: ['Bench Press RP', 'Rows RP', 'Incline DB RP', 'Pulldowns RP', 'Laterals'],
      },
      {
        day: 2,
        name: 'Lower A',
        focus: 'Quads & Hams',
        exercises: ['Leg Press RP', 'RDL RP', 'Leg Extensions RP', 'Leg Curls RP', 'Calves'],
      },
      {
        day: 3,
        name: 'Upper B',
        focus: 'Shoulders & Arms',
        exercises: ['OHP RP', 'Chin-ups RP', 'Dips RP', 'Curls RP', 'Rear Delts'],
      },
      {
        day: 4,
        name: 'Lower B',
        focus: 'Glutes & Legs',
        exercises: ['Squat RP', 'Hip Thrust RP', 'Walking Lunges', 'Leg Curls RP', 'Calves'],
      },
    ],
    features: [
      'Rest-pause on main exercises',
      '30-45 minute workouts',
      'Maximum intensity',
      'Advanced technique required',
    ],
    popularityScore: 72,
  },
  {
    id: 'progressive-overload-focus',
    name: 'Progressive Overload Focus',
    slug: 'progressive-overload-focus',
    description:
      'Systematic progression with detailed tracking. Every rep, every set designed to beat your previous best.',
    category: 'strength',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Progressive strength', 'Track progress', 'Systematic gains'],
    structure: {
      phases: 3,
      splitType: 'Upper/Lower',
      periodization: 'Linear with Deloads',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper A',
        focus: 'Bench Focus',
        exercises: ['Bench Press', 'Rows', 'OHP', 'Face Pulls', 'Curls'],
      },
      {
        day: 2,
        name: 'Lower A',
        focus: 'Squat Focus',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 3,
        name: 'Upper B',
        focus: 'Row Focus',
        exercises: ['Rows', 'Incline Press', 'Pull-ups', 'Lateral Raises', 'Triceps'],
      },
      {
        day: 4,
        name: 'Lower B',
        focus: 'Deadlift Focus',
        exercises: ['Deadlift', 'Front Squat', 'Lunges', 'Leg Curls', 'Calves'],
      },
    ],
    features: [
      'Clear progression targets',
      'Built-in deload protocol',
      'Progress tracking system',
      'Rep PRs and weight PRs',
    ],
    popularityScore: 79,
  },

  // ============================================
  // CELEBRITY/HERO PROGRAMS
  // ============================================
  {
    id: 'thors-strength',
    name: "Thor's Strength",
    slug: 'thors-strength',
    description:
      'Hemsworth-inspired superhero training. Build the powerful physique of a Norse god with heavy lifting and functional work.',
    category: 'strength',
    difficulty: 'advanced',
    daysPerWeek: 5,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables', 'kettlebells'],
    goals: ['Build strength', 'Superhero physique', 'Functional power'],
    structure: {
      phases: 3,
      splitType: 'Push/Pull/Legs + Conditioning',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper Push',
        focus: 'Chest & Shoulders',
        exercises: ['Bench Press', 'OHP', 'Incline DB Press', 'Dips', 'Lateral Raises'],
      },
      {
        day: 2,
        name: 'Lower Power',
        focus: 'Legs & Explosiveness',
        exercises: ['Squat', 'Box Jumps', 'Walking Lunges', 'RDL', 'Sled Push'],
      },
      {
        day: 3,
        name: 'Upper Pull',
        focus: 'Back & Arms',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Face Pulls', 'Hammer Curls'],
      },
      {
        day: 4,
        name: 'Strongman',
        focus: 'Functional Strength',
        exercises: ['Farmer Walks', 'Tire Flips', 'Sandbag Carries', 'Sledgehammer', 'Rope Climbs'],
      },
      {
        day: 5,
        name: 'Full Body',
        focus: 'Conditioning',
        exercises: ['KB Swings', 'Battle Ropes', 'Burpees', 'Medicine Ball Slams', 'Core Circuit'],
      },
    ],
    features: [
      'Heavy compound focus',
      'Functional strength work',
      'Conditioning days included',
      'Viking-inspired training',
    ],
    popularityScore: 85,
  },
  {
    id: 'dark-knight-training',
    name: 'Dark Knight Training',
    slug: 'dark-knight-training',
    description:
      'Batman-inspired tactical fitness. Build combat-ready strength, explosive power, and elite conditioning.',
    category: 'athletic',
    difficulty: 'advanced',
    daysPerWeek: 6,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'pull-up bar', 'plyo box'],
    goals: ['Combat fitness', 'Explosive power', 'Elite conditioning'],
    structure: {
      phases: 4,
      splitType: 'Tactical Split',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Combat Upper',
        focus: 'Striking Power',
        exercises: ['Bench Press', 'Explosive Push-ups', 'Medicine Ball Throws', 'Rows', 'Core'],
      },
      {
        day: 2,
        name: 'Tactical Lower',
        focus: 'Explosive Legs',
        exercises: ['Box Jumps', 'Squat', 'Split Jumps', 'Single Leg Work', 'Agility Drills'],
      },
      {
        day: 3,
        name: 'Conditioning',
        focus: 'Fight Conditioning',
        exercises: ['Battle Ropes', 'Burpees', 'Rowing Intervals', 'KB Complex', 'Sprint Intervals'],
      },
      {
        day: 4,
        name: 'Upper Strength',
        focus: 'Raw Strength',
        exercises: ['Weighted Pull-ups', 'OHP', 'Dips', 'Face Pulls', 'Grip Work'],
      },
      {
        day: 5,
        name: 'Lower Strength',
        focus: 'Leg Strength',
        exercises: ['Deadlift', 'Front Squat', 'Bulgarian Split Squats', 'Calf Raises', 'Core'],
      },
      {
        day: 6,
        name: 'Active Recovery',
        focus: 'Mobility & Light Work',
        exercises: ['Yoga Flow', 'Light Cardio', 'Foam Rolling', 'Stretching', 'Breathing Work'],
      },
    ],
    features: [
      'Combat-ready fitness',
      'Martial arts conditioning',
      'Mobility and recovery focus',
      '6-day elite program',
    ],
    popularityScore: 82,
  },
  {
    id: 'superhero-physique',
    name: 'Superhero Physique',
    slug: 'superhero-physique',
    description:
      'The Hollywood superhero transformation program. Build the V-taper, boulder shoulders, and screen-ready aesthetics.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    goals: ['V-taper physique', 'Hollywood aesthetics', 'Screen-ready body'],
    structure: {
      phases: 3,
      splitType: 'Body Part Split',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Chest & Triceps',
        focus: 'Upper Chest Focus',
        exercises: ['Incline Bench', 'Flat DB Press', 'Cable Flyes', 'Dips', 'Tricep Work'],
      },
      {
        day: 2,
        name: 'Back & Biceps',
        focus: 'Width & Thickness',
        exercises: ['Weighted Pull-ups', 'Rows', 'Lat Pulldown', 'Rear Delts', 'Curls'],
      },
      {
        day: 3,
        name: 'Shoulders',
        focus: 'Boulder Shoulders',
        exercises: ['OHP', 'Lateral Raises', 'Front Raises', 'Rear Delts', 'Shrugs'],
      },
      {
        day: 4,
        name: 'Legs',
        focus: 'Complete Leg Development',
        exercises: ['Squat', 'Leg Press', 'RDL', 'Leg Extensions', 'Leg Curls'],
      },
      {
        day: 5,
        name: 'Arms & Abs',
        focus: 'Arm Definition',
        exercises: ['Barbell Curls', 'Skull Crushers', 'Hammer Curls', 'Rope Pushdowns', 'Ab Circuit'],
      },
    ],
    features: [
      'V-taper focused',
      'High volume shoulders',
      'Upper chest emphasis',
      'Film-ready aesthetics',
    ],
    popularityScore: 83,
  },
  {
    id: 'hollywood-action-star',
    name: 'Hollywood Action Star',
    slug: 'hollywood-action-star',
    description:
      'Train like an action movie star. Balanced strength, aesthetics, and athletic performance for camera-ready fitness.',
    category: 'general',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 10,
    equipment: ['barbell', 'dumbbells', 'cables', 'kettlebells'],
    goals: ['Action star fitness', 'Balanced physique', 'Camera ready'],
    structure: {
      phases: 2,
      splitType: 'Push/Pull/Legs + Conditioning',
      periodization: 'Undulating',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Push',
        focus: 'Chest & Shoulders',
        exercises: ['Bench Press', 'OHP', 'Incline DB', 'Lateral Raises', 'Triceps'],
      },
      {
        day: 2,
        name: 'Pull',
        focus: 'Back & Biceps',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Face Pulls', 'Curls'],
      },
      {
        day: 3,
        name: 'Legs',
        focus: 'Complete Legs',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Walking Lunges', 'Calves'],
      },
      {
        day: 4,
        name: 'Athletic',
        focus: 'Power & Agility',
        exercises: ['Power Cleans', 'Box Jumps', 'Med Ball Work', 'KB Swings', 'Sprints'],
      },
      {
        day: 5,
        name: 'Arms & Core',
        focus: 'Detail Work',
        exercises: ['Supersets: Curls/Triceps', 'Abs Circuit', 'Forearms', 'Calves'],
      },
    ],
    features: [
      'Balanced strength and aesthetics',
      'Athletic performance',
      'Stunt-ready conditioning',
      'Photoshoot preparation',
    ],
    popularityScore: 80,
  },
  {
    id: 'beach-body-ready',
    name: 'Beach Body Ready',
    slug: 'beach-body-ready',
    description:
      'Get shredded for summer. Strategic fat loss training while building the muscles that matter for beach aesthetics.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 8,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Get lean', 'Beach aesthetics', 'Summer ready'],
    structure: {
      phases: 2,
      splitType: 'Push/Pull/Legs',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Push',
        focus: 'Chest & Shoulders',
        exercises: ['Incline Press', 'OHP', 'Flyes', 'Lateral Raises', 'Triceps'],
      },
      {
        day: 2,
        name: 'Pull',
        focus: 'Back & Biceps',
        exercises: ['Pull-ups', 'Rows', 'Face Pulls', 'Rear Delts', 'Curls'],
      },
      {
        day: 3,
        name: 'Legs + HIIT',
        focus: 'Legs & Conditioning',
        exercises: ['Squat', 'RDL', 'Walking Lunges', 'Leg Curls', 'HIIT Finisher'],
      },
      {
        day: 4,
        name: 'Upper',
        focus: 'Shoulders & Arms',
        exercises: ['Arnold Press', 'Incline Curls', 'Overhead Triceps', 'Lateral Raises', 'Abs'],
      },
      {
        day: 5,
        name: 'Full Body HIIT',
        focus: 'Metabolic Training',
        exercises: ['KB Swings', 'Burpees', 'Thrusters', 'Mountain Climbers', 'Core Circuit'],
      },
    ],
    features: [
      'HIIT finishers included',
      'Beach muscle emphasis',
      'Core and ab focus',
      'Strategic cardio recommendations',
    ],
    popularityScore: 84,
  },
  {
    id: 'greek-god-aesthetics',
    name: 'Greek God Aesthetics',
    slug: 'greek-god-aesthetics',
    description:
      'Sculpt a timeless physique inspired by classical proportions. Focus on V-taper, wide shoulders, and balanced development.',
    category: 'hypertrophy',
    difficulty: 'intermediate',
    daysPerWeek: 4,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables'],
    goals: ['Classic proportions', 'V-taper', 'Aesthetic balance'],
    structure: {
      phases: 3,
      splitType: 'Upper/Lower',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper A',
        focus: 'Width & V-Taper',
        exercises: ['Weighted Pull-ups', 'OHP', 'Incline DB Press', 'Lateral Raises', 'Face Pulls'],
      },
      {
        day: 2,
        name: 'Lower A',
        focus: 'Quad Sweep',
        exercises: ['Squat', 'Leg Press', 'Walking Lunges', 'Leg Extensions', 'Calves'],
      },
      {
        day: 3,
        name: 'Upper B',
        focus: 'Thickness & Detail',
        exercises: ['Rows', 'Bench Press', 'Arnold Press', 'Rear Delts', 'Arms'],
      },
      {
        day: 4,
        name: 'Lower B',
        focus: 'Posterior Chain',
        exercises: ['Deadlift', 'RDL', 'Hip Thrust', 'Leg Curls', 'Calves'],
      },
    ],
    features: [
      'Classical proportions focus',
      'Shoulder width priority',
      'Waist-minimizing approach',
      'Golden ratio training',
    ],
    popularityScore: 81,
  },
  {
    id: 'warrior-build',
    name: 'Warrior Build',
    slug: 'warrior-build',
    description:
      'Train like an ancient warrior. Functional strength, combat conditioning, and battle-ready endurance.',
    category: 'athletic',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 10,
    equipment: ['barbell', 'kettlebells', 'sandbag', 'pull-up bar'],
    goals: ['Warrior fitness', 'Functional strength', 'Combat ready'],
    structure: {
      phases: 2,
      splitType: 'Push/Pull/Legs + Conditioning',
      periodization: 'Undulating',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Upper Push',
        focus: 'Pushing Power',
        exercises: ['Floor Press', 'Push Press', 'Dips', 'KB Press', 'Plank'],
      },
      {
        day: 2,
        name: 'Lower',
        focus: 'Leg Strength & Power',
        exercises: ['Front Squat', 'KB Swings', 'Lunges', 'Box Jumps', 'Calf Raises'],
      },
      {
        day: 3,
        name: 'Conditioning',
        focus: 'Work Capacity',
        exercises: ['Sandbag Carries', 'Battle Ropes', 'Tire Drags', 'Burpees', 'Sprints'],
      },
      {
        day: 4,
        name: 'Upper Pull',
        focus: 'Pulling Strength',
        exercises: ['Deadlift', 'Pull-ups', 'Rows', 'Face Pulls', 'Grip Work'],
      },
      {
        day: 5,
        name: 'Full Body Combat',
        focus: 'Fight Training',
        exercises: ['Turkish Get-ups', 'Med Ball Slams', 'KB Complex', 'Sprawls', 'Core Circuit'],
      },
    ],
    features: [
      'Warrior-inspired training',
      'Functional carry work',
      'Combat conditioning',
      'Mental toughness focus',
    ],
    popularityScore: 78,
  },
  {
    id: 'athletic-marvel',
    name: 'Athletic Marvel',
    slug: 'athletic-marvel',
    description:
      'MCU-inspired athletic training. Build the combination of size, strength, and athleticism seen in Marvel heroes.',
    category: 'athletic',
    difficulty: 'intermediate',
    daysPerWeek: 5,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables', 'plyo box'],
    goals: ['Athletic physique', 'Functional muscle', 'Movie-ready'],
    structure: {
      phases: 3,
      splitType: 'Push/Pull/Legs + Athletic',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Push',
        focus: 'Upper Body Push',
        exercises: ['Bench Press', 'OHP', 'Incline DB', 'Dips', 'Lateral Raises'],
      },
      {
        day: 2,
        name: 'Pull',
        focus: 'Upper Body Pull',
        exercises: ['Weighted Pull-ups', 'Rows', 'Face Pulls', 'Curls', 'Rear Delts'],
      },
      {
        day: 3,
        name: 'Legs',
        focus: 'Lower Body',
        exercises: ['Squat', 'RDL', 'Leg Press', 'Leg Curls', 'Calf Raises'],
      },
      {
        day: 4,
        name: 'Athletic',
        focus: 'Power & Speed',
        exercises: ['Power Cleans', 'Box Jumps', 'Med Ball Throws', 'Sprints', 'Agility'],
      },
      {
        day: 5,
        name: 'Full Body',
        focus: 'Strength & Conditioning',
        exercises: ['Deadlift', 'Push Press', 'Pull-ups', 'KB Swings', 'Core Circuit'],
      },
    ],
    features: [
      'Marvel hero physique',
      'Athletic performance',
      'Power development',
      'Screen-ready conditioning',
    ],
    popularityScore: 79,
  },
  {
    id: 'classic-bodybuilder',
    name: 'Classic Bodybuilder',
    slug: 'classic-bodybuilder',
    description:
      'Golden era bodybuilding inspired training. Build the timeless aesthetics of Arnold and the legends.',
    category: 'hypertrophy',
    difficulty: 'advanced',
    daysPerWeek: 6,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells', 'cables', 'machines'],
    goals: ['Classic physique', 'Maximum muscle', 'Golden era aesthetics'],
    structure: {
      phases: 2,
      splitType: '6-Day Split',
      periodization: 'Block',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Chest & Back',
        focus: 'Superset Training',
        exercises: ['Bench Press', 'Pull-ups', 'Incline DB', 'Rows', 'Dips', 'Pulldowns'],
      },
      {
        day: 2,
        name: 'Shoulders & Arms',
        focus: 'Upper Body Detail',
        exercises: ['Arnold Press', 'Lateral Raises', 'Barbell Curls', 'Skull Crushers', 'Preacher Curls'],
      },
      {
        day: 3,
        name: 'Legs',
        focus: 'Quads & Hams',
        exercises: ['Squat', 'Leg Press', 'Leg Extensions', 'Leg Curls', 'Stiff Leg DL', 'Calves'],
      },
      {
        day: 4,
        name: 'Chest & Back',
        focus: 'Volume Day',
        exercises: ['Incline Press', 'T-Bar Rows', 'Cable Flyes', 'Chin-ups', 'Pullovers'],
      },
      {
        day: 5,
        name: 'Shoulders & Arms',
        focus: 'Pump Day',
        exercises: ['DB Press', 'Front Raises', 'Hammer Curls', 'Rope Pushdowns', 'Concentration Curls'],
      },
      {
        day: 6,
        name: 'Legs',
        focus: 'Detail Work',
        exercises: ['Front Squat', 'Hack Squat', 'Lunges', 'Good Mornings', 'Calf Raises'],
      },
    ],
    features: [
      'Golden era training style',
      'High volume approach',
      'Superset-based',
      'Classic physique focus',
    ],
    popularityScore: 77,
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    slug: 'modern-minimalist',
    description:
      'Maximum results with minimum equipment and time. Efficient, evidence-based training for the busy modern lifter.',
    category: 'general',
    difficulty: 'beginner',
    daysPerWeek: 3,
    durationWeeks: 12,
    equipment: ['barbell', 'dumbbells'],
    goals: ['Time efficient', 'Minimal equipment', 'Maximum results'],
    structure: {
      phases: 3,
      splitType: 'Full Body',
      periodization: 'Linear',
    },
    workoutPreview: [
      {
        day: 1,
        name: 'Full Body A',
        focus: 'Squat Pattern',
        exercises: ['Squat', 'Bench Press', 'Rows', 'Curls'],
      },
      {
        day: 2,
        name: 'Full Body B',
        focus: 'Hinge Pattern',
        exercises: ['Deadlift', 'OHP', 'Pull-ups', 'Triceps'],
      },
      {
        day: 3,
        name: 'Full Body C',
        focus: 'Mixed',
        exercises: ['Front Squat', 'Incline Press', 'Cable Rows', 'Arms'],
      },
    ],
    features: [
      'Only 3 days per week',
      '45-minute sessions',
      'Essential exercises only',
      'No fluff, all results',
    ],
    popularityScore: 85,
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
