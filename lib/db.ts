import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Get the absolute path to the database file
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Helper function to open the database
export async function openDb() {
  try {
    // Enable verbose mode for debugging
    sqlite3.verbose();
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        exercise TEXT NOT NULL,
        weight TEXT NOT NULL,
        date TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_config (
        id INTEGER PRIMARY KEY,
        config TEXT NOT NULL
      );
    `);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
} 