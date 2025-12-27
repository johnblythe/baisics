import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.join(process.cwd(), 'model-comparison-results');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('name');

  // If filename provided, return that file's content
  if (filename) {
    try {
      const filePath = path.join(RESULTS_DIR, filename);
      // Security: ensure we're not traversing outside the directory
      if (!filePath.startsWith(RESULTS_DIR)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return NextResponse.json({ content });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  }

  // Otherwise, list all comparison files
  try {
    const allFiles = fs.readdirSync(RESULTS_DIR);
    const abFiles = allFiles
      .filter(f => f.startsWith('ab-') && f.endsWith('.json') && !f.includes('comparison'))
      .map(name => {
        // Parse filename: ab-{persona}-{type}.json
        const match = name.match(/^ab-(.+)-(lean|full)\.json$/);
        if (!match) return null;
        return {
          name,
          persona: match[1].replace(/-/g, ' '),
          type: match[2] as 'lean' | 'full',
        };
      })
      .filter(Boolean);

    return NextResponse.json({ files: abFiles });
  } catch (error) {
    return NextResponse.json({ files: [], error: 'Could not read directory' });
  }
}
