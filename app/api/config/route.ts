import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';
import type { MuscleGroup } from '@/app/types/workout';

export async function GET() {
  const db = await openDb();
  try {
    const muscleGroups = await db.all(`
      SELECT name, category, exercises 
      FROM muscle_groups
    `);
    return NextResponse.json({ muscleGroups });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  } finally {
    await db.close();
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { muscleGroups } = body as { muscleGroups: MuscleGroup[] };

  const db = await openDb();
  try {
    await db.run('BEGIN TRANSACTION');

    // Clear existing config
    await db.run('DELETE FROM muscle_groups');

    // Insert new config
    for (const group of muscleGroups) {
      await db.run(
        'INSERT INTO muscle_groups (name, category, exercises) VALUES (?, ?, ?)',
        [group.name, group.category, JSON.stringify(group.exercises)]
      );
    }

    await db.run('COMMIT');
    return NextResponse.json({ success: true });
  } catch {
    await db.run('ROLLBACK');
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  } finally {
    await db.close();
  }
}