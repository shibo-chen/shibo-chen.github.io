import { REPOSITORY, FIELDS, parseEntry, dailyEntries } from './journal-data.mjs?v=20261102-date-fix';
import { DISTANCES, REFERENCE_BQ_SECONDS, formatTime, personalBests } from './journal-pb.mjs?v=20261102-date-fix';
import { parseWeight, weightRecords, weightChart } from './journal-weight.mjs?v=20261102-date-fix';

const root = document.querySelector('[data-journal]');
if (root) {
  const zh = root.dataset.lang === 'zh';
  const say = (cn, en) => zh ? cn : en;
  const status = document.getElementById('journal-status');
  const api = `https://api.github.com/repos/${REPOSITORY}/issues`;
  const originalURL = number => `https://github.com/${REPOSITORY}/issues/${number}`;
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  async function request(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' },
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error(`GitHub ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function failure(message) {
    status.replaceChildren(document.createTextNode(message + ' '));
    const link = element('a', say('直接在 GitHub 阅读 ↗', 'Read on GitHub ↗'), 'journal-source');
    link.href = `https://github.com/${REPOSITORY}/issues?q=is%3Aissue+author%3Ashibo-chen+%22%5BBQ+Journal%5D%22`;
    status.append(link);
  }
  if (root.dataset.journal === 'entry') {
    const id = new URLSearchParams(location.search).get('id') || '';
    if (!/^[1-9]\d{0,9}$/.test(id)) {
      failure(say('这条日志链接无效，请返回所有日志重新打开。', 'This entry link is invalid. Please return to all entries.'));
    } else {
      request(`${api}/${id}`).then(issue => {
        const entry = parseEntry(issue);
        if (!entry) throw new Error('Not a journal entry');
        const title = entry.headline || say('每日记录', 'Daily entry');
        document.title = `${entry.date} · ${title} | BQ Journal`;
        document.getElementById('journal-title').textContent = title;
        const date = document.getElementById('journal-date');
        date.textContent = entry.date;
        date.dateTime = entry.date;
        const body = document.getElementById('journal-body');
        for (const [key, label] of FIELDS) {
          const section = element('section');
          section.append(element('h2', label.split(' / ')[zh ? 0 : 1]),
            element('p', entry[key] || say('未记录。', 'Not recorded.'), 'journal-entry-text'));
          body.append(section);
        }
        const source = document.getElementById('journal-original');
        source.href = originalURL(entry.number);
        source.hidden = false;
        status.textContent = '';
      }).catch(() => failure(say('暂时无法读取这条日志，请稍后刷新。', 'Unable to load this entry. Please refresh shortly.')));
    }
  } else {
    const list = document.getElementById('journal-entries');
    const refresh = document.getElementById('journal-refresh');
    const more = document.getElementById('journal-more');
    let page = 0;
    let issues = [];
    let busy = false;
    const baselineNode = document.getElementById('journal-pb-baseline');
    const baselines = baselineNode ? JSON.parse(baselineNode.textContent) : [];
    const pbStatus = document.getElementById('journal-pb-status');
    const weightStatus = document.getElementById('journal-weight-status');
    function renderWeight() {
      const records = weightRecords(issues);
      const history = document.getElementById('journal-weight-history');
      const table = document.getElementById('journal-weights');
      const chart = document.getElementById('journal-weight-chart');
      const summary = document.getElementById('journal-weight-summary');
      history.hidden = chart.hidden = !records.length;
      chart.replaceChildren();
      table.replaceChildren();
      if (!records.length) {
        summary.textContent = say('还没有体重记录，填入第一条就可以开始。', 'No weight records yet. Add the first one to get started.');
        return;
      }
      const first = records[0];
      const latest = records.at(-1);
      const delta = Number((latest.kg - first.kg).toFixed(2));
      const change = `${delta > 0 ? '+' : ''}${delta} kg`;
      summary.textContent = say(`最新：${latest.kg} kg（${latest.date}） · 相对首条记录：${change} · 共 ${records.length} 天`,
        `Latest: ${latest.kg} kg (${latest.date}) · Change since first record: ${change} · ${records.length} days logged`);
      const svg = (tag, attrs, text) => {
        const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
        if (text) node.textContent = text;
        return node;
      };
      const plot = weightChart(records);
      chart.append(svg('title', {}, summary.textContent));
      for (let index = 0; index <= 2; index++) {
        const y = 24 + index * 74;
        const kg = plot.max - index / 2 * (plot.max - plot.min);
        chart.append(svg('line', { x1: 64, x2: 616, y1: y, y2: y, stroke: 'var(--border)' }),
          svg('text', { x: 56, y: y + 4, 'text-anchor': 'end', fill: 'var(--secondary)', 'font-size': 12 }, `${kg.toFixed(1)}`));
      }
      chart.append(svg('text', { x: 10, y: 14, fill: 'var(--secondary)', 'font-size': 12 }, 'kg'),
        svg('text', { x: 64, y: 204, fill: 'var(--secondary)', 'font-size': 12 }, first.date),
        svg('text', { x: 616, y: 204, 'text-anchor': 'end', fill: 'var(--secondary)', 'font-size': 12 }, latest.date),
        svg('polyline', { points: plot.points.map(point => `${point.x},${point.y}`).join(' '), fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2 }));
      for (const point of plot.points) {
        const dot = svg('circle', { cx: point.x, cy: point.y, r: 3, fill: 'var(--accent)' });
        dot.append(svg('title', {}, `${point.date}: ${point.kg} kg`));
        chart.append(dot);
      }
      for (const record of [...records].reverse()) {
        const row = element('tr');
        const edit = element('a', say('查看 / 修改 ↗', 'View / edit ↗'));
        edit.href = originalURL(record.number);
        const source = element('td');
        source.append(edit);
        row.append(element('td', record.date), element('td', String(record.kg)), element('td', record.note || '—'), source);
        table.append(row);
      }
    }
    function renderPB() {
      const table = document.getElementById('journal-pbs');
      const bests = personalBests(issues, baselines);
      table.replaceChildren();
      for (const distance of DISTANCES) {
        const result = bests.get(distance);
        const row = element('tr');
        const label = distance === 'Half marathon' ? say('半马', distance) : distance === 'Marathon' ? say('全马', distance) : distance;
        const heading = element('th', label);
        heading.scope = 'row';
        const race = element('td', result ? (zh && result.raceZh ? result.raceZh : result.race) || say('比赛待补', 'Race details pending') : say('待记录', 'Not recorded'));
        if (result?.number || result?.sourceURL) {
          race.textContent = '';
          const link = element('a', zh && result.raceZh ? result.raceZh : result.race);
          link.href = result.number ? originalURL(result.number) : result.sourceURL;
          race.append(link);
        }
        const displayTime = result ? (result.precisionMinute ? `${formatTime(result.seconds).slice(0, -3)} ${say('（时:分）', '(h:mm)')}` : formatTime(result.seconds)) : '—';
        row.append(heading, element('td', displayTime), element('td', result?.date || '—'), race);
        table.append(row);
      }
      const marathon = bests.get('Marathon');
      const gap = document.getElementById('journal-pb-gap');
      if (marathon) {
        const difference = marathon.seconds - REFERENCE_BQ_SECONDS;
        gap.textContent = difference > 0
          ? say(`全马 PB 比 2027 年男子 18–34 岁参考标准 2:55:00 慢${marathon.precisionMinute ? '约' : ''} ${formatTime(difference)}。`, `Marathon PB is ${marathon.precisionMinute ? 'approximately ' : ''}${formatTime(difference)} slower than the 2027 men's 18–34 reference standard of 2:55:00.`)
          : difference === 0
            ? say('全马 PB 与 2027 年男子 18–34 岁参考标准 2:55:00 相同。', "Marathon PB equals the 2027 men's 18–34 reference standard of 2:55:00.")
            : say(`全马 PB 比 2027 年男子 18–34 岁参考标准 2:55:00 快${marathon.precisionMinute ? '约' : ''} ${formatTime(-difference)}。`, `Marathon PB is ${marathon.precisionMinute ? 'approximately ' : ''}${formatTime(-difference)} faster than the 2027 men's 18–34 reference standard of 2:55:00.`);
        gap.textContent += say(' 此处仅比较时间；比赛认证、有效窗口和赛道调整仍需单独核对。', ' Time comparison only; certification, qualifying window and course adjustments still need checking.');
      } else gap.textContent = say('录入全马成绩后，会显示与 2:55:00 历史参考标准的时间差。', 'Add a marathon result to see its time difference from the historical 2:55:00 reference standard.');
    }
    function render() {
      list.querySelectorAll('[data-live]').forEach(node => node.remove());
      const entries = dailyEntries(issues);
      const liveDates = new Set(entries.map(entry => entry.date));
      list.querySelectorAll('[data-date]').forEach(node => { node.hidden = liveDates.has(node.dataset.date); });
      for (const entry of entries) {
        const card = element('article', '', 'journal-card');
        card.dataset.live = 'true';
        card.dataset.date = entry.date;
        const date = element('time', entry.date);
        date.dateTime = entry.date;
        const heading = element('h3');
        heading.textContent = entry.headline || say('每日记录', 'Daily entry');
        const body = element('div', '', 'post-content');
        const weight = parseWeight(entry.weight);
        if (weight !== null) body.append(element('p', say(`体重：${weight} kg`, `Weight: ${weight} kg`), 'journal-help'));
        for (const [key, label] of FIELDS) {
          const section = element('section');
          section.append(element('h4', label.split(' / ')[zh ? 0 : 1]),
            element('p', entry[key] || say('未记录。', 'Not recorded.'), 'journal-entry-text'));
          body.append(section);
        }
        const edit = element('a', say('修改这条记录 ↗', 'Edit this entry ↗'), 'journal-source');
        edit.href = originalURL(entry.number);
        card.append(date, heading, body, edit);
        list.append(card);
      }
      [...list.children].sort((a, b) => b.dataset.date.localeCompare(a.dataset.date)).forEach(node => list.append(node));
      renderPB();
      renderWeight();
    }
    async function load(reset = false) {
      if (busy) return;
      busy = true;
      refresh.disabled = more.disabled = true;
      status.textContent = say('正在读取最新记录…', 'Loading the latest entries…');
      pbStatus.textContent = say('正在核对全部历史成绩…', 'Checking all historical results…');
      weightStatus.textContent = say('正在同步体重记录…', 'Syncing weight records…');
      try {
        let next = reset ? 1 : page + 1;
        while (true) {
          const data = await request(`${api}?creator=shibo-chen&state=all&sort=created&direction=desc&per_page=100&page=${next}`);
          if (!Array.isArray(data)) throw new Error('Unexpected response');
          issues = reset && next === 1 ? data : issues.concat(data);
          page = next;
          render();
          more.hidden = data.length < 100;
          if (data.length < 100) break;
          next += 1;
        }
        pbStatus.textContent = say('已核对全部已提交成绩；每个距离显示最快一场。', 'All submitted results checked; fastest result shown for each distance.');
        weightStatus.textContent = say('体重记录已同步。', 'Weight records are up to date.');
        status.textContent = say('已同步。新提交后点「刷新」即可看到。', 'Up to date. Refresh here after submitting a new entry.');
      } catch {
        pbStatus.textContent = say('未能核对完整历史成绩；当前 PB 可能不完整，请刷新重试。', 'Could not check the full result history; displayed PBs may be incomplete. Refresh to retry.');
        weightStatus.textContent = say('未能同步全部体重记录；已显示的数据可能不完整，请刷新重试。', 'Could not sync all weight records. Displayed data may be incomplete; refresh to retry.');
        failure(say('暂时无法同步最新记录（网络或访问频率限制）。已显示的记录仍可阅读，请稍后刷新。',
          'Unable to sync new entries (connection or rate limit). Existing entries remain readable; please refresh shortly.'));
      } finally {
        busy = false;
        refresh.disabled = more.disabled = false;
      }
    }
    refresh.addEventListener('click', () => load(true));
    more.addEventListener('click', () => load());
    renderPB();
    load();
  }
}
