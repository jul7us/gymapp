import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, exercise, weight, date } = body;

    if (!type || !exercise || !weight || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { 
        status: 400 
      });
    }

    const db = await openDb();
    try {
      await db.run(`
        INSERT OR REPLACE INTO workouts (date, type, exercise, weight)
        VALUES (?, ?, ?, ?)
      `, [date, type, exercise, weight]);

      return NextResponse.json({ success: true });
    } finally {
      await db.close();
    }
  } catch {
    return NextResponse.json({ 
      error: 'Failed to save workout' 
    }, { 
      status: 500 
    });
  }
}