/**
 * Attendance CRUD and queries (MariaDB/MySQL).
 */
import { query, getPool } from './db.js';
import { toDateStringInTimezone, todayInTimezone } from './time.js';

export async function ensureUser(slackUserId, { email, displayName } = {}) {
  await query(
    `INSERT INTO users (slack_user_id, email, display_name)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       email = COALESCE(VALUES(email), email),
       display_name = COALESCE(VALUES(display_name), display_name),
       updated_at = CURRENT_TIMESTAMP(6)`,
    [slackUserId, email ?? null, displayName ?? null]
  );
}

export async function getTodayAttendance(slackUserId) {
  const today = todayInTimezone();
  const res = await query(
    `SELECT id, date, clock_in_at, clock_out_at, source, clock_out_source, record_status, late_minutes, worked_minutes, note
     FROM attendance
     WHERE slack_user_id = ? AND date = ?
     ORDER BY clock_in_at`,
    [slackUserId, today]
  );
  return res.rows;
}

export async function getLastClockInToday(slackUserId) {
  const today = todayInTimezone();
  const res = await query(
    `SELECT id, clock_in_at, clock_out_at, source, record_status, late_minutes
     FROM attendance
     WHERE slack_user_id = ? AND date = ? AND clock_out_at IS NULL
     ORDER BY clock_in_at DESC
     LIMIT 1`,
    [slackUserId, today]
  );
  return res.rows[0] ?? null;
}

export async function clockIn(slackUserId, clockInAt, source = 'manual', meta = {}) {
  const date = toDateStringInTimezone(clockInAt);
  const recordStatus = meta.recordStatus ?? 'present';
  const lateMinutes = Number.isFinite(meta.lateMinutes) ? Math.max(0, Number(meta.lateMinutes)) : 0;
  const note = meta.note ?? null;
  const checkInIp = meta.checkInIp ?? null;
  const checkInDeviceId = meta.checkInDeviceId ?? null;
  const checkInLat = Number.isFinite(meta.checkInLat) ? Number(meta.checkInLat) : null;
  const checkInLng = Number.isFinite(meta.checkInLng) ? Number(meta.checkInLng) : null;

  const pool = getPool();
  await pool.execute(
    `INSERT INTO attendance (
      slack_user_id, date, clock_in_at, source, record_status, late_minutes, note,
      check_in_ip, check_in_device_id, check_in_lat, check_in_lng
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slackUserId,
      date,
      clockInAt,
      source,
      recordStatus,
      lateMinutes,
      note,
      checkInIp,
      checkInDeviceId,
      checkInLat,
      checkInLng,
    ]
  );
  const [[row]] = await pool.execute(
    `SELECT id, date, clock_in_at, clock_out_at, source, clock_out_source, record_status, late_minutes, worked_minutes, note
     FROM attendance
     WHERE slack_user_id = ? AND date = ? AND clock_in_at = ?
     ORDER BY id DESC LIMIT 1`,
    [slackUserId, date, clockInAt]
  );
  return row;
}

export async function clockOut(attendanceId, clockOutAt, source = 'manual', meta = {}) {
  const note = meta.note ?? null;
  const checkOutIp = meta.checkOutIp ?? null;
  const checkOutDeviceId = meta.checkOutDeviceId ?? null;
  const checkOutLat = Number.isFinite(meta.checkOutLat) ? Number(meta.checkOutLat) : null;
  const checkOutLng = Number.isFinite(meta.checkOutLng) ? Number(meta.checkOutLng) : null;

  await query(
    `UPDATE attendance
     SET
       clock_out_at = ?,
       clock_out_source = ?,
       worked_minutes = GREATEST(0, TIMESTAMPDIFF(MINUTE, clock_in_at, ?)),
       check_out_ip = COALESCE(?, check_out_ip),
       check_out_device_id = COALESCE(?, check_out_device_id),
       check_out_lat = COALESCE(?, check_out_lat),
       check_out_lng = COALESCE(?, check_out_lng),
       note = COALESCE(?, note),
       updated_at = CURRENT_TIMESTAMP(6)
     WHERE id = ?`,
    [
      clockOutAt,
      source,
      clockOutAt,
      checkOutIp,
      checkOutDeviceId,
      checkOutLat,
      checkOutLng,
      note,
      attendanceId,
    ]
  );
}

export async function clockOutByRecord(record, clockOutAt, source = 'manual', meta = {}) {
  return clockOut(record.id, clockOutAt, source, meta);
}

export async function getWeeklyAttendance(slackUserId, weekStart, weekEnd) {
  const res = await query(
    `SELECT id, date, clock_in_at, clock_out_at, source, clock_out_source, record_status, late_minutes, worked_minutes, note
     FROM attendance
     WHERE slack_user_id = ? AND date >= ? AND date <= ?
     ORDER BY date, clock_in_at`,
    [slackUserId, weekStart, weekEnd]
  );
  return res.rows;
}
