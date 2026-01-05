import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Look up coach by invite slug
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug required' }, { status: 400 });
    }

    // Find coach by invite slug
    const coach = await prisma.user.findFirst({
      where: {
        inviteSlug: slug.toLowerCase(),
        isCoach: true,
      },
      select: {
        id: true,
        name: true,
        brandName: true,
        brandColor: true,
        brandLogo: true,
        inviteSlug: true,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Get or create public invite for this coach
    let publicInvite = await prisma.coachClient.findFirst({
      where: {
        coachId: coach.id,
        inviteEmail: null,
        clientId: null,
      },
      select: { inviteToken: true },
    });

    // Create public invite if doesn't exist
    if (!publicInvite) {
      const newInvite = await prisma.coachClient.create({
        data: {
          coachId: coach.id,
          inviteToken: crypto.randomUUID(),
          inviteEmail: null,
          clientId: null,
          inviteStatus: 'PENDING',
          status: 'ACTIVE',
        },
        select: { inviteToken: true },
      });
      publicInvite = newInvite;
    }

    return NextResponse.json({
      coach: {
        name: coach.brandName || coach.name,
        brandColor: coach.brandColor || '#FF6B6B',
        brandLogo: coach.brandLogo,
      },
      inviteToken: publicInvite.inviteToken,
    });
  } catch (error) {
    console.error('Error looking up coach by slug:', error);
    return NextResponse.json(
      { error: 'Failed to look up coach' },
      { status: 500 }
    );
  }
}
