import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Can't use prisma in edge runtime, so we'll pass data via query params
// The share page will pre-fetch and include stats in the URL

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const programName = searchParams.get('name') || 'Fitness Program';
  const workouts = searchParams.get('workouts') || '0';
  const volume = searchParams.get('volume') || '0';
  const weeks = searchParams.get('weeks') || '0';
  const userName = searchParams.get('user') || 'Athlete';

  // Format volume
  const volumeNum = parseInt(volume, 10);
  let volumeDisplay = `${volumeNum} lbs`;
  if (volumeNum >= 1000000) {
    volumeDisplay = `${(volumeNum / 1000000).toFixed(1)}M lbs`;
  } else if (volumeNum >= 1000) {
    volumeDisplay = `${(volumeNum / 1000).toFixed(1)}K lbs`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #FF6B6B 0%, #0F172A 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: 60,
        }}
      >
        {/* Top section with trophy and title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            marginBottom: 48,
          }}
        >
          {/* Trophy icon placeholder */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
            }}
          >
            🏆
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 20,
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              Program Complete!
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {programName}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 48,
            flex: 1,
          }}
        >
          {/* Workouts */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white' }}>
              {workouts}
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
              Workouts
            </div>
          </div>

          {/* Volume */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white' }}>
              {volumeDisplay}
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
              Total Volume
            </div>
          </div>

          {/* Weeks */}
          <div
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white' }}>
              {weeks}
            </div>
            <div style={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.8)' }}>
              Weeks
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Completed by {userName}
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'white',
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
