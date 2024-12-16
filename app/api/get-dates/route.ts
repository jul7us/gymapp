import { openDb } from '../db';
import { NextResponse } from 'next/server';

// Define the muscle group mappings
const muscleGroupCategories = {
  'Chest': 'push',
  'Shoulders': 'push',
  'Triceps': 'push',
  'Back': 'pull',
  'Biceps': 'pull',
  'Forearms': 'pull',
  'Quadriceps': 'legs',
  'Hamstrings': 'legs',
  'Calves': 'legs',
  'Glutes': 'legs'
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workoutType = searchParams.get('type');

    if (!workoutType) {
      return NextResponse.json({ error: 'Workout type is required' }, { status: 400 });
    }

    const db = await openDb();
    
    try {
      // Get all muscle groups for this workout type
      const muscleGroups = Object.entries(muscleGroupCategories)
        .filter(([_, category]) => category === workoutType)
        .map(([name]) => name);

      // Get dates for exercises in these muscle groups
      const dates = await db.all(`
        SELECT DISTINCT date 
        FROM workouts 
        WHERE type IN (${muscleGroups.map(() => '?').join(',')})
        ORDER BY date DESC;
      `, muscleGroups);

      console.log(`Found dates for ${workoutType}:`, dates);
      return NextResponse.json(dates.map(row => row.date));
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Error in get-dates:', error);
    return NextResponse.json({ error: 'Failed to get dates' }, { status: 500 });
  }
}