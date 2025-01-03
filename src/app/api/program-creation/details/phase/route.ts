import { NextResponse } from 'next/server';
import { getPhaseDetails } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure, WorkoutStructure } from '@/app/hi/services/programCreationSteps';

export async function POST(request: Request) {
  try {
    const { intakeData, programStructure, workoutStructure, phase } = await request.json();
    const phaseDetails = await getPhaseDetails(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      workoutStructure as WorkoutStructure,
      phase
    );
    return NextResponse.json({ success: true, phaseDetails });
  } catch (error) {
    console.error('Error getting phase details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get phase details' },
      { status: 500 }
    );
  }
} 