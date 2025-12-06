/**
 * Simplified extraction prompt - no confidence scores
 * Just extract what we have and ask for what's missing
 */
export const extractionPrompt = `Based on our conversation, extract the user's fitness profile.

REQUIRED FIELDS (must have all to proceed):
- sex: "male" | "female" | "other"
- trainingGoal: what they want to achieve
- weight: in lbs (convert kg if needed)
- workoutEnvironment: "gym" | "home" | "travel" | "outdoors"
- equipmentAccess: what equipment they have

OPTIONAL FIELDS (use defaults if not mentioned):
- age: number or null
- height: in inches (convert if needed) or null
- daysPerWeek: default 3
- timePerDay: default 60 (minutes)
- workoutStyle: "strength" | "cardio" | "yoga" | "hybrid" (default "strength")
- experienceLevel: "beginner" | "intermediate" | "advanced" (infer from context, default "beginner")
- preferences: array of preferences
- additionalInfo: injuries, limitations, other context

RULES:
1. Extract ALL information mentioned so far in the conversation
2. If a REQUIRED field is missing, ask about it naturally
3. If ALL required fields are present, set readyForProgram: true
4. Keep responses conversational and friendly
5. Summarize what you understood before asking the next question

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
}`