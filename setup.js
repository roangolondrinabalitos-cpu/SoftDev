// Interactive Postgres setup helper
// This will help you find the correct connection string for your Postgres installation

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function run() {
  console.log('=== Postgres Connection Setup ===\n');
  console.log('To proceed, I need your Postgres connection details.\n');

  const host = await question('Postgres host (default: localhost): ') || 'localhost';
  const port = await question('Postgres port (default: 5432): ') || '5432';
  const user = await question('Postgres user (default: postgres): ') || 'postgres';
  const password = await question('Postgres password (default: blank, press Enter to skip): ') || '';
  const dbName = 'ecommerce_db';

  const connUrl = `postgres://${user}${password ? ':' + password : ''}@${host}:${port}/postgres`;
  console.log(`\nTesting connection to ${connUrl}...\n`);

  const client = new Client({ connectionString: connUrl });
  try {
    await client.connect();
    console.log('✓ Connection successful!\n');

    // Create database if it doesn't exist
    console.log(`Creating database "${dbName}" (if not exists)...`);
    try {
      await client.query(`CREATE DATABASE ${dbName};`);
      console.log(`✓ Database "${dbName}" created.\n`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`✓ Database "${dbName}" already exists.\n`);
      } else {
        throw err;
      }
    }

    // Save to .env
    const finalUrl = `postgres://${user}${password ? ':' + password : ''}@${host}:${port}/${dbName}`;
    const envContent = `DATABASE_URL=${finalUrl}\nJWT_SECRET=ecommerce_demo_secret_change_in_production\nPORT=4000\n`;
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('✓ Updated .env with your connection details.\n');
    console.log('DATABASE_URL=' + finalUrl);
    console.log('\nNext steps:');
    console.log('  npm run migrate    # Create tables');
    console.log('  npm start          # Start server\n');

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure Postgres is running');
    console.log('2. Check your username and password');
    console.log('3. Verify the host and port');
    await client.end();
    process.exit(1);
  }
}

run();
