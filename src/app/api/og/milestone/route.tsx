import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { MilestoneType } from '@prisma/client';

// Inline milestone config to avoid importing client-side code
const MILESTONES: Record<MilestoneType, { name: string; quote: string; threshold: number }> = {
  WORKOUT_1: { threshold: 1, name: 'Day One', quote: 'The first rep is the hardest one to take.' },
  WORKOUT_10: { threshold: 10, name: 'Getting Started', quote: "Ten down. You're building something." },
  WORKOUT_25: { threshold: 25, name: 'Quarter Century', quote: 'Twenty-five workouts. The habit is forming.' },
  WORKOUT_50: { threshold: 50, name: 'Fifty Strong', quote: 'Fifty workouts. This is who you are now.' },
  WORKOUT_100: { threshold: 100, name: 'Century Club', quote: "One hundred workouts. You're in the Century Club." },
  WORKOUT_250: { threshold: 250, name: 'Two-Fifty', quote: 'Two hundred fifty. Most people quit at ten.' },
  WORKOUT_365: { threshold: 365, name: "Year's Worth", quote: "A year's worth of workouts. Respect earned." },
  WORKOUT_500: { threshold: 500, name: 'Five Hundred', quote: 'Five hundred workouts. Elite commitment.' },
  WORKOUT_1000: { threshold: 1000, name: 'The Thousand', quote: 'One thousand workouts. Legendary.' },
};

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as MilestoneType | null;

  if (!type || !MILESTONES[type]) {
    return new Response('Invalid milestone type', { status: 400 });
  }

  const config = MILESTONES[type];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Badge circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EF5350 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '0 8px 32px rgba(255, 107, 107, 0.4)',
          }}
        >
          <span style={{ fontSize: 64, color: 'white', fontWeight: 'bold' }}>
            {config.threshold}
          </span>
        </div>

        {/* Milestone name */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          {config.name}
        </div>

        {/* Quote */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: 800,
            textAlign: 'center',
            fontStyle: 'italic',
            marginBottom: 48,
          }}
        >
          &ldquo;{config.quote}&rdquo;
        </div>

        {/* Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: '#FF6B6B',
              fontWeight: 'bold',
            }}
          >
            baisics.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
