import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Workout Program | baisics',
  description: 'Create your own workout program or upload a PDF/Word doc and turn it into a trackable program with AI. Edit exercises, sets, reps, and start tracking your progress instantly.',
  openGraph: {
    title: 'Create Your Workout Program | baisics',
    description: 'Create your own workout program or turn any PDF/Word doc into a trackable program with AI.',
    type: 'website',
  },
};

export default function ImportProgramPage() {
  redirect('/create');
}
