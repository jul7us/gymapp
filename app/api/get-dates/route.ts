import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { WorkoutCategory } from '@/app/types/workout';

const CATEGORY_MUSCLES: Record<WorkoutCategory, string[]> = {
  push: ['Chest', 'Shoulders', 'Triceps'],
  pull: ['Back', 'Biceps', 'Forearms'],
  legs: ['Quadriceps', 'Hamstrings', 'Calves', 'Glutes']
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as WorkoutCategory | null;

    if (!type || !(type in CATEGORY_MUSCLES)) {
      return NextResponse.json({ error: 'Invalid workout type' }, { status: 400 });
    }

    const db = await openDb();
    try {
      const dates = await db.all(`
        SELECT DISTINCT date 
        FROM workouts 
        WHERE type IN (${CATEGORY_MUSCLES[type].map(() => '?').join(',')})
        ORDER BY date DESC
      `, CATEGORY_MUSCLES[type]);

      return NextResponse.json(dates.map(row => row.date));
    } finally {
      await db.close();
    }
  } catch {
    return NextResponse.json({ error: 'Failed to get dates' }, { status: 500 });
  }
}