import { config } from '../config.js';
import * as rules from '../attendance/rules.js';

export function formatHomeTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString('ko-KR', {
    timeZone: config.attendance.timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatHomeDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('ko-KR', {
    timeZone: config.attendance.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function buildHomeView({ todayRows, isWorking, flashMessage = '' }) {
  const rows = Array.isArray(todayRows) ? todayRows : [];
  const dashboardUrl = config.web.dashboardUrl?.trim();
  const calc = rules.calculateDayAttendance(rows);
  const now = new Date();
  const nowTime = formatHomeTime(now);
  const nowDate = formatHomeDate(now);
  const title = `🕐 출퇴근 도우미 ver${config.app.displayVersion}`;
  const firstClockIn = rows[0]?.clock_in_at ? formatHomeTime(rows[0].clock_in_at) : '-';
  const latest = rows[rows.length - 1];
  const lastClockOut = latest?.clock_out_at
    ? formatHomeTime(latest.clock_out_at)
    : isWorking
      ? '진행 중'
      : '-';
  const statusText = isWorking ? '근무 중' : '대기/퇴근';

  const clockInButton = {
    type: 'button',
    text: { type: 'plain_text', text: '출근하기', emoji: true },
    action_id: 'attendance_clock_in',
  };
  if (!isWorking) clockInButton.style = 'primary';

  const clockOutButton = {
    type: 'button',
    text: { type: 'plain_text', text: '퇴근하기', emoji: true },
    action_id: 'attendance_clock_out',
  };
  if (isWorking) clockOutButton.style = 'primary';

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: title, emoji: true },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*안녕하세요! 👋*\n출퇴근 관리를 도와드리겠습니다. 아래 버튼을 선택하거나 자연어로 명령해주세요.',
      },
    },
    {
      type: 'header',
      text: { type: 'plain_text', text: nowTime, emoji: true },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `${nowDate} · 상태: *${statusText}* · ver${config.app.displayVersion}`,
        },
      ],
    },
    { type: 'divider' },
    {
      type: 'actions',
      elements: [
        clockInButton,
        clockOutButton,
        {
          type: 'button',
          text: { type: 'plain_text', text: '오늘 현황 확인', emoji: true },
          action_id: 'attendance_today_status',
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '시간 정정 요청', emoji: true },
          action_id: 'attendance_request_correction',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '주간 리포트', emoji: true },
          action_id: 'attendance_weekly_summary',
        },
      ],
    },
    ...(dashboardUrl
      ? [
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: { type: 'plain_text', text: '웹 대시보드 열기', emoji: true },
                url: dashboardUrl,
              },
            ],
          },
        ]
      : []),
    { type: 'divider' },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*오늘 기록 건수*\n${rows.length}건` },
        { type: 'mrkdwn', text: `*오늘 누적 근무*\n${calc.totalFormatted}` },
        { type: 'mrkdwn', text: `*출근 시간*\n${firstClockIn}` },
        { type: 'mrkdwn', text: `*퇴근 시간*\n${lastClockOut}` },
        { type: 'mrkdwn', text: `*지각 여부*\n${calc.late ? '지각' : '정상'}` },
        { type: 'mrkdwn', text: `*현재 상태*\n${statusText}` },
      ],
    },
    { type: 'divider' },
    {
      type: 'input',
      block_id: 'attendance_home_nl_input',
      optional: true,
      label: { type: 'plain_text', text: '또는 자연어로 말씀해주세요:' },
      element: {
        type: 'plain_text_input',
        action_id: 'attendance_home_nl_text',
        multiline: false,
        placeholder: {
          type: 'plain_text',
          text: '예: 오늘 9시 20분에 출근했어요',
        },
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '전송', emoji: true },
          action_id: 'attendance_home_nl_submit',
          style: 'primary',
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `현재 상태: ${statusText}. 채널/DM에서도 자연어로 요청할 수 있습니다.`,
        },
      ],
    },
  ];

  if (flashMessage) {
    blocks.splice(1, 0, {
      type: 'section',
      text: { type: 'mrkdwn', text: `✅ ${flashMessage}` },
    });
  }

  return {
    type: 'home',
    callback_id: 'attendance_home',
    blocks,
  };
}
