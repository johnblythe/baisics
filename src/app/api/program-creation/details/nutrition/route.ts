import { NextResponse } from 'next/server';
import { getPhaseNutrition } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';
import { ProgramStructure } from '@/app/hi/services/programCreationSteps';

export async function POST(request: Request) {
  try {
    const { intakeData, programStructure, phase } = await request.json();
    const nutrition = await getPhaseNutrition(
      intakeData as IntakeFormData,
      programStructure as ProgramStructure,
      phase
    );
    return NextResponse.json({ success: true, nutrition });
  } catch (error) {
    console.error('Error getting phase nutrition:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get phase nutrition' },
      { status: 500 }
    );
  }
} 