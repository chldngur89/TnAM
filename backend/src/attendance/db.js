/**
 * MariaDB/MySQL client for attendance.
 */
import mysql from 'mysql2/promise';
import { config } from '../config.js';

let pool;

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

export function getPool() {
  if (!pool) {
    const opts = parseConnectionString(config.db.connectionString);
    pool = mysql.createPool({
      ...opts,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * Execute query. Returns { rows } to match pg-style usage.
 * mysql2 returns [rows, fields]; we expose rows only.
 */
export async function query(text, params = []) {
  const conn = getPool();
  const [rows] = await conn.execute(text, params);
  return { rows: Array.isArray(rows) ? rows : [] };
}
