import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET - Fetch coach settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isCoach: true,
        name: true,
        brandName: true,
        brandColor: true,
        brandLogo: true,
        inviteSlug: true,
      },
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach account' }, { status: 403 });
    }

    // Get public invite URL
    const publicInvite = await prisma.coachClient.findFirst({
      where: {
        coachId: session.user.id,
        inviteEmail: null,
        clientId: null,
      },
      select: { inviteToken: true },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';

    // Build invite URL: custom slug or token-based
    let inviteUrl = null;
    if (user.inviteSlug) {
      inviteUrl = `${baseUrl}/join/${user.inviteSlug}`;
    } else if (publicInvite?.inviteToken) {
      inviteUrl = `${baseUrl}/coach/invite/${publicInvite.inviteToken}`;
    }

    return NextResponse.json({
      name: user.name,
      brandName: user.brandName,
      brandColor: user.brandColor || '#FF6B6B', // Default coral
      brandLogo: user.brandLogo,
      inviteSlug: user.inviteSlug,
      inviteUrl,
    });
  } catch (error) {
    console.error('Error fetching coach settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update coach settings
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true },
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach account' }, { status: 403 });
    }

    const { brandName, brandColor, brandLogo, inviteSlug } = await request.json();

    // Validate invite slug if provided
    if (inviteSlug !== undefined && inviteSlug !== null) {
      // Normalize: lowercase, alphanumeric + hyphens only
      const normalizedSlug = inviteSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      if (normalizedSlug.length < 3) {
        return NextResponse.json(
          { error: 'Invite slug must be at least 3 characters' },
          { status: 400 }
        );
      }

      if (normalizedSlug.length > 30) {
        return NextResponse.json(
          { error: 'Invite slug must be 30 characters or less' },
          { status: 400 }
        );
      }

      // Check uniqueness (exclude current user)
      const existingSlug = await prisma.user.findFirst({
        where: {
          inviteSlug: normalizedSlug,
          NOT: { id: session.user.id },
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'This invite slug is already taken' },
          { status: 400 }
        );
      }
    }

    // Validate hex color
    if (brandColor && !/^#[0-9A-Fa-f]{6}$/.test(brandColor)) {
      return NextResponse.json(
        { error: 'Invalid color format. Use hex like #FF6B6B' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        brandName: brandName ?? undefined,
        brandColor: brandColor ?? undefined,
        brandLogo: brandLogo ?? undefined,
        inviteSlug: inviteSlug
          ? inviteSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
          : inviteSlug === null ? null : undefined,
      },
      select: {
        brandName: true,
        brandColor: true,
        brandLogo: true,
        inviteSlug: true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baisics.app';
    let inviteUrl = null;

    if (updatedUser.inviteSlug) {
      inviteUrl = `${baseUrl}/join/${updatedUser.inviteSlug}`;
    } else {
      const publicInvite = await prisma.coachClient.findFirst({
        where: {
          coachId: session.user.id,
          inviteEmail: null,
          clientId: null,
        },
        select: { inviteToken: true },
      });
      if (publicInvite?.inviteToken) {
        inviteUrl = `${baseUrl}/coach/invite/${publicInvite.inviteToken}`;
      }
    }

    return NextResponse.json({
      ...updatedUser,
      brandColor: updatedUser.brandColor || '#FF6B6B',
      inviteUrl,
    });
  } catch (error) {
    console.error('Error updating coach settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
