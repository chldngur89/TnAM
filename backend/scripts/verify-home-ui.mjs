import { config } from '../src/config.js';
import { buildHomeView } from '../src/slack/home-view.js';

function assertTrue(condition, message) {
  if (!condition) throw new Error(message);
}

function actionIds(block) {
  return (block?.elements || [])
    .map((e) => e?.action_id)
    .filter(Boolean);
}

function hasAllIds(block, ids) {
  const set = new Set(actionIds(block));
  return ids.every((id) => set.has(id));
}

const idleView = buildHomeView({
  todayRows: [],
  isWorking: false,
});

const titleBlock = idleView.blocks.find((b) => b.type === 'header');
assertTrue(
  titleBlock?.text?.text?.includes(`ver${config.app.displayVersion}`),
  `Header version mismatch. expected ver${config.app.displayVersion}`
);

const actionBlocks = idleView.blocks.filter((b) => b.type === 'actions');
const topActionRow = actionBlocks.find((b) =>
  hasAllIds(b, ['attendance_clock_in', 'attendance_clock_out', 'attendance_today_status'])
);
assertTrue(topActionRow, 'Top action row (출근/퇴근/오늘 현황) not found');
assertTrue(topActionRow.elements.length === 3, 'Top action row must contain 3 buttons');

const secondActionRow = actionBlocks.find((b) =>
  hasAllIds(b, ['attendance_request_correction', 'attendance_weekly_summary'])
);
assertTrue(secondActionRow, 'Second action row (정정/주간 리포트) not found');
assertTrue(secondActionRow.elements.length === 2, 'Second action row must contain 2 buttons');

const clockInBtn = topActionRow.elements.find((e) => e.action_id === 'attendance_clock_in');
const clockOutBtn = topActionRow.elements.find((e) => e.action_id === 'attendance_clock_out');
assertTrue(clockInBtn?.style === 'primary', 'Idle state should highlight 출근하기');
assertTrue(!clockOutBtn?.style, 'Idle state should not highlight 퇴근하기');

if (config.web.dashboardUrl?.trim()) {
  const dashboardRow = actionBlocks.find((b) =>
    (b.elements || []).some((e) => e?.url === config.web.dashboardUrl)
  );
  assertTrue(dashboardRow, 'Dashboard button row not found');
}

const workingView = buildHomeView({
  todayRows: [{ clock_in_at: new Date().toISOString(), clock_out_at: null }],
  isWorking: true,
});

const workingTopRow = workingView.blocks
  .filter((b) => b.type === 'actions')
  .find((b) => hasAllIds(b, ['attendance_clock_in', 'attendance_clock_out', 'attendance_today_status']));

const workingClockInBtn = workingTopRow?.elements?.find((e) => e.action_id === 'attendance_clock_in');
const workingClockOutBtn = workingTopRow?.elements?.find((e) => e.action_id === 'attendance_clock_out');
assertTrue(!workingClockInBtn?.style, 'Working state should not highlight 출근하기');
assertTrue(workingClockOutBtn?.style === 'primary', 'Working state should highlight 퇴근하기');

console.log(
  JSON.stringify(
    {
      ok: true,
      version: config.app.version,
      displayVersion: config.app.displayVersion,
      dashboardUrl: config.web.dashboardUrl || '',
      topRow: actionIds(topActionRow),
      secondRow: actionIds(secondActionRow),
    },
    null,
    2
  )
);
