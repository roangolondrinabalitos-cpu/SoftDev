require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function findUserByEmail(email){
  const res = await pool.query('SELECT id,email,name,phone,gender,dob,avatar FROM users WHERE email=$1', [email]);
  return res.rows[0];
}

app.post('/auth/register', async (req, res) => {
  try{
    const { email, password, name } = req.body;
    if(!email || !password) return res.status(400).json({error:'email and password required'});
    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if(exists.rowCount > 0) return res.status(409).json({error:'Email already registered'});
    const hash = await bcrypt.hash(password, 12);
    const insert = await pool.query(
      'INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id,email,name,phone,gender,dob,avatar,created_at',
      [email, hash, name || null]
    );
    const user = insert.rows[0];
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  }catch(err){ console.error(err); res.status(500).json({error:'server error'}); }
});

app.post('/auth/login', async (req, res) => {
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({error:'email and password required'});
    const q = await pool.query('SELECT id,email,password_hash,name,phone,gender,dob,avatar,created_at FROM users WHERE email=$1', [email]);
    const user = q.rows[0];
    if(!user) return res.status(401).json({error:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    delete user.password_hash;
    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  }catch(err){ console.error(err); res.status(500).json({error:'server error'}); }
});

app.get('/auth/me', async (req, res) => {
  try{
    const auth = req.headers.authorization;
    if(!auth) return res.status(401).json({error:'Missing token'});
    const parts = auth.split(' ');
    if(parts.length !== 2) return res.status(401).json({error:'Invalid token format'});
    const token = parts[1];
    let payload;
    try{ payload = jwt.verify(token, JWT_SECRET); } catch(e){ return res.status(401).json({error:'Invalid token'}); }
    const q = await pool.query('SELECT id,email,name,phone,gender,dob,avatar,created_at FROM users WHERE id=$1', [payload.sub]);
    const user = q.rows[0];
    if(!user) return res.status(404).json({error:'User not found'});
    res.json({ user });
  }catch(err){ console.error(err); res.status(500).json({error:'server error'}); }
});

app.get('/', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Auth server listening on port ${PORT}`));
