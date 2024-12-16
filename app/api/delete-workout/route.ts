import { NextResponse } from 'next/server';
import { openDb } from '@/lib/db';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const exercise = searchParams.get('exercise');

  if (!date || !exercise) {
    return NextResponse.json(
      { error: 'Date and exercise are required' },
      { status: 400 }
    );
  }

  const db = await openDb();
  try {
    await db.run(
      'DELETE FROM workouts WHERE date = ? AND exercise = ?',
      [date, exercise]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  } finally {
    await db.close();
  }
}