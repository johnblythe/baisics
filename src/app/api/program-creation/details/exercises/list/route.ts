import { NextResponse } from 'next/server';
import { getExercisesForFocus } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure, WorkoutStructure } from '@/app/hi/services/programCreationSteps';

export async function POST(request: Request) {
  try {
    const { intakeData, programStructure, workoutStructure, workoutFocus, userId } = await request.json();
    const exercises = await getExercisesForFocus(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      workoutStructure as WorkoutStructure,
      workoutFocus,
      userId
    );
    return NextResponse.json({ success: true, exercises });
  } catch (error) {
    console.error('Error getting exercises:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get exercises' },
      { status: 500 }
    );
  }
} 