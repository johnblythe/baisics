import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROGRAM_TEMPLATES } from '@/data/templates';
import TemplateDetailClient from './TemplateDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = PROGRAM_TEMPLATES.find((t) => t.slug === slug);

  if (!template) {
    return {
      title: 'Template Not Found | baisics',
    };
  }

  const title = `${template.name} - Free Workout Program | baisics`;
  const description = template.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = PROGRAM_TEMPLATES.find((t) => t.slug === slug);

  if (!template) {
    return notFound();
  }

  return <TemplateDetailClient template={template} />;
}
