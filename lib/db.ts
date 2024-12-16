import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import type { MuscleGroup } from '@/app/types/workout';

// Use /tmp for Vercel serverless functions
const dbPath = process.env.NODE_ENV === 'production'
  ? '/tmp/database.sqlite'
  : path.join(process.cwd(), 'database.sqlite');

export async function openDb() {
  // Create tables if they don't exist
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      exercise TEXT NOT NULL,
      weight TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS muscle_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      exercises TEXT NOT NULL,
      UNIQUE(name)
    );
  `);

  return db;
}

export async function getWorkouts(date?: string) {
  const db = await openDb();
  try {
    const query = `
      SELECT date, type, exercise, weight, 
      CASE 
        WHEN type IN ('Chest', 'Shoulders', 'Triceps') THEN 'push'
        WHEN type IN ('Back', 'Biceps', 'Forearms') THEN 'pull'
        WHEN type IN ('Quadriceps', 'Hamstrings', 'Calves', 'Glutes') THEN 'legs'
        ELSE 'other'
      END as workout_type
      FROM workouts
      ${date ? 'WHERE date = ?' : ''}
      ORDER BY date DESC
    `;
    
    return await db.all(query, date ? [date] : []);
  } finally {
    await db.close();
  }
}

export async function deleteWorkout(date: string, exercise: string) {
  const db = await openDb();
  try {
    await db.run(
      'DELETE FROM workouts WHERE date = ? AND exercise = ?',
      [date, exercise]
    );
  } finally {
    await db.close();
  }
}

export async function getMuscleGroups() {
  const db = await openDb();
  try {
    const groups = await db.all('SELECT * FROM muscle_groups');
    return groups.map(group => ({
      ...group,
      exercises: JSON.parse(group.exercises)
    }));
  } finally {
    await db.close();
  }
}

export async function saveMuscleGroups(muscleGroups: MuscleGroup[]) {
  const db = await openDb();
  try {
    await db.run('BEGIN TRANSACTION');
    await db.run('DELETE FROM muscle_groups');
    
    for (const group of muscleGroups) {
      await db.run(
        'INSERT INTO muscle_groups (name, category, exercises) VALUES (?, ?, ?)',
        [group.name, group.category, JSON.stringify(group.exercises)]
      );
    }
    
    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  } finally {
    await db.close();
  }
} 