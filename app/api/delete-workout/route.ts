import { NextResponse } from 'next/server';
import { deleteWorkout } from '@/lib/db';

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

  try {
    await deleteWorkout(date, exercise);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}