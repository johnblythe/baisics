import { NextResponse } from 'next/server';
import { getLibraryPrograms, getUserPrograms } from '@/services/programClone';
import { auth } from '@/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const daysPerWeek = searchParams.get('daysPerWeek')
      ? parseInt(searchParams.get('daysPerWeek')!)
      : undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 50;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;
    const type = searchParams.get('type'); // 'templates', 'user', or undefined for all

    // Get library programs (templates + public)
    const libraryPrograms = await getLibraryPrograms({
      category,
      difficulty,
      daysPerWeek,
      search,
      limit,
      offset,
    });

    // Get user's own programs if authenticated
    let userPrograms: any[] = [];
    if (type !== 'templates') {
      const session = await auth();
      if (session?.user?.id) {
        userPrograms = await getUserPrograms(session.user.id);
      }
    }

    // Return based on type filter
    if (type === 'templates') {
      return NextResponse.json({
        programs: libraryPrograms,
        total: libraryPrograms.length,
      });
    }

    if (type === 'user') {
      return NextResponse.json({
        programs: userPrograms,
        total: userPrograms.length,
      });
    }

    // Return both for unified view
    return NextResponse.json({
      templates: libraryPrograms,
      userPrograms,
      total: libraryPrograms.length + userPrograms.length,
    });
  } catch (error) {
    console.error('Library fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
