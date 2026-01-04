import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET - List all clients for a coach
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a coach
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isCoach: true },
    });

    if (!user?.isCoach) {
      return NextResponse.json({ error: 'Not a coach account' }, { status: 403 });
    }

    const clients = await prisma.coachClient.findMany({
      where: {
        coachId: session.user.id,
        status: { not: 'ARCHIVED' },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            ownedPrograms: {
              where: { active: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                workoutLogs: {
                  where: { status: 'completed' },
                  orderBy: { completedAt: 'desc' },
                  take: 1,
                },
                workoutPlans: {
                  include: {
                    workouts: true,
                  },
                },
              },
            },
            checkIns: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedClients = clients.map((cc) => ({
      id: cc.id,
      clientId: cc.clientId,
      nickname: cc.nickname,
      notes: cc.notes,
      status: cc.status,
      inviteStatus: cc.inviteStatus,
      inviteEmail: cc.inviteEmail,
      createdAt: cc.createdAt,
      client: cc.client
        ? {
            id: cc.client.id,
            name: cc.client.name,
            email: cc.client.email,
            image: cc.client.image,
            createdAt: cc.client.createdAt,
            currentProgram: cc.client.ownedPrograms[0]
              ? {
                  id: cc.client.ownedPrograms[0].id,
                  name: cc.client.ownedPrograms[0].name,
                  completedWorkouts: cc.client.ownedPrograms[0].workoutLogs.length,
                  totalWorkouts: cc.client.ownedPrograms[0].workoutPlans.reduce(
                    (acc: number, plan: { workouts: unknown[] }) => acc + plan.workouts.length,
                    0
                  ),
                  lastWorkout: cc.client.ownedPrograms[0].workoutLogs[0]?.completedAt || null,
                }
              : null,
            lastCheckIn: cc.client.checkIns[0]?.createdAt || null,
          }
        : null,
    }));

    return NextResponse.json({ clients: formattedClients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST - Add a new client (by email invite)
export async function POST(request: Request) {
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

    const { email, nickname, notes } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if client already exists as a user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Check if already a client
    const existingClient = await prisma.coachClient.findFirst({
      where: {
        coachId: session.user.id,
        OR: [
          { clientId: existingUser?.id },
          { inviteEmail: email },
        ],
      },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'This person is already your client' },
        { status: 400 }
      );
    }

    // Generate invite token
    const inviteToken = crypto.randomUUID();

    const coachClient = await prisma.coachClient.create({
      data: {
        coachId: session.user.id,
        clientId: existingUser?.id || null,
        inviteEmail: existingUser ? null : email,
        inviteToken: existingUser ? null : inviteToken,
        inviteStatus: existingUser ? 'ACCEPTED' : 'PENDING',
        inviteSentAt: existingUser ? null : new Date(),
        nickname,
        notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // TODO: Send invite email if new user

    return NextResponse.json({
      success: true,
      client: {
        id: coachClient.id,
        clientId: coachClient.clientId,
        nickname: coachClient.nickname,
        status: coachClient.status,
        inviteStatus: coachClient.inviteStatus,
        inviteEmail: coachClient.inviteEmail,
        client: coachClient.client,
      },
      inviteToken: existingUser ? null : inviteToken,
    });
  } catch (error) {
    console.error('Error adding client:', error);
    return NextResponse.json(
      { error: 'Failed to add client' },
      { status: 500 }
    );
  }
}
