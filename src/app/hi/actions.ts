'use server';

import { Message, ExtractedData, Program } from "@/types";
import { sendMessage } from "@/utils/chat";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { buildExtractionPrompt } from "@/utils/prompts/";

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



// @TODO: rename, clean up, etc
// @TODO: i'm not sure this is properly keeping a continuation of the conversation since it chops out
// a pretty, human-readable message instead of the entirety of what the AI has figured out
export async function processUserMessage(
  messages: Message[],
  userId: string,
  extractedData: ExtractedData | null = null
) {
  try {
    const messageHistory = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    // Build extraction prompt with existing data for returning users (#107)
    const prompt = buildExtractionPrompt(extractedData);

    const result = await sendMessage(
      [
        ...messageHistory,
        {
          role: 'user',
          content: prompt
        }
      ],
      userId
    );

    if (!result.success) {
      throw new Error('Failed to get response from Claude');
    }

    // @ts-ignore
    let responseText = result.data?.content?.[0]?.text || '{}';

    // Strip markdown code blocks if present (Claude sometimes wraps JSON despite instructions)
    responseText = responseText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();

    const aiResponse = JSON.parse(responseText);

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