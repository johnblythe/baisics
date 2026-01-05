import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/coach/clients/list
 * Lightweight endpoint for assignment dropdown - returns only essential client data
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a coach
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true }
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach' }, { status: 403 });
    }

    // Get active clients with their current active program
    const coachClients = await prisma.coachClient.findMany({
      where: {
        coachId: session.user.id,
        inviteStatus: 'ACCEPTED',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        nickname: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            ownedPrograms: {
              where: { active: true },
              select: {
                id: true,
                name: true
              },
              take: 1
            }
          }
        }
      },
      orderBy: {
        client: {
          name: 'asc'
        }
      }
    });

    // Transform to lightweight format
    const clients = coachClients
      .filter(cc => cc.client) // Filter out any null clients
      .map(cc => ({
        id: cc.client!.id,
        coachClientId: cc.id,
        name: cc.nickname || cc.client!.name || cc.client!.email || 'Unknown',
        activeProgram: cc.client!.ownedPrograms[0]?.name || null,
        activeProgramId: cc.client!.ownedPrograms[0]?.id || null
      }));

    return NextResponse.json({ clients });

  } catch (error) {
    console.error('Error fetching clients list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}
