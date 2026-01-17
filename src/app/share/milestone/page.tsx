import { Metadata } from 'next';
import { getMilestoneConfig, MILESTONES } from '@/lib/milestones';
import { MilestoneType } from '@prisma/client';
import {
  Star,
  Flame,
  Medal,
  Dumbbell,
  Crown,
  Diamond,
  CalendarCheck,
  Trophy,
  Infinity,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  star: Star,
  flame: Flame,
  medal: Medal,
  dumbbell: Dumbbell,
  crown: Crown,
  diamond: Diamond,
  'calendar-check': CalendarCheck,
  trophy: Trophy,
  infinity: Infinity,
};

interface ShareMilestonePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: ShareMilestonePageProps): Promise<Metadata> {
  const params = await searchParams;
  const milestoneType = params.type as MilestoneType | undefined;
  const config = milestoneType ? getMilestoneConfig(milestoneType) : null;

  if (!config) {
    return {
      title: 'Milestone Achievement - BAISICS',
      description: 'Check out this workout milestone achieved on BAISICS!',
    };
  }

  return {
    title: `${config.name} - BAISICS Achievement`,
    description: `"${config.quote}" - ${config.threshold} workouts completed!`,
    openGraph: {
      title: `${config.name} Achievement Unlocked!`,
      description: `"${config.quote}"`,
      type: 'website',
      siteName: 'BAISICS',
      images: [
        {
          url: `/api/og/milestone?type=${milestoneType}`,
          width: 1200,
          height: 630,
          alt: `${config.name} Badge`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.name} Achievement Unlocked!`,
      description: `"${config.quote}"`,
      images: [`/api/og/milestone?type=${milestoneType}`],
    },
  };
}

export default async function ShareMilestonePage({ searchParams }: ShareMilestonePageProps) {
  const params = await searchParams;
  const milestoneType = params.type as MilestoneType | undefined;
  const totalWorkouts = params.workouts ? parseInt(params.workouts as string, 10) : null;

  const config = milestoneType ? getMilestoneConfig(milestoneType) : null;

  if (!config) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Milestone Not Found</h1>
          <p className="text-[#64748B]">This achievement link is invalid.</p>
          <a
            href="https://baisics.app"
            className="inline-block mt-4 px-4 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#EF5350] transition-colors"
          >
            Go to BAISICS
          </a>
        </div>
      </div>
    );
  }

  const Icon = ICON_MAP[config.icon] || Star;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Share Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-br ${config.gradient} p-8 text-center text-white`}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon className="w-10 h-10" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold mb-2">{config.name}</h1>
            <p className="text-white/80">{config.threshold} workouts</p>
          </div>

          {/* Quote */}
          <div className="p-6 text-center">
            <p className="text-[#64748B] italic text-lg mb-6">
              &ldquo;{config.quote}&rdquo;
            </p>

            {totalWorkouts && (
              <p className="text-sm text-[#64748B] mb-6">
                {totalWorkouts} total workouts completed
              </p>
            )}

            {/* CTA */}
            <a
              href="https://baisics.app"
              className="inline-block w-full px-6 py-3 bg-[#FF6B6B] text-white rounded-xl font-medium hover:bg-[#EF5350] transition-colors"
            >
              Start Your Journey on BAISICS
            </a>

            {/* Branding */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>baisics.app</span>
            </div>
          </div>
        </div>

        {/* All Milestones Preview */}
        <div className="mt-6 bg-white rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[#64748B] mb-3 text-center">
            All Lifetime Milestones
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {MILESTONES.map((m) => {
              const MIcon = ICON_MAP[m.icon] || Star;
              const isEarned = m.threshold <= (totalWorkouts || config.threshold);
              return (
                <div
                  key={m.type}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    m.type === milestoneType
                      ? `bg-gradient-to-br ${m.gradient}`
                      : isEarned
                      ? `bg-gradient-to-br ${m.gradient} opacity-60`
                      : 'bg-gray-200'
                  }`}
                >
                  <MIcon
                    className={`w-5 h-5 ${
                      isEarned || m.type === milestoneType
                        ? 'text-white'
                        : 'text-gray-400'
                    }`}
                    strokeWidth={1.5}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
