import { NextResponse } from 'next/server';
import { getWorkoutStructure, ProgramStructure } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';

export async function POST(request: Request) {
  try {
    const { intakeData, programStructure } = await request.json();
    const workoutStructure = await getWorkoutStructure(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure
    );
    return NextResponse.json({ success: true, workoutStructure });
  } catch (error) {
    console.error('Error in workout structure creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workout structure' },
      { status: 500 }
    );
  }
} 