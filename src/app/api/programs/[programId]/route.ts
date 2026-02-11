import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
                exercises: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
        createdByUser: true,
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

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isTemplate !== undefined) updateData.isTemplate = Boolean(body.isTemplate);

    const updated = await prisma.program.update({
      where: { id: programId },
      data: updateData,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const { programId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify ownership
    const program = await prisma.program.findFirst({
      where: { id: programId, createdBy: session.user.id },
      select: { id: true, cloneCount: true },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Soft delete if program has clones (preserve for clone references)
    // Hard delete if it has no clones
    if (program.cloneCount > 0) {
      await prisma.program.update({
        where: { id: programId },
        data: { active: false },
      });
    } else {
      await prisma.program.delete({
        where: { id: programId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
