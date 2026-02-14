/**
 * Simplified extraction prompt - no confidence scores
 * Just extract what we have and ask for what's missing
 */
export const buildExtractionPrompt = (existingData?: any) => {
  const existingDataSection = existingData ? `
EXISTING USER DATA (already known - do NOT ask for these again unless user wants to change):
${JSON.stringify(existingData, null, 2)}

IMPORTANT: This is a returning user. Only ask about:
1. Their NEW goal/focus (if they haven't stated it clearly)
2. Changes to schedule (days/time) if they mentioned wanting to change
3. DO NOT ask for sex, weight, height, age - we already have these
4. Infer workout environment from context (e.g., "powerbuilding" implies gym with heavy weights)
` : '';

  return `Based on our conversation, extract the user's fitness profile.
${existingDataSection}
REQUIRED FIELDS (must have all to proceed):
- sex: "male" | "female" | "other"
- trainingGoal: what they want to achieve
- age: number (ask naturally, e.g. "How old are you?" or "What's your age?")
- weight: in lbs (convert kg if needed)
- height: in inches (convert if needed, e.g. 5'10" = 70 inches)
- workoutEnvironment: "gym" | "home" | "travel" | "outdoors"
- equipmentAccess: what equipment they have

OPTIONAL FIELDS (use defaults if not mentioned):
- daysPerWeek: default 3
- timePerDay: default 60 (minutes)
- workoutStyle: "strength" | "cardio" | "yoga" | "hybrid" (default "strength")
- experienceLevel: "beginner" | "intermediate" | "advanced" (infer from context, default "beginner")
- preferences: array of preferences
- additionalInfo: injuries, limitations, other context

RULES:
1. Merge conversation info with existing data (existing data takes precedence unless user explicitly changes it)
2. If a REQUIRED field is missing AND not in existing data, ask about it naturally
3. If ALL required fields are present (from conversation OR existing data), set readyForProgram: true
4. Keep responses conversational and friendly - don't be robotic
5. Be smart about inference - "powerbuilding" means gym, heavy weights, strength focus

Respond with ONLY the JSON object below. Do NOT wrap in markdown code blocks. Do NOT include any text before or after the JSON:
{
  "extractedData": {
    "gender": "male" | "female" | "other" | null,
    "goals": "their goal" | null,
    "daysPerWeek": 3,
    "timePerDay": 60,
    "age": number | null,
    "weight": number | null,
    "height": number | null,
    "experienceLevel": "beginner" | "intermediate" | "advanced",
    "workoutEnvironment": {
      "primary": "gym" | "home" | "travel" | "outdoors" | null,
      "limitations": []
    },
    "equipmentAccess": {
      "type": "full-gym" | "minimal" | "bodyweight" | "specific" | null,
      "available": []
    },
    "workoutStyle": {
      "primary": "strength" | "cardio" | "yoga" | "hybrid",
      "secondary": null
    },
    "preferences": [],
    "additionalInfo": ""
  },
  "missingRequired": ["list", "of", "missing", "required", "fields"],
  "nextQuestion": "Friendly question asking for missing info OR confirming ready to create program",
  "readyForProgram": false
}`;
};

// Legacy export for backwards compatibility
export const extractionPrompt = buildExtractionPrompt();
