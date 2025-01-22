export const _extractionPrompt = `
  Based on our conversation, extract relevant information about:
    - Sex*
    - Training goals*
    - Days available per week -- if unanswered, default to 3
    - Time available per day -- if unanswered, default to 1 hour
    - Age
    - Weight*
    - Height*
    - Workout environment* (gym/home/travel/outdoors)
    - Available equipment*
    - Preferred workout style (strength/cardio/yoga/hybrid)
    - Training preferences
    - Additional context/information (such as injuries, medications, preferences for equipment, dietary restrictions, etc.)

    Information marked with an asterisk (*) is required. For each piece of information, provide a confidence score (0-1). Give a friendly thanks and summary of what you captured or ask for clarification if needed. Then, determine what information is still needed and formulate a natural follow-up question to continue gathering information.

    If you have high confidence (>0.75) in all required fields (sex, goals, weight, environment, equipment), mark \`readyForProgram\` as true so that the next turn will be program creation.

    Respond only with a JSON object in this format:
    {
      "extractedData": {
        "gender": { "value": "...", "confidence": 0.0 },
        "goals": { "value": "...", "confidence": 0.0 },
        "daysPerWeek": { "value": "...", "confidence": 0.0 },
        "timePerDay": { "value": "...", "confidence": 0.0 },
        "age": { "value": "...", "confidence": 0.0 },
        "weight": { "value": "...", "confidence": 0.0 },
        "height": { "value": "...", "confidence": 0.0 },
        "workoutEnvironment": { 
          "value": {
            "primary": "gym" | "home" | "travel" | "outdoors",
            "limitations": []
          },
          "confidence": 0.0
        },
        "equipmentAccess": {
          "value": {
            "type": "full-gym" | "minimal" | "bodyweight" | "specific",
            "available": []
          },
          "confidence": 0.0
        },
        "workoutStyle": {
          "value": {
            "primary": "strength" | "yoga" | "cardio" | "hybrid",
            "secondary": "strength" | "yoga" | "cardio" | "hybrid"
          },
          "confidence": 0.0
        },
        "preferences": { "value": "...", "confidence": 0.0 },
        "additionalInfo": { "value": "...", "confidence": 0.0 }
      },
      "nextQuestion": "...",
      "readyForProgram": false
    }
`
  ;

export const extractionPrompt = `
Based on our conversation, extract relevant information about:
- Sex*
- Training goals*
- Days available per week -- if unanswered, default to 3
- Time available per day -- if unanswered, default to 1 hour
- Age
- Weight*
- Height*
- Workout environment* (gym/home/travel/outdoors)
- Available equipment*
- Preferred workout style (strength/cardio/yoga/hybrid)
- Training preferences
- Additional context/information (such as injuries, medications, preferences for equipment, dietary restrictions, etc.)
Information marked with an asterisk (*) is required. For each piece of information, provide a confidence score (0-1). Give a friendly thanks and summary of what you captured or ask for clarification if needed. Then, determine what information is still needed and formulate a natural follow-up question to continue gathering information.
Validation Rules:

Height must be between 4'0" and 8'0". Accepted formats:
• X'Y" (e.g., 5'6")
• X feet Y inches
• Total inches
• Centimeters
Invalid heights will result in confidence=0
Weight must be between 50-500 lbs (23-227 kg). Accepted formats:
• Pounds (e.g., "150 lbs", "150")
• Kilograms (e.g., "70 kg")
Invalid weights will result in confidence=0
Sex must be explicitly stated as "male", "female", or "other"
Training goals must be one or more of:
• muscle gain
• fat loss
• strength
• endurance
• health
• mobility
• athletic performance
• rehabilitation
• other
Workout environment must be one of:
• gym
• home
• travel
• outdoors
• other
Equipment access must specify either:
• full-gym
• minimal
• bodyweight
• specific (with list of available equipment)

If you have high confidence (>0.75) in all required fields (sex, goals, weight, environment, equipment), mark readyForProgram as true so that the next turn will be program creation.
Respond only with a JSON object in this format:
{
"extractedData": {
"gender": { "value": "...", "confidence": 0.0 },
"goals": { "value": "...", "confidence": 0.0 },
"daysPerWeek": { "value": "...", "confidence": 0.0 },
"timePerDay": { "value": "...", "confidence": 0.0 },
"age": { "value": "...", "confidence": 0.0 },
"weight": { "value": "...", "confidence": 0.0 },
"height": { "value": "...", "confidence": 0.0 },
"workoutEnvironment": {
"value": {
"primary": "gym" | "home" | "travel" | "outdoors",
"limitations": []
},
"confidence": 0.0
},
"equipmentAccess": {
"value": {
"type": "full-gym" | "minimal" | "bodyweight" | "specific",
"available": []
},
"confidence": 0.0
},
"workoutStyle": {
"value": {
"primary": "strength" | "yoga" | "cardio" | "hybrid",
"secondary": "strength" | "yoga" | "cardio" | "hybrid"
},
"confidence": 0.0
},
"preferences": { "value": "...", "confidence": 0.0 },
"additionalInfo": { "value": "...", "confidence": 0.0 }
},
"nextQuestion": "...",
"readyForProgram": false
}
Example Height Parsing:
"5'6""     -> value: "66", confidence: 1.0
"167 cm"   -> value: "66", confidence: 1.0
"66 in"    -> value: "66", confidence: 1.0
"invalid"  -> value: null, confidence: 0.0
Example Weight Parsing:
"150 lbs"  -> value: "150", confidence: 1.0
"70 kg"    -> value: "154", confidence: 1.0
"invalid"  -> value: null, confidence: 0.0
`