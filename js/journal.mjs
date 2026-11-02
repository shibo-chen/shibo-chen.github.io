import { REPOSITORY, FIELDS, parseEntry, dailyEntries } from './journal-data.mjs';

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
    function render() {
      list.querySelectorAll('[data-live]').forEach(node => node.remove());
      const entries = dailyEntries(issues);
      const liveDates = new Set(entries.map(entry => entry.date));
      list.querySelectorAll('[data-date]').forEach(node => { node.hidden = liveDates.has(node.dataset.date); });
      for (const entry of entries) {
        const url = `${root.dataset.entryUrl}?id=${entry.number}`;
        const card = element('article', '', 'journal-card');
        card.dataset.live = 'true';
        card.dataset.date = entry.date;
        const date = element('time', entry.date);
        date.dateTime = entry.date;
        const heading = element('h3');
        const title = element('a', entry.headline || say('每日记录', 'Daily entry'));
        title.href = url;
        heading.append(title);
        const preview = entry.training.replace(/\s+/g, ' ');
        const read = element('a', say('阅读记录 →', 'Read entry →'), 'journal-read');
        read.href = url;
        card.append(date, heading, element('p', preview.slice(0, 180) + (preview.length > 180 ? '…' : '')), read);
        list.append(card);
      }
      [...list.children].sort((a, b) => b.dataset.date.localeCompare(a.dataset.date)).forEach(node => list.append(node));
    }
    async function load(reset = false) {
      if (busy) return;
      busy = true;
      refresh.disabled = more.disabled = true;
      status.textContent = say('正在读取最新记录…', 'Loading the latest entries…');
      try {
        const next = reset ? 1 : page + 1;
        const data = await request(`${api}?creator=shibo-chen&state=all&sort=created&direction=desc&per_page=100&page=${next}`);
        if (!Array.isArray(data)) throw new Error('Unexpected response');
        issues = reset ? data : issues.concat(data);
        page = next;
        render();
        more.hidden = data.length < 100;
        status.textContent = say('已同步。新提交后点「刷新」即可看到。', 'Up to date. Refresh here after submitting a new entry.');
      } catch {
        failure(say('暂时无法同步最新记录（网络或访问频率限制）。已显示的记录仍可阅读，请稍后刷新。',
          'Unable to sync new entries (connection or rate limit). Existing entries remain readable; please refresh shortly.'));
      } finally {
        busy = false;
        refresh.disabled = more.disabled = false;
      }
    }
    refresh.addEventListener('click', () => load(true));
    more.addEventListener('click', () => load());
    load();
  }
}
