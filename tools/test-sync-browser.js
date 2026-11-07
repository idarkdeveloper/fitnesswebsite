#!/usr/bin/env node
/* End-to-end sync test: two isolated browser profiles ("phone" and "laptop") run the real app
   against an in-memory fake cloud that behaves like the Supabase table (version check included).
   Needs Playwright with Chromium. Serve the repo first:  python3 -m http.server 8765
   Then:  node tools/test-sync-browser.js [http://localhost:8765/] */
'use strict';
const { chromium } = require('playwright');
const assert = require('assert');
const BASE = process.argv[2] || 'http://localhost:8765/';

const cloud = { doc: null, version: 0, puts: 0, conflicts: 0, delayNextPut: 0 };
const fakeAdapter = `
  window.__PF_SYNC_ADAPTER__ = {
    _user: { id: 'owner-1', email: 'me@example.com' },
    init(onAuth) { this._onAuth = onAuth; return Promise.resolve(this._user); },
    user() { return this._user; },
    signInGoogle: async () => {}, signInEmail: async () => {},
    async signOut() { this._user = null; },
    getDoc: () => window.__cloudGet(),
    putDoc: (doc, version) => window.__cloudPut(doc, version),
    deleteDoc: () => window.__cloudDelete(),
  };`;

async function device(browser, name, errors) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 900 }, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await page.route('**/*.supabase.co/**', (r) => r.abort());   // tests never touch the real project
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
  page.on('dialog', (d) => d.accept());
  await page.exposeFunction('__cloudGet', () => (cloud.doc ? { doc: JSON.parse(JSON.stringify(cloud.doc)), version: cloud.version } : null));
  await page.exposeFunction('__cloudPut', async (doc, version) => {
    if (cloud.delayNextPut) { const ms = cloud.delayNextPut; cloud.delayNextPut = 0; await new Promise((r) => setTimeout(r, ms)); }
    if ((version == null && cloud.doc) || (version != null && version !== cloud.version)) { cloud.conflicts++; return { conflict: true }; }
    cloud.doc = doc; cloud.version += 1; cloud.puts++;
    return { version: cloud.version };
  });
  await page.exposeFunction('__cloudDelete', () => { cloud.doc = null; cloud.version = 0; });
  await page.addInitScript(fakeAdapter);
  await page.goto(BASE + '#/profile');
  await page.waitForFunction(() => window.PFSync && window.PFSync.status().ready);
  return page;
}

/** Ask a device to sync and wait until that run has finished. */
async function sync(page) {
  const before = await page.evaluate(() => window.PFSync.status().lastSynced);
  await page.evaluate(() => window.PFSync.syncNow());
  await page.waitForFunction((b) => { const s = window.PFSync.status(); return s.state === 'ok' && s.lastSynced !== b; }, before, { timeout: 10000 });
}
const addWorkout = (page, id, progId, level) => page.evaluate(([id, progId, level]) => {
  const s = window.PF_APP.getState();
  s.workouts.push({ id, at: new Date().toISOString(), routineName: 'Test', entries: [{ progId, level, values: [10, 10], passed: true }] });
  s.levels[progId] = Math.max(s.levels[progId] || 0, level);
  window.save();
}, [id, progId, level]);
const ids = (page) => page.evaluate(() => window.PF_APP.getState().workouts.map((w) => w.id).sort());

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const phone = await device(browser, 'phone', errors);
  const laptop = await device(browser, 'laptop', errors);
  const step = (m) => console.log('  ok  ' + m);

  await sync(phone); await sync(laptop);

  await addWorkout(phone, 'p1', 'wall-pushups', 2);
  await addWorkout(laptop, 'l1', 'wall-pushups', 1);
  await sync(phone); await sync(laptop); await sync(phone);
  assert.deepStrictEqual(await ids(phone), ['l1', 'p1']);
  assert.deepStrictEqual(await ids(laptop), ['l1', 'p1']);
  assert.strictEqual(await laptop.evaluate(() => window.PF_APP.getState().levels['wall-pushups']), 2);
  step('workouts logged offline on both devices end up on both');

  await phone.click('button[data-action="theme"][data-theme="light"]');
  await sync(phone); await sync(laptop);
  assert.strictEqual(await laptop.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light');
  step('theme picked in the UI on the phone applies on the laptop');

  await laptop.evaluate(() => { const s = window.PF_APP.getState(); s.workouts = s.workouts.filter((w) => w.id !== 'p1'); window.save(); });
  await sync(laptop); await sync(phone);
  assert.deepStrictEqual(await ids(phone), ['l1']);
  step('a workout deleted on the laptop disappears on the phone');

  // Both devices save at once; the phone's upload is held back so the laptop wins the race.
  await addWorkout(phone, 'p2', 'squats', 1);
  await addWorkout(laptop, 'l2', 'squats', 3);
  cloud.delayNextPut = 800;
  const conflictsBefore = cloud.conflicts;
  await Promise.all([sync(phone), sync(laptop)]);
  await sync(phone); await sync(laptop);
  assert.ok(cloud.conflicts > conflictsBefore, 'expected a version conflict');
  assert.deepStrictEqual(await ids(phone), ['l1', 'l2', 'p2']);
  assert.deepStrictEqual(await ids(laptop), ['l1', 'l2', 'p2']);
  step(`simultaneous saves converge (conflicts retried: ${cloud.conflicts - conflictsBefore})`);

  // Import while signed in merges.
  const file = { workouts: [{ id: 'f1', at: '2026-01-01T10:00:00Z', routineName: 'Old', entries: [] }], levels: { squats: 1, lunges: 2 }, profile: { theme: 'dark' } };
  await phone.setInputFiles('#importFile', { name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(file)) });
  await phone.waitForFunction(() => window.PF_APP.getState().workouts.some((w) => w.id === 'f1'));
  assert.strictEqual(await phone.evaluate(() => window.PF_APP.getState().profile.theme), 'light');
  assert.strictEqual(await phone.evaluate(() => window.PF_APP.getState().levels.squats), 3);
  await sync(phone); await sync(laptop);
  assert.deepStrictEqual(await ids(laptop), ['f1', 'l1', 'l2', 'p2']);
  step('import while signed in merges and syncs (settings kept)');

  // Track tab data: a weigh-in and a meal on the phone appear on the laptop.
  await phone.evaluate(() => {
    const st = window.PF_APP.getState();
    st.hlog['2026-11-07|weight'] = 114.6;
    st.meals.push({ id: 'meal-1', day: '2026-11-07', at: new Date().toISOString(), name: 'Oats', kcal: 380, protein: 13 });
    window.save();
  });
  await sync(phone); await sync(laptop);
  assert.strictEqual(await laptop.evaluate(() => window.PF_APP.getState().hlog['2026-11-07|weight']), 114.6);
  assert.deepStrictEqual(await laptop.evaluate(() => window.PF_APP.getState().meals.map((m) => m.name)), ['Oats']);
  step('Track tab weigh-ins and meals sync between devices');

  // Reset on the phone beats unsynced work on the laptop, which gets a backup.
  await addWorkout(laptop, 'l3', 'lunges', 1);       // not synced yet
  await phone.click('button[data-action="reset"]');
  await sync(phone); await sync(laptop);
  assert.deepStrictEqual(await ids(laptop), []);
  assert.deepStrictEqual(await laptop.evaluate(() => window.PF_APP.getState().levels), {});
  const rec = await laptop.evaluate(() => window.PFSync.recovery());
  assert.ok(rec && rec.state.workouts.some((w) => w.id === 'l3'), 'laptop should keep a backup with l3');
  await laptop.evaluate(() => { location.hash = '#/home'; location.hash = '#/profile'; });
  await laptop.waitForSelector('button[data-action="sync-recovery"]');
  step('reset wins everywhere; the laptop offers a backup of what it lost');

  assert.ok(!JSON.stringify(cloud.doc).includes('reminder'), 'reminder must stay local');
  await phone.screenshot({ path: process.env.SHOT || '/dev/null' }).catch(() => {});
  assert.deepStrictEqual(errors, [], 'console errors:\n' + errors.join('\n'));
  step('no console errors or CSP violations');

  // Not configured: no adapter, empty config → app works, card says not set up.
  const ctx = await browser.newContext({ serviceWorkers: 'block' }); const plain = await ctx.newPage(); const errs = [];
  await plain.route('**/sync-config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: "window.PF_SYNC_CONFIG = { url: '', anonKey: '' };" }));
  plain.on('pageerror', (e) => errs.push(e.message)); plain.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await plain.goto(BASE + '#/profile');
  await plain.waitForSelector('text=Stored on this device');
  assert.deepStrictEqual(errs, []);
  step('without sync settings the app runs fully local');

  await browser.close();
  console.log(`\nall browser checks passed (cloud version ${cloud.version}, uploads ${cloud.puts})`);
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
