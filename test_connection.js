// Quick Postgres connection tester - helps diagnose connection issues
const { Client } = require('pg');

const connectionStrings = [
  { url: 'postgres://postgres:@localhost:5432/postgres', desc: 'Default (no password)' },
  { url: 'postgres://postgres:password@localhost:5432/postgres', desc: 'With "password"' },
  { url: 'postgres://localhost/postgres', desc: 'TCP only (trust auth)' },
];

async function testConnection(connUrl, desc) {
  const client = new Client({ connectionString: connUrl });
  try {
    await client.connect();
    console.log(`✓ ${desc} — SUCCESS`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`✗ ${desc} — FAILED: ${err.message}`);
    return false;
  }
}

async function run() {
  console.log('Testing Postgres connections...\n');
  for (const { url, desc } of connectionStrings) {
    const ok = await testConnection(url, desc);
    if (ok) {
      console.log(`\nFound working connection: ${url}`);
      console.log('Update DATABASE_URL in .env to:');
      console.log(`DATABASE_URL=${url}\n`);
      break;
    }
  }
}

run();
