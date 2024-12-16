import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import type { MuscleGroup } from '@/app/types/workout';

const dbPath = path.join(process.cwd(), 'database.sqlite');

export async function openDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
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