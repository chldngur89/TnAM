/**
 * Block Kit UI for /attendance slash command.
 */
import { config } from '../config.js';

export function attendanceMenuBlocks() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('ko-KR', {
    timeZone: config.attendance.timezone,
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateStr = now.toLocaleDateString('ko-KR', {
    timeZone: config.attendance.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🕐 출퇴근 도우미', emoji: true },
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
      text: { type: 'plain_text', text: timeStr, emoji: true },
    },
    {
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `${dateStr} · 메뉴에서 바로 처리할 수 있습니다.` }],
    },
    { type: 'divider' },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '출근하기', emoji: true },
          action_id: 'attendance_clock_in',
          style: 'primary',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '퇴근하기', emoji: true },
          action_id: 'attendance_clock_out',
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
          text: { type: 'plain_text', text: '오늘 현황 확인', emoji: true },
          action_id: 'attendance_today_status',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '주간 리포트', emoji: true },
          action_id: 'attendance_weekly_summary',
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '자연어 예: `오늘 9시 20분에 출근했어요`, `지각인가요?`, `2월 12일 출근시간 08:55로 정정`',
        },
      ],
    },
  ];
}

export function ephemeralBlocks(text) {
  return [
    {
      type: 'section',
      text: { type: 'mrkdwn', text },
    },
  ];
}

export function errorBlocks(message) {
  return [
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `:warning: ${message}` },
    },
  ];
}
