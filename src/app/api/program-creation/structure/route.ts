import { NextResponse } from 'next/server';
import { getProgramStructure } from '@/app/hi/services/programCreationSteps';
import { IntakeFormData } from '@/types';

export async function POST(request: Request) {
  try {
    const { intakeData, userId } = await request.json();
    const programStructure = await getProgramStructure(intakeData as IntakeFormData, userId);
    return NextResponse.json({ success: true, programStructure });
  } catch (error) {
    console.error('Error in program structure creation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create program structure' },
      { status: 500 }
    );
  }
} 