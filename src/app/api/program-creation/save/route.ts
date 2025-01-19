import { NextResponse } from 'next/server';
import { saveProgramToDatabase } from '@/app/hi/services/programCreationSteps';
import { Program } from '@/types';

export async function POST(request: Request) {
  try {
    const program = await request.json();
    console.log("🚀 ~ POST ~ program:", program)
    const savedProgram = await saveProgramToDatabase(program as Program);
    console.log("🚀 ~ POST ~ savedProgram:", savedProgram)
    return NextResponse.json({ success: true, program, programId: savedProgram.id });
  } catch (error) {
    console.error('Error saving program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save program' },
      { status: 500 }
    );
  }
} 