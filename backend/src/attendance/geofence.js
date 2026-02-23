/**
 * Simple geofence helpers for 2-table attendance schema.
 * This module keeps GPS auto clock-in/out minimal and practical:
 * - Enter geofence while not clocked-in => clock-in
 * - Stay outside for a configured threshold => auto clock-out
 */
import { config } from '../config.js';
import * as repo from './repository.js';
import * as rules from './rules.js';

const RADIUS_EARTH_M = 6371000;

export function distanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIUS_EARTH_M * c;
}

export function isInsideGeofence(lat, lng) {
  if (!config.geofence.enabled) return false;
  const d = distanceMeters(
    config.geofence.centerLat,
    config.geofence.centerLng,
    lat,
    lng
  );
  return d <= config.geofence.radiusMeters;
}

/**
 * 2-table mode does not maintain external calendar events.
 */
export async function hasCalendarEventInRange() {
  return false;
}

/**
 * @returns {Promise<{ action: 'clock_in' | 'clock_out' | 'none', message?: string }>}
 */
export async function processLocationUpdate(slackUserId, lat, lng) {
  if (!config.geofence.enabled) {
    return { action: 'none', message: 'Geofence is disabled.' };
  }

  await repo.ensureUser(slackUserId);

  const inside = isInsideGeofence(lat, lng);
  const now = new Date();
  const nowIso = now.toISOString();
  const lastOpen = await repo.getLastClockInToday(slackUserId);

  if (inside) {
    if (!lastOpen) {
      await repo.clockIn(slackUserId, nowIso, 'gps', {
        checkInLat: lat,
        checkInLng: lng,
        note: 'Auto clock-in from geofence',
      });
      return { action: 'clock_in', message: '건물 진입으로 출근 처리되었습니다.' };
    }
    return { action: 'none' };
  }

  if (!lastOpen) return { action: 'none' };

  const workedSoFar = rules.workingMinutes(lastOpen.clock_in_at, nowIso);
  if (workedSoFar < config.attendance.awayAutoClockOutMinutes) {
    return { action: 'none' };
  }

  await repo.clockOutByRecord(lastOpen, nowIso, 'gps', {
    checkOutLat: lat,
    checkOutLng: lng,
    note: `Auto clock-out after ${config.attendance.awayAutoClockOutMinutes}m outside`,
  });

  return {
    action: 'clock_out',
    message: `${config.attendance.awayAutoClockOutMinutes}분 이상 외부에 있어 퇴근 처리되었습니다.`,
  };
}
