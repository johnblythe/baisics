import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getTemplateBySlug, PROGRAM_TEMPLATES } from '@/data/templates';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, customizations } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 });
    }

    const template = PROGRAM_TEMPLATES.find((t) => t.id === templateId);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Get user intake for customization
    const userIntake = await prisma.userIntake.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Build template context for generation
    const templateContext = {
      basedOn: {
        id: template.id,
        name: template.name,
        splitType: template.structure.splitType,
        daysPerWeek: customizations?.daysPerWeek || template.daysPerWeek,
        durationWeeks: template.durationWeeks,
        phases: template.structure.phases,
        periodization: template.structure.periodization,
        category: template.category,
        difficulty: template.difficulty,
        workoutPreview: template.workoutPreview,
      },
      customizations: {
        ...customizations,
        userGoals: userIntake?.trainingGoal,
        experienceLevel: userIntake?.experienceLevel,
      },
    };

    // Return template context for the generation service to use
    // The actual generation will be handled by the unified generation endpoint
    return NextResponse.json({
      success: true,
      templateContext,
      redirectUrl: `/hi?template=${encodeURIComponent(JSON.stringify(templateContext))}`,
    });
  } catch (error) {
    console.error('Error processing template:', error);
    return NextResponse.json(
      { error: 'Failed to process template' },
      { status: 500 }
    );
  }
}

// GET - List all templates
export async function GET() {
  try {
    const templates = PROGRAM_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      daysPerWeek: t.daysPerWeek,
      durationWeeks: t.durationWeeks,
      equipment: t.equipment,
      goals: t.goals,
      features: t.features.slice(0, 3),
      popularityScore: t.popularityScore,
      author: t.author,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
