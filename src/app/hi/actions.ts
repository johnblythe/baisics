'use server';

import { Message, ExtractedData, IntakeFormData, WorkoutPlan, Program } from "@/types";
import { sendMessage } from "@/utils/chat";
import { analyzeModificationRequest, createProgram } from "./services/programCreation";
import { prisma } from "@/lib/prisma";
import { modifyPhase } from "./services/programCreation";

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
    experienceLevel: 'beginner', // Default value, could be extracted from conversation
    modificationRequest: extractedData.modificationRequest?.value || '',
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
  console.log("🚀 ~ processUserMessage ~ extractedData:", extractedData)
  try {
    if (generateProgramDirectly) {
      console.log("generateProgramDirectly");
      const intakeData = convertToIntakeFormat(extractedData);
      
      // Save intake data using existing UserIntake model
      await prisma.userIntake.upsert({
        where: { userId },
        create: {
          userId,
          sex: intakeData.sex || 'other',
          trainingGoal: intakeData.trainingGoal,
          daysAvailable: intakeData.daysAvailable,
          dailyBudget: intakeData.dailyBudget,
          experienceLevel: intakeData.experienceLevel,
          age: intakeData.age,
          weight: intakeData.weight,
          height: intakeData.height,
          trainingPreferences: intakeData.trainingPreferences || [],
          additionalInfo: intakeData.additionalInfo
        },
        update: {
          sex: intakeData.sex || 'other',
          trainingGoal: intakeData.trainingGoal,
          daysAvailable: intakeData.daysAvailable,
          dailyBudget: intakeData.dailyBudget,
          experienceLevel: intakeData.experienceLevel,
          age: intakeData.age,
          weight: intakeData.weight,
          height: intakeData.height,
          trainingPreferences: intakeData.trainingPreferences || [],
          additionalInfo: intakeData.additionalInfo
        }
      });

      // Save confidence scores in prompt log for analysis
      await prisma.promptLog.create({
        data: {
          userId,
          prompt: 'Initial intake analysis',
          response: JSON.stringify(extractedData?.confidence || {}),
          model: process.env.SONNET_MODEL!,
          success: true
        }
      });

      // Generate program using new service
      const program = await createProgram(intakeData);
      
      return {
        success: true,
        program
      };
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
    console.log("🚀 ~ aiResponse:", aiResponse)

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

export async function processModificationRequest(
  messages: Message[],
  userId: string,
  currentProgram: Program,
  modificationRequest: string,
  requestedPhase: number = 1,
) {
  try {
    // First analyze the modification request
    const analysis = await analyzeModificationRequest(modificationRequest);
    console.log("🚀 ~ analysis:", analysis)
    
    // If confidence is low, ask for clarification
    if (analysis.confidence < 0.7) {
      return {
        success: true,
        message: "I'm not quite sure what changes you'd like to make. Could you please be more specific?",
        needsClarification: true
      };
    }

    // If there are multiple requests, handle them one by one
    if (analysis.type === 'multiple' && analysis.subRequests) {
      let modifiedProgram = currentProgram;
      const modifications = [];

      for (const request of analysis.subRequests) {
        const result = await processPhaseModification(
          userId,
          modifiedProgram,
          requestedPhase,
          request
        );
        if (result.success) {
          modifiedProgram = result.program as Program;
          modifications.push(result.message);
        }
      }

      return {
        success: true,
        message: modifications.join(' '),
        program: modifiedProgram,
        needsClarification: false
      };
    }

    // If the modification affects all phases, apply to each phase
    if (analysis.affectsAllPhases) {
      let modifiedProgram = currentProgram;
      const modifications = [];

      for (let phase = 1; phase <= currentProgram.workoutPlans.length; phase++) {
        const result = await processPhaseModification(
          userId,
          modifiedProgram,
          phase,
          modificationRequest
        );
        if (result.success) {
          modifiedProgram = result.program as Program;
          modifications.push(result.message);
        }
      }

      return {
        success: true,
        message: "I've applied your changes across all phases of the program.",
        program: modifiedProgram,
        needsClarification: false
      };
    }

    // Otherwise, just modify the requested phase
    return processPhaseModification(
      userId,
      currentProgram,
      requestedPhase,
      modificationRequest
    );

  } catch (error) {
    console.error("Failed to process modification request:", error);
    return {
      success: false,
      message: "I encountered an error while processing your request. Please try again.",
      needsClarification: true
    };
  }
}

export async function saveDemoIntake(userId: string) {
  'use server'
  
  const DEMO_INTAKE = {
    sex: 'male',
    trainingGoal: 'muscle building',
    daysAvailable: 5,
    dailyBudget: 90,
    age: 30,
    weight: 180,
    height: 72,
    experienceLevel: 'intermediate',
    trainingPreferences: ['free weights', 'machines', 'bodyweight'],
    additionalInfo: 'Athletic background, looking to build muscle while maintaining conditioning'
  };

  try {
    await prisma.userIntake.upsert({
      where: { userId },
      create: {
        userId,
        ...DEMO_INTAKE
      },
      update: {
        ...DEMO_INTAKE
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to save demo intake:', error);
    return { success: false };
  }
}

export async function processPhaseModification(
  userId: string,
  currentProgram: Program,
  phaseNumber: number,
  modificationRequest: string
) {
  try {
    const currentPhase = currentProgram.workoutPlans.find((p: WorkoutPlan) => p.phase === phaseNumber);
    if (!currentPhase) {
      throw new Error(`Phase ${phaseNumber} not found`);
    }
    console.log("🚀 ~ currentPhase:", currentPhase)

    // Get modified phase from Claude
    const modifiedPhase = await modifyPhase(
      userId,
      currentPhase,
      modificationRequest
    );
    console.log("🚀 ~ modifiedPhase:", modifiedPhase)

    // Create a new program object with the modified phase
    const transformedProgram = {
      ...currentProgram,
      workoutPlans: currentProgram.workoutPlans.map((phase: WorkoutPlan) => 
        phase.phase === phaseNumber ? modifiedPhase : phase
      )
    };

    return {
      success: true,
      message: `Phase ${phaseNumber} has been updated with your requested changes.`,
      program: transformedProgram,
      needsClarification: false
    };

  } catch (error) {
    console.error("Failed to process phase modification request:", error);
    return {
      success: false,
      message: "I encountered an error while processing your request. Please try again.",
      needsClarification: true
    };
  }
} 