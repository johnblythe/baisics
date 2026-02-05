import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { matchTemplateToToolData, ToolSource } from '@/services/templateMatcher';
import { cloneStaticTemplate } from '@/services/programClone';
import { Sparkles, LayoutGrid, Upload } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Your Dashboard | baisics',
};

interface DashboardPageProps {
  searchParams: Promise<{ claim?: string; personal?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  const claimToken = params.claim;

  // Check mode cookie in addition to ?personal=true query param
  const cookieStore = await cookies();
  const modeCookie = cookieStore.get('baisics-mode')?.value;
  const personalDashboard = params.personal === 'true' || modeCookie === 'consumer';
  let claimData: { source?: string; toolData?: Record<string, unknown> } | null = null;

  // Check if user is a coach and redirect to coach dashboard (unless personal=true)
  if (!personalDashboard) {
    const coachCheck = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true },
    });

    if (coachCheck?.isCoach) {
      redirect('/coach/dashboard');
    }
  }

  // Process pending claim if token provided
  if (claimToken) {
    const claim = await prisma.pendingClaim.findUnique({
      where: { token: claimToken },
    });

    if (claim && !claim.used && claim.expiresAt > new Date()) {
      // Mark claim as used
      await prisma.pendingClaim.update({
        where: { id: claim.id },
        data: { used: true },
      });

      claimData = {
        source: claim.source,
        toolData: claim.toolData as Record<string, unknown> | undefined,
      };
    }
  }

  // Get the latest program and user info
  const [latestProgram, user, programCount] = await Promise.all([
    prisma.program.findFirst({
      where: {
        createdBy: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    }),
    prisma.program.count({
      where: {
        createdBy: session.user.id,
        isTemplate: false,
      },
    }),
  ]);

  if (!latestProgram) {
    // No existing program - check if we have claim data for auto-assignment
    if (claimData) {
      // Match tool results to best template
      const match = matchTemplateToToolData(
        claimData.source as ToolSource,
        claimData.toolData
      );

      if (match) {
        // Clone the matched template for this user
        const result = await cloneStaticTemplate(match.template.id, session.user.id);

        if (result.success && result.programId) {
          // Redirect to new program with welcome state
          const welcomeParams = new URLSearchParams();
          welcomeParams.set('welcome', 'claim');
          welcomeParams.set('reason', encodeURIComponent(match.reason));
          welcomeParams.set('source', claimData.source || 'tool');
          redirect(`/dashboard/${result.programId}?${welcomeParams.toString()}`);
        }
      }

      // Fallback: redirect to /hi with prefill if clone fails
      const fallbackParams = new URLSearchParams();
      fallbackParams.set('source', claimData.source || 'unknown');
      if (claimData.toolData) {
        fallbackParams.set('prefill', encodeURIComponent(JSON.stringify(claimData.toolData)));
      }
      redirect(`/hi?${fallbackParams.toString()}`);
    }

    // No programs - show empty state with CTAs
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            No active program
          </h1>
          <p className="text-[#475569] mb-8">
            Get started by creating a personalized program or choosing from our templates.
          </p>

          <div className="space-y-3">
            <Link
              href="/hi"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#FF6B6B] hover:bg-[#EF5350] text-white font-semibold rounded-lg transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Create with AI
            </Link>

            <Link
              href="/templates"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-[#0F172A] text-[#0F172A] hover:bg-gray-50 font-semibold rounded-lg transition-colors"
            >
              <LayoutGrid className="w-5 h-5" />
              Browse Templates
            </Link>

            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-[#0F172A] text-[#0F172A] hover:bg-gray-50 font-semibold rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import your own
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Free tier: if user already has a program and tries to claim another via token,
  // redirect to current program with upgrade prompt
  if (claimData && !user?.isPremium && programCount > 0) {
    redirect(`/dashboard/${latestProgram.id}?upgrade_prompt=program_limit`);
  }

  // Redirect to the latest program
  redirect(`/dashboard/${latestProgram.id}`);
} 