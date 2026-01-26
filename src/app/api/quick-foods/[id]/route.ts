import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// DELETE /api/quick-foods/[id] - deletes a quick food entry
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Find entry and verify ownership
    const quickFood = await prisma.quickFood.findUnique({
      where: { id },
    });

    if (!quickFood) {
      return NextResponse.json({ error: 'Quick food not found' }, { status: 404 });
    }

    if (quickFood.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.quickFood.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quick food:', error);
    return NextResponse.json(
      { error: 'Failed to delete quick food' },
      { status: 500 }
    );
  }
}
