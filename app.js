/* =============================================================
   PulseFit — bodyweight progression trainer
   -------------------------------------------------------------
   Single-page app, no build step. Hash router + render functions.
   Content lives in data.js (window.PF_DATA); user progress lives
   in localStorage under "pf2_state".
   ============================================================= */
'use strict';

/* ---------------------------------------------------------------
   0. Helpers
   --------------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const ICONS = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  run: '<circle cx="14" cy="4.5" r="2"/><path d="M6 21l3.5-5.5 3 2V22M9.5 15.5 11 9.5l4 2.5 3.5-.5M11 9.5 8 10.5 6.5 13.5"/>',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  award: '<circle cx="12" cy="8.5" r="5.5"/><path d="M8.6 13 7 21.5l5-2.8 5 2.8L15.4 13"/>',
  user: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="10" r="3.2"/><path d="M5.8 18.4c1.5-2.1 3.7-3.2 6.2-3.2s4.7 1.1 6.2 3.2"/>',
  chevR: 'M9 5.5l6.5 6.5L9 18.5',
  chevL: 'M15 5.5 8.5 12l6.5 6.5',
  swap: 'M4 8h15.5L15.5 4M20 16H4.5l4 4',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.8l2.3 2M9.5 2.5h5M19 6l1.5-1.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.2" fill="currentColor" stroke="none"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.6" r="1.3" fill="#000" stroke="none" opacity=".45"/>',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  crown: 'M3.5 8.5 8 12l4-6.5 4 6.5 4.5-3.5L19 18.5H5z',
  gift: '<rect x="3.5" y="8" width="17" height="4.5" rx="1"/><path d="M5 12.5V20.5h14v-8M12 8v12.5M12 8C10.5 4.5 7 4 7 6.2 7 7.8 9.6 8 12 8zm0 0c1.5-3.5 5-4 5-1.8C17 7.8 14.4 8 12 8z"/>',
  flame: 'M12 21.5c3.9 0 6.8-2.8 6.8-6.6 0-4-2.9-6-4-9.9-1.8 1.6-2.8 3.6-2.8 5.6-1.1-.9-1.8-2.3-1.9-3.9C7.4 9.2 5.2 11.6 5.2 14.9c0 3.8 2.9 6.6 6.8 6.6z',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.6v.01"/>',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.2 7l1 13h9.6l1-13M10 11v5.5M14 11v5.5',
  x: 'M6 6l12 12M18 6 6 18',
  play: 'M7.5 4.5 19 12 7.5 19.5z',
  pause: 'M8 5v14M16 5v14',
  bolt: 'M13 2.5 4.5 14H11l-1 7.5L18.5 10H12z',
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.8 1.8H4.2zM10 21h4',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4M12 16.8v.01"/>',
  shield: 'M12 3l7.5 2.8V12c0 4.6-3.2 7.8-7.5 9-4.3-1.2-7.5-4.4-7.5-9V5.8z',
  download: 'M12 4v11.5M7 10.5l5 5 5-5M4.5 20h15',
  upload: 'M12 20V8.5M7 13.5l5-5 5 5M4.5 4h15',
  reset: 'M4 12a8 8 0 1 0 2.4-5.7L4 8.6M4 3.5v5.1h5.1',
  cloud: 'M7 18.5h10.5a4 4 0 0 0 .4-7.98A6 6 0 0 0 6.3 9.1 4.75 4.75 0 0 0 7 18.5z',
  dumbbell: 'M6.5 6.5l11 11M3.5 9.5l6-6M14.5 20.5l6-6M2 11l2 2M11 2l2 2M20 11l2 2M11 20l2 2',
  star: 'M12 3.2l2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17.1 6.6 20l1-6.1-4.4-4.3 6.1-.8z',
  sprout: 'M12 21v-8.5M12 12.5C12 8.6 9.2 6.4 5 6.4c0 4 2.8 6.1 7 6.1zm0-2C12 7.3 14.6 5 18.6 5c0 3.6-2.6 5.5-6.6 5.5z',
  leaf: 'M5 19.5C5 10.4 11 5 20 5c0 9.2-5.6 14.5-14.4 14.5M5 19.5l7.5-7.5',
  wheat: 'M12 22V9M12 13.5 9 10.5M12 13.5l3-3M12 17.5 9 14.5M12 17.5l3-3M12 9 9.6 6 12 2.5 14.4 6z',
  tree: 'M12 2.8 17.8 10H15l4 6.2H5L9 10H6.2zM12 16.2V21',
  mountain: 'M2.5 20 9 9.5l4 6 2.5-3.5 6 8z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5c0 2.8 1.6 4.6 3.7 4.9M16 6h3.5c0 2.8-1.6 4.6-3.7 4.9M12 13v3.5M8.5 20.5h7M9.5 16.5h5v4h-5z',
  external: 'M14 4h6v6M20 4l-8.5 8.5M18 14v6H4V6h6',
  pushup: 'M2.5 19.5h19M4.5 9.5a1.8 1.8 0 1 0 0-.01M7 11l13 4.5M8.5 11.6V19',
  pullup: 'M3 4h18M7 4l2.2 6.5M17 4l-2.2 6.5M12 8.2a1.8 1.8 0 1 0 0-.01M9.2 10.5h5.6M12 10.5v6M12 16.5 10 21.5M12 16.5l2 5',
  squat: 'M10 3.8a1.8 1.8 0 1 0 0-.01M10.5 6.5 9 12.5h6.5l-1 6.5h3M10.3 8.5H17',
  sparkle: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
};

function icon(name, attrs = '') {
  const def = ICONS[name] || ICONS.info;
  const inner = def.startsWith('<') ? def : `<path d="${def}"/>`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${attrs}>${inner}</svg>`;
}

/* ---------------------------------------------------------------
   1. Content index
   --------------------------------------------------------------- */
const DATA = window.PF_DATA || { categories: [] };
const CATS = DATA.categories;
const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
const PROG = {};
CATS.forEach((c) => c.progressions.forEach((p, i) => { PROG[p.id] = { p, cat: c, idx: i }; }));
const TOTAL_PROGS = Object.keys(PROG).length;

const CAT_HUE = {
  pushups: 215, pullups: 250, squats: 190, 'leg-raises': 280, bridges: 165, twists: 320,
  grip: 30, lunges: 140, dips: 0, 'elbow-levers': 45, 'clutch-flag': 200,
};

/* Stick-figure artwork (original vector poses, 160×100 canvas). */
const POSES = {
  pushups: { ground: 1, head: [40, 50], lines: [[46, 54, 92, 68, 134, 82], [50, 56, 52, 70, 50, 85]] },
  pullups: { bar: [36, 14, 124, 14], head: [80, 40], lines: [[74, 48, 64, 31, 68, 14], [86, 48, 96, 31, 92, 14], [80, 48, 80, 72], [80, 72, 74, 82, 82, 93]] },
  squats: { ground: 1, head: [70, 24], lines: [[71, 31, 64, 58], [64, 58, 94, 60, 88, 85, 100, 85], [70, 38, 104, 40]] },
  'leg-raises': { ground: 1, head: [30, 78], lines: [[37, 81, 84, 81], [84, 81, 118, 32], [42, 82, 66, 84]] },
  bridges: { ground: 1, head: [45, 62], path: 'M51 54 Q 80 18 106 50', lines: [[36, 85, 51, 54], [106, 50, 116, 70, 124, 85]] },
  twists: { ground: 1, head: [66, 38], lines: [[70, 80, 68, 46], [70, 80, 128, 84], [68, 53, 46, 64, 40, 84], [68, 53, 94, 58]] },
  grip: { bar: [46, 12, 114, 12], head: [90, 38], lines: [[82, 12, 83, 46], [84, 46, 86, 72], [86, 72, 81, 94], [86, 72, 92, 94], [85, 50, 97, 68]] },
  lunges: { ground: 1, head: [80, 16], lines: [[80, 23, 80, 52], [80, 52, 104, 60, 104, 85], [80, 52, 64, 76, 42, 84], [80, 30, 82, 50]] },
  dips: { bars: 1, head: [76, 17], lines: [[76, 24, 78, 54], [76, 30, 70, 50], [78, 54, 92, 66, 82, 82]] },
  'elbow-levers': { ground: 1, head: [32, 56], lines: [[39, 59, 82, 60, 128, 62], [80, 61, 82, 72, 80, 85]] },
  'clutch-flag': { pole: 1, head: [110, 36], lines: [[102, 44, 66, 50], [66, 50, 22, 48], [102, 40, 100, 26], [98, 50, 100, 62]] },
};

function figure(catId) {
  const pose = POSES[catId] || POSES.pushups;
  const prop = 'class="prop" stroke="currentColor" stroke-width="3"';
  let svg = '';
  if (pose.ground) svg += `<line x1="8" y1="88" x2="152" y2="88" ${prop}/>`;
  if (pose.bar) svg += `<line x1="${pose.bar[0]}" y1="${pose.bar[1]}" x2="${pose.bar[2]}" y2="${pose.bar[3]}" ${prop}/>`;
  if (pose.bars) svg += `<path d="M40 50H124M54 50V96M110 50V96" ${prop} fill="none"/>`;
  if (pose.pole) svg += `<path d="M100 4V96" ${prop} stroke-width="4"/>`;
  const body = 'stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  (pose.lines || []).forEach((l) => {
    const pts = [];
    for (let i = 0; i < l.length; i += 2) pts.push(`${l[i]},${l[i + 1]}`);
    svg += `<polyline points="${pts.join(' ')}" ${body}/>`;
  });
  if (pose.path) svg += `<path d="${pose.path}" ${body}/>`;
  svg += `<circle cx="${pose.head[0]}" cy="${pose.head[1]}" r="7" fill="currentColor"/>`;
  return `<svg class="fig" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${svg}</svg>`;
}

/** Generated photo for an id (category cover or progression) if listed in img/manifest.js, else the stick figure. */
const IMAGES = window.PF_IMAGES || {};
function media(catId, imgId, alt = '') {
  const src = imgId && IMAGES[imgId];
  // The figure stays underneath as the loading placeholder; the photo covers it once decoded.
  return src
    ? `${figure(catId)}<img class="photo" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async" />`
    : figure(catId);
}

function art(catId, { cls = '', locked = false, shift = 0, inner = '', img = null, alt = '' } = {}) {
  const h = (CAT_HUE[catId] ?? 210) + shift;
  return `<div class="art ${cls} ${locked ? 'locked' : ''}" style="--h:${h}">${media(catId, img, alt)}${locked ? `<span class="lock">${icon('lock')}</span>` : ''}${inner}</div>`;
}

/* ---------------------------------------------------------------
   2. Routines, badges, tips
   --------------------------------------------------------------- */
const ROUTINES = [
  { id: 'foundation', name: 'Foundation Routine', desc: 'Two movements a session, rotating through the core six.', sessions: [['pushups', 'leg-raises'], ['pullups', 'squats'], ['bridges', 'twists']] },
  { id: 'push-pull-legs', name: 'Push · Pull · Legs', desc: 'Classic three-way split with grip and core finishers.', sessions: [['pushups', 'twists'], ['pullups', 'grip'], ['squats', 'leg-raises', 'bridges']] },
  { id: 'full-body', name: 'Full Body Circuit', desc: 'Four big movements every session. Best on 2–3 days a week.', sessions: [['pushups', 'pullups', 'squats', 'leg-raises']] },
  { id: 'strength-pro', name: 'Strength Builder', desc: 'Adds dips, lunges, levers and the flag. Pro routine.', pro: true, sessions: [['pushups', 'dips', 'elbow-levers'], ['pullups', 'grip', 'clutch-flag'], ['squats', 'lunges', 'bridges']] },
];
const ROUTINE = Object.fromEntries(ROUTINES.map((r) => [r.id, r]));

const LADDERS = [
  { id: 'pushup-ladder', cat: 'pushups', name: 'Pushup Ladder', icon: 'pushup' },
  { id: 'pullup-ladder', cat: 'pullups', name: 'Pullup Ladder', icon: 'pullup' },
  { id: 'squat-ladder', cat: 'squats', name: 'Squat Ladder', icon: 'squat' },
];
const TIER_ICONS = ['sprout', 'leaf', 'wheat', 'tree', 'mountain'];

const STREAK_BADGES = [
  { id: 's3', n: 3, name: 'Warmed Up' },
  { id: 's5', n: 5, name: 'In Motion' },
  { id: 's10', n: 10, name: 'Locked In' },
  { id: 's30', n: 30, name: 'Iron Will' },
];

const TIPS = [
  '30 seconds of wall sit while the kettle boils. Thighs parallel, back flat.',
  'Hang from a sturdy door frame or bar for 20 seconds. Shoulders down, not shrugged.',
  '10 slow calf raises on a stair edge. Pause for a second at the top.',
  'Hold a hollow body position for 20 seconds: lower back pressed into the floor.',
  '15 glute bridges, squeezing at the top for a two-count each rep.',
  'Walk for 60 seconds carrying a full bag in each hand. Tall posture, ribs stacked.',
  '5 slow-motion squats: four seconds down, four seconds up.',
  '10 incline pushups on a kitchen counter. Elbows at about 45°.',
  'Stand on one leg for 30 seconds each side. Eyes closed if that is too easy.',
  'Shoulder circles: 10 forward, 10 backward, as big as you can make them.',
  'Plank for 30 seconds. Squeeze your glutes and push the floor away.',
  'Take the stairs two at a time for one flight, then walk back down slowly.',
  'Deep squat hold for 30 seconds. Heels down, chest proud, elbows pushing knees out.',
  '8 reverse lunges per leg, controlling the knee down to just above the floor.',
  'Dead bug: 10 slow reps, opposite arm and leg, lower back glued down.',
  'Scapula pushups: 10 reps, moving only your shoulder blades.',
];

/* ---------------------------------------------------------------
   3. State
   --------------------------------------------------------------- */
const STORAGE_KEY = 'pf2_state';

function defaultState() {
  return {
    v: 1,
    profile: { name: '', email: '', theme: 'midnight', pro: false },
    routineId: 'foundation',
    trainingDays: [1, 2, 4, 5],         // 0 = Sun … 6 = Sat
    restSeconds: 90,
    current: {},                        // catId -> progression index (presence = started)
    levels: {},                         // progId -> highest level completed (0-3)
    workouts: [],                       // {id, at, routineId, entries:[{progId, level, values[], passed}]}
    joined: {},                         // ladderId -> ISO date
    reminder: { enabled: false, time: '18:00', lastNotified: '' },
    challengeStart: null,
  };
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return defaultState();
    const d = defaultState();
    return { ...d, ...raw, profile: { ...d.profile, ...(raw.profile || {}) }, reminder: { ...d.reminder, ...(raw.reminder || {}) } };
  } catch {
    return defaultState();
  }
}

let state = loadState();
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  if (window.PFSync) window.PFSync.noteSave(state);   // cloud sync (sync.js), if loaded
}

/* ---------------------------------------------------------------
   4. Dates & schedule
   --------------------------------------------------------------- */
const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, '0');
const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const today = () => startOfDay(new Date());
const mondayIndex = (d) => (d.getDay() + 6) % 7; // Mon=0 … Sun=6
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const fmtLong = (d) => `${WEEKDAY_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`;
const fmtShort = (d) => `${WEEKDAY_LONG[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()].slice(0, 3)} ${ordinal(d.getDate())}`;
const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();

function routine() {
  const r = ROUTINE[state.routineId] || ROUTINES[0];
  return r.pro && !state.profile.pro ? ROUTINES[0] : r;
}

function isTrainingDay(d) { return state.trainingDays.includes(d.getDay()); }

/** Category ids scheduled for a date (empty array = rest day). */
function sessionFor(d) {
  if (!isTrainingDay(d)) return [];
  const r = routine();
  const days = [...state.trainingDays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  const k = days.indexOf(d.getDay());
  const epochMonday = new Date(2024, 0, 1); // a Monday
  const weekIdx = Math.floor((addDays(d, -mondayIndex(d)) - epochMonday) / (7 * DAY_MS));
  return r.sessions[(weekIdx * days.length + k) % r.sessions.length].filter((c) => CAT[c]);
}

/* ---------------------------------------------------------------
   5. Progress model
   --------------------------------------------------------------- */
const isLocked = (cat) => cat.premium && !state.profile.pro;
const isStarted = (catId) => Object.prototype.hasOwnProperty.call(state.current, catId);
const currentIdx = (catId) => clamp(state.current[catId] ?? 0, 0, CAT[catId].progressions.length - 1);
const currentProg = (catId) => CAT[catId].progressions[currentIdx(catId)];
const levelDone = (progId) => state.levels[progId] || 0;
const workingLevel = (progId) => Math.min(3, levelDone(progId) + 1);
const isMastered = (progId) => levelDone(progId) >= 3;

function targetText(p, lvlNum) {
  const l = p.levels[lvlNum - 1];
  if (p.type === 'hold') return `${l.sets} ${l.sets === 1 ? 'hold' : 'holds'} of ${l.target} seconds${p.perSide ? ' per side' : ''}`;
  return `${l.sets} ${l.sets === 1 ? 'set' : 'sets'} of ${l.target}${p.perSide ? ' per side' : ''}`;
}
const unitOf = (p) => (p.type === 'hold' ? 'sec' : 'reps');

function workoutDays() {
  const s = new Set();
  state.workouts.forEach((w) => s.add(dayKey(new Date(w.at))));
  return s;
}
const workoutsOn = (key) => state.workouts.filter((w) => dayKey(new Date(w.at)) === key);

/** Streak of completed training days; scheduled rest days never break it. */
function streakStats() {
  const days = workoutDays();
  if (!days.size) return { current: 0, best: 0 };
  const first = fromKey([...days].sort()[0]);
  const end = today();
  let run = 0, best = 0;
  for (let d = first; d <= end; d = addDays(d, 1)) {
    const k = dayKey(d);
    if (days.has(k)) { run++; best = Math.max(best, run); }
    else if (!isTrainingDay(d) || k === dayKey(end)) { /* rest day or today not done yet */ }
    else run = 0;
  }
  return { current: run, best };
}

const masteredCount = () => Object.keys(PROG).filter(isMastered).length;

function ladderSteps(ladder) {
  const progs = CAT[ladder.cat].progressions.slice(0, 5);
  return { done: progs.reduce((a, p) => a + levelDone(p.id), 0), total: progs.length * 3, progs };
}

function achievements() {
  const { best } = streakStats();
  const workouts = workoutDays().size;
  const mastered = masteredCount();
  const started = CATS.filter((c) => isStarted(c.id)).length;
  const list = [
    ...STREAK_BADGES.map((b) => ({ id: b.id, name: b.name, num: b.n, icon: 'flame', earned: best >= b.n, hint: `Train ${b.n} scheduled days in a row` })),
    { id: 'w1', name: 'First Rep', icon: 'star', earned: workouts >= 1, hint: 'Log your first workout' },
    { id: 'w10', name: 'Ten Down', num: 10, icon: 'dumbbell', earned: workouts >= 10, hint: 'Train on 10 different days' },
    { id: 'w50', name: 'Half Century', num: 50, icon: 'dumbbell', earned: workouts >= 50, hint: 'Train on 50 different days' },
    { id: 'm1', name: 'First Mastery', icon: 'check', earned: mastered >= 1, hint: 'Complete level 3 of any progression' },
    { id: 'm5', name: 'Five Mastered', num: 5, icon: 'award', earned: mastered >= 5, hint: 'Master 5 progressions' },
    { id: 'm20', name: 'Twenty Mastered', num: 20, icon: 'trophy', earned: mastered >= 20, hint: 'Master 20 progressions' },
    { id: 'x6', name: 'Explorer', num: 6, icon: 'sparkle', earned: started >= 6, hint: 'Start 6 movement families' },
    ...LADDERS.map((l) => { const s = ladderSteps(l); return { id: l.id, name: l.name, icon: l.icon, earned: s.done >= s.total, hint: `Finish all ${s.total} steps of the ${l.name}` }; }),
  ];
  return list;
}

/* ---------------------------------------------------------------
   6. UI primitives: toast, sheet
   --------------------------------------------------------------- */
let toastTimer;
function toast(msg) {
  let el = $('#toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

let sheetReturnFocus = null;
let onSheetClose = null;
function openSheet(title, body, { onClose } = {}) {
  sheetReturnFocus = document.activeElement;
  onSheetClose = onClose || null;
  $('#layer').innerHTML = `
    <div class="overlay" data-action="overlay">
      <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
        <span class="sheet-handle" aria-hidden="true"></span>
        <div class="sheet-head">
          <h2 id="sheetTitle">${esc(title)}</h2>
          <button class="icon-btn round bare" data-action="close-sheet" aria-label="Close">${icon('x')}</button>
        </div>
        <div id="sheetBody">${body}</div>
      </div>
    </div>`;
  enableSheetDrag($('#layer .sheet'));
  const first = $('#layer .sheet button:not([data-action="close-sheet"]), #layer .sheet input, #layer .sheet select');
  (first || $('#layer [data-action="close-sheet"]')).focus();
}
/** Drag the handle or header down to dismiss (touch and mouse). Past 90px or a fast flick closes. */
function enableSheetDrag(sheet) {
  if (!sheet) return;
  let startY = 0, dy = 0, t0 = 0, active = false;
  const grab = (ev) => {
    if (!ev.target.closest('.sheet-handle, .sheet-head') || ev.target.closest('button')) return;
    active = true; startY = ev.clientY; dy = 0; t0 = performance.now();
    sheet.classList.add('dragging');
    sheet.setPointerCapture(ev.pointerId);
  };
  const move = (ev) => {
    if (!active) return;
    dy = Math.max(0, ev.clientY - startY);
    sheet.style.transform = `translateY(${dy}px)`;
  };
  const release = () => {
    if (!active) return;
    active = false;
    sheet.classList.remove('dragging');
    const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
    if (dy > 90 || (fast && dy > 30)) { closeSheet(); return; }
    sheet.classList.add('settling');
    sheet.style.transform = '';
    setTimeout(() => sheet.classList.remove('settling'), 250);
  };
  sheet.addEventListener('pointerdown', grab);
  sheet.addEventListener('pointermove', move);
  sheet.addEventListener('pointerup', release);
  sheet.addEventListener('pointercancel', release);
}

function closeSheet() {
  if (!$('#layer').innerHTML) return;
  $('#layer').innerHTML = '';
  const cb = onSheetClose; onSheetClose = null;
  if (cb) cb();
  if (sheetReturnFocus && document.contains(sheetReturnFocus)) sheetReturnFocus.focus();
}
const sheetOpen = () => !!$('#layer .overlay');

/* ---------------------------------------------------------------
   7. Router
   --------------------------------------------------------------- */
const NAV = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'movements', label: 'Movements', icon: 'run' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
  { id: 'challenges', label: 'Challenges', icon: 'award' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  return { name: parts[0] || 'home', arg: parts[1] ? decodeURIComponent(parts[1]) : null, query: new URLSearchParams(query) };
}

function renderNav(active) {
  const section = { category: 'movements', exercise: 'movements', workout: 'home' }[active] || active;
  const html = NAV.map((n) => `
    <a class="tab" href="#/${n.id}" ${section === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span></a>`).join('');
  $$('[data-nav]').forEach((el) => { el.innerHTML = html; });
}

const VIEWS = {};
let lastRouteKey = '';
let pendingSummary = null;
function render() {
  const r = parseRoute();
  const view = VIEWS[r.name] || VIEWS.home;
  renderNav(r.name);
  $('#view').innerHTML = view(r);
  const key = location.hash;
  if (key !== lastRouteKey) {
    window.scrollTo(0, 0);
    lastRouteKey = key;
  }
  afterRender(r);
  if (pendingSummary) { const s = pendingSummary; pendingSummary = null; showSummary(s); }
}
const rerender = () => {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
};

function go(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}

/* ---------------------------------------------------------------
   8. Views
   --------------------------------------------------------------- */
let selectedDay = dayKey(today());
let carouselIdx = 0;
let tipIdx = Math.floor(Math.random() * TIPS.length);

function greeting() {
  const h = new Date().getHours();
  const part = h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const name = state.profile.name.trim();
  return `${part}${name ? ', ' + esc(name.split(' ')[0]) : ''}`;
}

function dayStatus(d) {
  const k = dayKey(d);
  if (workoutsOn(k).length) return { text: 'Completed', done: true };
  if (!sessionFor(d).length) return { text: 'Rest day' };
  if (d > today()) return { text: 'Upcoming' };
  if (k === dayKey(today())) return { text: 'Not attempted' };
  return { text: 'Missed' };
}

function reminderBanner() {
  const rm = state.reminder;
  if (!rm.enabled) return '';
  const now = new Date();
  const [hh, mm] = rm.time.split(':').map(Number);
  const due = now.getHours() * 60 + now.getMinutes() >= hh * 60 + mm;
  if (!due || workoutsOn(dayKey(today())).length || !sessionFor(today()).length) return '';
  return `<div class="banner">${icon('bell')}<span>It's past ${esc(rm.time)} — today's session is still waiting for you.</span></div>`;
}

VIEWS.home = () => {
  const d = fromKey(selectedDay);
  const cats = sessionFor(d);
  const status = dayStatus(d);
  const r = routine();
  const count30 = Math.min(30, workoutDays().size);
  carouselIdx = clamp(carouselIdx, 0, Math.max(0, cats.length - 1));

  const slides = cats.map((cid, i) => {
    const c = CAT[cid];
    const p = currentProg(cid);
    const lvl = workingLevel(p.id);
    return `
      <div class="ex-slide" data-slide="${i}">
        <a href="#/exercise/${p.id}" aria-label="${esc(p.name)} details">${art(cid, { shift: currentIdx(cid) * 4, img: p.id })}</a>
        <div class="cat-title">${esc(c.name)}</div>
        <div class="row-between ex-meta">
          <div class="grow">
            <div class="label">${esc(c.name)} ${currentIdx(cid) + 1}</div>
            <div class="name">${esc(p.name)}</div>
            <div class="lvl">${isMastered(p.id) ? `<span class="level-ring done">${icon('check')}</span> Mastered` : `<span class="level-ring"></span> Level ${lvl}`}</div>
            <div class="small muted mt-1">${targetText(p, lvl)}</div>
          </div>
          <div class="row gap-3">
            <button class="icon-btn" data-action="rest-settings" aria-label="Rest timer settings">${icon('timer')}</button>
            <button class="icon-btn" data-action="swap-prog" data-cat="${cid}" aria-label="Change ${esc(c.name)} progression">${icon('swap')}</button>
          </div>
        </div>
      </div>`;
  }).join('');

  const isFuture = d > today();
  const routineBody = cats.length ? `
      <div class="ex-carousel" id="carousel">${slides}</div>
      ${cats.length > 1 ? `<div class="carousel-dots" role="tablist">${cats.map((_, i) => `<button data-action="dot" data-i="${i}" aria-label="Exercise ${i + 1}" ${i === carouselIdx ? 'aria-current="true"' : ''}></button>`).join('')}</div>` : '<div class="spacer-5"></div>'}
      <button class="btn block lg" data-action="start-workout" ${isFuture ? 'disabled' : ''}>${status.done ? 'Train again' : isFuture ? 'Upcoming' : 'Start'}</button>`
    : `<div class="rest-day">${icon('moon')}<div class="h3">Rest &amp; recover</div><p class="muted">No session scheduled. Light walking or mobility work is a great idea.</p></div>`;

  const strip = Array.from({ length: 14 }, (_, i) => {
    const day = addDays(today(), i);
    const k = dayKey(day);
    const n = sessionFor(day).length;
    const done = workoutsOn(k).length > 0;
    return `<button class="day-chip ${done ? 'done' : ''}" data-action="pick-day" data-day="${k}" aria-pressed="${k === selectedDay}">
      <div class="wd">${i === 0 ? 'Today' : WEEKDAY_SHORT[day.getDay()]}</div>
      <div class="dn">${day.getDate()}</div>
      <div class="cnt">${done ? icon('check') + ' Done' : n ? icon('dumbbell') + ' ' + n : 'Rest'}</div>
    </button>`;
  }).join('');

  return `
    <h1 class="h1">${greeting()}</h1>
    ${reminderBanner()}
    ${!state.workouts.length && !state.seenIntro ? `
    <section class="card howto" aria-label="How PulseFit works">
      <div class="row-between"><h2 class="h3">How PulseFit works</h2>
        <button class="icon-btn round bare" data-action="dismiss-intro" aria-label="Dismiss">${icon('x')}</button></div>
      <ol>
        <li>${icon('dumbbell')}<span><b>Each movement is a ladder.</b> Start with an exercise you can do with clean form — progression 1 if unsure.</span></li>
        <li>${icon('check')}<span><b>Hit a level's target</b> (e.g. 2 sets of 15) to complete it. Finish level 3 to unlock the next exercise.</span></li>
        <li>${icon('calendar')}<span><b>Train on your scheduled days.</b> Rest days never break your streak.</span></li>
      </ol>
      <button class="btn ghost block" data-action="dismiss-intro">Got it</button>
    </section>` : ''}
    <section class="card challenge-strip" aria-label="30 day workout challenge">
      <div class="row-between">
        <div class="title">${icon('flame')} 30 Day Workout Challenge</div>
        <div class="row gap-2">
          <span class="muted small fw-bold">${count30} / 30 workouts</span>
          <button class="icon-btn round bare" data-action="info-30" aria-label="About the 30 day challenge">${icon('info')}</button>
        </div>
      </div>
      <div class="row">
        <div class="progress grow" role="progressbar" aria-valuemin="0" aria-valuemax="30" aria-valuenow="${count30}"><span style="width:${(count30 / 30) * 100}%"></span></div>
        <span class="gift ${count30 >= 30 ? 'c-warn' : ''}">${icon('gift')}</span>
      </div>
    </section>

    <section class="card routine-card" aria-label="Routine">
      <div class="inner">
        <button class="routine-pick" data-action="pick-routine">${icon('crown')}<span>${esc(r.name)}</span>${icon('swap')}</button>
        ${routineBody}
      </div>
      <div class="day-nav">
        <button class="icon-btn bare" data-action="shift-day" data-n="-1" aria-label="Previous day">${icon('chevL')}</button>
        <div>
          <div class="d1">${fmtLong(d)}</div>
          <div class="d2">Day ${mondayIndex(d) + 1} of 7</div>
          <div class="d3 ${status.done ? 'c-success' : ''}">${status.text}</div>
        </div>
        <button class="icon-btn bare" data-action="shift-day" data-n="1" aria-label="Next day">${icon('chevR')}</button>
      </div>
    </section>

    <h2 class="h2">Upcoming Days</h2>
    <div class="days-strip">${strip}</div>

    <section class="card micro mt-5">
      <h3>${icon('bolt')} Got 60 seconds?<br/>Try a micro fitness hit</h3>
      <div class="note">Adjust to your comfort level — every small step counts!</div>
      <p class="tip">${esc(TIPS[tipIdx % TIPS.length])}</p>
      <button class="btn ghost" data-action="next-tip">${icon('reset')} Another one</button>
    </section>`;
};

VIEWS.movements = () => `
  <h1 class="h1">Movement Library</h1>
  ${state.profile.pro ? '' : `
  <div class="promo">
    <span class="pill">${icon('crown')} Pro</span>
    <h3>Unlock advanced movements</h3>
    <p class="muted m-0 mb-3">Lunges, dips, elbow levers, the clutch flag and the Strength Builder routine.</p>
    <button class="link-btn" data-action="pro">See PulseFit Pro ${icon('chevR', 'class="icon-sm"')}</button>
  </div>`}
  <div class="lib-grid">
    ${CATS.map((c) => {
      const locked = isLocked(c);
      return `<a class="lib-tile" href="#/category/${c.id}" ${locked ? `data-action="locked" data-cat="${c.id}"` : ''}>
        ${art(c.id, { locked, img: c.id })}
        <div class="name">${esc(c.name)}</div>
        <div class="count">${plural(c.progressions.length, 'Progression')}</div>
      </a>`;
    }).join('')}
  </div>`;

VIEWS.category = (r) => {
  const c = CAT[r.arg];
  if (!c) return notFound();
  if (isLocked(c)) return lockedView(c);
  const cur = isStarted(c.id) ? currentIdx(c.id) : -1;
  return `
    <div class="topbar">
      <a class="icon-btn bare round" href="#/movements" aria-label="Back to Movement Library">${icon('chevL')}</a>
      <div class="title">${esc(c.name)}</div>
    </div>
    <div class="art cat-hero" style="--h:${CAT_HUE[c.id] ?? 210}">
      ${media(c.id, c.id)}
    </div>
    <h1 class="h2">${esc(c.name)} Progressions</h1>
    <p class="muted t-lg m-0">${esc(c.blurb || '')} Browse the ${c.progressions.length} progressions below and pick one you can do comfortably and safely. When in doubt, start with progression 1 and work your way up.</p>
    <div class="prog-list">
      ${c.progressions.map((p, i) => {
        const done = levelDone(p.id);
        return `<a class="prog-row" href="#/exercise/${p.id}">
          ${art(c.id, { shift: i * 4, img: p.id })}
          <div>
            <div class="num">Progression ${i + 1}${i === cur ? '<span class="tag-current">Current</span>' : ''}</div>
            <div class="nm">${esc(p.name)}</div>
            <div class="lv">${done >= 3 ? `<span class="level-ring done">${icon('check')}</span> Mastered` : `<span class="level-ring ${done ? 'next' : ''}"></span> Level ${done + 1}`}</div>
          </div>
        </a>`;
      }).join('')}
    </div>`;
};

let exTab = 'levels';
const EX_TABS = ['levels', 'tutorial', 'cues'];
VIEWS.exercise = (r) => {
  const ref = PROG[r.arg];
  if (!ref) return notFound();
  const { p, cat, idx } = ref;
  if (isLocked(cat)) return lockedView(cat);
  const done = levelDone(p.id);
  const isCurrent = isStarted(cat.id) && currentIdx(cat.id) === idx;
  const prev = cat.progressions[idx - 1], next = cat.progressions[idx + 1];

  let tabBody = '';
  if (exTab === 'levels') {
    tabBody = `<ul class="levels">${p.levels.map((l, i) => `
      <li><span class="level-ring big ${done > i ? 'done' : ''}">${done > i ? icon('check') : ''}</span>
        <span class="lname">Level ${i + 1}</span><span class="ltarget">${targetText(p, i + 1)}</span></li>`).join('')}</ul>`;
  } else if (exTab === 'tutorial') {
    tabBody = `
      <h3 class="section-title t-xl">How to do ${esc(p.name.toLowerCase())}?</h3>
      <ol class="steps">${(p.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <h3 class="section-title t-xl">How to make this exercise harder?</h3>
      <p class="t-lg">${esc(p.harder || '')}</p>
      <h3 class="section-title t-xl">How to make this exercise easier?</h3>
      <p class="t-lg">${esc(p.easier || '')}</p>`;
  } else {
    tabBody = `<ul class="cues">${(p.cues || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
  }

  return `
    <div class="topbar">
      <a class="icon-btn bare round" href="#/category/${cat.id}" aria-label="Back to ${esc(cat.name)}">${icon('chevL')}</a>
      <div class="title">${esc(p.name)}</div>
    </div>
    ${art(cat.id, { cls: 'ex-hero', shift: idx * 4, img: p.id, alt: `Athlete demonstrating ${p.name}` })}
    <div class="ex-head">
      <h1>${esc(p.name)}</h1>
      <button class="btn" data-action="log-sets" data-prog="${p.id}">Log sets</button>
    </div>
    <div class="row small muted wrap gap-2">
      <span>${esc(cat.name)} · Progression ${idx + 1} of ${cat.progressions.length}</span>
      ${isCurrent ? '<span class="tag-current c-accent fw-heavy">· CURRENT</span>' : `<button class="link-btn" data-action="set-current" data-prog="${p.id}">Make this my current progression</button>`}
    </div>
    <h2 class="section-title">Overview</h2>
    <p class="overview">${esc(p.overview)}</p>
    <hr class="sep" />
    <div class="h3 mb-2">Muscles Worked</div>
    <div class="small">Primary:</div>
    <div class="chips">${p.primary.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
    <div class="small">Secondary:</div>
    <div class="chips">${p.secondary.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>
    <div class="segmented" role="tablist" aria-label="Exercise details" style="--n:3;--i:${EX_TABS.indexOf(exTab)}">
      ${[['levels', 'Levels'], ['tutorial', 'Tutorial'], ['cues', 'Form Cues']].map(([id, label]) =>
        `<button role="tab" aria-selected="${exTab === id}" data-action="ex-tab" data-tab="${id}">${label}</button>`).join('')}
    </div>
    <div role="tabpanel">${tabBody}</div>
    <div class="row-between mt-6">
      ${prev ? `<a class="btn ghost" href="#/exercise/${prev.id}">${icon('chevL')} ${esc(prev.name)}</a>` : '<span></span>'}
      ${next ? `<a class="btn ghost" href="#/exercise/${next.id}">${esc(next.name)} ${icon('chevR')}</a>` : ''}
    </div>`;
};

VIEWS.activity = () => {
  const { current } = streakStats();
  const total = state.workouts.length;
  const ach = achievements();
  const earned = ach.filter((a) => a.earned);

  const rows = CATS.map((c) => {
    const started = isStarted(c.id);
    const cur = currentIdx(c.id);
    const p = c.progressions[cur];
    const locked = isLocked(c);
    const dots = c.progressions.map((q, i) => `<span class="dot ${isMastered(q.id) ? 'done' : started && i === cur ? 'current' : ''}"></span>`).join('');
    const sub = locked ? 'Pro · Tap to learn more' : started ? `${esc(p.name)} · Level ${isMastered(p.id) ? 'mastered' : workingLevel(p.id) + ' / 3'}` : 'Not Started · Tap to begin';
    return `<a class="mastery-row ${started ? '' : 'inactive'}" href="#/category/${c.id}" ${locked ? `data-action="locked" data-cat="${c.id}"` : ''}>
      ${art(c.id, { shift: started ? cur * 4 : 0, img: started ? p.id : c.id })}
      <div class="grow"><div class="nm">${esc(c.name)}</div><div class="dots" aria-label="${c.progressions.filter((q) => isMastered(q.id)).length} of ${c.progressions.length} mastered">${dots}</div><div class="sub">${sub}</div></div>
    </a>`;
  }).join('');

  // workout history grouped by month
  const sorted = [...state.workouts].sort((a, b) => b.at.localeCompare(a.at));
  const groups = [];
  sorted.forEach((w) => {
    const d = new Date(w.at);
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).replace(' ', ', ');
    let g = groups[groups.length - 1];
    if (!g || g.label !== label) { g = { label, items: [] }; groups.push(g); }
    g.items.push(w);
  });
  const history = groups.length ? groups.map((g) => `
    <div class="month-head"><span>${esc(g.label)}</span><span>${plural(g.items.length, 'Workout')}</span></div>
    ${g.items.map((w) => {
      const d = new Date(w.at);
      return `<div class="history-item">
        <div class="grow">
          <div class="rt">${esc(w.routineName || 'Workout')}</div>
          <div class="dt">${esc(fmtShort(d))}</div>
          <div class="tm">${icon('check')} ${fmtTime(d)} · ${plural(w.entries.length, 'exercise')}</div>
        </div>
        <button class="icon-btn round accent-outline" data-action="view-workout" data-id="${w.id}" aria-label="View workout from ${esc(fmtShort(d))}">${icon('chevR')}</button>
      </div>`;
    }).join('')}`).join('')
    : `<div class="empty">${icon('calendar')}<div>No workouts yet. Your sessions will show up here.</div><a class="btn mt-3" href="#/home">Go to today's session</a></div>`;

  return `
    <h1 class="h1">Activity</h1>
    <div class="stat-grid">
      <button class="stat" data-action="info-streak"><div><div class="v">${current}</div><div class="k">Day Activity Streak</div></div>${icon('chevR')}</button>
      <button class="stat" data-action="scroll-history"><div><div class="v">${total}</div><div class="k">Total Workouts</div></div>${icon('chevR')}</button>
    </div>
    <div class="row-between mt-5"><h2 class="h2 m-0">Achievements</h2><span class="muted small">${earned.length} / ${ach.length} earned</span></div>
    <a class="badge-callout mt-3" href="#/challenges">
      ${icon('award')}
      <div><div class="h3 t-body">${earned.length ? `${plural(earned.length, 'badge')} earned` : 'No badges yet'}</div>
      <div class="small muted">${earned.length ? 'Latest: ' + esc(earned[earned.length - 1].name) : 'Complete challenges to earn badges.'}</div></div>
      ${icon('chevR')}
    </a>
    <h2 class="h2">${masteredCount()} / ${TOTAL_PROGS} Progressions Mastered</h2>
    <div>${rows}</div>
    <h2 class="h2" id="history">Workout History</h2>
    <div>${history}</div>`;
};

function badgeHtml(b) {
  return `<div class="badge ${b.earned ? 'earned' : ''}" title="${esc(b.hint || '')}">
    <div class="medal">${b.num != null ? `<span class="num">${b.num}</span>` : ''}${b.earned ? icon(b.icon || 'award') : icon('lock')}${b.tier ? `<span class="tier">${icon(b.tier)}</span>` : ''}</div>
    <div>${esc(b.name)}</div>
  </div>`;
}

VIEWS.challenges = () => {
  const { best, current } = streakStats();
  const streak = STREAK_BADGES.map((b) => badgeHtml({ ...b, num: b.n, icon: 'flame', earned: best >= b.n }));
  const ladders = LADDERS.map((l) => {
    const s = ladderSteps(l);
    const joined = !!state.joined[l.id];
    const last = s.progs[s.progs.length - 1];
    const done = s.done >= s.total;
    return `<section class="card ch-card">
      <div class="head">${icon(l.icon)}<h3 class="h3">${esc(l.name)}</h3><span class="steps-count">${s.done} / ${s.total} steps</span></div>
      <p>Climb from ${esc(s.progs[0].name)} to ${esc(last.name)}. Each progression you master earns its badge; master ${esc(last.name)} to finish. Levels you've already logged count.</p>
      <div class="progress"><span style="width:${(s.done / s.total) * 100}%"></span></div>
      <div class="badge-grid five">${s.progs.map((p, i) => badgeHtml({ name: p.name, earned: isMastered(p.id), icon: TIER_ICONS[i], tier: TIER_ICONS[i] })).join('')}</div>
      ${done ? `<div class="btn block accent" aria-disabled="true">${icon('trophy')} Completed</div>`
        : joined ? `<div class="row"><a class="btn grow" href="#/category/${l.cat}">Continue</a><button class="btn ghost" data-action="leave" data-id="${l.id}">Leave</button></div>`
        : `<button class="btn block lg" data-action="join" data-id="${l.id}">Join</button>`}
    </section>`;
  }).join('');

  return `
    <h1 class="h1">Challenges</h1>
    <section class="card">
      <div class="row-between"><h2 class="h3">Workout Streaks</h2><span class="muted small">Current: ${current} · Best: ${best}</span></div>
      <p class="muted small m-0 mt-2 mb-4">Train on consecutive scheduled days. Rest days never break a streak.</p>
      <div class="badge-grid">${streak.join('')}</div>
    </section>
    <h2 class="h2">Join a challenge</h2>
    ${ladders}
    <h2 class="h2">All badges</h2>
    <div class="card"><div class="badge-row wrap">${achievements().map(badgeHtml).join('')}</div></div>`;
};

const THEMES = [
  { id: 'midnight', name: 'Midnight', sw: '#1d1660', dots: ['#272b56', '#4888f5', '#5cd1e4'] },
  { id: 'light', name: 'Light', sw: '#ffffff', dots: ['#1556bf', '#006e82'] },
  { id: 'dark', name: 'Dark', sw: '#111111', dots: ['#222', '#4888f5', '#5cd1e4'] },
];

VIEWS.profile = () => {
  const ach = achievements();
  const pf = state.profile;
  return `
    <h1 class="h1">Profile</h1>
    <div class="row-between"><h2 class="h2 m-0 mt-2">Achievements</h2><span class="muted">${ach.filter((a) => a.earned).length} / ${ach.length} earned</span></div>
    <p class="muted m-0 mt-1 mb-4">Complete challenges to earn badges.</p>
    <div class="badge-row">${ach.map(badgeHtml).join('')}</div>

    <div class="field mt-8"><label for="pfName">Name</label>
      <input class="input" id="pfName" data-bind="name" value="${esc(pf.name)}" placeholder="Your name" autocomplete="name" maxlength="40" /></div>
    <div class="field mt-6"><label for="pfEmail">Email</label>
      <input class="input" id="pfEmail" type="email" data-bind="email" value="${esc(pf.email)}" placeholder="you@example.com" autocomplete="email" maxlength="80" /></div>
    <p class="muted small m-0 mt-2 ml-1">Stored only in this browser — nothing is sent anywhere.</p>

    <h2 class="h2">Theme</h2>
    <div role="radiogroup" aria-label="Theme">
      ${THEMES.map((t) => `<button class="theme-opt" role="radio" aria-checked="${pf.theme === t.id}" data-action="theme" data-theme="${t.id}">
        <span class="sw" style="background:${t.sw}">${t.dots.map((c) => `<i style="background:${c}"></i>`).join('')}</span>
        ${t.name}${pf.theme === t.id ? `<span class="check">${icon('check')}</span>` : ''}
      </button>`).join('')}
    </div>

    <div class="list-group mt-5">
      <button class="list-item" data-action="pro"><span>PulseFit Pro<span class="li-sub">${pf.pro ? 'Unlocked' : 'Advanced movements & routines'}</span></span>${icon('chevR')}</button>
      ${installRow()}
      <a class="list-item" href="tracker.html"><span>Daily Health Tracker<span class="li-sub">Steps, sleep, calories &amp; BMI tools</span></span>${icon('external')}</a>
    </div>
    <div class="list-group">
      <button class="list-item" data-action="routine-days"><span>Adjust Routine Days<span class="li-sub">${[1, 2, 3, 4, 5, 6, 0].filter((d) => state.trainingDays.includes(d)).map((d) => WEEKDAY_SHORT[d]).join(', ') || 'None'}</span></span>${icon('chevR')}</button>
      <button class="list-item" data-action="rest-settings"><span>Rest Timer<span class="li-sub">${state.restSeconds} seconds between sets</span></span>${icon('chevR')}</button>
      <button class="list-item" data-action="reminders"><span>Reminders<span class="li-sub">${state.reminder.enabled ? 'Daily at ' + esc(state.reminder.time) : 'Off'}</span></span>${icon('chevR')}</button>
    </div>
    ${accountCard()}
    <div class="list-group">
      <button class="list-item" data-action="export"><span>Export Data</span>${icon('download')}</button>
      <button class="list-item" data-action="import"><span>Import Data</span>${icon('upload')}</button>
      <button class="list-item danger" data-action="reset"><span>Reset All Progress</span>${icon('trash')}</button>
    </div>
    <div class="list-group">
      <button class="list-item" data-action="faq"><span>Help &amp; FAQ</span>${icon('chevR')}</button>
      <button class="list-item" data-action="privacy"><span>Privacy &amp; Terms</span>${icon('chevR')}</button>
    </div>
    <input type="file" id="importFile" accept="application/json,.json" hidden />`;
};

/* ---------- workout session ---------- */
let draft = null; // {date, entries:[{progId, values[], done[]}]}
try { draft = JSON.parse(sessionStorage.getItem('pf2_draft') || 'null'); } catch { draft = null; }
const saveDraft = () => { try { sessionStorage.setItem('pf2_draft', JSON.stringify(draft)); } catch { /* ignore */ } };

function newEntry(progId) {
  const p = PROG[progId].p;
  const l = p.levels[workingLevel(progId) - 1];
  return { progId, values: Array(l.sets).fill(l.target), done: Array(l.sets).fill(false) };
}

function entryEditor(e, i) {
  const { p, cat, idx } = PROG[e.progId];
  const lvl = workingLevel(p.id);
  const unit = unitOf(p);
  return `<section class="card session-ex" data-entry="${i}">
    <div class="top">
      ${art(cat.id, { shift: idx * 4, img: p.id })}
      <div class="grow">
        <div class="small muted">${esc(cat.name)} ${idx + 1}</div>
        <div class="h3">${esc(p.name)}</div>
        <div class="target-line">${isMastered(p.id) ? 'Mastered · ' : `Level ${lvl} target: `}${targetText(p, lvl)}</div>
      </div>
    </div>
    <div class="mt-3">
      ${e.values.map((v, s) => `<div class="set-row">
        <span class="sl">Set ${s + 1}</span>
        <div class="stepper">
          <button data-action="step" data-e="${i}" data-s="${s}" data-d="-1" aria-label="Decrease set ${s + 1}">${icon('minus')}</button>
          <input type="number" inputmode="numeric" min="0" max="999" value="${v}" data-set data-e="${i}" data-s="${s}" aria-label="Set ${s + 1} ${unit}" />
          <button data-action="step" data-e="${i}" data-s="${s}" data-d="1" aria-label="Increase set ${s + 1}">${icon('plus')}</button>
          <span class="unit">${unit}${p.perSide ? '/side' : ''}</span>
        </div>
        <button class="set-done" data-action="toggle-set" data-e="${i}" data-s="${s}" aria-pressed="${e.done[s]}" aria-label="Mark set ${s + 1} done">${icon('check')}</button>
      </div>`).join('')}
    </div>
    <div class="set-actions">
      <button class="btn subtle" data-action="add-set" data-e="${i}">${icon('plus')} Add set</button>
      ${e.values.length > 1 ? `<button class="btn subtle" data-action="remove-set" data-e="${i}">${icon('minus')} Remove set</button>` : ''}
      ${p.type === 'hold' ? `<button class="btn subtle" data-action="hold-timer" data-e="${i}">${icon(holdTimer && holdTimer.e === i ? 'pause' : 'play')} ${holdTimer && holdTimer.e === i ? 'Stop hold' : 'Time a hold'}</button>` : ''}
      <a class="btn subtle" href="#/exercise/${p.id}">${icon('info')} How to</a>
    </div>
  </section>`;
}

VIEWS.workout = () => {
  if (!draft || draft.mode !== 'session') {
    return `<div class="empty">${icon('dumbbell')}<p>No workout in progress.</p><a class="btn" href="#/home">Back to Home</a></div>`;
  }
  const d = fromKey(draft.date);
  const doneSets = draft.entries.reduce((a, e) => a + e.done.filter(Boolean).length, 0);
  return `
    <div class="topbar">
      <button class="icon-btn bare round" data-action="cancel-workout" aria-label="Cancel workout">${icon('x')}</button>
      <div class="title">${esc(routine().name)}</div>
    </div>
    <p class="muted text-center m-0 mb-5">${fmtLong(d)} · Tap ✓ after each set to start your rest timer.</p>
    ${draft.entries.map(entryEditor).join('')}
    <button class="btn block lg" data-action="finish-workout" ${doneSets ? '' : 'disabled'}>Finish workout</button>
    <p class="muted small text-center">Only sets marked ✓ are saved.</p>`;
};

function lockedView(c) {
  return `<div class="empty">${art(c.id, { locked: true, img: c.id, cls: 'locked-hero' })}
    <div class="h3">${esc(c.name)} is a Pro movement</div>
    <p>Unlock it, along with the other advanced families, with PulseFit Pro.</p>
    <button class="btn" data-action="pro">See PulseFit Pro</button></div>`;
}
const notFound = () => `<div class="empty">${icon('help')}<p>That page doesn't exist.</p><a class="btn" href="#/home">Go home</a></div>`;

/* ---------------------------------------------------------------
   9. After-render wiring (carousel scroll sync)
   --------------------------------------------------------------- */
/** Width of one carousel step: slide width plus the CSS gap token. */
const slideStep = (car) => car.clientWidth + (parseFloat(getComputedStyle(car).columnGap) || 0);

function afterRender(r) {
  if (r.name === 'home') {
    const car = $('#carousel');
    if (car) {
      car.scrollLeft = carouselIdx * slideStep(car);
      car.addEventListener('scroll', () => {
        const i = Math.round(car.scrollLeft / slideStep(car));
        if (i !== carouselIdx) {
          carouselIdx = i;
          $$('.carousel-dots button').forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
        }
      }, { passive: true });
    }
  }
}

/* ---------------------------------------------------------------
   10. Workout logic
   --------------------------------------------------------------- */
function evaluate(entry) {
  const { p, cat, idx } = PROG[entry.progId];
  const lvl = workingLevel(p.id);
  const goal = p.levels[lvl - 1];
  const vals = entry.values.filter((_, i) => entry.done[i]).map((v) => Math.max(0, Number(v) || 0));
  const passed = vals.filter((v) => v >= goal.target).length >= goal.sets;
  const result = { progId: p.id, level: lvl, values: vals, passed, leveledUp: false, unlocked: null };
  if (!isStarted(cat.id)) state.current[cat.id] = idx;
  if (passed && levelDone(p.id) < lvl) {
    state.levels[p.id] = lvl;
    result.leveledUp = true;
    if (lvl === 3 && currentIdx(cat.id) === idx && cat.progressions[idx + 1]) {
      state.current[cat.id] = idx + 1;
      result.unlocked = cat.progressions[idx + 1].id;
    }
  }
  return result;
}

function commitWorkout(dateKey, entries, routineName) {
  const before = new Set(achievements().filter((a) => a.earned).map((a) => a.id));
  const results = entries.filter((e) => e.done.some(Boolean)).map(evaluate);
  if (!results.length) return null;
  const d = fromKey(dateKey);
  const now = new Date();
  const at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
  state.workouts.push({
    id: Math.random().toString(36).slice(2, 10),
    at: at.toISOString(),
    routineName,
    entries: results.map(({ progId, level, values, passed }) => ({ progId, level, values, passed })),
  });
  save();
  const newBadges = achievements().filter((a) => a.earned && !before.has(a.id));
  return { results, newBadges };
}

function showSummary(summary) {
  const { results, newBadges } = summary;
  const lines = results.map((r) => {
    const p = PROG[r.progId].p;
    let msg = r.passed ? (r.leveledUp ? `Level ${r.level} complete!` : 'Target hit') : 'Logged — keep at it';
    if (r.unlocked) msg += ` Unlocked ${PROG[r.unlocked].p.name}.`;
    return `<div class="opt static"><span class="level-ring ${r.passed ? 'done' : ''}">${r.passed ? icon('check') : ''}</span>
      <div><div class="t">${esc(p.name)}</div><div class="s">${esc(r.values.join(' · '))} ${unitOf(p)} — ${esc(msg)}</div></div></div>`;
  }).join('');
  openSheet('Workout saved', `
    <div class="celebrate"><div class="big">${results.some((r) => r.leveledUp) ? '🏆' : '💪'}</div>
      <p class="muted">${results.some((r) => r.leveledUp) ? 'You levelled up. Great work!' : 'Every session counts. See you next time!'}</p></div>
    <div class="opt-list">${lines}</div>
    ${newBadges.length ? `<h3 class="h3 m-0 mt-5 mb-2">New badge${newBadges.length > 1 ? 's' : ''}</h3><div class="badge-row">${newBadges.map(badgeHtml).join('')}</div>` : ''}
    <button class="btn block mt-5" data-action="close-sheet">Done</button>`);
}

/* ---------- rest + hold timers ---------- */
let restTimer = null; // {end, int}
function startRest() {
  stopRest();
  const end = Date.now() + state.restSeconds * 1000;
  const bar = document.createElement('div');
  bar.className = 'rest-bar';
  bar.id = 'restBar';
  bar.setAttribute('role', 'timer');
  bar.innerHTML = `<span>Rest</span><span class="t">0:00</span><button class="btn" data-action="skip-rest">Skip</button>`;
  document.body.appendChild(bar);
  const tick = () => {
    const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
    const t = bar.querySelector('.t');
    if (t) t.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
    if (left <= 0) { beep(); stopRest(); toast('Rest over — next set!'); }
  };
  restTimer = { int: setInterval(tick, 250) };
  tick();
}
function stopRest() {
  if (restTimer) clearInterval(restTimer.int);
  restTimer = null;
  const b = $('#restBar'); if (b) b.remove();
}

let holdTimer = null; // {e, start, int}
function toggleHold(e) {
  if (holdTimer && holdTimer.e === e) {
    const secs = Math.round((Date.now() - holdTimer.start) / 1000);
    clearInterval(holdTimer.int);
    holdTimer = null;
    const entry = draft.entries[e];
    let s = entry.done.findIndex((x) => !x);
    if (s === -1) { entry.values.push(secs); entry.done.push(true); }
    else { entry.values[s] = secs; entry.done[s] = true; }
    saveDraft();
    toast(`Hold recorded: ${secs} s`);
    refreshDraftView();
    startRest();
    return;
  }
  if (holdTimer) clearInterval(holdTimer.int);
  stopRest();
  holdTimer = { e, start: Date.now() };
  holdTimer.int = setInterval(() => {
    const btn = $(`[data-action="hold-timer"][data-e="${e}"]`);
    if (btn) btn.lastChild.textContent = ` Stop hold · ${Math.round((Date.now() - holdTimer.start) / 1000)} s`;
  }, 250);
  refreshDraftView();
}

let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach((t) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880; g.gain.value = 0.08;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.15);
    });
  } catch { /* no audio */ }
  if (navigator.vibrate) navigator.vibrate([120, 80, 120]);
}

function refreshDraftView() {
  if (draft && draft.mode === 'quick' && sheetOpen()) {
    $('#sheetBody').innerHTML = quickLogBody();
  } else if (parseRoute().name === 'workout') {
    rerender();
  }
}

function quickLogBody() {
  return `${entryEditor(draft.entries[0], 0)}
    <button class="btn block lg" data-action="save-quick" ${draft.entries[0].done.some(Boolean) ? '' : 'disabled'}>Save sets</button>
    <p class="faint small text-center">Mark each set ✓ to include it.</p>`;
}

/* ---------------------------------------------------------------
   11. Sheets (settings, info)
   --------------------------------------------------------------- */
function routineSheet() {
  openSheet('Choose a routine', `<div class="opt-list" role="radiogroup">
    ${ROUTINES.map((r) => {
      const locked = r.pro && !state.profile.pro;
      return `<button class="opt" role="radio" aria-checked="${routine().id === r.id}" data-action="${locked ? 'pro' : 'set-routine'}" data-id="${r.id}">
        <div><div class="t">${esc(r.name)} ${r.pro ? `<span class="pill ml-2">${icon('crown')} Pro</span>` : ''}</div>
        <div class="s">${esc(r.desc)} ${r.sessions.length > 1 ? `${r.sessions.length} rotating sessions.` : ''}</div></div>
        ${locked ? icon('lock') : routine().id === r.id ? icon('check') : ''}
      </button>`;
    }).join('')}</div>`);
}

function swapSheet(catId) {
  const c = CAT[catId];
  const cur = currentIdx(catId);
  openSheet(`${c.name} progression`, `<p class="muted">Pick the progression you can do comfortably with good form.</p>
    <div class="opt-list" role="radiogroup">
    ${c.progressions.map((p, i) => `<button class="opt" role="radio" aria-checked="${i === cur}" data-action="choose-prog" data-cat="${catId}" data-i="${i}">
      <span class="level-ring ${isMastered(p.id) ? 'done' : ''}">${isMastered(p.id) ? icon('check') : ''}</span>
      <div><div class="t">${i + 1}. ${esc(p.name)}</div><div class="s">${isMastered(p.id) ? 'Mastered' : `Level ${workingLevel(p.id)} · ${targetText(p, workingLevel(p.id))}`}</div></div>
      ${i === cur ? icon('check') : ''}
    </button>`).join('')}</div>`);
}

function restSheet() {
  openSheet('Rest timer', `<p class="muted">Countdown that starts after each completed set.</p>
    <div class="opt-list" role="radiogroup">
    ${[30, 60, 90, 120, 180].map((s) => `<button class="opt" role="radio" aria-checked="${state.restSeconds === s}" data-action="set-rest" data-s="${s}">
      <div class="t">${s < 60 ? s + ' seconds' : s / 60 + (s === 60 ? ' minute' : ' minutes')}</div>${state.restSeconds === s ? icon('check') : ''}</button>`).join('')}
    </div>`);
}

function routineDaysSheet() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  openSheet('Training days', `<p class="muted">Choose the days you want to train. Your routine's sessions rotate across them; the other days are rest days.</p>
    <div class="weekdays">${order.map((d) => `<button data-action="toggle-day" data-d="${d}" aria-pressed="${state.trainingDays.includes(d)}" aria-label="${WEEKDAY_SHORT[d]}">${WEEKDAY_SHORT[d].slice(0, 2)}</button>`).join('')}</div>
    <p class="small muted">${plural(state.trainingDays.length, 'day')} per week. Most people do well with 3–4.</p>
    <button class="btn block" data-action="close-sheet">Done</button>`);
}

function remindersSheet() {
  const rm = state.reminder;
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  openSheet('Reminders', `
    <div class="row-between mb-4"><div><div class="t fw-bold">Daily reminder</div><div class="small muted">On training days, while PulseFit is open</div></div>
      <button class="toggle" role="switch" aria-checked="${rm.enabled}" data-action="toggle-reminder" aria-label="Daily reminder"></button></div>
    <div class="field"><label for="rmTime">Time</label><input class="input" id="rmTime" type="time" value="${esc(rm.time)}" data-bind="reminderTime" /></div>
    <p class="small muted mt-4">${perm === 'granted' ? 'Browser notifications are allowed.' : perm === 'denied' ? 'Browser notifications are blocked — you will still see an in-app banner.' : perm === 'unsupported' ? 'This browser does not support notifications — you will see an in-app banner instead.' : 'Turning this on will ask for notification permission.'}</p>`);
}

function proSheet() {
  openSheet('PulseFit Pro', `
    <p>Pro unlocks the advanced movement families — <strong>Lunges, Dips, Elbow Levers and the Clutch Flag</strong> — plus the <strong>Strength Builder</strong> routine.</p>
    <p class="muted small">This site is a demo with no payments or accounts. Flip the switch to try Pro features for free.</p>
    <div class="row-between card flat soft mt-4 mb-4"><div><div class="fw-bold">Pro features</div><div class="small muted">${state.profile.pro ? 'Unlocked' : 'Locked'}</div></div>
      <button class="toggle" role="switch" aria-checked="${state.profile.pro}" data-action="toggle-pro" aria-label="Pro features"></button></div>`);
}

const FAQ = [
  ['How do progressions work?', 'Each movement family is a ladder of exercises from easiest to hardest. Every exercise has three levels. Hit a level\'s target (for example, 2 sets of 15) and it is marked complete. Finish level 3 and the next progression unlocks as your current one.'],
  ['Where should I start?', 'Pick the progression you can do comfortably for the level 1 target with clean form. If in doubt, start at progression 1 — the early steps build tendon strength and technique.'],
  ['What counts toward my streak?', 'Any workout logged on a scheduled training day. Rest days never break your streak.'],
  ['How do I log a single exercise?', 'Open any exercise and tap "Log sets". It is saved like a workout and counts toward levels and badges.'],
  ['Where is my data stored?', 'Only in this browser (localStorage). Use Export Data in your profile to back it up or move it to another device.'],
  ['Is this medical advice?', 'No. Stop if you feel pain, and check with a medical professional before starting a new training program.'],
];
function faqSheet() {
  openSheet('Help & FAQ', `<div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`);
}
function privacySheet() {
  openSheet('Privacy & Terms', `
    <p><strong>Privacy.</strong> Everything you enter is stored in your browser's local storage. Clearing your browser data or using Reset All Progress deletes it.</p>
    <p><strong>Cloud sync (optional).</strong> Only if you sign in under Profile → Account, a copy of your workouts, levels, progressions, joined ladders, name and app settings is stored in a private Supabase database so your devices can sync. Your email field, reminders and anything else on this device are never uploaded. Only the owner's account can read or write that copy. Delete cloud data removes it.</p>
    <p><strong>Imagery.</strong> Exercise photos are AI-generated illustrations, not photographs of real athletes. Follow the written cues for exact form.</p>
    <p><strong>Terms.</strong> PulseFit is provided as-is for general fitness education. Exercise carries inherent risk; train within your abilities, warm up properly, and stop if anything hurts. Consult a qualified professional if you have health concerns.</p>`);
}

function workoutSheet(id) {
  const w = state.workouts.find((x) => x.id === id);
  if (!w) return;
  const d = new Date(w.at);
  openSheet(fmtShort(d), `
    <p class="muted">${esc(w.routineName || 'Workout')} · ${fmtTime(d)}</p>
    <div class="opt-list">${w.entries.map((e) => {
      const ref = PROG[e.progId];
      const name = ref ? ref.p.name : e.progId;
      return `<div class="opt static"><span class="level-ring ${e.passed ? 'done' : ''}">${e.passed ? icon('check') : ''}</span>
        <div><div class="t">${esc(name)} · Level ${e.level}</div><div class="s">${esc(e.values.join(' · '))} ${ref ? unitOf(ref.p) : ''}${e.passed ? ' — target hit' : ''}</div></div></div>`;
    }).join('')}</div>
    <button class="btn block danger mt-5" data-action="delete-workout" data-id="${w.id}">${icon('trash')} Delete workout</button>
    <p class="faint small text-center">Deleting a workout does not undo levels already earned.</p>`);
}

/* ---------------------------------------------------------------
   12. Event delegation
   --------------------------------------------------------------- */
/* ---------- cloud sync UI (engine in sync.js) ---------- */
function downloadJson(obj, name) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}-${dayKey(today())}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function ago(iso) {
  if (!iso) return 'not yet';
  const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return fmtShort(new Date(iso));
}

function syncLine(st) {
  switch (st.state) {
    case 'syncing': return 'Syncing…';
    case 'ok': return `Synced ${ago(st.lastSynced)}`;
    case 'offline': return 'Offline: changes are saved on this device';
    case 'unreachable': return "Can't reach the cloud (it may be paused). Changes are saved on this device.";
    case 'auth': return 'Sign in again to sync';
    case 'not_allowed': return "This account can't sync";
    case 'error': return st.detail || 'Sync failed. Will retry.';
    default: return st.lastSynced ? `Last synced ${ago(st.lastSynced)}` : 'Connecting…';
  }
}

function accountCard() {
  const S = window.PFSync;
  const st = S ? S.status() : { configured: false };
  if (!st.configured) {
    return `<div class="list-group"><div class="list-item static"><span>Back up &amp; sync<span class="li-sub">Cloud sync isn't set up yet (see docs/SUPABASE_SETUP.md)</span></span>${icon('cloud')}</div></div>`;
  }
  const rec = S.recovery();
  const recRow = rec ? `<button class="list-item" data-action="sync-recovery"><span>Download this device's data from before the reset<span class="li-sub">Saved ${esc(ago(rec.at))}</span></span>${icon('download')}</button>` : '';
  if (!st.user) {
    return `<div class="list-group">
      <button class="list-item" data-action="sync-signin"><span>Back up &amp; sync<span class="li-sub">${st.ready ? 'Sign in to sync your phone and computer' : 'Loading…'}</span></span>${icon('cloud')}</button>${recRow}</div>`;
  }
  return `<div class="list-group">
    <button class="list-item" data-action="sync-now"><span>${esc(st.user.email || 'Signed in')}<span class="li-sub" data-sync-line>${esc(syncLine(st))}</span></span>${icon('cloud')}</button>
    ${recRow}
    <button class="list-item" data-action="sync-signout"><span>Sign out<span class="li-sub">Your data stays on this device</span></span>${icon('chevR')}</button>
    <button class="list-item danger" data-action="sync-delete"><span>Delete cloud data</span>${icon('trash')}</button>
  </div>`;
}

/* ---------- installable app (helpers in pwa.js) ---------- */
function installRow() {
  const I = window.PFInstall;
  if (!I || I.installed()) return '';
  return `<button class="list-item" data-action="install"><span>Install PulseFit app<span class="li-sub">Home-screen icon, full screen, works offline</span></span>${icon('download')}</button>`;
}

function installSheet() {
  const I = window.PFInstall;
  const steps = I && I.isIOS
    ? ['Open this page in <strong>Safari</strong>.', 'Tap the <strong>Share</strong> button (square with an arrow).', 'Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.']
    : ['Open the browser menu (<strong>⋮</strong>, top right in Chrome).', 'Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.', 'Confirm with <strong>Install</strong>.'];
  openSheet('Install PulseFit', `
    <p class="muted m-0 mb-4">PulseFit becomes an app on your home screen: it opens full screen, works offline, and keeps your data and sync.</p>
    <ol class="m-0">${steps.map((s) => `<li class="mb-2">${s}</li>`).join('')}</ol>`);
}

function signInSheet() {
  openSheet('Back up & sync', `
    <p class="muted m-0 mb-4">Sign in to keep your workouts and progress in sync across your devices. This app works fully without signing in.</p>
    <button class="btn block lg" data-action="sync-google">Continue with Google</button>
    <div class="field mt-6"><label for="syncEmail">Or get a sign-in link by email</label>
      <input class="input" id="syncEmail" type="email" autocomplete="email" placeholder="you@example.com" maxlength="120" /></div>
    <button class="btn ghost block mt-3" data-action="sync-email">Email me a link</button>
    <p class="muted small m-0 mt-3">Open the link in this same browser.</p>`);
}

function codeSheet(email) {
  openSheet('Check your email', `
    <p class="muted m-0 mb-4">We sent a sign-in email to <strong>${esc(email)}</strong>. Open its link in this browser. If the email also shows a 6-digit code, you can type it here instead.</p>
    <div class="field"><label for="syncCode">Code</label>
      <input class="input" id="syncCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456" data-email="${esc(email)}" /></div>
    <button class="btn block mt-3" data-action="sync-code">Sign in with code</button>`);
}

window.PF_APP = {
  getState: () => state,
  setState: (s) => { state = s; save(); applyTheme(); if (!sheetOpen() && !document.activeElement?.matches('input, textarea')) rerender(); },
  freshState: () => { const s = defaultState(); s.profile.theme = state.profile.theme; return s; },
  downloadJson,
  toast,
};

const ACTIONS = {
  'install': async () => {
    const I = window.PFInstall;
    if (I && I.canPrompt()) { if (await I.prompt()) toast('PulseFit installed'); rerender(); }
    else installSheet();
  },
  'sync-signin': signInSheet,
  'sync-google': () => window.PFSync.signInGoogle(),
  'sync-email': async () => {
    const email = ($('#syncEmail')?.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('Enter a valid email'); return; }
    if (await window.PFSync.signInEmail(email)) codeSheet(email);
  },
  'sync-code': async () => {
    const el = $('#syncCode');
    const code = (el?.value || '').replace(/\s/g, '');
    if (!/^\d{6,10}$/.test(code)) { toast('Enter the code from the email'); return; }
    if (await window.PFSync.verifyCode(el.dataset.email, code)) { closeSheet(); toast('Signed in'); }
  },
  'sync-now': () => window.PFSync.syncNow(),
  'sync-signout': () => { if (confirm('Sign out of cloud sync? Your data stays on this device.')) window.PFSync.signOut(); },
  'sync-delete': () => {
    if (confirm('Delete your cloud copy and sign out? Data on this device is not affected.')) window.PFSync.deleteCloud();
  },
  'sync-recovery': () => {
    const r = window.PFSync.recovery();
    if (!r) return;
    downloadJson(r.state, 'pulsefit-before-reset');
    if (confirm('Downloaded. Remove the saved copy from this device?')) { window.PFSync.clearRecovery(); rerender(); }
  },
  'overlay': (el, ev) => { if (ev.target === el) closeSheet(); },
  'close-sheet': () => closeSheet(),
  'pick-routine': routineSheet,
  'set-routine': (el) => { state.routineId = el.dataset.id; carouselIdx = 0; save(); closeSheet(); rerender(); toast(`Routine: ${ROUTINE[el.dataset.id].name}`); },
  'swap-prog': (el) => swapSheet(el.dataset.cat),
  'choose-prog': (el) => { state.current[el.dataset.cat] = Number(el.dataset.i); save(); closeSheet(); rerender(); },
  'rest-settings': restSheet,
  'set-rest': (el) => { state.restSeconds = Number(el.dataset.s); save(); closeSheet(); rerender(); },
  'dot': (el) => {
    carouselIdx = Number(el.dataset.i);
    const car = $('#carousel');
    if (car) car.scrollTo({ left: carouselIdx * slideStep(car), behavior: 'smooth' });
  },
  'shift-day': (el) => { selectedDay = dayKey(addDays(fromKey(selectedDay), Number(el.dataset.n))); carouselIdx = 0; rerender(); },
  'pick-day': (el) => { selectedDay = el.dataset.day; carouselIdx = 0; rerender(); },
  'next-tip': () => { tipIdx++; rerender(); },
  'dismiss-intro': () => { state.seenIntro = true; save(); rerender(); },
  'info-30': () => openSheet('30 Day Workout Challenge', `<p>Train on 30 different days to complete the challenge. Days don't need to be consecutive — just keep showing up.</p><p class="muted">${workoutDays().size >= 30 ? 'You did it! 🎉' : `${30 - Math.min(30, workoutDays().size)} to go.`}</p>`),
  'info-streak': () => { const s = streakStats(); openSheet('Activity streak', `<p>Your streak counts consecutive <strong>scheduled training days</strong> with a logged workout. Rest days are skipped, so they never break it.</p><p class="muted">Current: ${s.current} · Best: ${s.best}</p>`); },
  'scroll-history': () => { const h = $('#history'); if (h) h.scrollIntoView({ behavior: 'smooth' }); },
  'start-workout': () => {
    const cats = sessionFor(fromKey(selectedDay));
    if (!cats.length) return;
    cats.forEach((c) => { if (!isStarted(c)) state.current[c] = 0; });
    save();
    draft = { mode: 'session', date: selectedDay, entries: cats.map((c) => newEntry(currentProg(c).id)) };
    saveDraft();
    go('#/workout');
  },
  'cancel-workout': () => {
    const any = draft && draft.entries.some((e) => e.done.some(Boolean));
    if (any && !confirm('Discard this workout? Sets you marked will not be saved.')) return;
    draft = null; saveDraft(); stopRest(); go('#/home');
  },
  'finish-workout': () => {
    stopRest();
    const s = commitWorkout(draft.date, draft.entries, routine().name);
    draft = null; saveDraft();
    pendingSummary = s;
    go('#/home');
  },
  'log-sets': (el) => {
    draft = { mode: 'quick', date: dayKey(today()), entries: [newEntry(el.dataset.prog)] };
    openSheet(`Log ${PROG[el.dataset.prog].p.name}`, quickLogBody(), { onClose: () => { if (draft && draft.mode === 'quick') { draft = null; stopRest(); if (holdTimer) { clearInterval(holdTimer.int); holdTimer = null; } } } });
  },
  'save-quick': () => {
    stopRest();
    const s = commitWorkout(draft.date, draft.entries, 'Quick log');
    draft = null;
    closeSheet();
    rerender();
    if (s) showSummary(s);
  },
  'step': (el) => {
    const e = draft.entries[el.dataset.e], s = Number(el.dataset.s);
    e.values[s] = clamp((Number(e.values[s]) || 0) + Number(el.dataset.d), 0, 999);
    const input = $(`input[data-set][data-e="${el.dataset.e}"][data-s="${s}"]`);
    if (input) input.value = e.values[s];
    saveDraft();
  },
  'toggle-set': (el) => {
    const e = draft.entries[el.dataset.e], s = Number(el.dataset.s);
    e.done[s] = !e.done[s];
    saveDraft();
    el.setAttribute('aria-pressed', String(e.done[s]));
    if (e.done[s]) startRest(); else stopRest();
    const fin = $('[data-action="finish-workout"], [data-action="save-quick"]');
    if (fin) fin.disabled = !draft.entries.some((x) => x.done.some(Boolean));
  },
  'add-set': (el) => { const e = draft.entries[el.dataset.e]; e.values.push(e.values[e.values.length - 1] ?? 0); e.done.push(false); saveDraft(); refreshDraftView(); },
  'remove-set': (el) => { const e = draft.entries[el.dataset.e]; if (e.values.length > 1) { e.values.pop(); e.done.pop(); } saveDraft(); refreshDraftView(); },
  'hold-timer': (el) => toggleHold(Number(el.dataset.e)),
  'skip-rest': stopRest,
  'ex-tab': (el) => {
    const from = EX_TABS.indexOf(exTab);
    exTab = el.dataset.tab;
    rerender();
    // Re-rendering replaces the control, so replay the slide from the old position.
    const seg = $('.segmented');
    if (seg && from !== EX_TABS.indexOf(exTab)) {
      seg.style.setProperty('--i', from);
      void seg.offsetWidth;
      seg.style.setProperty('--i', EX_TABS.indexOf(exTab));
    }
    const sel = $('.segmented [aria-selected="true"]');
    if (sel) sel.focus();
  },
  'set-current': (el) => { const { cat, idx, p } = PROG[el.dataset.prog]; state.current[cat.id] = idx; save(); rerender(); toast(`${p.name} is now your current ${cat.name.toLowerCase()} progression`); },
  'locked': (el, ev) => { ev.preventDefault(); proSheet(); },
  'pro': proSheet,
  'toggle-pro': () => { state.profile.pro = !state.profile.pro; save(); closeSheet(); rerender(); toast(state.profile.pro ? 'Pro features unlocked' : 'Pro features turned off'); },
  'join': (el) => {
    const l = LADDERS.find((x) => x.id === el.dataset.id);
    state.joined[l.id] = dayKey(today());
    if (!isStarted(l.cat)) state.current[l.cat] = 0;
    save(); rerender();
    toast(`Joined! ${CAT[l.cat].name} is now on your progress board.`);
  },
  'leave': (el) => { delete state.joined[el.dataset.id]; save(); rerender(); },
  'theme': (el) => { state.profile.theme = el.dataset.theme; save(); applyTheme(); rerender(); },
  'routine-days': routineDaysSheet,
  'toggle-day': (el) => {
    const d = Number(el.dataset.d);
    const has = state.trainingDays.includes(d);
    if (has && state.trainingDays.length === 1) { toast('Keep at least one training day'); return; }
    state.trainingDays = has ? state.trainingDays.filter((x) => x !== d) : [...state.trainingDays, d];
    save(); routineDaysSheet(); rerender();
  },
  'reminders': remindersSheet,
  'toggle-reminder': async () => {
    state.reminder.enabled = !state.reminder.enabled;
    if (state.reminder.enabled && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }
    save(); remindersSheet(); rerender();
  },
  'export': () => downloadJson(state, 'pulsefit-backup'),
  'import': () => $('#importFile').click(),
  'reset': () => {
    if (!confirm('Reset all progress, workouts and settings? This cannot be undone.')) return;
    const theme = state.profile.theme;
    state = defaultState(); state.profile.theme = theme;
    if (window.PFSync) window.PFSync.noteReset(state);   // a reset replaces older data on synced devices too
    save(); rerender(); toast('All progress reset');
  },
  'faq': faqSheet,
  'privacy': privacySheet,
  'view-workout': (el) => workoutSheet(el.dataset.id),
  'delete-workout': (el) => {
    if (!confirm('Delete this workout?')) return;
    state.workouts = state.workouts.filter((w) => w.id !== el.dataset.id);
    save(); closeSheet(); rerender(); toast('Workout deleted');
  },
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (!fn) return;
  if (el.dataset.action === 'step' && suppressStepClick) { suppressStepClick = false; return; }
  if (el.dataset.action === 'overlay') { fn(el, ev); return; }
  fn(el, ev);
});

/* Press and hold a stepper button to repeat (after 400ms, every 70ms). */
let holdRepeat = null;
let suppressStepClick = false;
document.addEventListener('pointerdown', (ev) => {
  const el = ev.target.closest('[data-action="step"]');
  if (!el) return;
  clearTimeout(holdRepeat?.t); clearInterval(holdRepeat?.i);
  suppressStepClick = false;
  holdRepeat = { t: setTimeout(() => {
    suppressStepClick = true;
    holdRepeat.i = setInterval(() => ACTIONS.step(el), 70);
  }, 400) };
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => document.addEventListener(type, () => {
  if (holdRepeat) { clearTimeout(holdRepeat.t); clearInterval(holdRepeat.i); holdRepeat = null; }
}, true));

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.matches('[data-set]') && draft) {
    draft.entries[t.dataset.e].values[t.dataset.s] = clamp(Number(t.value) || 0, 0, 999);
    saveDraft();
  } else if (t.dataset.bind === 'name' || t.dataset.bind === 'email') {
    state.profile[t.dataset.bind] = t.value;
    save();
  } else if (t.dataset.bind === 'reminderTime') {
    state.reminder.time = t.value || '18:00';
    save();
  }
});

document.addEventListener('change', async (ev) => {
  if (ev.target.id !== 'importFile') return;
  const file = ev.target.files[0];
  ev.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object' || !Array.isArray(data.workouts) || typeof data.levels !== 'object') throw new Error('bad');
    const d = defaultState();
    if (window.PFSync && window.PFSync.signedIn()) {
      // Signed in: merge the file into the synced data instead of replacing it.
      if (!confirm('Merge this file into your synced data? Workouts are combined and the highest levels are kept. Your settings stay as they are.')) return;
      state = window.PFSync.mergeImport(state, data);
      save(); rerender(); toast('Backup merged');
      return;
    }
    state = { ...d, ...data, profile: { ...d.profile, ...(data.profile || {}) }, reminder: { ...d.reminder, ...(data.reminder || {}) } };
    save(); applyTheme(); rerender(); toast('Data imported');
  } catch {
    toast("That file doesn't look like a PulseFit backup");
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && sheetOpen()) closeSheet();
});

/* ---------------------------------------------------------------
   13. Theme, reminders, boot
   --------------------------------------------------------------- */
function applyTheme() {
  const t = THEMES.some((x) => x.id === state.profile.theme) ? state.profile.theme : 'midnight';
  document.documentElement.setAttribute('data-theme', t);
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = { midnight: '#1c2a55', light: '#ffffff', dark: '#13161d' }[t];
}

function checkReminder() {
  const rm = state.reminder;
  if (!rm.enabled || !('Notification' in window) || Notification.permission !== 'granted') return;
  const k = dayKey(today());
  if (rm.lastNotified === k || workoutsOn(k).length || !sessionFor(today()).length) return;
  const [hh, mm] = rm.time.split(':').map(Number);
  const now = new Date();
  if (now.getHours() * 60 + now.getMinutes() < hh * 60 + mm) return;
  try { new Notification('PulseFit', { body: "Today's session is waiting. A few sets is all it takes!" }); } catch { /* ignore */ }
  rm.lastNotified = k;
  save();
}

// Hide nav-dependent brand icon placeholder
$$('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });

window.addEventListener('hashchange', () => { closeSheet(); stopRest(); render(); });
// Refresh Profile when the install option appears or the app gets installed (pwa.js).
if (window.PFInstall) window.PFInstall.onChange(() => { if (parseRoute().name === 'profile' && !sheetOpen()) rerender(); });
// Called by sync.js once it loads: refresh the Account card when sync status changes.
window.PF_onSyncReady = () => window.PFSync.onChange((st) => {
  if (parseRoute().name !== 'profile' || sheetOpen()) return;
  const line = $('[data-sync-line]');
  if (line && st.user) line.textContent = syncLine(st);                  // same card, new status
  else if (!document.activeElement?.matches('input, textarea')) rerender(); // signed in/out: redraw the card
});
applyTheme();
if (!location.hash) history.replaceState(null, '', '#/home');
render();
checkReminder();
setInterval(checkReminder, 60000);
