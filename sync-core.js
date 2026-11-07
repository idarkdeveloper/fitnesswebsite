/* PulseFit sync core: pure functions, no I/O.
   Used by sync.js in the browser and by tools/test-merge.js in Node.
   Design: docs/BACKEND_DESIGN.md, section 3. */
(function (root) {
  'use strict';

  const SCHEMA = 1;
  const SKEW_MS = 5 * 60 * 1000;          // future stamps beyond this are clamped
  // Single-value settings, merged by newest stamp.
  const FIXED_REGS = ['profile.name', 'profile.theme', 'profile.pro', 'routineId', 'trainingDays', 'restSeconds'];
  // Maps of single values (one register per key), merged by newest stamp.
  // hprofile: body profile and targets; hlog: "YYYY-MM-DD|field" -> number (weight, steps, sleep, water,
  // measurements); foods: saved foods by id.
  const MAP_REGS = ['current', 'joined', 'hprofile', 'hlog', 'foods'];
  // Append-only lists of records with ids, merged by union minus tombstones.
  const COLLECTIONS = ['workouts', 'meals'];

  const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  /** Stable JSON: object keys sorted, so equal data gives equal strings. */
  function stable(v) {
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (isObj(v)) return '{' + Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
    return JSON.stringify(v === undefined ? null : v);
  }

  /** The synced part of app state. Email, reminder and challengeStart stay on the device. */
  function pick(state) {
    const s = state || {};
    const p = s.profile || {};
    return clone({
      profile: { name: p.name ?? '', theme: p.theme ?? 'midnight', pro: !!p.pro },
      routineId: s.routineId,
      trainingDays: Array.isArray(s.trainingDays) ? s.trainingDays : [],
      restSeconds: s.restSeconds,
      current: isObj(s.current) ? s.current : {},
      levels: isObj(s.levels) ? s.levels : {},
      joined: isObj(s.joined) ? s.joined : {},
      workouts: Array.isArray(s.workouts) ? s.workouts : [],
      hprofile: isObj(s.hprofile) ? s.hprofile : {},
      hlog: isObj(s.hlog) ? s.hlog : {},
      foods: isObj(s.foods) ? s.foods : {},
      meals: Array.isArray(s.meals) ? s.meals : [],
    });
  }

  /** Flatten registers to {path: value}. Map keys become "current.<cat>" etc. */
  function registers(data) {
    const out = {};
    for (const path of FIXED_REGS) {
      const [a, b] = path.split('.');
      out[path] = b ? (data[a] || {})[b] : data[a];
    }
    for (const m of MAP_REGS) for (const [k, v] of Object.entries(data[m] || {})) out[m + '.' + k] = v;
    return out;
  }

  function setRegister(data, path, value) {
    const i = path.indexOf('.');
    const head = i < 0 ? path : path.slice(0, i);
    const tail = i < 0 ? null : path.slice(i + 1);
    if (MAP_REGS.includes(head)) {
      data[head] = data[head] || {};
      if (value === null || value === undefined) delete data[head][tail];
      else data[head][tail] = clone(value);
    } else if (tail) {
      data[head] = data[head] || {};
      data[head][tail] = clone(value);
    } else {
      data[head] = clone(value);
    }
  }

  /** What the device remembers to detect changes between saves. */
  function snapshot(state) {
    const d = pick(state);
    return { regs: registers(d), ids: COLLECTIONS.flatMap((c) => d[c].map((x) => x.id)) };
  }

  function emptyMeta() {
    return { gen: 0, stamps: {}, deleted: {}, snap: null };
  }

  /**
   * Record a local save: stamp registers that changed since the last snapshot,
   * tombstone workouts and meals that disappeared. Returns a new meta object.
   */
  function noteSave(meta, state, nowIso) {
    const m = clone(meta) || emptyMeta();
    const next = snapshot(state);
    if (m.snap) {
      const keys = new Set([...Object.keys(m.snap.regs), ...Object.keys(next.regs)]);
      for (const k of keys) {
        if (stable(m.snap.regs[k]) !== stable(next.regs[k])) m.stamps[k] = nowIso;
      }
      const now = new Set(next.ids);
      for (const id of m.snap.ids) if (!now.has(id)) m.deleted[id] = nowIso;
    }
    m.snap = next;
    return m;
  }

  /** Reset: a new generation that replaces older ones everywhere. */
  function noteReset(meta, state) {
    const m = clone(meta) || emptyMeta();
    return { ...m, gen: (m.gen || 0) + 1, stamps: {}, deleted: {}, snap: snapshot(state) };
  }

  function toDoc(state, meta) {
    const m = meta || emptyMeta();
    return { schema: SCHEMA, gen: m.gen || 0, data: pick(state), stamps: clone(m.stamps || {}), deleted: clone(m.deleted || {}) };
  }

  /** Validate a downloaded document before trusting it. Returns an error string or null. */
  function validateDoc(doc) {
    if (!isObj(doc)) return 'not an object';
    if (doc.schema !== SCHEMA) return 'unknown schema ' + doc.schema;
    if (!Number.isInteger(doc.gen) || doc.gen < 0) return 'bad gen';
    const d = doc.data;
    if (!isObj(d)) return 'no data';
    if (!Array.isArray(d.workouts) || d.workouts.some((w) => !isObj(w) || typeof w.id !== 'string' || typeof w.at !== 'string')) return 'bad workouts';
    if (!isObj(d.levels) || Object.values(d.levels).some((v) => !Number.isInteger(v) || v < 0 || v > 3)) return 'bad levels';
    if (!isObj(d.current) || !isObj(d.joined) || !isObj(d.profile)) return 'bad maps';
    if (!isObj(doc.stamps) || !isObj(doc.deleted)) return 'bad meta';
    // Health fields are optional (documents written before the Track tab don't have them).
    if (d.meals !== undefined && (!Array.isArray(d.meals) || d.meals.some((m) => !isObj(m) || typeof m.id !== 'string' || typeof m.at !== 'string' || !Number.isFinite(m.kcal)))) return 'bad meals';
    if (d.hlog !== undefined && (!isObj(d.hlog) || Object.values(d.hlog).some((v) => !Number.isFinite(v)))) return 'bad hlog';
    for (const k of ['hprofile', 'foods']) if (d[k] !== undefined && !isObj(d[k])) return 'bad ' + k;
    return null;
  }

  const stampMs = (s, nowMs) => {
    const t = Date.parse(s || '');
    if (!Number.isFinite(t)) return 0;
    return Math.min(t, nowMs + SKEW_MS);
  };
  const defined = (v) => v !== undefined && v !== null;

  /**
   * Merge a local document with a remote (cloud) document.
   * - Different gen: the higher gen wins outright (reset wins).
   * - Same gen: workouts and meals union minus tombstones, levels by max, registers
   *   (settings, health profile, daily log values, saved foods) by newest stamp.
   *   Equal stamps: a value beats no value; otherwise the remote copy wins.
   * Returns { doc, lostLocal } where lostLocal is true if a reset elsewhere discarded local data.
   */
  function merge(local, remote, nowIso) {
    const nowMs = Date.parse(nowIso || new Date().toISOString());
    // No cloud copy yet: merge against an empty one so stamps still get clamped.
    if (!remote) remote = { schema: SCHEMA, gen: local.gen, data: clone(local.data), stamps: {}, deleted: {} };
    if (!local) return { doc: clone(remote), lostLocal: false };
    if (local.gen !== remote.gen) {
      if (remote.gen > local.gen) {
        const ld = local.data || {};
        const lostLocal = (ld.workouts || []).length > 0 || Object.keys(ld.levels || {}).length > 0
          || (ld.meals || []).length > 0 || Object.keys(ld.hlog || {}).length > 0;
        return { doc: clone(remote), lostLocal };
      }
      return { doc: clone(local), lostLocal: false };
    }

    // Tombstones: union, keep the later time.
    const deleted = { ...(local.deleted || {}) };
    for (const [id, t] of Object.entries(remote.deleted || {})) {
      if (!deleted[id] || Date.parse(t) > Date.parse(deleted[id])) deleted[id] = t;
    }

    // Workouts and meals: union by id. Same id on both sides: keep remote's copy (they are never edited).
    const unite = (name) => {
      const byId = new Map();
      for (const w of local.data[name] || []) byId.set(w.id, w);
      for (const w of remote.data[name] || []) byId.set(w.id, w);
      return [...byId.values()]
        .filter((w) => !deleted[w.id])
        .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    };

    // Levels: highest wins.
    const levels = { ...(local.data.levels || {}) };
    for (const [k, v] of Object.entries(remote.data.levels || {})) levels[k] = Math.max(levels[k] || 0, v);

    // Registers: newest stamp wins.
    const data = { ...clone(remote.data), levels };
    for (const c of COLLECTIONS) data[c] = clone(unite(c));
    for (const m of MAP_REGS) data[m] = {};
    const lr = registers(local.data);
    const rr = registers(remote.data);
    const stamps = {};
    const paths = new Set([...Object.keys(lr), ...Object.keys(rr), ...Object.keys(local.stamps || {}), ...Object.keys(remote.stamps || {})]);
    for (const p of paths) {
      const head = p.split('.')[0];
      if (!FIXED_REGS.includes(p) && !MAP_REGS.includes(head)) continue;
      const ls = (local.stamps || {})[p];
      const rs = (remote.stamps || {})[p];
      const lt = stampMs(ls, nowMs);
      const rt = stampMs(rs, nowMs);
      let useLocal;
      if (lt !== rt) useLocal = lt > rt;
      else if (defined(lr[p]) !== defined(rr[p])) useLocal = defined(lr[p]);
      else useLocal = false;
      setRegister(data, p, useLocal ? lr[p] : rr[p]);
      const st = useLocal ? ls : rs;
      const t = useLocal ? lt : rt;
      // Store the clamped time, so a stamp from a broken clock can't keep winning later.
      if (st) stamps[p] = t < Date.parse(st) ? new Date(t).toISOString() : st;
    }
    return { doc: { schema: SCHEMA, gen: local.gen, data, stamps, deleted }, lostLocal: false };
  }

  /**
   * Import a backup file while signed in: merge, don't replace.
   * Workouts are combined, levels take the max, started categories and joined ladders
   * missing locally are added; local settings win.
   */
  function mergeImport(state, fileState) {
    const cur = pick(state);
    const file = pick(fileState);
    const ids = new Set(cur.workouts.map((w) => w.id));
    const workouts = [...cur.workouts, ...file.workouts.filter((w) => w && typeof w.id === 'string' && !ids.has(w.id))]
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    const levels = { ...cur.levels };
    for (const [k, v] of Object.entries(file.levels)) if (Number.isInteger(v)) levels[k] = Math.max(levels[k] || 0, v);
    const current = { ...file.current, ...cur.current };
    const joined = { ...file.joined, ...cur.joined };
    // Health data: add meals, log entries, saved foods and profile fields this device doesn't have.
    const mealIds = new Set(cur.meals.map((m) => m.id));
    const meals = [...cur.meals, ...file.meals.filter((m) => m && typeof m.id === 'string' && Number.isFinite(m.kcal) && !mealIds.has(m.id))]
      .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    const hlog = { ...Object.fromEntries(Object.entries(file.hlog).filter(([, v]) => Number.isFinite(v))), ...cur.hlog };
    const hprofile = { ...file.hprofile, ...cur.hprofile };
    const foods = { ...file.foods, ...cur.foods };
    return { ...clone(state), workouts, levels, current, joined, meals, hlog, hprofile, foods };
  }

  /** Put a merged document's data back into full app state, keeping device-local fields. */
  function applyDoc(state, doc) {
    const d = clone(doc.data);
    const s = clone(state);
    s.profile = { ...(s.profile || {}), ...d.profile };
    for (const k of ['routineId', 'trainingDays', 'restSeconds', 'current', 'levels', 'joined', 'workouts', 'hprofile', 'hlog', 'foods', 'meals']) {
      if (d[k] !== undefined) s[k] = d[k];
    }
    return s;
  }

  function metaFromDoc(doc, state) {
    return { gen: doc.gen, stamps: clone(doc.stamps || {}), deleted: clone(doc.deleted || {}), snap: snapshot(state) };
  }

  const api = { SCHEMA, pick, registers, snapshot, emptyMeta, noteSave, noteReset, toDoc, validateDoc, merge, mergeImport, applyDoc, metaFromDoc, stable };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PFSyncCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
