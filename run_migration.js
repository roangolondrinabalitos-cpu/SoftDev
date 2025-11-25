// Simple migration runner that uses DATABASE_URL from .env
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const sqlPath = path.join(__dirname, 'migrations', 'create_users.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration SQL not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Please set DATABASE_URL in .env (eg: postgres://user:pass@localhost:5432/dbname)');
    process.exit(1);
  }
  const client = new Client({ connectionString: dbUrl });
  try {
    console.log('Connecting to', dbUrl.replace(/:[^:@]+@/, ':*****@'));
    await client.connect();
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    try { await client.end(); } catch(e){}
  }
}

run();
