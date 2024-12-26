import { PrismaClient } from '@prisma/client';
import { anthropic } from '@/lib/anthropic'
const prisma = new PrismaClient();

const EXAMPLE_EXERCISE = {
  name: "Barbell Row",
  category: "Compound",
  equipment: ["Barbell", "Weight Plates"],
  description: "A compound pulling movement that targets the back muscles.",
  instructions: [
    "Hinge forward at hips, keeping back straight",
    "Grip barbell slightly wider than shoulder width",
    "Pull bar to lower chest/upper abdomen",
    "Keep elbows close to body",
    "Lower with control to starting position"
  ],
  commonMistakes: [
    "Using too much body momentum",
    "Rounding the back",
    "Pulling to wrong position",
    "Not maintaining hip hinge",
    "Letting elbows flare too wide"
  ],
  benefits: [
    "Builds back thickness",
    "Improves posture",
    "Develops pulling strength",
    "Enhances core stability",
    "Strengthens grip"
  ],
  difficulty: "INTERMEDIATE",
  isCompound: true,
  movementPattern: "PULL",
  targetMuscles: ["BACK", "LATS"],
  secondaryMuscles: ["BICEPS", "CORE", "FOREARMS"],
  videoUrl: "https://example.com/barbell-row"
};

export async function generateExercisePrompt(numberOfExercises: number): Promise<string> {
  // Get existing exercise names to avoid duplicates
  const existingExercises = await prisma.exerciseLibrary.findMany({
    select: {
      name: true,
      movementPattern: true
    }
  });

  const prompt = `Please generate ${numberOfExercises} new unique exercises following EXACTLY the same structure and format as this example:

${JSON.stringify(EXAMPLE_EXERCISE, null, 2)}

Requirements:
1. Follow the exact same JSON structure, including all fields
2. Maintain the same level of detail for instructions (2-8 items), common mistakes (2-5 items), and benefits (2-5 items)
3. Use only the following enums:
   - difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
   - movementPattern: "PUSH" | "PULL" | "HINGE" | "SQUAT" | "LUNGE" | "CARRY" | "ROTATION" | "PLANK"
   - targetMuscles/secondaryMuscles: "CHEST" | "BACK" | "SHOULDERS" | "BICEPS" | "TRICEPS" | "FOREARMS" | "CORE" | "QUADRICEPS" | "HAMSTRINGS" | "CALVES" | "GLUTES" | "TRAPEZIUS" | "LATS"
4. Do not duplicate any of these existing exercises:
${existingExercises.map(e => `- ${e.name} (${e.movementPattern})`).join('\n')}

Please provide the response as a valid JSON array that can be parsed directly.`;

  return prompt;
}

export async function saveNewExercises(exercisesJson: string): Promise<void> {
  try {
    const exercises = JSON.parse(exercisesJson);
    
    if (!Array.isArray(exercises)) {
      throw new Error('Exercises must be provided as an array');
    }

    console.log('Starting to save new exercises...');
    
    for (const exercise of exercises) {
      // Check if exercise already exists
      const existing = await prisma.exerciseLibrary.findFirst({
        where: { name: exercise.name }
      });

      if (existing) {
        console.log(`Skipping duplicate exercise: ${exercise.name}`);
        continue;
      }

      const result = await prisma.exerciseLibrary.create({
        data: exercise,
      });
      console.log(`Created new exercise: ${result.name}`);
    }
    
    console.log('Finished saving exercises.');
  } catch (error) {
    console.error('Error saving exercises:', error);
    throw error;
  }
}

// Example usage:
/*
async function example() {
  // 1. Generate the prompt
  const prompt = await generateExercisePrompt(3);
  console.log(prompt);

  // 2. Send prompt to Claude and get response
  // const claudeResponse = await sendToClaude(prompt);

  // 3. Save the new exercises
  // await saveNewExercises(claudeResponse);
}
*/

const sendToClaude = async (prompt: string) => {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
  });
  return response.content[0].text;
};

(async () => {
  const prompt = await generateExercisePrompt(50);
  const response = await sendToClaude(prompt);
  console.log(response);
  await saveNewExercises(response);
})();
