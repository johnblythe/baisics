import { IntakeFormData, ProgramStructure, ProgramData, Phase } from "@/types";
import { generateProgramStructurePrompt, generatePhaseDetailsPrompt } from "@/app/start/prompts";
import { sendMessage } from "@/utils/chat";

export async function createProgram(intakeData: IntakeFormData) {
  try {
    // Step 1: Generate program structure
    const structurePrompt = generateProgramStructurePrompt(intakeData);
    const structureResult = await sendMessage([{
      role: 'user',
      content: structurePrompt
    }]);

    if (!structureResult.success) {
      throw new Error('Failed to generate program structure');
    }

    const programStructure: ProgramStructure = JSON.parse(
      structureResult.data?.content?.[0]?.text || '{}'
    );

    // Step 2: Generate each phase's details
    const phases = [];
    for (let i = 1; i <= programStructure.totalPhases; i++) {
      const phasePrompt = generatePhaseDetailsPrompt(
        intakeData,
        programStructure,
        i
      );

      const phaseResult = await sendMessage([{
        role: 'user',
        content: phasePrompt
      }]);

      if (!phaseResult.success) {
        throw new Error(`Failed to generate phase ${i} details`);
      }

      const phaseDetails = JSON.parse(
        phaseResult.data?.content?.[0]?.text || '{}'
      );
      phases.push(phaseDetails);
    }

    // Step 3: Combine into final program
    return {
      programName: `${intakeData.trainingGoal} Focus Program`,
      programDescription: programStructure.overallProgression.join('. '),
      phases
    };
  } catch (error) {
    console.error('Program creation failed:', error);
    throw error;
  }
}

export async function modifyProgram(
  currentProgram: any,
  modificationRequest: string,
  intakeData: IntakeFormData
) {
  try {
    // Step 1: Generate modification structure
    const structurePrompt = generateProgramStructurePrompt(intakeData);
    const structureResult = await sendMessage([{
      role: 'user',
      content: structurePrompt
    }]);

    if (!structureResult.success) {
      throw new Error('Failed to generate program structure');
    }

    const programStructure: ProgramStructure = JSON.parse(
      structureResult.data?.content?.[0]?.text || '{}'
    );
    console.log("🚀 ~ programStructure:", programStructure)

    // Validate phase count matches current program
    if (programStructure.totalPhases !== currentProgram.workoutPlans.length) {
      programStructure.totalPhases = currentProgram.workoutPlans.length;
    }

    // Step 2: Generate each phase's modified details
    const phases = [];
    for (let i = 1; i <= programStructure.totalPhases; i++) {
      const currentPhase = currentProgram.workoutPlans[i - 1];
      const phasePrompt = generatePhaseDetailsPrompt(
        intakeData,
        programStructure,
        i,
        currentPhase, // Pass current phase for reference
        modificationRequest // Pass modification request
      );

      const phaseResult = await sendMessage([{
        role: 'user',
        content: phasePrompt
      }]);

      console.log("🚀 ~ phaseResult:", JSON.stringify(phaseResult.data?.content?.[0]?.text, null, 2))

      if (!phaseResult.success) {
        throw new Error(`Failed to generate phase ${i} details`);
      }

      const phaseDetails = JSON.parse(
        phaseResult.data?.content?.[0]?.text || '{}'
      );
      phases.push(phaseDetails);
    }

    // Step 3: Combine into final program
    return {
      programName: currentProgram.name,
      programDescription: `${currentProgram.description} (Modified: ${modificationRequest})`,
      phases
    };
  } catch (error) {
    console.error('Program modification failed:', error);
    throw error;
  }
} 