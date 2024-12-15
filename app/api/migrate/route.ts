import { openDb } from '../db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await openDb();
    
    try {
      // Backup existing data
      const existingData = await db.all('SELECT date, type, exercise, weight FROM workouts');
      console.log('Backing up:', existingData.length, 'records');

      // Drop and recreate the table without workout_type column
      await db.exec(`
        DROP TABLE IF EXISTS workouts;
        CREATE TABLE workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          exercise TEXT NOT NULL,
          weight TEXT NOT NULL,
          UNIQUE(date, exercise)
        );
      `);

      // Restore the data
      if (existingData.length > 0) {
        for (const row of existingData) {
          await db.run(`
            INSERT INTO workouts (date, type, exercise, weight)
            VALUES (?, ?, ?, ?)
          `, [row.date, row.type, row.exercise, row.weight]);
        }
        console.log('Restored:', existingData.length, 'records');
      }

      return NextResponse.json({ 
        message: 'Migration completed successfully',
        recordsMigrated: existingData.length
      });
    } finally {
      await db.close();
    }
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Failed to migrate database' }, { status: 500 });
  }
} 