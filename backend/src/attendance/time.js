import { config } from '../config.js';

/**
 * Return YYYY-MM-DD in configured attendance timezone.
 */
export function toDateStringInTimezone(value = new Date(), timeZone = config.attendance.timezone) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function todayInTimezone(timeZone = config.attendance.timezone) {
  return toDateStringInTimezone(new Date(), timeZone);
}

/**
 * Add days to a YYYY-MM-DD string.
 */
export function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
