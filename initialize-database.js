import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function initializeDatabase() {
  const db = await open({
    filename: './database.sqlite', // Ensure this matches the path used in your API
    driver: sqlite3.Database,
  });

  // Create the `workouts` table if it doesn't already exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      exercise TEXT,
      weight REAL,
      date TEXT
    )
  `);

  console.log('Database initialized and table created!');
  await db.close();
}

initializeDatabase();