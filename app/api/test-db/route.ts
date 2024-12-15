import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Log environment variable presence (not the actual values)
    console.log('Environment check:', {
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasPostgresUser: !!process.env.POSTGRES_USER,
      hasPostgresPassword: !!process.env.POSTGRES_PASSWORD,
      hasPostgresHost: !!process.env.POSTGRES_HOST,
      hasPostgresDatabase: !!process.env.POSTGRES_DATABASE,
    });

    // Test the connection
    const result = await sql`
      SELECT current_timestamp as time,
             current_database() as database,
             version() as version;
    `;

    return NextResponse.json({
      status: 'success',
      connection: 'ok',
      details: result.rows[0],
      env: {
        hasUrl: !!process.env.POSTGRES_URL,
        hasUser: !!process.env.POSTGRES_USER,
        hasPassword: !!process.env.POSTGRES_PASSWORD,
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      status: 'error',
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasUrl: !!process.env.POSTGRES_URL,
        hasUser: !!process.env.POSTGRES_USER,
        hasPassword: !!process.env.POSTGRES_PASSWORD,
      }
    }, {
      status: 500
    });
  }
} 