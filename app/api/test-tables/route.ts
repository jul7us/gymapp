import { openDb } from '../db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await openDb();
    
    try {
      // Check muscle_groups table
      const muscleGroups = await db.all(`
        SELECT * FROM muscle_groups
      `);
      console.log('Muscle groups:', muscleGroups);

      // Check workouts table
      const workouts = await db.all(`
        SELECT * FROM workouts
      `);
      console.log('Workouts:', workouts);

      // Check join
      const joined = await db.all(`
        SELECT 
          w.date,
          w.type,
          w.exercise,
          w.weight,
          mg.category as workout_type
        FROM workouts w
        LEFT JOIN muscle_groups mg ON w.type = mg.name
      `);
      console.log('Joined data:', joined);

      return NextResponse.json({
        muscleGroups,
        workouts,
        joined
      });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to check tables' }, { status: 500 });
  }
} 