export const extractionPrompt = `
  Based on our conversation, extract relevant information about:
    - Sex*
    - Training goals*
    - Days available per week -- if unanswered, default to 3
    - Time available per day -- if unanswered, default to 1 hour
    - Age
    - Weight*
    - Height
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
            "primary": "...",
            "limitations": []
          },
          "confidence": 0.0
        },
        "equipmentAccess": {
          "value": {
            "type": "...",
            "available": []
          },
          "confidence": 0.0
        },
        "workoutStyle": {
          "value": {
            "primary": "...",
            "secondary": "..."
          },
          "confidence": 0.0
        },
        "preferences": { "value": "...", "confidence": 0.0 },
        "additionalInfo": { "value": "...", "confidence": 0.0 }
      },
      "nextQuestion": "...",
      "readyForProgram": false
    }`
  ;