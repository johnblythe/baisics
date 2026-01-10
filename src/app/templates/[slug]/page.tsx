import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROGRAM_TEMPLATES, ProgramTemplate } from '@/data/templates';
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

function generateJsonLd(template: ProgramTemplate) {
  // JSON-LD structured data for search engine rich snippets
  // Template data is trusted server-side content, not user input
  return {
    '@context': 'https://schema.org',
    '@type': 'ExercisePlan',
    name: template.name,
    description: template.description,
    exerciseType: template.category,
    activityDuration: `P${template.durationWeeks}W`,
    activityFrequency: `${template.daysPerWeek} days per week`,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'difficulty',
        value: template.difficulty,
      },
      {
        '@type': 'PropertyValue',
        name: 'splitType',
        value: template.structure.splitType,
      },
    ],
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = PROGRAM_TEMPLATES.find((t) => t.slug === slug);

  if (!template) {
    return notFound();
  }

  const jsonLd = generateJsonLd(template);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TemplateDetailClient template={template} />
    </>
  );
}
