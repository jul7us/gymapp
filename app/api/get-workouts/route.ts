import { openDb } from '../db';
import { NextResponse } from 'next/server';
import { WorkoutData, MuscleGroupName, WorkoutCategory } from '@/app/types/workout';

// Define the muscle group mappings with proper typing
const muscleGroupCategories: Record<MuscleGroupName, WorkoutCategory> = {
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
} as const;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const db = await openDb();
    
    try {
      // Create parameterized query with valid types
      const validTypes = Object.keys(muscleGroupCategories);
      const placeholders = validTypes.map(() => '?').join(',');
      
      const workouts = await db.all<WorkoutData[]>(`
        SELECT * FROM workouts 
        WHERE date = ? 
        AND type IN (${placeholders})
        ORDER BY type;
      `, [date, ...validTypes]);

      // Add workout_type based on muscle group
      const workoutsWithType = workouts.map((workout: { type: MuscleGroupName }) => ({
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