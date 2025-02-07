import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NewProgramCreation from './NewProgramCreation';

export default async function NewProgramPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Program</h1>
      <NewProgramCreation userId={session.user.id} />
    </div>
  );
} 