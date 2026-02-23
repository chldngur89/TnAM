import 'dotenv/config';
/**
 * Slack Attendance AI - Bolt app on Express.
 * - Slash command /attendance → Block Kit
 * - Button actions: clock in/out, correction, weekly summary
 * - Natural language (app_mention or DM) → Ollama intent → server logic
 * - Optional: POST /location for GPS updates (geofence auto clock)
 */
import express from 'express';
import pkg from '@slack/bolt';
const { App, ExpressReceiver } = pkg;
import { config, assertOllamaLocalhost } from './config.js';
import { attendanceMenuBlocks, ephemeralBlocks } from './slack/blocks.js';
import { extractIntent, OLLAMA_FALLBACK_MESSAGE } from './ollama.js';
import * as repo from './attendance/repository.js';
import * as rules from './attendance/rules.js';
import { addDays, todayInTimezone } from './attendance/time.js';
import { processLocationUpdate } from './attendance/geofence.js';

// Ensure Ollama is localhost only
assertOllamaLocalhost();

const expressReceiver = new ExpressReceiver({
  signingSecret: config.slack.signingSecret,
  endpoints: '/slack/events',
  processBeforeResponse: true,
});

const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  receiver: expressReceiver,
});

const webApp = express();

function toDateKey(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

// ----- Basic health endpoint for EC2/LB checks -----
webApp.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ----- Slack URL verification / event callback quick ack -----
webApp.post('/slack/events', (req, res, next) => {
  // Real Slack requests include signature headers.
  // Let Bolt handle signed requests to preserve verification + full event handling.
  if (req.headers['x-slack-signature']) {
    return next();
  }

  // Fallback path for manual/local curl tests without Slack signature headers.
  return express.json()(req, res, (err) => {
    if (err) {
      return res.status(400).send('invalid json');
    }

    const payload = req.body || {};
    if (payload.type === 'url_verification') {
      return res.status(200).send(payload.challenge);
    }
    if (payload.type === 'event_callback') {
      console.log('Slack events payload:', payload);
      return res.status(200).send('ok');
    }
    return next();
  });
});

// Keep Bolt router mounted so slash commands / interactivity still work on /slack/events.
webApp.use(expressReceiver.router);

// ----- Slash command /attendance -----
app.command('/attendance', async ({ command, ack, respond }) => {
  await ack();

  const userId = command.user_id;
  await repo.ensureUser(userId, { displayName: command.user_name });

  await respond({
    response_type: 'ephemeral',
    blocks: attendanceMenuBlocks(),
  });
});

// ----- Button: Clock In -----
app.action('attendance_clock_in', async ({ ack, body, client }) => {
  await ack();
  const userId = body.user.id;
  await repo.ensureUser(userId);

  const already = await repo.getLastClockInToday(userId);
  if (already) {
    await client.chat.postEphemeral({
      channel: body.channel.id,
      user: userId,
      text: '이미 오늘 출근 기록이 있습니다.',
      blocks: ephemeralBlocks('이미 오늘 출근 기록이 있습니다. 퇴근 후 다시 출근할 수 있습니다.'),
    });
    return;
  }

  const now = new Date();
  const late = rules.isLate(now);
  const record = await repo.clockIn(userId, now.toISOString(), 'slash', {
    recordStatus: late ? 'late' : 'present',
    lateMinutes: rules.lateMinutes(now),
  });
  const timeStr = new Date(record.clock_in_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: userId,
    text: `출근 완료: ${timeStr}`,
    blocks: ephemeralBlocks(
      `✅ *출근 완료*\n시각: ${timeStr}${late ? '\n⚠️ 지각으로 기록됩니다.' : ''}`
    ),
  });
});

// ----- Button: Clock Out -----
app.action('attendance_clock_out', async ({ ack, body, client }) => {
  await ack();
  const userId = body.user.id;

  const last = await repo.getLastClockInToday(userId);
  if (!last) {
    await client.chat.postEphemeral({
      channel: body.channel.id,
      user: userId,
      text: '출근 기록이 없습니다.',
      blocks: ephemeralBlocks('출근 기록이 없습니다. 먼저 출근하기를 눌러 주세요.'),
    });
    return;
  }

  const now = new Date().toISOString();
  await repo.clockOutByRecord(last, now, 'slash');
  const minutes = rules.workingMinutes(last.clock_in_at, now);
  const timeStr = new Date(now).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: userId,
    text: `퇴근 완료: ${timeStr}`,
    blocks: ephemeralBlocks(
      `✅ *퇴근 완료*\n시각: ${timeStr}\n오늘 근무: ${rules.formatDuration(minutes)}`
    ),
  });
});

// ----- Button: Request Correction -----
app.action('attendance_request_correction', async ({ ack, body, client }) => {
  await ack();
  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: body.user.id,
    text: '시간 정정 요청',
    blocks: ephemeralBlocks(
      '시간 정정이 필요하면 채널에 자연어로 남겨 주세요. 예: "2월 12일 출근 시간을 08:55로 바꿔 주세요"\n또는 관리자에게 요청해 주세요.'
    ),
  });
});

// ----- Button: Weekly Summary -----
app.action('attendance_weekly_summary', async ({ ack, body, client }) => {
  await ack();
  const userId = body.user.id;

  const endStr = todayInTimezone();
  const startStr = addDays(endStr, -6);

  const rows = await repo.getWeeklyAttendance(userId, startStr, endStr);
  const dayMap = {};
  for (const r of rows) {
    const d = toDateKey(r.date);
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push(r);
  }

  let totalMinutes = 0;
  let lateCount = 0;
  const lines = [];
  const days = Object.keys(dayMap).sort();
  for (const d of days) {
    const recs = dayMap[d];
    const calc = rules.calculateDayAttendance(recs);
    totalMinutes += calc.totalMinutes;
    if (calc.late) lateCount++;
    const label = new Date(d + 'Z').toLocaleDateString('ko-KR', { weekday: 'short', month: 'numeric', day: 'numeric' });
    lines.push(`• ${label}: ${calc.totalFormatted}${calc.late ? ' (지각)' : ''}`);
  }

  const text =
    `*이번 주 출퇴근 요약* (${startStr} ~ ${endStr})\n` +
    (lines.length ? lines.join('\n') + `\n*총 근무:* ${rules.formatDuration(totalMinutes)}\n*지각:* ${lateCount}회` : '기록이 없습니다.');

  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: userId,
    text: '주간 요약',
    blocks: ephemeralBlocks(text),
  });
});

// ----- Natural language: app_mention or DM -----
async function handleNaturalLanguage(text, userId, channelId, client, threadTs) {
  const opts = { channel: channelId, user: userId, thread_ts: threadTs };

  const intentResult = await extractIntent(text);
  if (!intentResult) {
    await client.chat.postEphemeral({
      ...opts,
      text: OLLAMA_FALLBACK_MESSAGE,
      blocks: ephemeralBlocks(OLLAMA_FALLBACK_MESSAGE),
    });
    return;
  }

  const { intent, time, date, confidence } = intentResult;
  if (confidence < 0.5) {
    await client.chat.postEphemeral({
      ...opts,
      text: '의도를 파악하기 어렵습니다. 버튼을 사용하거나 다시 말씀해 주세요.',
      blocks: ephemeralBlocks('의도를 파악하기 어렵습니다. `/attendance` 버튼을 사용하거나 다시 말씀해 주세요.'),
    });
    return;
  }

  const today = todayInTimezone();
  const resolveDate = date ? date : today;

  switch (intent) {
    case 'clock_in': {
      await repo.ensureUser(userId);
      const already = await repo.getLastClockInToday(userId);
      if (already) {
        await client.chat.postEphemeral({
          ...opts,
          blocks: ephemeralBlocks('이미 오늘 출근 기록이 있습니다.'),
        });
        return;
      }
      const clockAt = time
        ? new Date(`${resolveDate}T${time}:00`)
        : new Date();
      const late = rules.isLate(clockAt);
      const record = await repo.clockIn(userId, clockAt.toISOString(), 'nl', {
        recordStatus: late ? 'late' : 'present',
        lateMinutes: rules.lateMinutes(clockAt),
      });
      await client.chat.postEphemeral({
        ...opts,
        blocks: ephemeralBlocks(
          `출근 기록했습니다. (${new Date(record.clock_in_at).toLocaleTimeString('ko-KR')})${late ? ' 지각으로 기록됩니다.' : ''}`
        ),
      });
      return;
    }
    case 'clock_out': {
      const last = await repo.getLastClockInToday(userId);
      if (!last) {
        await client.chat.postEphemeral({
          ...opts,
          blocks: ephemeralBlocks('출근 기록이 없습니다.'),
        });
        return;
      }
      const clockAt = time
        ? new Date(`${resolveDate}T${time}:00`)
        : new Date();
      await repo.clockOutByRecord(last, clockAt.toISOString(), 'nl');
      const minutes = rules.workingMinutes(last.clock_in_at, clockAt);
      await client.chat.postEphemeral({
        ...opts,
        blocks: ephemeralBlocks(
          `퇴근 기록했습니다. (${clockAt.toLocaleTimeString('ko-KR')}) 근무: ${rules.formatDuration(minutes)}`
        ),
      });
      return;
    }
    case 'correction': {
      await client.chat.postEphemeral({
        ...opts,
        blocks: ephemeralBlocks(
          `정정 요청 입력: (${time || '시간'} ${resolveDate})\n현재는 2개 핵심 테이블(users, attendance)로 운영 중이라 정정 승인 테이블은 비활성화되어 있습니다.\n관리자에게 직접 요청해 주세요.`
        ),
      });
      return;
    }
    case 'summary': {
      const weekEnd = todayInTimezone();
      const weekStart = addDays(weekEnd, -6);
      const rows = await repo.getWeeklyAttendance(
        userId,
        weekStart,
        weekEnd
      );
      const dayMap = {};
      for (const r of rows) {
        const d = toDateKey(r.date);
        if (!dayMap[d]) dayMap[d] = [];
        dayMap[d].push(r);
      }
      let totalMinutes = 0;
      const lines = [];
      for (const d of Object.keys(dayMap).sort()) {
        const calc = rules.calculateDayAttendance(dayMap[d]);
        totalMinutes += calc.totalMinutes;
        const label = new Date(d + 'Z').toLocaleDateString('ko-KR', { weekday: 'short', month: 'numeric', day: 'numeric' });
        lines.push(`• ${label}: ${calc.totalFormatted}`);
      }
      await client.chat.postEphemeral({
        ...opts,
        blocks: ephemeralBlocks(
          `*이번 주 요약*\n${lines.join('\n')}\n*총:* ${rules.formatDuration(totalMinutes)}`
        ),
      });
      return;
    }
    case 'question': {
      const todayRecords = await repo.getTodayAttendance(userId);
      const last = await repo.getLastClockInToday(userId);
      let msg = '오늘 출근 기록이 없습니다.';
      if (todayRecords.length > 0) {
        const calc = rules.calculateDayAttendance(todayRecords);
        msg = `오늘 근무: ${calc.totalFormatted}${calc.late ? ' (지각)' : ''}. ${last ? '현재 출근 중입니다.' : '퇴근했습니다.'}`;
      }
      await client.chat.postEphemeral({ ...opts, blocks: ephemeralBlocks(msg) });
      return;
    }
    default:
      await client.chat.postEphemeral({
        ...opts,
        blocks: ephemeralBlocks('요청을 처리할 수 없습니다. `/attendance` 로 메뉴를 확인해 주세요.'),
      });
  }
}

// App mention: @bot natural language
app.event('app_mention', async ({ event, client }) => {
  const text = event.text?.replace(/<@[A-Z0-9]+>\s*/, '').trim();
  if (!text) return;
  await handleNaturalLanguage(
    text,
    event.user,
    event.channel,
    client,
    event.ts
  );
});

// DM to bot: natural language
app.message(async ({ message, client }) => {
  if (message.channel_type !== 'im' || message.bot_id || !message.text) return;
  const text = message.text.trim();
  if (!text) return;
  await handleNaturalLanguage(
    text,
    message.user,
    message.channel,
    client,
    message.ts
  );
});

// ----- Health -----
webApp.get('/health', (req, res) => {
  res.json({ ok: true, service: 'slack-attendance-ai' });
});

// ----- GPS location (for mobile/backend calling with lat/lng) -----
webApp.post('/api/location', express.json(), async (req, res) => {
  const { slack_user_id: slackUserId, lat, lng } = req.body || {};
  if (!slackUserId || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'slack_user_id, lat, lng required' });
  }
  try {
    const result = await processLocationUpdate(slackUserId, lat, lng);
    return res.json(result);
  } catch (err) {
    console.error('Location update error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ----- Start -----
(async () => {
  webApp.listen(config.port, '0.0.0.0', () => {
    console.log(`Slack Attendance AI listening on 0.0.0.0:${config.port}`);
  });
})();
