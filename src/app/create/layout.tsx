import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Program | baisics',
  description: 'Upload any PDF or Word doc and turn it into a trackable workout program with AI. Edit exercises, sets, reps, and start tracking your progress instantly.',
  openGraph: {
    title: 'Create Your Program | baisics',
    description: 'Turn any PDF or Word doc into a trackable workout program with AI.',
    type: 'website',
  },
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
