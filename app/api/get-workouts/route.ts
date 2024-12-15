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
    const date = searchParams.get('date');

    const db = await openDb();
    
    try {
      let query = 'SELECT * FROM workouts';
      const params = [];

      if (date) {
        query += ' WHERE date = ?';
        params.push(date);
      }

      query += ' ORDER BY date DESC, type, exercise';

      const workouts = await db.all(query, params);

      // Add workout_type based on muscle group
      const workoutsWithType = workouts.map(workout => ({
        ...workout,
        workout_type: muscleGroupCategories[workout.type] || 'unknown'
      }));

      console.log('Found workouts:', workoutsWithType);
      return NextResponse.json(workoutsWithType);
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Error in get-workouts:', error);
    return NextResponse.json({ error: 'Failed to get workouts' }, { status: 500 });
  }
}