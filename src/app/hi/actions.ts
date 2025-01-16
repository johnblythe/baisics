'use server';

import { Message, ExtractedData, IntakeFormData, WorkoutPlan, Program } from "@/types";
import { sendMessage } from "@/utils/chat";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
// import { modifyPhase } from "./services/programCreation";
import { createProgramSequentially } from "./services/_sequentialProgramCreation";
import { extractionPrompt } from "@/utils/prompts/";

// New server action for sending emails
export async function sendEmailAction(options: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const result = await sendEmail(options);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

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
  try {
    if (generateProgramDirectly) {
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
      const program = await createProgramSequentially(intakeData, userId);
      
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

    // @ts-ignore
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
    return;
    // @ts-ignore
    const programWithModifiedPhase = await processPhaseModification(
      userId,
      currentProgram,
      requestedPhase,
      modificationRequest,
    );
    console.log("🚀 ~ programWithModifiedPhase:", JSON.stringify(programWithModifiedPhase, null, 2))

    return {
      success: true,
      message: "Program updated successfully with your requested changes.",
      program: programWithModifiedPhase,
      needsClarification: false
    };

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

// @TODO: refactor
// export async function processPhaseModification(
//   userId: string,
//   currentProgram: Program,
//   phaseNumber: number,
//   modificationRequest: string
// ) {
//   try {
//     // @ts-ignore
//     const currentPhase = currentProgram.workoutPlans.find((p: WorkoutPlan) => p.phase === phaseNumber);
//     if (!currentPhase) {
//       throw new Error(`Phase ${phaseNumber} not found`);
//     }
//     console.log("🚀 ~ currentPhase:", currentPhase)

//     // Get modified phase from Claude
//     const modifiedPhase = await modifyPhase(
//       userId,
//       currentPhase,
//       modificationRequest
//     );
//     console.log("🚀 ~ modifiedPhase:", modifiedPhase)

//     // Create a new program object with the modified phase
//     const transformedProgram = {
//       ...currentProgram,
//       workoutPlans: currentProgram.workoutPlans.map((phase: WorkoutPlan) => 
//         // @ts-ignore
//         phase.phase === phaseNumber ? modifiedPhase : phase
//       )
//     };

//     return {
//       success: true,
//       message: `Phase ${phaseNumber} has been updated with your requested changes.`,
//       program: transformedProgram,
//       needsClarification: false
//     };

//   } catch (error) {
//     console.error("Failed to process phase modification request:", error);
//     return {
//       success: false,
//       message: "I encountered an error while processing your request. Please try again.",
//       needsClarification: true
//     };
//   }
// } 