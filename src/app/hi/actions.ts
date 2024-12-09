'use server';

import { Message, ExtractedData, IntakeFormData } from "./types";
// import { revalidatePath } from "next/cache";
import { sendMessage } from "@/utils/chat";
import { generateTrainingProgramPrompt } from "../start/prompts";
import { prisma } from "@/lib/prisma";

const REQUIRED_CONFIDENCE_THRESHOLD = 0.7;

// Helper to convert extracted data to IntakeFormData format
function convertToIntakeFormat(extractedData: any): IntakeFormData {
  return {
    sex: extractedData.gender?.value || 'other',
    trainingGoal: extractedData.goals?.value,
    daysAvailable: parseInt(extractedData.daysPerWeek?.value) || 3,
    dailyBudget: parseInt(extractedData.timePerDay?.value) || 60,
    age: extractedData.age?.value ? parseInt(extractedData.age.value) : undefined,
    weight: extractedData.weight?.value ? parseInt(extractedData.weight.value) : undefined,
    height: extractedData.height?.value ? parseInt(extractedData.height.value) : undefined,
    trainingPreferences: extractedData.preferences?.value ? 
      extractedData.preferences.value.split(',').map((p: string) => p.trim()) : 
      [],
    additionalInfo: extractedData.additionalInfo?.value || '',
    experienceLevel: 'beginner' // Default value, could be extracted from conversation
  };
}

// @TODO: rename, clean up, etc
// @TODO: i'm not sure this is properly keeping a continuation of the conversation since it chops out
// a pretty, human-readable message instead of the entirety of what the AI has figured out
export async function processUserMessage(
  messages: Message[], 
  userId: string, 
  extractedData: ExtractedData | null = null,
  generateProgramDirectly: boolean = false
) {
  try {
    // @TODO: break this up into two discerete helper methods. one to generate the training program, one is to source new information. 
    if (generateProgramDirectly) {
      // Skip extraction and go straight to program generation
      const intakeData = convertToIntakeFormat(extractedData);
      const programPrompt = generateTrainingProgramPrompt(intakeData);
      const programResult = await sendMessage([{
        role: 'user',
        content: programPrompt
      }]);

      if (programResult.success) {
        console.log("🚀 ~ programResult:", JSON.stringify(programResult.data, null, 2))
        return {
          success: true,
          program: JSON.parse(programResult.data?.content?.[0]?.text || '{}')
        };
      }
    }

    const messageHistory = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    // Log the extraction prompt
    const extractionPrompt = `Based on our conversation, extract relevant information about:
      - Sex*
      - Training goals*
      - Days available per week -- if unanswered, default to 3
      - Time available per day -- if unanswered, default to 1 hour
      - Age
      - Weight*
      - Height
      - Training preferences
      - Additional context/information (such as injuries, medications, preferences for equipment, dietary restrictions, etc.)

      Information marked with an asterisk (*) is required. For each piece of information, provide a confidence score (0-1). Then, determine what information is still needed and formulate a natural follow-up question.

      If you have high confidence (>0.75) in all required fields (sex, goals, weight), mark \`readyForProgram\` as true so that the next turn will be program creation.

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
          "preferences": { "value": "...", "confidence": 0.0 },
          "additionalInfo": { "value": "...", "confidence": 0.0 }
        },
        "nextQuestion": "...",
        "readyForProgram": false
      }`
    ;

    const result = await sendMessage([
      ...messageHistory,
      {
        role: 'user',
        content: extractionPrompt
      }
    ]);

    if (!result.success) {
      throw new Error('Failed to get response from Claude');
    }

    const aiResponse = JSON.parse(result.data?.content?.[0]?.text || '{}');

    return {
      success: true,
      message: aiResponse.nextQuestion || "Could you tell me more about your fitness goals?",
      extractedData: aiResponse.extractedData,
      readyForProgram: aiResponse.readyForProgram
    };

  } catch (error) {
    console.error("Failed to process message:", error);

    return {
      success: false,
      message: "I'm sorry, I encountered an error. Please try again."
    };
  }
} 