import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
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
    redirect('/hi');
  }

  // Redirect to the latest program
  redirect(`/dashboard/${latestProgram.id}`);
} 