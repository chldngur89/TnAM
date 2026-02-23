/**
 * Configuration. Load from env (use dotenv in production if needed).
 */
import { readFileSync } from 'node:fs';

const OLLAMA_TIMEOUT_MS = 5000;
const OLLAMA_RETRY_COUNT = 1;
const FALLBACK_DASHBOARD_URL = 'https://sixpenny-bacterioscopic-wava.ngrok-free.dev';

function env(key, defaultValue) {
  const v = process.env[key];
  if (v !== undefined && v !== '') return v;
  return defaultValue;
}

function readBackendPackageVersion() {
  try {
    const raw = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
    const parsed = JSON.parse(raw);
    if (typeof parsed?.version === 'string' && parsed.version.trim() !== '') {
      return parsed.version.trim();
    }
  } catch {
    // no-op
  }
  return '1.0.0';
}

function toDisplayVersion(version) {
  const [major = '1', minor = '0'] = String(version).split('.');
  return `${major}.${minor}`;
}

function normalizeDashboardUrl(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return FALLBACK_DASHBOARD_URL;
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();
    const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
    if (isIpv4 || host === 'localhost' || host === '127.0.0.1') {
      return FALLBACK_DASHBOARD_URL;
    }
    return u.toString().replace(/\/+$/, '');
  } catch {
    return FALLBACK_DASHBOARD_URL;
  }
}

const packageVersion = readBackendPackageVersion();
const appVersion = env('APP_VERSION', packageVersion);
const dashboardUrl = normalizeDashboardUrl(env('WEB_DASHBOARD_URL', FALLBACK_DASHBOARD_URL));

export const config = {
  port: Number(env('PORT', '3000')),
  app: {
    version: appVersion,
    displayVersion: toDisplayVersion(appVersion),
  },
  slack: {
    signingSecret: env('SLACK_SIGNING_SECRET', ''),
    botToken: env('SLACK_BOT_TOKEN', ''),
    appToken: env('SLACK_APP_TOKEN', ''),
  },
  ollama: {
    baseUrl: env('OLLAMA_BASE_URL', 'http://127.0.0.1:11435'),
    model: env('OLLAMA_MODEL', 'qwen2.5:7b'),
    timeoutMs: Number(env('OLLAMA_TIMEOUT_MS', String(OLLAMA_TIMEOUT_MS))),
    retryCount: Number(env('OLLAMA_RETRY_COUNT', String(OLLAMA_RETRY_COUNT))),
  },
  db: {
    connectionString: env('DATABASE_URL', 'mysql://root@localhost:3306/attendance'),
  },
  web: {
    dashboardUrl,
  },
  attendance: {
    defaultWorkStart: env('ATTENDANCE_WORK_START', '09:00'),
    defaultWorkEnd: env('ATTENDANCE_WORK_END', '18:00'),
    timezone: env('ATTENDANCE_TIMEZONE', 'Asia/Seoul'),
    lateThresholdMinutes: Number(env('ATTENDANCE_LATE_THRESHOLD_MINUTES', '0')),
    awayAutoClockOutMinutes: Number(env('ATTENDANCE_AWAY_AUTO_CLOCKOUT_MINUTES', '60')),
  },
  geofence: {
    enabled: env('GEOFENCE_ENABLED', 'false') === 'true',
    centerLat: Number(env('GEOFENCE_CENTER_LAT', '37.5665')),
    centerLng: Number(env('GEOFENCE_CENTER_LNG', '126.9780')),
    radiusMeters: Number(env('GEOFENCE_RADIUS_METERS', '200')),
  },
};

/** Ensure Ollama is only called from localhost (security). */
export function assertOllamaLocalhost() {
  const u = new URL(config.ollama.baseUrl);
  if (u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') {
    throw new Error(`Ollama baseUrl must be localhost. Got: ${config.ollama.baseUrl}`);
  }
}
