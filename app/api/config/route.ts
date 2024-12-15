import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const result = await db.get('SELECT config FROM workout_config WHERE id = 1');
    
    if (!result) {
      return NextResponse.json({ muscleGroups: [] });
    }

    return NextResponse.json(JSON.parse(result.config));
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await openDb();

    await db.run(
      'INSERT OR REPLACE INTO workout_config (id, config) VALUES (?, ?)',
      [1, JSON.stringify(body)]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}