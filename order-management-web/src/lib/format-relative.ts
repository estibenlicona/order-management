const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const dateFmt = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelative(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const diff = d.getTime() - Date.now();
  const abs = Math.abs(diff);

  if (abs < MINUTE) return rtf.format(Math.round(diff / 1000), 'second');
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (abs < 7 * DAY) return rtf.format(Math.round(diff / DAY), 'day');
  return dateFmt.format(d);
}

export function formatAbsolute(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return dateFmt.format(d);
}
