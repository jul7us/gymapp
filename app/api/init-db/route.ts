import { openDb } from '../db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Starting database initialization...');
    
    const db = await openDb();
    console.log('Database connection opened');

    try {
      // Create workouts table
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
      console.log('Workouts table created');

      // Create muscle_groups table
      await db.exec(`
        CREATE TABLE IF NOT EXISTS muscle_groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          UNIQUE(name)
        );
      `);
      console.log('Muscle groups table created');

      return NextResponse.json({ message: 'Database tables created successfully' });
    } finally {
      // Close the database connection
      await db.close();
      console.log('Database connection closed');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 