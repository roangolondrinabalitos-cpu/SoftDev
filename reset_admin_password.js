const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetAdminPassword() {
  const email = 'beyyaah_21@gmail.com';
  const newPassword = '11212003';
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      console.log('User not found. Creating new admin user...');
      const userId = require('crypto').randomUUID();
      await pool.query(
        'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
        [userId, email, hashedPassword]
      );
      console.log(`✓ Created admin user: ${email}`);
    } else {
      console.log(`✓ Updated password for ${email}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetAdminPassword();
