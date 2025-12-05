import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const programId = searchParams.get('programId');
  const type = searchParams.get('type') || 'program'; // program, achievement, milestone

  // Default OG image
  if (!programId) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span
              style={{
                fontSize: 72,
                fontWeight: 'bold',
                color: 'white',
                letterSpacing: '-2px',
              }}
            >
              BAISICS
            </span>
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
            }}
          >
            AI-Powered Fitness Programs
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  try {
    // For edge runtime, we can't use Prisma directly
    // So we'll render a static template with placeholder data
    // In production, you'd use a separate data fetching mechanism

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            fontFamily: 'system-ui, sans-serif',
            padding: '60px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 28, fontWeight: 'bold', color: 'white' }}>
                BAISICS
              </span>
            </div>
            <span
              style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.6)',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '8px 16px',
                borderRadius: '20px',
              }}
            >
              AI-Generated Program
            </span>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '30px',
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 'bold', color: 'white' }}>
              My Fitness Journey
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: '800px',
              }}
            >
              A personalized program designed just for me
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'flex',
              gap: '30px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '24px 40px',
                borderRadius: '16px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>12</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }}>
                Workouts
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '24px 40px',
                borderRadius: '16px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: '#10b981' }}>75%</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }}>
                Complete
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '24px 40px',
                borderRadius: '16px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: '#f59e0b' }}>4</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }}>
                Phases
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '24px 40px',
                borderRadius: '16px',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 48, fontWeight: 'bold', color: '#ec4899' }}>48</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.6)' }}>
                Exercises
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);

    // Fallback
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          }}
        >
          <span style={{ fontSize: 48, color: 'white', fontWeight: 'bold' }}>
            BAISICS
          </span>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
