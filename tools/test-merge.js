#!/usr/bin/env node
/* Unit tests for sync-core.js. Plain Node, no dependencies:  node tools/test-merge.js */
'use strict';
const assert = require('assert');
const C = require('../sync-core.js');

let passed = 0;
const test = (name, fn) => {
  try { fn(); passed++; console.log('  ok  ' + name); } catch (e) { console.error('  FAIL ' + name + '\n' + e.stack); process.exitCode = 1; }
};

/* ---- A tiny simulation of devices and the cloud row ---- */
let clock = Date.parse('2026-11-07T10:00:00Z');
const tick = (ms = 1000) => new Date((clock += ms)).toISOString();
const now = () => new Date(clock).toISOString();

const base = () => ({
  v: 1, profile: { name: '', email: 'me@example.com', theme: 'midnight', pro: false },
  routineId: 'foundation', trainingDays: [1, 2, 4, 5], restSeconds: 90,
  current: {}, levels: {}, workouts: [], joined: {},
  reminder: { enabled: false, time: '18:00', lastNotified: '' }, challengeStart: null,
});
const device = (state = base()) => {
  const d = { state, meta: C.emptyMeta() };
  d.meta = C.noteSave(d.meta, d.state, now()); // first snapshot, no stamps
  return d;
};
const edit = (d, fn) => { fn(d.state); d.meta = C.noteSave(d.meta, d.state, tick()); };
const reset = (d) => { const t = d.state.profile.theme; d.state = base(); d.state.profile.theme = t; d.meta = C.noteReset(d.meta, d.state); };
let wid = 0;
let mid = 0;
const logWorkout = (d, progId = 'wall-pushups', level = 1) => {
  const w = { id: 'w' + (++wid), at: tick(), routineName: 'R', entries: [{ progId, level, values: [10], passed: true }] };
  edit(d, (s) => { s.workouts.push(w); s.levels[progId] = Math.max(s.levels[progId] || 0, level); });
  return w.id;
};
const cloud = () => ({ doc: null, version: null });

/** One sync run, as sync.js does it (without the network). Returns {lostLocal}. */
function sync(d, c) {
  const local = C.toDoc(d.state, d.meta);
  const { doc, lostLocal } = C.merge(local, c.doc, now());
  d.state = C.applyDoc(d.state, doc);
  d.meta = C.metaFromDoc(doc, d.state);
  if (!c.doc || C.stable(doc) !== C.stable(c.doc)) { c.doc = JSON.parse(JSON.stringify(doc)); c.version = (c.version || 0) + 1; }
  return { lostLocal };
}
const synced = (d) => C.stable(C.pick(d.state));

/* ---- Tests ---- */
console.log('sync-core');

test('offline workouts on two devices both survive', () => {
  const c = cloud(); const a = device(); const b = device();
  const x = logWorkout(a); const y = logWorkout(b);
  sync(a, c); sync(b, c); sync(a, c);
  for (const d of [a, b]) assert.deepStrictEqual(d.state.workouts.map((w) => w.id).sort(), [x, y].sort());
  assert.strictEqual(synced(a), synced(b));
});

test('newer setting wins, older one does not come back', () => {
  const c = cloud(); const a = device(); const b = device();
  edit(b, (s) => { s.profile.theme = 'light'; });
  edit(a, (s) => { s.profile.theme = 'dark'; });           // later
  sync(b, c); sync(a, c); sync(b, c);
  assert.strictEqual(a.state.profile.theme, 'dark');
  assert.strictEqual(b.state.profile.theme, 'dark');
});

test('a deleted workout stays deleted', () => {
  const c = cloud(); const a = device(); const b = device();
  const x = logWorkout(a); sync(a, c); sync(b, c);
  edit(a, (s) => { s.workouts = s.workouts.filter((w) => w.id !== x); });
  sync(b, c); sync(a, c); sync(b, c);
  assert.ok(!a.state.workouts.some((w) => w.id === x));
  assert.ok(!b.state.workouts.some((w) => w.id === x));
});

test('levels take the highest value', () => {
  const c = cloud(); const a = device(); const b = device();
  edit(a, (s) => { s.levels.squats = 2; }); edit(b, (s) => { s.levels.squats = 1; s.levels.lunges = 3; });
  sync(a, c); sync(b, c); sync(a, c);
  assert.deepStrictEqual(a.state.levels, { squats: 2, lunges: 3 });
  assert.deepStrictEqual(b.state.levels, { squats: 2, lunges: 3 });
});

test('moving a progression down and leaving a ladder sync', () => {
  const c = cloud(); const a = device(); const b = device();
  edit(a, (s) => { s.current.push = 4; s.joined.pushup = '2026-11-01'; }); sync(a, c); sync(b, c);
  edit(b, (s) => { s.current.push = 2; delete s.joined.pushup; }); sync(b, c); sync(a, c);
  assert.strictEqual(a.state.current.push, 2);
  assert.ok(!('pushup' in a.state.joined));
});

test('reset wins over unsynced work elsewhere, and flags the loss', () => {
  const c = cloud(); const a = device(); const b = device();
  logWorkout(a); sync(a, c); sync(b, c);
  logWorkout(b);                                           // offline on b
  reset(a); sync(a, c);
  const r = sync(b, c);
  assert.strictEqual(r.lostLocal, true);
  assert.strictEqual(b.state.workouts.length, 0);
  assert.deepStrictEqual(b.state.levels, {});
  assert.strictEqual(synced(a), synced(b));
  logWorkout(b); sync(b, c); sync(a, c);                   // life goes on in the new generation
  assert.strictEqual(a.state.workouts.length, 1);
});

test('device-local fields never leave the device', () => {
  const c = cloud(); const a = device(); const b = device();
  edit(a, (s) => { s.reminder.enabled = true; s.profile.email = 'secret@example.com'; });
  sync(a, c); sync(b, c);
  assert.ok(!JSON.stringify(c.doc).includes('secret@example.com'));
  assert.ok(!('reminder' in c.doc.data));
  assert.strictEqual(b.state.reminder.enabled, false);
  assert.strictEqual(b.state.profile.email, 'me@example.com');
});

test('first sign-in keeps unstamped local progress the cloud lacks', () => {
  const c = cloud(); const a = device(); edit(a, (s) => { s.profile.theme = 'light'; }); sync(a, c);
  const legacy = base(); legacy.current.squat = 3; legacy.workouts.push({ id: 'old1', at: '2025-01-01T00:00:00Z', entries: [] });
  const b = device(legacy);                                // no stamps at all
  sync(b, c);
  assert.strictEqual(b.state.current.squat, 3);
  assert.ok(b.state.workouts.some((w) => w.id === 'old1'));
  assert.strictEqual(b.state.profile.theme, 'light');      // the cloud's stamped setting wins
});

test('import while signed in merges and is idempotent', () => {
  const s = base(); s.profile.theme = 'dark'; s.levels.squats = 1; s.workouts.push({ id: 'a', at: '2026-01-01T00:00:00Z', entries: [] });
  const file = base(); file.profile.theme = 'light'; file.levels.squats = 3; file.current.pull = 1;
  file.workouts.push({ id: 'a', at: '2026-01-01T00:00:00Z', entries: [] }, { id: 'b', at: '2026-02-01T00:00:00Z', entries: [] });
  const once = C.mergeImport(s, file); const twice = C.mergeImport(once, file);
  assert.deepStrictEqual(once.workouts.map((w) => w.id), ['a', 'b']);
  assert.strictEqual(once.levels.squats, 3);
  assert.strictEqual(once.current.pull, 1);
  assert.strictEqual(once.profile.theme, 'dark');          // local settings win
  assert.strictEqual(C.stable(once), C.stable(twice));
});

test('a stamp from a clock far in the future is clamped', () => {
  const c = cloud(); const a = device(); const b = device();
  edit(a, (s) => { s.restSeconds = 60; });
  a.meta.stamps.restSeconds = '2099-01-01T00:00:00Z';       // broken clock
  sync(a, c); tick(10 * 60 * 1000);
  edit(b, (s) => { s.restSeconds = 120; });                // a real change 10 minutes later
  sync(b, c); sync(a, c);
  assert.strictEqual(a.state.restSeconds, 120);
  assert.strictEqual(b.state.restSeconds, 120);
});

test('merge with itself changes nothing', () => {
  const a = device(); logWorkout(a); edit(a, (s) => { s.profile.name = 'Sam'; });
  const d = C.toDoc(a.state, a.meta);
  assert.strictEqual(C.stable(C.merge(d, d, now()).doc), C.stable(d));
});

test('validateDoc rejects malformed documents', () => {
  const good = C.toDoc(base(), C.emptyMeta());
  assert.strictEqual(C.validateDoc(good), null);
  assert.ok(C.validateDoc(null));
  assert.ok(C.validateDoc({ ...good, schema: 99 }));
  assert.ok(C.validateDoc({ ...good, data: { ...good.data, levels: { x: 9 } } }));
  assert.ok(C.validateDoc({ ...good, data: { ...good.data, workouts: [{ id: 1 }] } }));
});

test('random edits on three devices converge without losing workouts', () => {
  let seed = 42; const rnd = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % n; };
  for (let round = 0; round < 200; round++) {
    const c = cloud(); const ds = [device(), device(), device()];
    const logged = new Set(); const deleted = new Set(); const maxLevel = {};
    for (let step = 0; step < 40; step++) {
      const d = ds[rnd(3)];
      switch (rnd(8)) {
        case 5: edit(d, (s) => { (s.meals = s.meals || []).push({ id: 'z' + (++mid), day: '2026-11-0' + (1 + rnd(7)), at: tick(), name: 'x', kcal: 100 + rnd(500) }); }); break;
        case 6: edit(d, (s) => { s.hlog = s.hlog || {}; const k = '2026-11-0' + (1 + rnd(3)) + '|' + ['weight', 'steps', 'water'][rnd(3)]; if (rnd(4) === 0) delete s.hlog[k]; else s.hlog[k] = 100 + rnd(50); }); break;
        case 0: case 1: { const lv = 1 + rnd(3); const p = ['a', 'b', 'c'][rnd(3)]; logged.add(logWorkout(d, p, lv)); maxLevel[p] = Math.max(maxLevel[p] || 0, lv); break; }
        case 2: if (d.state.workouts.length) { const id = d.state.workouts[rnd(d.state.workouts.length)].id; deleted.add(id); edit(d, (s) => { s.workouts = s.workouts.filter((w) => w.id !== id); }); } break;
        case 3: edit(d, (s) => { s.profile.theme = ['light', 'dark', 'midnight'][rnd(3)]; }); break;
        case 4: edit(d, (s) => { s.current[['push', 'pull'][rnd(2)]] = rnd(5); }); break;
        default: sync(d, c);
      }
    }
    for (let k = 0; k < 2; k++) for (const d of ds) sync(d, c);
    const ref = synced(ds[0]);
    for (const d of ds) assert.strictEqual(synced(d), ref, 'devices diverged in round ' + round);
    const ids = new Set(ds[0].state.workouts.map((w) => w.id));
    for (const id of logged) assert.strictEqual(ids.has(id), !deleted.has(id), `workout ${id} wrong in round ${round}`);
    for (const [p, lv] of Object.entries(maxLevel)) assert.strictEqual(ds[0].state.levels[p], lv);
  }
});


/* ---- Health tracking (Track tab) ---- */
const hbase = () => ({ ...base(), hprofile: {}, hlog: {}, foods: {}, meals: [] });
const logMeal = (d, kcal, day = '2026-11-07') => {
  const m = { id: 'm' + (++mid), day, at: tick(), name: 'Food ' + mid, kcal, protein: 10 };
  edit(d, (s) => { s.meals.push(m); });
  return m.id;
};

test('meals from two devices combine; a deleted meal stays deleted', () => {
  const c = cloud(); const a = device(hbase()); const b = device(hbase());
  const x = logMeal(a, 500); const y = logMeal(b, 300);
  sync(a, c); sync(b, c); sync(a, c);
  assert.deepStrictEqual(a.state.meals.map((m) => m.id).sort(), [x, y].sort());
  edit(b, (s) => { s.meals = s.meals.filter((m) => m.id !== x); });
  sync(b, c); sync(a, c);
  assert.deepStrictEqual(a.state.meals.map((m) => m.id), [y]);
});

test('daily values merge per field: weight on one device, steps on the other', () => {
  const c = cloud(); const a = device(hbase()); const b = device(hbase());
  edit(a, (s) => { s.hlog['2026-11-07|weight'] = 114.6; });
  edit(b, (s) => { s.hlog['2026-11-07|steps'] = 8200; });
  sync(a, c); sync(b, c); sync(a, c);
  for (const d of [a, b]) assert.deepStrictEqual(d.state.hlog, { '2026-11-07|weight': 114.6, '2026-11-07|steps': 8200 });
  edit(b, (s) => { s.hlog['2026-11-07|weight'] = 114.2; });          // a later correction wins
  sync(b, c); sync(a, c);
  assert.strictEqual(a.state.hlog['2026-11-07|weight'], 114.2);
  edit(a, (s) => { delete s.hlog['2026-11-07|steps']; });            // clearing a value syncs too
  sync(a, c); sync(b, c);
  assert.ok(!('2026-11-07|steps' in b.state.hlog));
});

test('profile targets and saved foods sync; removing a saved food sticks', () => {
  const c = cloud(); const a = device(hbase()); const b = device(hbase());
  edit(a, (s) => { s.hprofile.goalWeight = 90; s.foods.f1 = { name: 'Oats', kcal: 380, protein: 13 }; });
  sync(a, c); sync(b, c);
  assert.strictEqual(b.state.hprofile.goalWeight, 90);
  assert.strictEqual(b.state.foods.f1.name, 'Oats');
  edit(b, (s) => { delete s.foods.f1; }); sync(b, c); sync(a, c);
  assert.ok(!('f1' in a.state.foods));
});

test('documents written before the Track tab still merge', () => {
  const c = cloud(); const a = device(base());                       // old shape, no health fields
  logWorkout(a); sync(a, c);
  delete c.doc.data.meals; delete c.doc.data.hlog; delete c.doc.data.hprofile; delete c.doc.data.foods;
  assert.strictEqual(C.validateDoc(c.doc), null);
  const b = device(hbase()); logMeal(b, 250); sync(b, c);
  assert.strictEqual(b.state.workouts.length, 1);
  assert.strictEqual(b.state.meals.length, 1);
});

test('validateDoc rejects malformed health data', () => {
  const good = C.toDoc(hbase(), C.emptyMeta());
  assert.strictEqual(C.validateDoc(good), null);
  assert.ok(C.validateDoc({ ...good, data: { ...good.data, meals: [{ id: 'x', at: 'y', kcal: 'lots' }] } }));
  assert.ok(C.validateDoc({ ...good, data: { ...good.data, hlog: { 'd|weight': '115' } } }));
});

test('importing a backup merges health data without overwriting local values', () => {
  const s = hbase(); s.hlog['2026-11-07|weight'] = 114; s.hprofile.goalWeight = 90;
  s.meals.push({ id: 'a', day: '2026-11-07', at: '2026-11-07T08:00:00Z', name: 'Eggs', kcal: 150 });
  const file = hbase(); file.hlog['2026-11-07|weight'] = 120; file.hlog['2026-11-01|weight'] = 116; file.hprofile.goalWeight = 80;
  file.meals.push({ id: 'a', day: '2026-11-07', at: '2026-11-07T08:00:00Z', name: 'Eggs', kcal: 150 }, { id: 'b', day: '2026-11-01', at: '2026-11-01T08:00:00Z', name: 'Rice', kcal: 300 });
  const out = C.mergeImport(s, file);
  assert.strictEqual(out.hlog['2026-11-07|weight'], 114);
  assert.strictEqual(out.hlog['2026-11-01|weight'], 116);
  assert.strictEqual(out.hprofile.goalWeight, 90);
  assert.deepStrictEqual(out.meals.map((m) => m.id), ['b', 'a']);
});

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
