import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const body = await request.json();

    // Accept userId from session OR body (for anonymous /hi flow)
    const session = await auth();
    const userId = session?.user?.id || body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify ownership
    const program = await prisma.program.findFirst({
      where: { id: programId, createdBy: userId },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.program.update({
      where: { id: programId },
      data: {
        name: body.name ?? program.name,
        description: body.description ?? program.description,
      },
    });

    return NextResponse.json({ program: updated });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    let userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      const session = await auth();
      userId = session?.user?.id ?? null;
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        createdBy: userId,
      },
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
        user: true,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 