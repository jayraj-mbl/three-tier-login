const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'app_demo_change_me',
  database: process.env.DB_NAME || 'companydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use(session({
  name: 'three_tier_sid',
  secret: process.env.SESSION_SECRET || 'change_this_demo_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Please log in first.' });
  next();
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const expectedUser = process.env.DEMO_USERNAME || 'admin';
  const expectedPassword = process.env.DEMO_PASSWORD || 'Admin@12345';
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username !== expectedUser || !(await bcrypt.compare(password, await bcrypt.hash(expectedPassword, 10)))) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Unable to create session.' });
    req.session.user = { username };
    res.json({ username });
  });
});

app.get('/api/me', requireAuth, (req, res) => res.json(req.session.user));

app.get('/api/employees', requireAuth, async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, employee_code, full_name, email, department, job_title, created_at FROM employees ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error('Employee query failed:', err.message);
    res.status(500).json({ error: 'Unable to retrieve employee records.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Unable to log out.' });
    res.clearCookie('three_tier_sid');
    res.json({ message: 'Logged out.' });
  });
});

async function start() {
  // Confirm the database is ready before accepting traffic.
  await pool.query('SELECT 1');
  app.listen(PORT, '0.0.0.0', () => console.log(`Application listening on port ${PORT}`));
}
start().catch((err) => {
  console.error('Startup failed; check database configuration/readiness:', err.message);
  process.exit(1);
});
