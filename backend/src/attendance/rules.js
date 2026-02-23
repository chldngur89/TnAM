/**
 * Business rules: late policy, working hours calculation.
 * AI does NOT do this; server only.
 */
import { getLastClockInToday } from './repository.js';
import { config } from '../config.js';

const DEFAULT_WORK_START = config.attendance.defaultWorkStart; // "09:00"
const DEFAULT_WORK_END = config.attendance.defaultWorkEnd;
const LATE_THRESHOLD_MINUTES = config.attendance.lateThresholdMinutes;

function parseTime(str) {
  if (!str) return null;
  const [h, m] = str.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return { hours: h, minutes: m ?? 0 };
}

function timeToMinutes(t) {
  if (!t) return 0;
  return t.hours * 60 + t.minutes;
}

/**
 * Check if clock-in time is late (after work start + threshold).
 * @param {Date} clockInAt
 * @param {string} workStart - e.g. "09:00"
 */
export function isLate(clockInAt, workStart = DEFAULT_WORK_START) {
  return lateMinutes(clockInAt, workStart) > 0;
}

/**
 * Return late minutes from work start + threshold.
 * If not late, returns 0.
 */
export function lateMinutes(clockInAt, workStart = DEFAULT_WORK_START) {
  const start = parseTime(workStart);
  if (!start) return 0;
  const threshold = LATE_THRESHOLD_MINUTES;
  const clockMinutes = clockInAt.getHours() * 60 + clockInAt.getMinutes();
  const startMinutes = timeToMinutes(start);
  return Math.max(0, clockMinutes - (startMinutes + threshold));
}

/**
 * Calculate working minutes between clock_in_at and clock_out_at (or now if no clock out).
 */
export function workingMinutes(clockInAt, clockOutAt) {
  const end = clockOutAt ? new Date(clockOutAt) : new Date();
  const start = new Date(clockInAt);
  const ms = Math.max(0, end - start);
  return Math.floor(ms / 60000);
}

/**
 * Format minutes as "Xh Ym".
 */
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/**
 * Get expected work duration for a day (in minutes) based on work_start and work_end.
 */
export function expectedWorkMinutes(workStart = DEFAULT_WORK_START, workEnd = DEFAULT_WORK_END) {
  const start = parseTime(workStart);
  const end = parseTime(workEnd);
  if (!start || !end) return 8 * 60;
  return Math.max(0, timeToMinutes(end) - timeToMinutes(start));
}

/**
 * Overtime = working minutes - expected (only if clocked out).
 */
export function overtimeMinutes(clockInAt, clockOutAt, workStart, workEnd) {
  if (!clockOutAt) return 0;
  const expected = expectedWorkMinutes(workStart, workEnd);
  const actual = workingMinutes(clockInAt, clockOutAt);
  return Math.max(0, actual - expected);
}

/**
 * Example: full attendance calculation for one day (multiple in/out pairs).
 * Returns { totalMinutes, late, overtimeMinutes, segments }.
 */
export function calculateDayAttendance(records, workStart = DEFAULT_WORK_START, workEnd = DEFAULT_WORK_END) {
  let totalMinutes = 0;
  let late = false;
  const segments = [];

  for (const r of records) {
    const inAt = new Date(r.clock_in_at);
    const outAt = r.clock_out_at ? new Date(r.clock_out_at) : null;
    totalMinutes += workingMinutes(r.clock_in_at, r.clock_out_at);
    if (!late && isLate(inAt, workStart)) late = true;
    segments.push({ clock_in_at: inAt, clock_out_at: outAt });
  }

  const lastSegment = segments[segments.length - 1];
  const lastOut = lastSegment?.clock_out_at;
  const lastIn = lastSegment?.clock_in_at;
  let overtimeMinutesVal = 0;
  if (lastOut) {
    overtimeMinutesVal = overtimeMinutes(lastIn, lastOut, workStart, workEnd);
  }

  return {
    totalMinutes,
    totalFormatted: formatDuration(totalMinutes),
    late,
    overtimeMinutes: overtimeMinutesVal,
    overtimeFormatted: formatDuration(overtimeMinutesVal),
    segments,
  };
}

/**
 * Check if user already clocked in today (and not yet clocked out).
 */
export async function hasOpenClockIn(slackUserId) {
  const last = await getLastClockInToday(slackUserId);
  return last !== null;
}
