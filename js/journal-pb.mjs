import { OWNER, normalizeDate } from './journal-data.mjs?v=20261102-trends';

export const DISTANCES = ['5K', '10K', 'Half marathon', 'Marathon'];
// Historical reference only: 2027 men's 18–34 qualifying standard.
export const REFERENCE_BQ_SECONDS = 2 * 3600 + 55 * 60;
export const REFERENCE_BQ_ACCEPTED_SECONDS = 2 * 3600 + 49 * 60 + 43;

export function parseTime(value) {
  if (!/^\d{1,3}:\d{2}(?::\d{2})?$/.test(value)) return null;
  const parts = value.split(':').map(Number);
  if (parts.at(-1) > 59 || (parts.length === 3 && parts[1] > 59)) return null;
  const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
  return seconds > 0 && seconds < 86400 ? seconds : null;
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) % 60;
  const remainder = seconds % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` : `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function parsePB(issue) {
  if (!issue || issue.pull_request || issue.user?.login?.toLowerCase() !== OWNER ||
      !issue.title?.startsWith('[BQ PB]') || !Number.isSafeInteger(issue.number) || issue.number < 1) return null;
  const labels = ['距离 / Distance', '成绩 / Time', '日期 / Date', '比赛 / Race'];
  const fields = {};
  let current;
  for (const line of (issue.body || '').replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.startsWith('### ') ? line.slice(4).trim() : '';
    if (labels.includes(heading)) { current = heading; fields[current] = []; }
    else if (current) fields[current].push(line);
  }
  const read = label => (fields[label] || []).join('\n').trim();
  const distance = read(labels[0]);
  const seconds = parseTime(read(labels[1]));
  const date = normalizeDate(read(labels[2]));
  const race = read(labels[3]);
  if (!DISTANCES.includes(distance) || seconds === null || !date || !race || race === '_No response_') return null;
  return { number: issue.number, distance, seconds, date, race };
}

export function personalBests(issues, baselines = []) {
  const bests = new Map(baselines.map(result => [result.distance, result]));
  for (const issue of issues) {
    const result = parsePB(issue);
    if (!result) continue;
    const previous = bests.get(result.distance);
    if (!previous || result.seconds < previous.seconds ||
        (previous.precisionMinute && Math.floor(result.seconds / 60) === Math.floor(previous.seconds / 60)) ||
        (result.seconds === previous.seconds && result.date > previous.date)) bests.set(result.distance, result);
  }
  return bests;
}
