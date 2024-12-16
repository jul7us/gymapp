import { openDb } from '../lib/db';

async function testDatabaseSetup() {
  console.log('🔍 Testing database setup...');
  
  const db = await openDb();
  try {
    // Test workouts table
    const workoutsTable = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='workouts'
    `);
    console.log('✓ Workouts table:', workoutsTable ? 'exists' : 'missing');

    // Test muscle_groups table
    const muscleGroupsTable = await db.get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='muscle_groups'
    `);
    console.log('✓ Muscle groups table:', muscleGroupsTable ? 'exists' : 'missing');

    // Clean existing test data
    await db.run(`
      DELETE FROM workouts 
      WHERE date = '2024-03-21' AND exercise = 'Bench Press'
    `);

    // Insert test data
    await db.run(`
      INSERT INTO workouts (date, type, exercise, weight)
      VALUES ('2024-03-21', 'Chest', 'Bench Press', '135')
    `);
    console.log('✓ Test data inserted');

    // Verify data
    const testData = await db.get('SELECT * FROM workouts LIMIT 1');
    console.log('✓ Data verification:', testData ? 'successful' : 'failed');

    // Clean up test data
    await db.run(`
      DELETE FROM workouts 
      WHERE date = '2024-03-21' AND exercise = 'Bench Press'
    `);
    console.log('✓ Test data cleaned up');

  } finally {
    await db.close();
  }
}

testDatabaseSetup().catch(console.error); 