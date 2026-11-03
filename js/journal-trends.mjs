import { OWNER, normalizeDate } from './journal-data.mjs?v=20261102-trends';
import { parsePB } from './journal-pb.mjs?v=20261102-trends';

export function parseMiles(value) {
  if (typeof value !== 'string' || !/^\d{1,4}(?:\.\d{1,3})?$/.test(value.trim())) return null;
  return Number(value.trim());
}

// Each submission is a daily total, so a correction replaces that date rather
// than adding a second workout. Empty mileage is unknown; explicit 0 is rest.
export function runningRecords(issues, baselines = []) {
  const days = new Map(baselines.map(record => [record.date, { ...record, updated: '', number: 0 }]));
  for (const issue of issues) {
    if (!issue || issue.pull_request || issue.user?.login?.toLowerCase() !== OWNER ||
        !['[BQ Run]', '[BQ Journal]'].some(prefix => issue.title?.startsWith(prefix)) ||
        !Number.isSafeInteger(issue.number) || issue.number < 1) continue;
    const fields = {};
    let heading;
    for (const line of (issue.body || '').replace(/\r\n/g, '\n').split('\n')) {
      if (line.startsWith('### ')) { heading = line.slice(4).trim(); fields[heading] = []; }
      else if (heading) fields[heading].push(line);
    }
    const date = normalizeDate((fields['日期 / Date'] || []).join('\n').trim());
    const miles = parseMiles((fields['跑量 / Running distance (miles)'] || []).join('\n').trim());
    if (!date || miles === null) continue;
    const record = { date, miles, number: issue.number, updated: issue.updated_at || issue.created_at || '' };
    const previous = days.get(date);
    if (!previous || record.updated > previous.updated ||
        (record.updated === previous.updated && record.number > previous.number)) days.set(date, record);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

const DAY = 86400000;
const stamp = date => Date.parse(`${date}T12:00:00Z`);
const iso = time => new Date(time).toISOString().slice(0, 10);
export function weekStart(date) {
  const time = stamp(date);
  return iso(time - (new Date(time).getUTCDay() + 6) % 7 * DAY);
}

export function journalToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const read = type => parts.find(part => part.type === type).value;
  return `${read('year')}-${read('month')}-${read('day')}`;
}

export function weeklyMileage(records, today = journalToday(), count = 12) {
  if (!records.length) return [];
  const end = Math.max(stamp(weekStart(today)), ...records.map(record => stamp(weekStart(record.date))));
  const start = Math.max(Math.min(...records.map(record => stamp(weekStart(record.date)))), end - (count - 1) * 7 * DAY);
  const weeks = [];
  for (let time = start; time <= end; time += 7 * DAY) {
    const startDate = iso(time);
    const days = records.filter(record => record.date >= startDate && record.date <= iso(time + 6 * DAY));
    weeks.push({ date: startDate, miles: days.length ? Number(days.reduce((sum, record) => sum + record.miles, 0).toFixed(3)) : null, days: days.length });
  }
  return weeks;
}

export function marathonHistory(issues, baselines = []) {
  const races = new Map(baselines.filter(result => result.distance === 'Marathon' && normalizeDate(result.date)).map(result => [result.date, result]));
  const submitted = new Map();
  for (const issue of issues) {
    const result = parsePB(issue);
    if (!result || result.distance !== 'Marathon') continue;
    const updated = issue.updated_at || issue.created_at || '';
    const previous = submitted.get(result.date);
    if (!previous || updated > previous.updated || (updated === previous.updated && result.number > previous.number)) submitted.set(result.date, { ...result, updated });
  }
  for (const [date, result] of submitted) races.set(date, result);
  return [...races.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// SVG elements do not reliably reflect the HTML `hidden` attribute through
// the `.hidden` property. The stylesheet checks the attribute directly.
export function setChartVisible(chart, visible) {
  if (visible) chart.removeAttribute('hidden');
  else chart.setAttribute('hidden', '');
}

// SVG charts share dimensions with the weight plot and retain calendar spacing.
export function drawTrendChart(chart, records, { bars = false, unit, format = value => Number(value.toFixed(1)).toString(), summary = '' }) {
  chart.replaceChildren();
  const known = records.filter(record => record.value !== null && Number.isFinite(record.value));
  setChartVisible(chart, known.length > 0);
  if (!known.length) return;
  const svg = (tag, attrs, text) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text) node.textContent = text;
    return node;
  };
  const high = Math.max(...known.map(record => record.value));
  const low = Math.min(...known.map(record => record.value));
  const padding = Math.max(unit === 'h:mm:ss' ? 60 : 1, (high - low) * .15);
  const min = bars ? 0 : Math.max(0, low - padding);
  const max = bars ? Math.max(1, high * 1.12) : high + padding;
  const first = stamp(records[0].date);
  const last = stamp(records.at(-1).date);
  const width = bars ? Math.min(30, 500 / records.length) : 0;
  const x = date => last === first ? 340 : 80 + (stamp(date) - first) / (last - first) * 520;
  const y = value => 24 + (max - value) / (max - min) * 148;
  chart.append(svg('title', {}, summary));
  for (let index = 0; index <= 2; index++) {
    const at = 24 + index * 74;
    chart.append(svg('line', { x1: 64, x2: 616, y1: at, y2: at, stroke: 'var(--border)' }),
      svg('text', { x: 60, y: at + 4, 'text-anchor': 'end', fill: 'var(--secondary)', 'font-size': 11 }, format(max - (max - min) * index / 2)));
  }
  chart.append(svg('text', { x: 8, y: 14, fill: 'var(--secondary)', 'font-size': 12 }, unit),
    svg('text', { x: 64, y: 204, fill: 'var(--secondary)', 'font-size': 12 }, records[0].date),
    svg('text', { x: 616, y: 204, 'text-anchor': 'end', fill: 'var(--secondary)', 'font-size': 12 }, records.at(-1).date));
  if (!bars && known.length > 1) chart.append(svg('polyline', { points: known.map(record => `${x(record.date)},${y(record.value)}`).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2 }));
  for (const record of known) {
    const node = bars && record.value > 0
      ? svg('rect', { x: x(record.date) - width / 2, y: y(record.value), width, height: 172 - y(record.value), rx: 2, fill: 'var(--accent)' })
      : svg('circle', { cx: x(record.date), cy: y(record.value), r: 3, fill: 'var(--accent)' });
    node.append(svg('title', {}, record.label || `${record.date}: ${format(record.value)} ${unit}`));
    chart.append(node);
  }
}
