import 'dotenv/config';
/**
 * Run schema.sql to create tables (MariaDB/MySQL).
 * Usage: node src/attendance/migrate.js
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import mysql from 'mysql2/promise';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseConnectionString(uri) {
  try {
    const u = new URL(uri);
    return {
      host: u.hostname || 'localhost',
      port: u.port ? Number(u.port) : 3306,
      user: u.username || undefined,
      password: u.password || undefined,
      database: u.pathname ? u.pathname.slice(1) : undefined,
    };
  } catch {
    return { host: 'localhost', port: 3306, database: 'attendance' };
  }
}

async function migrate() {
  const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const opts = parseConnectionString(config.db.connectionString);
  const conn = await mysql.createConnection({
    ...opts,
    multipleStatements: true,
  });
  try {
    await conn.query(sql);
    console.log('Migration completed.');
  } finally {
    await conn.end();
  }
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
