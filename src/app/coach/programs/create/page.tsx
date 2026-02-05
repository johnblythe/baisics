import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CoachProgramCreator } from './CoachProgramCreator';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Program | Coach | baisics',
  description: 'Create a workout program for your client or as a template',
};

interface PageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function CoachProgramCreatePage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/coach/programs/create');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isCoach: true },
  });
  if (!user?.isCoach) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const clientId = params?.clientId || null;

  let clientName: string | null = null;
  if (clientId) {
    const relationship = await prisma.coachClient.findFirst({
      where: {
        coachId: session.user.id,
        clientId,
        inviteStatus: 'ACCEPTED',
      },
      include: {
        client: { select: { name: true, email: true } },
      },
    });
    if (!relationship) {
      redirect('/coach/dashboard');
    }
    clientName = relationship.client?.name || relationship.client?.email || 'Client';
  }

  const backHref = clientId ? `/coach/clients/${clientId}` : '/coach/dashboard';
  const backLabel = clientId ? `Back to ${clientName}` : 'Back to Dashboard';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">
            {clientId ? `Create Program for ${clientName}` : 'Create Program'}
          </h1>
          <p className="text-[#64748B] mt-2">
            {clientId
              ? 'Build a custom program and assign it to your client'
              : 'Build a program template you can assign to clients later'}
          </p>
        </div>

        <CoachProgramCreator clientId={clientId} clientName={clientName} />
      </div>
    </div>
  );
}
