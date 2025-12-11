import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import NewProgramCreation from './NewProgramCreation';

export default async function NewProgramPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return <NewProgramCreation userId={session.user.id} />;
}
