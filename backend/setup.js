/**
 * Run once to initialise the database:
 *   node setup.js
 *
 * Reads .env for connection details, runs schema.sql, then seeds default users.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'airde_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function main() {
  console.log('Connecting to PostgreSQL...');
  const client = await pool.connect();

  try {
    console.log('Running schema.sql...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    // Remove the static user INSERT from schema.sql lines (we'll insert properly below)
    const schemaWithoutUsers = sql.replace(
      /-- Seed: Default admin user[\s\S]*?ON CONFLICT \(username\) DO NOTHING;/,
      ''
    );

    await client.query(schemaWithoutUsers);
    console.log('Schema applied.');

    // Seed default users with proper hashed passwords
    const defaultUsers = [
      { username: 'admin',     email: 'admin@airde.com',     password: 'admin123', role: 'admin' },
      { username: 'operator1', email: 'operator1@airde.com', password: 'admin123', role: 'operator' },
    ];

    for (const u of defaultUsers) {
      const hash = await bcrypt.hash(u.password, 10);
      await client.query(
        `INSERT INTO users (username, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [u.username, u.email, hash, u.role]
      );
      console.log(`User seeded: ${u.username} (${u.role})`);
    }

    console.log('\nSetup complete!');
    console.log('Default accounts:');
    console.log('  admin    / admin123  (role: admin)');
    console.log('  operator1 / admin123 (role: operator)');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
