// School calendar + time helpers used by the dashboards and header.
// Sri Lankan international schools run three terms; boundaries are approximate and only drive UI labels.
const TERMS = [
  { term: 1, start: [0, 1], end: [3, 30] },
  { term: 2, start: [4, 1], end: [7, 31] },
  { term: 3, start: [8, 1], end: [11, 31] },
];
const DAY_MS = 86_400_000;

export function getTermInfo(now = new Date()) {
  const year = now.getFullYear();
  const current =
    TERMS.find(({ start, end }) => {
      const s = new Date(year, start[0], start[1]);
      const e = new Date(year, end[0], end[1], 23, 59, 59);
      return now >= s && now <= e;
    }) || TERMS[0];
  const start = new Date(year, current.start[0], current.start[1]);
  const end = new Date(year, current.end[0], current.end[1]);
  const today = new Date(year, now.getMonth(), now.getDate());
  const week = Math.floor((today - start) / (7 * DAY_MS)) + 1;
  const daysLeft = Math.max(0, Math.round((end - today) / DAY_MS));
  return { year, term: current.term, week, daysLeft, label: `${year} – Term ${current.term}` };
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatLongDate(now = new Date()) {
  return now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Backend DayOfWeek name for a date, or null on weekends. */
export function todayKey(now = new Date()) {
  return [null, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', null][now.getDay()];
}

/** "07:50" / "07:50:00" -> minutes since midnight */
export function toMinutes(time) {
  if (!time) return null;
  const [h, m] = String(time).split(':').map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}

export function formatTime(time) {
  if (!time) return '';
  const [h, m] = String(time).split(':');
  return `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
}

export function periodState(start, end, nowMinutes, isNext) {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s == null || e == null) return 'later';
  if (nowMinutes >= e) return 'completed';
  if (nowMinutes >= s) return 'live';
  return isNext ? 'next' : 'later';
}

export function initials(name = '') {
  const parts = String(name).replace(/[_.@]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatLKR(value) {
  const n = Number(value) || 0;
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString()}`;
}

