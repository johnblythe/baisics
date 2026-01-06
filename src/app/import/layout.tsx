import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Import Your Workout Program | BAIsics',
  description: 'Upload any PDF or Word doc and turn it into a trackable workout program with AI. Edit exercises, sets, reps, and start tracking your progress instantly.',
  openGraph: {
    title: 'Import Your Workout Program | BAIsics',
    description: 'Turn any PDF or Word doc into a trackable workout program with AI.',
    type: 'website',
  },
};

export default function ImportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
