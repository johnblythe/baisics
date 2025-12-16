import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { matchTemplateToToolData, ToolSource } from '@/services/templateMatcher';
import { cloneStaticTemplate } from '@/services/programClone';

interface DashboardPageProps {
  searchParams: Promise<{ claim?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const params = await searchParams;
  const claimToken = params.claim;
  let claimData: { source?: string; toolData?: Record<string, unknown> } | null = null;

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

  // Get the latest program
  const latestProgram = await prisma.program.findFirst({
    where: {
      createdBy: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
    },
  });

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
    redirect('/hi');
  }

  // Redirect to the latest program
  redirect(`/dashboard/${latestProgram.id}`);
} 