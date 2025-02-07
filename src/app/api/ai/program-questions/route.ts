import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { OpenAIStream } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prompt } = body;

    // Log the prompt for debugging
    console.log('AI Prompt:', prompt);

    // Call OpenAI
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
    });

    if (!response.ok) {
      throw new Error('AI service error');
    }

    const data = await response.json();
    console.log('AI Response:', data);

    // Parse the response as JSON array of questions
    try {
      const questions = JSON.parse(data.content[0].text);
      return NextResponse.json(questions);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating program questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate program questions' },
      { status: 500 }
    );
  }
} 