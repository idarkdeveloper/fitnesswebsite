/* Design QA: the checks that would have caught this app's real layout bugs before merge.
   Needs Playwright with Chromium. Serve the repo first:  python3 -m http.server 8765
   Then:  node tools/design-qa.js [http://localhost:8765/] [out-dir]

   For each phone width x Android text size x screen it checks:
     1. width      nothing sticks out past the screen (the 1,524 px Progress page, PR #53)
     2. targets    every control is at least 24 x 24 px (WCAG 2.2 SC 2.5.8; DESIGN.md aims for 44)
     3. text       no text under 12 px, at the default text size (DESIGN.md type scale)
     4. icons      no inline icon blown up past 48 px by a missing size (the squeezed card, PR #52)
     5. menu       the bottom menu spans the screen, no wider, and stays compact
     6. errors     no page errors, console errors or browser confirm()/alert() pop-ups
   It writes design-qa.md (a table of every problem) and a screenshot per phone and screen,
   and exits 1 when anything fails. */
const { chromium, devices } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = (process.argv[2] || 'http://localhost:8765/').replace(/\/?$/, '/');
const OUT = process.argv[3] || 'design-qa';
const PHONES = [['Galaxy S24', devices['Galaxy S24']], ['Galaxy S8', devices['Galaxy S8']], ['Pixel 7', devices['Pixel 7']]];
const TEXT_SIZES = [1, 1.3, 1.6];                     // Android font size setting, as the app's WebView applies it
const SCREENS = ['', 'track', 'movements', 'category/pushups', 'exercise/wall-pushups', 'progress', 'profile', 'plan'];
const SHEETS = [['Trends sheet', '[data-action="habit-history"]'], ['Add food sheet', '[data-action="track-food"]']];
const BIG_ART = '.art, .ring-wrap, .wchart, .habit-chart, .medal, .hero, .celebrate, .lv-art, .ex-hero, .thumb';

async function check(p, label, scale) {
  return p.evaluate(({ scale, BIG_ART }) => {
    const vw = document.documentElement.clientWidth, out = [];
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !el.closest('[hidden], [inert]'); };
    const name = (el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).replace(/\s+/g, ' ').trim().slice(0, 40);
    const scrollClipped = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible' && a.getBoundingClientRect().right <= vw + 1) return true; } return false; };
    const scope = document.querySelector('dialog[open]') || document.querySelector('#view');
    // 1. width
    for (const el of scope.querySelectorAll('*')) {
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
      const r = el.getBoundingClientRect();
      if (r.width && (r.right > vw + 1 || r.left < -1) && !scrollClipped(el)) { out.push(['width', `${name(el)} reaches ${Math.round(r.right)} px on a ${vw} px screen`]); break; }
    }
    // 2. targets
    for (const el of scope.querySelectorAll('button, a[href], input:not([type=hidden]), select, [role=tab], [role=switch]')) {
      if (!visible(el)) continue;
      // A checkbox or radio inside its <label>: the whole label is the target.
      const r = (el.matches('input[type=checkbox], input[type=radio]') && el.closest('label') ? el.closest('label') : el).getBoundingClientRect();
      const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline';
      if (!inline && (r.width < 24 || r.height < 24)) out.push(['targets', `"${name(el)}" is ${Math.round(r.width)} x ${Math.round(r.height)} px`]);
    }
    // 3. text (default text size only: larger settings make everything bigger)
    if (scale === 1) {
      const seen = new Set();
      for (const el of scope.querySelectorAll('*')) {
        if (!visible(el) || el.closest('svg')) continue;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (own && fs < 12 && !el.closest('.sr-only')) { const t = name(el); if (!seen.has(t)) { seen.add(t); out.push(['text', `"${t}" is ${fs}px`]); } }
      }
    }
    // 4. icons
    for (const s of scope.querySelectorAll('svg')) {
      if (!visible(s) || s.closest(BIG_ART)) continue;
      const r = s.getBoundingClientRect();
      if (r.width > 48 || r.height > 48) out.push(['icons', `icon in "${name(s.parentElement)}" is ${Math.round(r.width)} x ${Math.round(r.height)} px`]);
    }
    // 5. menu
    const nav = document.querySelector('nav.tabbar');
    if (nav && getComputedStyle(nav).display !== 'none' && !document.querySelector('dialog[open]')) {
      const r = nav.getBoundingClientRect();
      if (Math.round(r.width) !== vw) out.push(['menu', `bottom menu is ${Math.round(r.width)} px wide on a ${vw} px screen`]);
      if (r.height > 72 * Math.max(1, scale * 0.85)) out.push(['menu', `bottom menu is ${Math.round(r.height)} px tall`]);
    }
    return out;
  }, { scale, BIG_ART }).then((list) => list.map(([kind, msg]) => ({ where: label, kind, msg })));
}

async function setTextSize(p, scale) {
  if (scale === 1) return;
  await p.evaluate((z) => {
    const els = [...document.querySelectorAll('body *')].filter((el) => !el.closest('svg'));
    const sizes = els.map((el) => parseFloat(getComputedStyle(el).fontSize));
    els.forEach((el, i) => { el.style.fontSize = sizes[i] * z + 'px'; });
  }, scale);
  await p.waitForTimeout(100);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const problems = [];
  let checked = 0;
  for (const [phone, dev] of PHONES) {
    const ctx = await b.newContext({ ...dev });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => problems.push({ where: phone, kind: 'errors', msg: e.message }));
    p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) problems.push({ where: phone, kind: 'errors', msg: m.text() }); });
    p.on('dialog', (d) => { problems.push({ where: phone, kind: 'errors', msg: `browser ${d.type()}(): ${d.message()}` }); d.dismiss(); });
    // A fresh install whose every day is a training day, so Today shows a session.
    await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
    await p.evaluate(() => { const k = 'pf2_state'; const st = JSON.parse(localStorage.getItem(k)); st.trainingDays = [0, 1, 2, 3, 4, 5, 6]; localStorage.setItem(k, JSON.stringify(st)); });
    for (const scale of TEXT_SIZES) {
      for (const s of SCREENS) {
        await p.goto(BASE + '#/' + s); await p.reload(); await p.waitForTimeout(450);
        await setTextSize(p, scale);
        const where = `${phone} · text ${Math.round(scale * 100)}% · #/${s || 'today'}`;
        problems.push(...await check(p, where, scale)); checked++;
        if (scale === 1) await p.screenshot({ path: path.join(OUT, `${phone.replace(/\W+/g, '')}-${(s || 'today').replace(/\W+/g, '-')}.png`), fullPage: true });
      }
      for (const [sheet, opener] of SHEETS) {
        await p.goto(BASE + '#/'); await p.reload(); await p.waitForTimeout(450);
        const o = await p.$(opener); if (!o) { problems.push({ where: phone, kind: 'errors', msg: `could not open ${sheet}` }); continue; }
        await o.click(); await p.waitForSelector('dialog[open]'); await p.waitForTimeout(250);
        await setTextSize(p, scale);
        problems.push(...await check(p, `${phone} · text ${Math.round(scale * 100)}% · ${sheet}`, scale)); checked++;
        await p.keyboard.press('Escape');
      }
    }
    await ctx.close();
  }
  await b.close();
  // Same problem on many screens or sizes: report it once, with a count.
  const grouped = new Map();
  for (const x of problems) { const k = x.kind + '|' + x.msg; const g = grouped.get(k) || { ...x, n: 0 }; g.n++; grouped.set(k, g); }
  const rows = [...grouped.values()];
  const md = [`# Design QA`, '', `${checked} screen checks: ${PHONES.map((x) => x[0]).join(', ')} at text size ${TEXT_SIZES.map((t) => t * 100 + '%').join(', ')}.`, '',
    rows.length ? `**${rows.length} problem${rows.length === 1 ? '' : 's'}**` : '**No problems found.**', '',
    ...(rows.length ? ['| Check | Problem | First seen | Times |', '|---|---|---|---|', ...rows.map((r) => `| ${r.kind} | ${r.msg.replace(/\|/g, '/')} | ${r.where} | ${r.n} |`)] : [])].join('\n');
  fs.writeFileSync(path.join(OUT, 'design-qa.md'), md + '\n');
  console.log(md);
  process.exit(rows.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
