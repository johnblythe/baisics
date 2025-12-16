import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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
    // If no program exists, redirect to create one
    // Pass claim data as query params if present
    if (claimData) {
      const params = new URLSearchParams();
      params.set('source', claimData.source || 'unknown');
      if (claimData.toolData) {
        params.set('prefill', encodeURIComponent(JSON.stringify(claimData.toolData)));
      }
      redirect(`/hi?${params.toString()}`);
    }
    redirect('/hi');
  }

  // Redirect to the latest program
  redirect(`/dashboard/${latestProgram.id}`);
} 