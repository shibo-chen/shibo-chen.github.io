import { OWNER, normalizeDate } from './journal-data.mjs?v=20261102-date-fix';

export function parseWeight(value) {
  if (typeof value !== 'string' || !/^\d{1,3}(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const kg = Number(value.trim());
  return kg > 0 ? kg : null;
}

export function weightRecords(issues) {
  const days = new Map();
  for (const issue of issues) {
    if (!issue || issue.pull_request || issue.user?.login?.toLowerCase() !== OWNER ||
        !['[BQ Weight]', '[BQ Journal]'].some(prefix => issue.title?.startsWith(prefix)) ||
        !Number.isSafeInteger(issue.number) || issue.number < 1) continue;
    const fields = {};
    let heading;
    for (const line of (issue.body || '').replace(/\r\n/g, '\n').split('\n')) {
      if (line.startsWith('### ')) { heading = line.slice(4).trim(); fields[heading] = []; }
      else if (heading) fields[heading].push(line);
    }
    const read = label => (fields[label] || []).join('\n').trim();
    const date = normalizeDate(read('日期 / Date'));
    const kg = parseWeight(read('体重 / Weight (kg)'));
    if (!date || kg === null) continue;
    const note = read('备注 / Note');
    const result = { date, kg, number: issue.number, note: note === '_No response_' ? '' : note, updated: issue.updated_at || issue.created_at || '' };
    const previous = days.get(date);
    if (!previous || result.updated > previous.updated ||
        (result.updated === previous.updated && result.number > previous.number)) days.set(date, result);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function weightChart(records) {
  if (!records.length) return null;
  const times = records.map(record => Date.parse(`${record.date}T12:00:00Z`));
  const values = records.map(record => record.kg);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const padding = Math.max(1, (high - low) * .15);
  const min = Math.max(0, low - padding);
  const max = high + padding;
  const duration = times.at(-1) - times[0];
  return {
    min, max,
    points: records.map((record, index) => ({
      x: duration ? 64 + (times[index] - times[0]) / duration * 552 : 340,
      y: 24 + (max - record.kg) / (max - min) * 148,
      date: record.date, kg: record.kg,
    })),
  };
}
