import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get distinct categories
    const categoriesRaw = await prisma.exerciseLibrary.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    const categories = categoriesRaw
      .map(c => c.category)
      .filter((c): c is string => c !== null && c !== '');

    // Get all equipment (flatten arrays and dedupe)
    const equipmentRaw = await prisma.exerciseLibrary.findMany({
      select: { equipment: true },
      where: { equipment: { isEmpty: false } },
    });
    const equipment = [...new Set(equipmentRaw.flatMap(e => e.equipment))].sort();

    // Get all target muscles (flatten arrays and dedupe)
    const musclesRaw = await prisma.exerciseLibrary.findMany({
      select: { targetMuscles: true },
      where: { targetMuscles: { isEmpty: false } },
    });
    const muscles = [...new Set(musclesRaw.flatMap(m => m.targetMuscles))].sort();

    return NextResponse.json({ categories, equipment, muscles });
  } catch (error) {
    console.error('Failed to get filter options:', error);
    return NextResponse.json(
      { categories: [], equipment: [], muscles: [], error: 'Unable to load filter options' },
      { status: 500 }
    );
  }
}
