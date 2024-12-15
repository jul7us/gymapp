import { openDb } from '../db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, exercise, weight, date } = body;

    console.log('Received workout data:', { type, exercise, weight, date });

    // Basic validation
    if (!type || !exercise || !weight || !date) {
      const missingFields = [];
      if (!type) missingFields.push('type');
      if (!exercise) missingFields.push('exercise');
      if (!weight) missingFields.push('weight');
      if (!date) missingFields.push('date');

      console.error('Missing fields:', missingFields);
      return NextResponse.json({ 
        error: 'Missing required fields',
        missingFields,
        received: { type, exercise, weight, date }
      }, { 
        status: 400 
      });
    }

    const db = await openDb();

    try {
      console.log('Creating/verifying table structure...');
      await db.exec(`
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          exercise TEXT NOT NULL,
          weight TEXT NOT NULL,
          UNIQUE(date, exercise)
        );
      `);

      console.log('Inserting workout data...');
      const insertResult = await db.run(`
        INSERT OR REPLACE INTO workouts (date, type, exercise, weight)
        VALUES (?, ?, ?, ?)
      `, [date, type, exercise, weight]);

      console.log('Insert result:', insertResult);

      const savedRecord = await db.get(
        'SELECT * FROM workouts WHERE date = ? AND exercise = ?',
        [date, exercise]
      );

      console.log('Saved record:', savedRecord);
      return NextResponse.json({ success: true, data: savedRecord });
    } finally {
      await db.close();
    }

  } catch (error) {
    console.error('Error in save-workout:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to save workout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}