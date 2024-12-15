import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { join } from 'path';

// Get the absolute path to the database file
const dbPath = join(process.cwd(), 'database.sqlite');

export async function openDb() {
  console.log('Opening database at:', dbPath);
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
} 