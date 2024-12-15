import { openDb } from '../db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const exercise = searchParams.get('exercise');
    const workoutType = searchParams.get('workoutType');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const db = await openDb();
    
    try {
      if (exercise) {
        // Delete specific exercise
        await db.run(
          'DELETE FROM workouts WHERE date = ? AND exercise = ?',
          [date, exercise]
        );
        console.log('Deleted exercise:', { date, exercise });
      } else if (workoutType) {
        // Delete all exercises for specific workout type
        await db.run(`
          DELETE FROM workouts 
          WHERE date = ? 
          AND type IN (
            SELECT name 
            FROM muscle_groups 
            WHERE category = ?
          )
        `, [date, workoutType]);
        console.log('Deleted workout type:', { date, workoutType });
      } else {
        // Delete all exercises for the date
        await db.run('DELETE FROM workouts WHERE date = ?', [date]);
        console.log('Deleted all exercises for date:', date);
      }

      return NextResponse.json({ success: true });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Error in delete-workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}