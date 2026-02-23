/**
 * Block Kit UI for /attendance slash command.
 */
export function attendanceMenuBlocks() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🕐 출퇴근 도우미', emoji: true },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*현재* ${dateStr} ${timeStr}\n아래 버튼을 선택하거나, 채널에 자연어로 말씀해 주세요. (예: "오늘 9시 12분에 출근했어요", "지각이에요?")`,
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*출퇴근 기록*' },
      accessory: {
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
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: '*기타*' },
      accessory: {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '시간 정정 요청', emoji: true },
            action_id: 'attendance_request_correction',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '주간 요약', emoji: true },
            action_id: 'attendance_weekly_summary',
          },
        ],
      },
    },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: '자연어 예: "I came in at 9:12", "Am I late?", "Fix clock-in to 08:55"' },
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
