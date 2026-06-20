const { Pool, types } = require('pg');
require('dotenv').config();

// pg parses SQL DATE (OID 1082) into a JS Date at local midnight, then toISOString() converts
// to UTC — in timezones ahead of UTC (e.g. WIB/UTC+7) this shifts the displayed date back by
// one day. DATE columns represent a calendar date with no time/timezone component, so return
// the raw 'YYYY-MM-DD' string untouched instead of letting pg construct a Date from it.
types.setTypeParser(1082, (val) => val);

// Managed free Postgres providers (Neon, Render, Supabase, ...) hand out a single connection
// string and require SSL. DATABASE_URL takes priority when set; otherwise fall back to the
// discrete DB_* vars used for local development (no SSL, matches a local Postgres install).
const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'airde_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl,
    });

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

module.exports = pool;
