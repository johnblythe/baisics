import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

interface RouteParams {
  params: Promise<{ clientId: string }>;
}

// GET - Get detailed client info
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    const coachClient = await prisma.coachClient.findFirst({
      where: {
        id: clientId,
        coachId: session.user.id,
      },
      include: {
        client: {
          include: {
            ownedPrograms: {
              orderBy: { createdAt: 'desc' },
              include: {
                workoutPlans: {
                  include: {
                    workouts: {
                      include: {
                        exercises: { orderBy: { sortOrder: 'asc' } },
                      },
                    },
                  },
                },
                workoutLogs: {
                  orderBy: { completedAt: 'desc' },
                  take: 10,
                  include: {
                    workout: {
                      select: {
                        name: true,
                        focus: true,
                      },
                    },
                  },
                },
                stats: {
                  orderBy: { createdAt: 'desc' },
                  take: 10,
                },
                checkIns: {
                  orderBy: { createdAt: 'desc' },
                  take: 5,
                  include: {
                    stats: {
                      select: {
                        energyLevel: true,
                        soreness: true,
                        recovery: true,
                        weight: true,
                      },
                    },
                  },
                },
              },
            },
            userIntakes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!coachClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client: coachClient });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PATCH - Update client notes/nickname/status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;
    const body = await request.json();
    const { nickname, notes, status } = body;

    const coachClient = await prisma.coachClient.findFirst({
      where: {
        id: clientId,
        coachId: session.user.id,
      },
    });

    if (!coachClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const updated = await prisma.coachClient.update({
      where: { id: clientId },
      data: {
        ...(nickname !== undefined && { nickname }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE - Remove client (archive)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await params;

    const coachClient = await prisma.coachClient.findFirst({
      where: {
        id: clientId,
        coachId: session.user.id,
      },
    });

    if (!coachClient) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Soft delete - archive instead of hard delete
    await prisma.coachClient.update({
      where: { id: clientId },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing client:', error);
    return NextResponse.json(
      { error: 'Failed to remove client' },
      { status: 500 }
    );
  }
}
