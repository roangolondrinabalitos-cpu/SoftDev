// Create ecommerce_db database
const { Client } = require('pg');

async function run() {
  const adminClient = new Client({
    connectionString: 'postgres://postgres:061313@localhost:5432/postgres'
  });
  
  try {
    await adminClient.connect();
    console.log('Connected to Postgres...');
    
    // Create database
    try {
      await adminClient.query('CREATE DATABASE ecommerce_db;');
      console.log('✓ Created database: ecommerce_db');
    } catch (err) {
      if (err.code === '42P04') { // already exists
        console.log('✓ Database ecommerce_db already exists');
      } else {
        throw err;
      }
    }
    
    await adminClient.end();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
