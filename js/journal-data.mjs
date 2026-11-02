// GitHub issue forms are the journal's public data store. Only the owner's
// submissions with the expected title and a valid date can become entries.
export const REPOSITORY = 'shibo-chen/shibo-chen.github.io';
export const OWNER = 'shibo-chen';
export const FIELDS = [
  ['training', '训练 / Training'],
  ['food', '饮食 / Food'],
  ['sleep', '睡眠 / Sleep'],
  ['reflections', '感受 / Reflections'],
];

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Accept ordinary form dates without requiring zero-padded month/day values.
// Always return a real calendar date in the canonical format used for sorting.
export function normalizeDate(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  if (!match) return null;
  const date = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  return validDate(date) ? date : null;
}

export function parseEntry(issue) {
  if (!issue || issue.pull_request || issue.user?.login?.toLowerCase() !== OWNER ||
      !issue.title?.startsWith('[BQ Journal]') || !Number.isSafeInteger(issue.number) || issue.number < 1) return null;
  const fields = {};
  const labels = ['日期 / Date', '一句话 / Headline', '体重 / Weight (kg)', ...FIELDS.map(([, label]) => label)];
  let current = null;
  for (const line of (issue.body || '').replace(/\r\n/g, '\n').split('\n')) {
    const heading = line.startsWith('### ') ? line.slice(4).trim() : null;
    if (labels.includes(heading)) {
      current = heading;
      fields[current] = [];
    } else if (current) fields[current].push(line);
  }
  const read = label => {
    const value = (fields[label] || []).join('\n').trim();
    return value === '_No response_' ? '' : value;
  };
  const date = normalizeDate(read('日期 / Date'));
  if (!date || !read('训练 / Training')) return null;
  return {
    number: issue.number,
    date,
    headline: read('一句话 / Headline').slice(0, 160),
    weight: read('体重 / Weight (kg)'),
    updated: issue.updated_at || issue.created_at || '',
    ...Object.fromEntries(FIELDS.map(([key, label]) => [key, read(label)])),
  };
}

// A correction submitted for the same date replaces the earlier card. Keep all
// source issues intact; editing an existing issue is the normal update path.
export function dailyEntries(issues) {
  const days = new Map();
  for (const issue of issues) {
    const entry = parseEntry(issue);
    if (!entry) continue;
    const previous = days.get(entry.date);
    if (!previous || entry.updated > previous.updated ||
        (entry.updated === previous.updated && entry.number > previous.number)) days.set(entry.date, entry);
  }
  return [...days.values()].sort((a, b) => b.date.localeCompare(a.date));
}
