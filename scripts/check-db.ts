const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { join } = require('path');

async function checkDatabase() {
  const dbPath = join(process.cwd(), 'database.sqlite');
  console.log('Checking database at:', dbPath);
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  try {
    // List all tables
    console.log('\nTables in database:');
    const tables = await db.all(`
      SELECT name FROM sqlite_master WHERE type='table';
    `);
    console.log(tables);

    // If workouts table exists, show its structure
    if (tables.some(t => t.name === 'workouts')) {
      console.log('\nWorkouts table structure:');
      const structure = await db.all(`PRAGMA table_info(workouts);`);
      console.log(structure);

      console.log('\nSample data from workouts:');
      const sampleData = await db.all(`SELECT * FROM workouts LIMIT 3;`);
      console.log(sampleData);
    } else {
      console.log('\nWorkouts table does not exist!');
    }
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await db.close();
  }
}

checkDatabase().catch(console.error); 