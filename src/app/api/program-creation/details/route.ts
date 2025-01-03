import { NextResponse } from 'next/server';
import { IntakeFormData } from '@/types';
import { ProgramStructure, getWorkoutDetails, WorkoutStructure } from '@/app/hi/services/programCreationSteps';

export async function POST(request: Request) {
  try {
    const { intakeData, programStructure, workoutStructure } = await request.json();
    const workoutDetails = await getWorkoutDetails(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      workoutStructure as WorkoutStructure,
      0 // Starting with phase 0
    );
    return NextResponse.json({ success: true, workoutDetails });
  } catch (error) {
    console.error('Error in workout details creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create workout details' },
      { status: 500 }
    );
  }
} 