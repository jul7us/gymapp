import { openDb } from '../lib/db';

async function initializeDatabase() {
  const db = await openDb();
  
  try {
    // Create the workouts table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        exercise TEXT NOT NULL,
        weight TEXT NOT NULL
      )
    `);

    // Create the muscle_groups table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS muscle_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        exercises TEXT NOT NULL,
        UNIQUE(name)
      );
    `);
  } finally {
    await db.close();
  }
}

initializeDatabase().catch(console.error); 