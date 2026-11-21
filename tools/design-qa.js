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
   And once per theme (Midnight, Light, Dark) on one phone:
     7. contrast   text against what is actually behind it: 4.5:1, or 3:1 for large text (WCAG 1.4.3)
     8. focus      Tab moves through visible controls and each shows a 2 px+ focus ring (WCAG 2.4.7, 2.4.11)
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
// [name, button that opens it, screen it is on (default Today)]
const SHEETS = [['Trends sheet', '[data-action="habit-history"]'], ['Add food sheet', '[data-action="track-food"]'],
  ["Foods you don't eat sheet", '[data-action="dislike-sheet"]', 'plan']];
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
      // Chart labels: SVG text scales with its chart, so measure the size it is drawn at.
      for (const t of scope.querySelectorAll('svg text')) {
        if (!visible(t)) continue;
        const svg = t.ownerSVGElement, vb = svg.viewBox && svg.viewBox.baseVal;
        if (!vb || !vb.width) continue;
        const px = parseFloat(getComputedStyle(t).fontSize) * svg.getBoundingClientRect().width / vb.width;
        if (px < 11.95) { const k = 'chart ' + t.textContent.trim(); if (!seen.has(k)) { seen.add(k); out.push(['text', `chart label "${t.textContent.trim()}" is drawn at ${px.toFixed(1)}px`]); } }
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

/* 7. Text contrast against the colour behind it. Semi-transparent backgrounds are composited up to the first
   solid one; text that sits on the page's gradient is checked against both gradient ends; text on art or
   images can't be judged from the DOM and is skipped. */
async function checkContrast(p, label) {
  return p.evaluate(() => {
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
    const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
    const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const root = getComputedStyle(document.documentElement);
    const tok = (n) => { const d = document.createElement('i'); d.style.color = root.getPropertyValue(n).trim(); document.body.appendChild(d); const c = parse(getComputedStyle(d).color); d.remove(); return c; };
    const pageEnds = [tok('--bg-top'), tok('--bg-bottom')].filter(Boolean);
    const out = [], seen = new Set();
    const scope = document.querySelector('dialog[open]') || document.querySelector('#view');
    for (const el of scope.querySelectorAll('*')) {
      if (el.closest('svg, .sr-only, .art, .thumb, .ex-hero, .hero, .medal, [aria-hidden="true"], :disabled, [aria-disabled="true"]')) continue;
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
      if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      // The selected segment's pill is a ::before on its track; its colour is --accent.
      let backs = null, stack = [];
      if (el.closest('.segmented') && el.closest('[aria-selected="true"], [aria-checked="true"]')) backs = [tok('--accent')];
      for (let a = el; a && !backs; a = a.parentElement) {
        const as = getComputedStyle(a);
        if (as.backgroundImage !== 'none' && a !== document.body && a !== document.documentElement) { stack = null; break; }   // art or gradient: skip
        const bg = parse(as.backgroundColor);
        if (bg && bg.a > 0) { stack.push(bg); if (bg.a >= 1) { backs = [bg]; break; } }
      }
      if (stack === null) continue;
      if (!backs) backs = pageEnds;
      backs = backs.map((b) => stack.slice(0, stack.length - (b === stack[stack.length - 1] ? 1 : 0)).reverse().reduce((acc, layer) => over(layer, acc), b));
      let fg = parse(cs.color); if (!fg) continue;
      const fs = parseFloat(cs.fontSize), large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
      const need = large ? 3 : 4.5;
      const worst = Math.min(...backs.map((b) => ratio(fg.a < 1 ? over(fg, b) : fg, b)));
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30);
      if (worst < need - 0.05 && !seen.has(t)) { seen.add(t); out.push(`"${t}" is ${worst.toFixed(2)}:1, needs ${need}:1`); }
    }
    return out;
  }).then((list) => list.map((msg) => ({ where: label, kind: 'contrast', msg })));
}

/* 8. Keyboard: the first stops of Tab order are visible and show a focus ring. */
async function checkFocus(p, label, stops = 14) {
  const out = [];
  await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  for (let i = 0; i < stops; i++) {
    await p.keyboard.press('Tab');
    const f = await p.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      const name = (e.getAttribute('aria-label') || e.textContent || e.tagName).replace(/\s+/g, ' ').trim().slice(0, 30);
      const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2) || /(\d+(\.\d+)?px\s+){2,3}[1-9]/.test(cs.boxShadow) || (e.matches('input, select, textarea') && cs.boxShadow !== 'none');
      return { name, hidden: !r.width || !r.height || cs.visibility === 'hidden', ring };
    });
    if (!f) continue;
    if (f.hidden) out.push({ where: label, kind: 'focus', msg: `Tab lands on an invisible element ("${f.name}")` });
    else if (!f.ring) out.push({ where: label, kind: 'focus', msg: `"${f.name}" has no visible focus ring` });
  }
  return out;
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
    const ctx = await b.newContext({ ...dev, reducedMotion: 'reduce' });   // measure layout at rest, not mid-animation
    const p = await ctx.newPage();
    p.on('pageerror', (e) => problems.push({ where: phone, kind: 'errors', msg: e.message }));
    p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) problems.push({ where: phone, kind: 'errors', msg: m.text() }); });
    p.on('dialog', (d) => { problems.push({ where: phone, kind: 'errors', msg: `browser ${d.type()}(): ${d.message()}` }); d.dismiss(); });
    // A fresh install whose every day is a training day, so Today shows a session.
    await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
    await p.evaluate(() => { const k = 'pf2_state'; const st = JSON.parse(localStorage.getItem(k)); st.trainingDays = [0, 1, 2, 3, 4, 5, 6];
      // A few weigh-ins and step counts, so the weight chart and Trends bars are drawn and checked too.
      for (let i = 0; i < 8; i++) { const d = new Date(); d.setDate(d.getDate() - i * 3); const day = d.toISOString().slice(0, 10); st.hlog[day + '|weight'] = 116.2 - i * 0.4; st.hlog[day + '|steps'] = 6000 + i * 700; }
      localStorage.setItem(k, JSON.stringify(st)); });
    for (const scale of TEXT_SIZES) {
      for (const s of SCREENS) {
        await p.goto(BASE + '#/' + s); await p.reload(); await p.waitForTimeout(450);
        await setTextSize(p, scale);
        const where = `${phone} · text ${Math.round(scale * 100)}% · #/${s || 'today'}`;
        problems.push(...await check(p, where, scale)); checked++;
        if (scale === 1) await p.screenshot({ path: path.join(OUT, `${phone.replace(/\W+/g, '')}-${(s || 'today').replace(/\W+/g, '-')}.png`), fullPage: true });
      }
      for (const [sheet, opener, route = ''] of SHEETS) {
        await p.goto(BASE + '#/' + route); await p.reload(); await p.waitForTimeout(450);
        const o = await p.$(opener); if (!o) { problems.push({ where: phone, kind: 'errors', msg: `could not open ${sheet}` }); continue; }
        await o.click(); await p.waitForSelector('dialog[open]'); await p.waitForTimeout(250);
        await setTextSize(p, scale);
        problems.push(...await check(p, `${phone} · text ${Math.round(scale * 100)}% · ${sheet}`, scale)); checked++;
        await p.keyboard.press('Escape');
      }
    }
    await ctx.close();
  }
  // Contrast and keyboard focus, once per theme on one phone at the default text size.
  for (const theme of ['midnight', 'light', 'dark']) {
    const ctx = await b.newContext({ ...PHONES[0][1], hasTouch: false, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(400);
    await p.evaluate((t) => { const st = JSON.parse(localStorage.getItem('pf2_state')); st.trainingDays = [0, 1, 2, 3, 4, 5, 6]; st.profile.theme = t; localStorage.setItem('pf2_state', JSON.stringify(st)); }, theme);
    for (const s of SCREENS) {
      await p.goto(BASE + '#/' + s); await p.reload(); await p.waitForTimeout(450);
      const where = `${PHONES[0][0]} · ${theme} · #/${s || 'today'}`;
      problems.push(...await checkContrast(p, where)); checked++;
      if (s === '' || s === 'progress') problems.push(...await checkFocus(p, where));
    }
    for (const [sheet, opener, route = ''] of SHEETS) {
      await p.goto(BASE + '#/' + route); await p.reload(); await p.waitForTimeout(450);
      await p.click(opener); await p.waitForSelector('dialog[open]'); await p.waitForTimeout(250);
      problems.push(...await checkContrast(p, `${PHONES[0][0]} · ${theme} · ${sheet}`)); checked++;
    }
    await ctx.close();
  }
  await b.close();
  // Same problem on many screens or sizes: report it once, with a count.
  const grouped = new Map();
  for (const x of problems) { const k = x.kind + '|' + x.msg; const g = grouped.get(k) || { ...x, n: 0 }; g.n++; grouped.set(k, g); }
  const rows = [...grouped.values()];
  const md = [`# Design QA`, '', `${checked} screen checks: ${PHONES.map((x) => x[0]).join(', ')} at text size ${TEXT_SIZES.map((t) => t * 100 + '%').join(', ')}; contrast and focus in the Midnight, Light and Dark themes.`, '',
    rows.length ? `**${rows.length} problem${rows.length === 1 ? '' : 's'}**` : '**No problems found.**', '',
    ...(rows.length ? ['| Check | Problem | First seen | Times |', '|---|---|---|---|', ...rows.map((r) => `| ${r.kind} | ${r.msg.replace(/\|/g, '/')} | ${r.where} | ${r.n} |`)] : [])].join('\n');
  fs.writeFileSync(path.join(OUT, 'design-qa.md'), md + '\n');
  console.log(md);
  process.exit(rows.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
