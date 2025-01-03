import { NextResponse } from 'next/server';
import { getWorkoutFocus } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure, WorkoutStructure } from '@/app/hi/services/programCreationSteps';

export async function POST(request: Request) {
  try {
    const { intakeData, programStructure, workoutStructure, dayNumber } = await request.json();
    const workoutFocus = await getWorkoutFocus(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      workoutStructure as WorkoutStructure,
      dayNumber
    );
    return NextResponse.json({ success: true, workoutFocus });
  } catch (error) {
    console.error('Error getting workout focus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get workout focus' },
      { status: 500 }
    );
  }
} 