function icsDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcs(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function buildOpsCalendar(opsPlan, runId) {
  const now = new Date();
  const start = new Date(now.getTime() + 15 * 60 * 1000);

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MenuMind//Ops Plan//EN',
    ...opsPlan.map((task, index) => {
      const eventStart = new Date(start.getTime() + index * 20 * 60 * 1000);
      const eventEnd = new Date(eventStart.getTime() + 15 * 60 * 1000);
      return [
        'BEGIN:VEVENT',
        `UID:${task.id}-${runId || 'run'}@menumind.local`,
        `DTSTAMP:${icsDate(now)}`,
        `DTSTART:${icsDate(eventStart)}`,
        `DTEND:${icsDate(eventEnd)}`,
        `SUMMARY:${escapeIcs(`MenuMind: ${task.title}`)}`,
        `DESCRIPTION:${escapeIcs(`${task.detail} Owner: ${task.owner}. Priority: ${task.priority}.`)}`,
        'END:VEVENT',
      ].join('\r\n');
    }),
    'END:VCALENDAR',
  ].join('\r\n');
}
