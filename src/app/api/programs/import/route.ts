import { NextResponse } from 'next/server';
import { workoutFilePrompt } from '@/utils/prompts/workoutFileProcessing';
import { sendMessage } from '@/utils/chat';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFileType(base64String: string): { valid: boolean; mimeType: string | null; error?: string } {
  try {
    // Extract the MIME type from the base64 string
    const mimeMatch = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    
    if (!mimeMatch) {
      return { 
        valid: false, 
        mimeType: null,
        error: 'Invalid file format. File must be a PDF or image (JPEG, PNG).'
      };
    }

    const mimeType = mimeMatch[1].toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
      return { 
        valid: false, 
        mimeType,
        error: `Unsupported file type: ${mimeType}. File must be a PDF or image (JPEG, PNG).`
      };
    }

    // Check file size
    const base64Data = base64String.replace(/^data:.*?;base64,/, '');
    const fileSize = (base64Data.length * 3) / 4; // Approximate size in bytes

    if (fileSize > MAX_FILE_SIZE) {
      return {
        valid: false,
        mimeType,
        error: 'File size exceeds 10MB limit.'
      };
    }

    return { valid: true, mimeType };
  } catch (error) {
    return { 
      valid: false, 
      mimeType: null,
      error: 'Failed to validate file type.'
    };
  }
}

export async function POST(request: Request) {
  try {
    const { file, fileName } = await request.json();

    // Validate file type and size
    const validation = validateFileType(file);
    
    if (!validation.valid) {
      return NextResponse.json({
        error: true,
        reason: 'File validation failed',
        details: [validation.error || 'Unknown validation error']
      });
    }

    // Extract just the base64 data without the data URL prefix
    const base64Data = file.split(',')[1];

    // Send to Claude with our prompt
    const messages = [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: validation.mimeType || 'application/pdf',
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: workoutFilePrompt + `\n\nAnalyze the workout file above (${fileName}).`
        },
      ],
    }];

    const response = await sendMessage(messages, 'system');

    if (!response.success) {
      return NextResponse.json({
        error: true,
        reason: 'Failed to process with Claude',
        details: [response.error || 'Unknown error']
      });
    }

    // Parse Claude's response
    const content = Array.isArray(response.data?.content)
      ? response.data.content.find(block => 'text' in block)?.text || ''
      : '';

    if (!content) {
      return NextResponse.json({
        error: true,
        reason: 'No content in response',
        details: ['Claude returned an empty response']
      });
    }

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (error) {
      return NextResponse.json({
        error: true,
        reason: 'Failed to parse response',
        details: ['Claude returned invalid JSON']
      });
    }

  } catch (error) {
    return NextResponse.json({
      error: true,
      reason: 'Server error',
      details: [error instanceof Error ? error.message : 'Unknown error']
    });
  }
} 