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
  refresh: 'M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4.5v4.2h-4.2',
  upload: 'M12 20V8.5M7 13.5l5-5 5 5M4.5 4h15',
  reset: 'M4 12a8 8 0 1 0 2.4-5.7L4 8.6M4 3.5v5.1h5.1',
  heartPulse: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>',
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
    planReminder: { enabled: true, day: 5, time: '18:00', lastNotified: '' },  // weekly "next week's plan is out" (0 = Sun … 6 = Sat)
    challengeStart: null,
    hprofile: {},                       // body profile & targets (Track tab)
    hlog: {},                           // "YYYY-MM-DD|field" -> number: weight, steps, sleep, water, measurements
    foods: {},                          // saved foods: id -> { name, kcal, protein? }
    meals: [],                          // {id, day, at, name, kcal, protein?}
    grocery: {},                        // "weekMonday|ingredient" -> 1 (bought as suggested) or { b: amount bought, sub?: stand-in, sb?: its amount }
    foodsSeeded: false,                 // starter "My foods" added on this device (not synced)
    foodsSeededDE: false,               // German everyday foods added on this device (not synced)
    hmigrated: false,                   // old tracker.html data imported on this device (not synced)
  };
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return defaultState();
    const d = defaultState();
    return { ...d, ...raw, profile: { ...d.profile, ...(raw.profile || {}) }, reminder: { ...d.reminder, ...(raw.reminder || {}) }, planReminder: { ...d.planReminder, ...(raw.planReminder || {}) } };
  } catch {
    return defaultState();
  }
}

let state = loadState();
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  if (window.PFSync) window.PFSync.noteSave(state);   // cloud sync (sync.js), if loaded
  if (window.PF_widgetPush) window.PF_widgetPush();     // Android home-screen widget, in the app only
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
  { id: 'today', label: 'Today', icon: 'home' },
  { id: 'exercises', label: 'Exercises', icon: 'run' },
  { id: 'progress', label: 'Progress', icon: 'activity' },
  { id: 'profile', label: 'Profile', icon: 'user' },
];

function parseRoute() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = h.split('?');
  const parts = path.split('/').filter(Boolean);
  return { name: parts[0] || 'today', arg: parts[1] ? decodeURIComponent(parts[1]) : null, query: new URLSearchParams(query) };
}

function renderNav(active) {
  const section = { movements: 'exercises', category: 'exercises', exercise: 'exercises', workout: 'today', home: 'today', track: 'today', plan: 'today', activity: 'progress', challenges: 'progress' }[active] || active;
  const html = NAV.map((n) => `
    <a class="tab" href="#/${n.id}" ${section === n.id ? 'aria-current="page"' : ''}>${icon(n.icon)}<span>${n.label}</span></a>`).join('');
  $$('[data-nav]').forEach((el) => { el.innerHTML = html; });
}

const VIEWS = {};
let lastRouteKey = '';
let pendingSummary = null;
function render() {
  const r = parseRoute();
  const view = VIEWS[r.name] || VIEWS.today;
  renderNav(r.name);
  document.body.dataset.route = r.name;        // e.g. hides the tab bar during a workout
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
  const part = h < 5 ? 'Evening' : h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
  const name = state.profile.name.trim();
  return name ? `${part}, ${esc(name.split(' ')[0])}` : `Good ${part.toLowerCase()}`;
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

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
/** True on the reminder's weekday once its time has passed (the moment to notify). */
function planReminderDue() {
  const pr = state.planReminder;
  if (!pr.enabled || !window.PF_MEALS) return false;
  const now = new Date();
  const [hh, mm] = pr.time.split(':').map(Number);
  return now.getDay() === pr.day && now.getHours() * 60 + now.getMinutes() >= hh * 60 + mm;
}
/** The Today banner stays from the reminder until the end of Saturday, the last shopping day before Sunday. */
function planBannerDue() {
  const pr = state.planReminder;
  if (!pr.enabled || !window.PF_MEALS) return false;
  const r = (pr.day + 6) % 7, t = planIdx(todayKey());               // Monday = 0 … Saturday = 5
  return planReminderDue() || (t > r && t <= 5);
}
/** Next week's plan comes out on Friday: Friday–Sunday the reminder and Groceries are about next week. */
const planReminderWeek = () => (planIdx(todayKey()) >= 4 ? 1 : 0);
function planBanner() {
  if (!planBannerDue()) return '';
  const w = planReminderWeek();
  const start = keyAdd(weekStart(todayKey()), 7 * w);
  if (Object.keys(state.grocery).some((k) => k.startsWith(start + '|'))) return '';   // already shopping from the list
  const wd = new Date().getDay();
  const when = wd === 6 ? ' Shops are closed tomorrow, so shop today.' : wd === 5 ? ' Shop tomorrow: shops are closed on Sunday.' : '';
  return `<div class="banner">${icon('bell')}<span class="grow">${w ? "Next week's meal plan is ready." : "This week's meal plan is ready."}${when}</span>
    <button class="btn subtle sm" data-action="open-groceries" data-w="${w}">Groceries</button></div>`;
}

/* ---------- shared bits for the redesigned views ---------- */
/** Row of small segments: 'done' (success), 'cur' (primary), anything else is off. */
const segBar = (states, cls = '') => `<span class="segs ${cls}" aria-hidden="true">${states.map((s) => `<i class="${s}"></i>`).join('')}</span>`;
/** Progress ring: pct 0–1, drawn with the accent token. */
function ringSvg(pct, size = 88, stroke = 9) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = clamp(pct, 0, 1);
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-fg" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}
const routineShort = (r) => r.name.replace(/\s*Routine$/i, '');
const planLogged = (key, label) => state.meals.some((m) => m.day === key && m.name.startsWith(label + ':'));

/** Level states for a progression: done levels, the working level, the rest. */
const levelStates = (p) => [0, 1, 2].map((i) => (levelDone(p.id) > i ? 'done' : i === workingLevel(p.id) - 1 ? 'cur' : 'off'));

/* ---------- Today (Home + Track) ---------- */
VIEWS.today = () => {
  const tk = todayKey();
  const sel = fromKey(selectedDay);
  const isToday = selectedDay === tk;
  const cats = sessionFor(sel);
  const status = dayStatus(sel);
  const r = routine();
  const { current: streak } = streakStats();
  const ws = weekStart(tk);

  const week = Array.from({ length: 7 }, (_, i) => {
    const k = keyAdd(ws, i), d = fromKey(k);
    const done = workoutsOn(k).length > 0, train = sessionFor(d).length > 0;
    const mark = done ? icon('check') : train && k >= tk ? icon('dumbbell') : '<i class="dot"></i>';
    return `<button class="wk-day ${k === selectedDay ? 'sel' : ''} ${done ? 'done' : ''}" data-action="pick-day" data-day="${k}" aria-pressed="${k === selectedDay}" aria-label="${esc(fmtLong(d))}: ${done ? 'workout done' : train ? 'training day' : 'rest day'}">
      <span class="wd">${WEEKDAY_SHORT[d.getDay()]}</span><span class="dn">${d.getDate()}</span><span class="mk">${mark}</span></button>`;
  }).join('');

  const rows = cats.map((cid) => {
    const c = CAT[cid], p = currentProg(cid), lvl = workingLevel(p.id), L = p.levels[lvl - 1];
    return `<a class="sess-row" href="#/exercise/${p.id}">
      ${art(cid, { cls: 'thumb', shift: currentIdx(cid) * 4, img: p.id })}
      <span class="grow"><span class="nm">${esc(p.name)}</span><span class="meta">${esc(c.name)} ${currentIdx(cid) + 1} · ${isMastered(p.id) ? 'Mastered' : `Level ${lvl}`} · ${L.sets} × ${L.target}${p.type === 'hold' ? ' s' : ''}</span></span>
      ${segBar(levelStates(p), 'dots')}
    </a>`;
  }).join('');
  const sets = cats.reduce((a, cid) => { const p = currentProg(cid); return a + p.levels[workingLevel(p.id) - 1].sets; }, 0);
  const mins = Math.max(5, Math.round((sets * (state.restSeconds + 45)) / 60));
  const isFuture = sel > today();
  const session = cats.length ? `
      <div class="sess-list">${rows}</div>
      <button class="btn block lg start-btn" data-action="start-workout" ${isFuture ? 'disabled' : ''}>${icon('play')} ${status.done ? 'Train again' : isFuture ? 'Upcoming' : `Start · about ${mins} min`}</button>
      <div class="row-between small muted mt-3"><span>Rest timer ${state.restSeconds} s</span><button class="link-btn" data-action="rest-settings">Change</button></div>`
    : `<div class="rest-day">${icon('moon')}<div><div class="fw-bold">Rest &amp; recover</div><p class="muted small m-0">No session on this day. A walk or some mobility work is a great idea.</p></div></div>`;

  // Today's log
  const T = targets(tk);
  const meals = state.meals.filter((m) => m.day === tk);
  const eaten = meals.reduce((a, m) => a + m.kcal, 0), protein = meals.reduce((a, m) => a + (m.protein || 0), 0);
  const left = T ? T.kcal - eaten : null;
  const ringCenter = T
    ? `<b>${nf(Math.abs(left))}</b><small>${left >= 0 ? 'left' : 'over'}</small>`
    : `<b>${nf(eaten)}</b><small>eaten</small>`;
  let next = '';
  if (window.PF_MEALS) {
    const di = planIdx(tk);
    const dmeals = dayInfo(di, weekStart(tk)).meals;
    const j = dmeals.findIndex((m) => !planLogged(tk, m.label));
    next = j < 0
      ? '<p class="small muted m-0 mt-2">All of today\'s plan is logged. Nice work.</p>'
      : `<div class="next-meal mt-2"><span class="plan-k accent">${dmeals[j].label}</span>
          <span class="grow">${dishLinks(dmeals[j], weekStart(tk))}<span class="d-block small muted">${nf(dmeals[j].kcal)} kcal · ${nf(dmeals[j].protein)} g protein</span></span>
          <button class="btn subtle sm" data-action="plan-log" data-day="${di}" data-wk="${weekStart(tk)}" data-m="${j}" aria-label="Log ${dmeals[j].label.toLowerCase()} today">${icon('plus')} Log</button></div>`;
  }
  const p = hp();
  const w = hget(tk, 'weight'), wl = latestOn('weight', tk), a = avg7(tk), rate = weeklyRate(tk);
  const cur = a ?? wl?.v;
  const start = firstOf('weight')?.v;
  const goalPct = p.goalWeight && start && cur && start > p.goalWeight ? (start - cur) / (start - p.goalWeight) : 0;
  const steps = hget(tk, 'steps'), sleep = hget(tk, 'sleep'), water = hget(tk, 'water');
  const sg = p.stepGoal || HDEF.stepGoal, lg = p.sleepGoal || HDEF.sleepGoal, wg = p.waterGoal || HDEF.waterGoal;
  const tile = (action, k, v, u, sub, pct, accent, label, extra = '') => `<button class="q-tile" data-action="${action}" data-today="1" aria-label="${label}" ${extra}>
      <span class="row-between"><span class="k">${k}</span><span class="q-plus">${icon('plus')}</span></span>
      <span class="v">${v}${u ? ` <small>${u}</small>` : ''}</span><span class="sub">${sub}</span>
      <span class="bar"><span class="${accent ? 'accent' : ''}" style="width:${clamp(pct, 0, 1) * 100}%"></span></span></button>`;
  const wsub = wl == null ? 'Log your morning weight'
    : [rate != null && Math.abs(rate) >= 0.05 ? `${rate < 0 ? '↓' : '↑'} ${Math.abs(rate).toFixed(1)} kg a week` : '',
      p.goalWeight && cur != null && cur - p.goalWeight > 0.05 ? `${kg(cur - p.goalWeight)} to goal` : ''].filter(Boolean).join(' · ') || (w != null ? 'Logged today' : `Last: ${fmtShort(fromKey(wl.day))}`);

  return `
    <div class="today-head">
      <div><div class="small muted fw-500">${esc(fmtLong(today()))}</div><h1 class="h1 m-0">${greeting()}</h1></div>
      <button class="streak-pill" data-action="info-streak" aria-label="${streak} day streak">${icon('flame')} ${streak}</button>
    </div>
    ${reminderBanner()}
    ${planBanner()}
    <div class="wk-strip">${week}</div>
    ${!state.workouts.length && !state.seenIntro ? `
    <section class="card howto mt-4" aria-label="How PulseFit works">
      <div class="row-between"><h2 class="h3">How PulseFit works</h2>
        <button class="icon-btn round bare" data-action="dismiss-intro" aria-label="Dismiss">${icon('x')}</button></div>
      <ol>
        <li>${icon('dumbbell')}<span><b>Each movement is a ladder.</b> Start with an exercise you can do with clean form, progression 1 if unsure.</span></li>
        <li>${icon('check')}<span><b>Hit a level's target</b> (e.g. 2 sets of 15) to complete it. Finish level 3 to unlock the next exercise.</span></li>
        <li>${icon('calendar')}<span><b>Train on your scheduled days.</b> Rest days never break your streak.</span></li>
      </ol>
    </section>` : ''}
    <section class="card session-card mt-4" aria-labelledby="sessH">
      <div class="row-between">
        <div><div class="eyebrow">${isToday ? "Today's session" : esc(fmtShort(sel))}</div><h2 class="sess-title" id="sessH">${esc(routineShort(r))} · Day ${mondayIndex(sel) + 1} of 7</h2></div>
        <button class="icon-btn round" data-action="pick-routine" aria-label="Change routine (${esc(r.name)})">${icon('swap')}</button>
      </div>
      ${session}
    </section>

    <div class="sec-head"><h2 class="h2 m-0">${isToday ? "Today's log" : 'Log'}</h2><a class="link-btn small" href="#/track">All days</a></div>
    <section class="card food-sum" aria-label="Food today">
      <div class="row gap-4">
        <div class="ring-wrap">${ringSvg(T ? eaten / T.kcal : 0)}<div class="ring-c">${ringCenter}</div></div>
        <div class="grow">
          <div class="h3">Food</div>
          <div class="small muted">${T ? `${nf(eaten)} of ${nf(T.kcal)} kcal · ${nf(protein)} / ${T.protein} g protein` : `${nf(eaten)} kcal today · <button class="link-btn" data-action="track-setup">set your target</button>`}</div>
          ${meals.length ? `<div class="chips m-0 mt-2">${meals.slice(-3).map((m) => `<span class="chip sm">${esc(m.name.length > 22 ? m.name.slice(0, 21) + '…' : m.name)}</span>`).join('')}${meals.length > 3 ? `<a class="chip sm" href="#/track">+${meals.length - 3}</a>` : ''}</div>` : ''}
        </div>
      </div>
      <button class="btn ghost block mt-4" data-action="track-food" data-today="1">${icon('plus')} Add food</button>
      ${window.PF_MEALS ? `<div class="divider-top mt-4">
        <div class="row-between"><span class="eyebrow muted">Plan · next up</span><a class="link-btn small" href="#/plan">Week &amp; groceries</a></div>
        ${next}
      </div>` : ''}
    </section>
    <div class="q-grid mt-3">
      ${tile('track-weight', 'Weight', w != null ? kg(w) : wl ? kg(wl.v) : '–', wl ? 'kg' : '', wsub, goalPct, true, 'Log weight')}
      ${tile('track-steps', 'Steps', steps != null ? nf(steps) : '–', '', `of ${nf(sg)}`, steps != null ? steps / sg : 0, false, 'Log steps')}
      ${tile('track-sleep', 'Sleep', sleep != null ? fmtSleep(sleep) : '–', '', `of ${fmtSleep(lg)}`, sleep != null ? sleep / lg : 0, false, 'Log sleep')}
      ${tile('track-water-add', 'Water', water != null ? (water / 1000).toFixed(1) : '0', 'L', 'tap + for a glass', (water || 0) / wg, false, 'Add a glass of water (250 ml)', 'data-ml="250"')}
    </div>
    ${watchLine(tk)}
    <div class="tip-card mt-5">
      ${icon('bolt')}
      <p class="grow m-0"><b>60-second hit.</b> <span class="muted">${esc(TIPS[tipIdx % TIPS.length])}</span></p>
      <button class="icon-btn round bare" data-action="next-tip" aria-label="Another tip">${icon('reset')}</button>
    </div>`;
};
VIEWS.exercises = (...a) => VIEWS.movements(...a);
VIEWS.home = VIEWS.today;

/* ---------- Exercises: status list (#/exercises; the old #/movements still works) ---------- */
let movFilter = 'all';
VIEWS.movements = () => {
  const open = CATS.filter((c) => !isLocked(c));
  const locked = CATS.filter(isLocked);
  const shown = open.filter((c) => movFilter === 'all' || (movFilter === 'progress' ? isStarted(c.id) : !isStarted(c.id)));
  const rows = shown.map((c) => {
    const started = isStarted(c.id), cur = currentIdx(c.id), p = c.progressions[cur], n = c.progressions.length;
    const sub = started ? `${p.name} · ${isMastered(p.id) ? 'Mastered' : `Level ${workingLevel(p.id)}`} · ${cur + 1} of ${n}` : `Not started · ${n} progressions`;
    const segs = c.progressions.map((q, i) => (isMastered(q.id) ? 'done' : started && i === cur ? 'cur' : 'off'));
    return `<a class="mv-row" href="#/category/${c.id}">
      ${art(c.id, { cls: 'thumb sq', shift: started ? cur * 4 : 0, img: started ? p.id : c.id })}
      <span class="grow"><span class="nm">${esc(c.name)}</span><span class="sub">${esc(sub)}</span>${segBar(segs)}</span>
      ${icon('chevR')}
    </a>`;
  }).join('');
  const chip = (id, label) => `<button class="fchip ${movFilter === id ? 'on' : ''}" data-action="mov-filter" data-f="${id}" aria-pressed="${movFilter === id}">${label}</button>`;
  return `
    <h1 class="h1 m-0">Exercises</h1>
    <p class="muted m-0 mt-1">${CATS.length} families · ${TOTAL_PROGS} progressions · ${masteredCount()} mastered</p>
    <div class="row gap-2 mt-4 wrap">${chip('all', 'All')}${chip('progress', 'In progress')}${chip('new', 'Not started')}</div>
    ${shown.length ? `<div class="mv-list mt-4">${rows}</div>` : `<p class="muted mt-4">${movFilter === 'progress' ? 'Nothing in progress yet. Pick a family and start with progression 1.' : 'You have started every family.'}</p>`}
    ${locked.length ? `
      <div class="sec-head"><h2 class="h2 m-0">Pro families</h2><span class="pill">${icon('crown')} Pro</span></div>
      <div class="pro-grid">${locked.map((c) => `<button class="pro-tile" data-action="locked" data-cat="${c.id}" aria-label="${esc(c.name)} (Pro)">${art(c.id, { locked: true, img: c.id })}<span>${esc(c.name)}</span></button>`).join('')}</div>
      <button class="btn ghost block mt-4" data-action="pro">See PulseFit Pro</button>` : ''}`;
};

VIEWS.category = (r) => {
  const c = CAT[r.arg];
  if (!c) return notFound();
  if (isLocked(c)) return lockedView(c);
  const cur = isStarted(c.id) ? currentIdx(c.id) : -1;
  return `
    <div class="topbar">
      <a class="icon-btn bare round" href="#/exercises" aria-label="Back to Exercises">${icon('chevL')}</a>
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

let exTab = 'how';
const EX_TABS = ['how', 'cues', 'vary'];

/** Sets that hit the target for this level in the latest workout that logged it. */
function setsHit(p, lvl) {
  const L = p.levels[lvl - 1];
  for (let i = state.workouts.length - 1; i >= 0; i--) {
    const e = state.workouts[i].entries.find((x) => x.progId === p.id && x.level === lvl);
    if (e) return Math.min(L.sets, e.values.filter((v) => v >= L.target).length);
  }
  return 0;
}

VIEWS.exercise = (r) => {
  const ref = PROG[r.arg];
  if (!ref) return notFound();
  const { p, cat, idx } = ref;
  if (isLocked(cat)) return lockedView(cat);
  const done = levelDone(p.id), lvl = workingLevel(p.id), mastered = isMastered(p.id);
  const isCurrent = isStarted(cat.id) && currentIdx(cat.id) === idx;
  const prev = cat.progressions[idx - 1], next = cat.progressions[idx + 1];
  const unit = p.type === 'hold' ? ' s' : '';
  const hit = mastered ? 0 : setsHit(p, lvl);

  const bars = p.levels.map((l, i) => {
    const st = done > i ? 'done' : i === lvl - 1 && !mastered ? 'cur' : 'off';
    const pct = st === 'done' ? 100 : st === 'cur' ? (hit / l.sets) * 100 : 0;
    return `<div class="lv ${st}">
      <span class="lv-bar"><span style="width:${pct}%"></span></span>
      <span class="row-between lv-name"><span>Level ${i + 1}</span>${st === 'done' ? icon('check') : st === 'cur' ? `<span>${hit} / ${l.sets}</span>` : ''}</span>
      <span class="lv-t">${l.sets} × ${l.target}${unit}</span>
    </div>`;
  }).join('');

  let tabBody;
  if (exTab === 'how') {
    tabBody = `<ol class="num-steps">${(p.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
  } else if (exTab === 'cues') {
    tabBody = `<ul class="cues">${(p.cues || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
  } else {
    tabBody = `<h3 class="h3 mt-4">Make it easier</h3><p class="t-lg m-0 mt-2">${esc(p.easier || '')}</p>
      <h3 class="h3 mt-5">Make it harder</h3><p class="t-lg m-0 mt-2">${esc(p.harder || '')}</p>`;
  }

  return `
    <div class="ex-hero2">
      ${art(cat.id, { cls: 'hero-art', shift: idx * 4, img: p.id, alt: `Athlete demonstrating ${p.name}` })}
      <div class="ex-hero-top">
        <a class="icon-btn round glass" href="#/category/${cat.id}" aria-label="Back to ${esc(cat.name)}">${icon('chevL')}</a>
        <span class="glass-chip">${esc(cat.name)} · ${idx + 1} of ${cat.progressions.length}</span>
      </div>
      <div class="ex-hero-txt">
        <div class="eyebrow">${isCurrent ? 'Current progression' : `Progression ${idx + 1}`}</div>
        <h1>${esc(p.name)}</h1>
      </div>
    </div>
    <section class="card lvl-card mt-4" aria-label="Levels">
      <div class="row-between"><h2 class="h3">${mastered ? 'Mastered' : `Level ${lvl} of 3`}</h2>${mastered ? icon('trophy', 'class="c-warn icon-md"') : `<span class="small muted">Target <b class="c-text">${targetText(p, lvl)}</b></span>`}</div>
      <div class="lv-row mt-3">${bars}</div>
      <p class="small muted m-0 mt-3">${mastered ? 'You have mastered this progression.' : `Hit ${targetText(p, lvl)} in one workout to complete this level.`}</p>
      ${isCurrent ? '' : `<button class="link-btn small mt-2" data-action="set-current" data-prog="${p.id}">Make this my current progression</button>`}
    </section>
    <p class="overview mt-5">${esc(p.overview)}</p>
    <div class="chips">${p.primary.map((m) => `<span class="chip strong">${esc(m)}</span>`).join('')}${p.secondary.map((m) => `<span class="chip dashed">${esc(m)}</span>`).join('')}</div>
    <div class="segmented" role="tablist" aria-label="Exercise details" style="--n:3;--i:${EX_TABS.indexOf(exTab)}">
      ${[['how', 'How to'], ['cues', 'Form cues'], ['vary', 'Easier / harder']].map(([id, label]) =>
        `<button role="tab" aria-selected="${exTab === id}" data-action="ex-tab" data-tab="${id}">${label}</button>`).join('')}
    </div>
    <div role="tabpanel">${tabBody}</div>
    <div class="row-between mt-5 small">
      ${prev ? `<a class="link-plain" href="#/exercise/${prev.id}">${icon('chevL', 'class="icon-sm"')} ${esc(prev.name)}</a>` : '<span></span>'}
      ${next ? `<a class="link-plain" href="#/exercise/${next.id}">${esc(next.name)} ${icon('chevR', 'class="icon-sm"')}</a>` : ''}
    </div>
    <div class="ex-actions">
      <button class="btn lg grow" data-action="log-sets" data-prog="${p.id}">Log sets</button>
      <button class="btn subtle lg" data-action="swap-prog" data-cat="${cat.id}">Swap</button>
    </div>`;
};

/* ---------- Progress (Activity + Challenges + Body) ---------- */
let progTab = 'strength';
const PROG_TABS = ['strength', 'body', 'history'];

function historyRow(w) {
  const d = new Date(w.at);
  return `<button class="hist-row" data-action="view-workout" data-id="${w.id}">
    <span class="grow"><span class="fw-bold d-block">${esc(fmtShort(d))}</span><span class="small muted">${esc(w.routineName || 'Workout')} · ${plural(w.entries.length, 'exercise')} · ${fmtTime(d)}</span></span>${icon('chevR')}</button>`;
}

function progressStrength() {
  const ladders = CATS.map((c) => {
    const locked = isLocked(c), started = isStarted(c.id), cur = currentIdx(c.id);
    const m = c.progressions.filter((q) => isMastered(q.id)).length;
    const segs = c.progressions.map((q, i) => (locked ? 'lock' : isMastered(q.id) ? 'done' : started && i === cur ? 'cur' : 'off'));
    return `<a class="lad-row ${locked ? 'locked' : ''}" href="#/category/${c.id}" ${locked ? `data-action="locked" data-cat="${c.id}"` : ''}>
      <i class="lad-dot" style="--h:${CAT_HUE[c.id] ?? 210}"></i><span class="nm">${esc(c.name)}</span>${segBar(segs, 'wide')}<span class="cnt">${locked ? 'Pro' : `${m}/${c.progressions.length}`}</span></a>`;
  }).join('');
  const ch = LADDERS.map((l) => {
    const s = ladderSteps(l), joined = !!state.joined[l.id], done = s.done >= s.total;
    const nextP = s.progs.find((q) => !isMastered(q.id));
    const segs = s.progs.map((q) => (isMastered(q.id) ? 'done' : q === nextP && joined ? 'cur' : 'off'));
    return `<section class="ch-mini">
      <div class="row gap-2">${icon(l.icon)}<span class="fw-bold grow">${esc(l.name)}</span><span class="small fw-bold">${s.done} / ${s.total}</span></div>
      ${segBar(segs, 'wide mt-3')}
      <p class="small muted m-0 mt-2">${done ? 'Completed. Every badge earned.' : `Next badge: master ${esc(nextP.name)}`}</p>
      ${done ? '' : joined ? `<a class="btn sm mt-3" href="#/category/${l.cat}">Continue</a>` : `<button class="btn ghost sm mt-3" data-action="join" data-id="${l.id}">Join</button>`}
    </section>`;
  }).join('');
  const ach = achievements();
  const recent = [...state.workouts].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 2);
  return `
    <section class="card mt-4" aria-labelledby="ladH">
      <div class="row-between"><h2 class="h3" id="ladH">Mastery ladders</h2><span class="small muted">tap to open</span></div>
      <div class="lad-list mt-2">${ladders}</div>
      <div class="legend small muted mt-3"><span><i class="done"></i>Mastered</span><span><i class="cur"></i>Current</span><span><i class="off"></i>Not yet</span></div>
    </section>
    <div class="sec-head"><h2 class="h2 m-0">Challenges</h2><span class="small muted">${LADDERS.filter((l) => state.joined[l.id]).length} joined</span></div>
    <div class="h-scroll">${ch}</div>
    <div class="sec-head"><h2 class="h2 m-0">Badges</h2><span class="small muted">${ach.filter((a) => a.earned).length} / ${ach.length}</span></div>
    <div class="badge-row h-scroll">${ach.map(badgeHtml).join('')}</div>
    <div class="card list-card mt-5">
      ${recent.length ? recent.map(historyRow).join('') : '<p class="muted m-0 p-row">No workouts yet. Your sessions will show up here.</p>'}
      ${state.workouts.length ? '<button class="link-btn p-row" data-action="prog-tab" data-tab="history">All workout history</button>' : ''}
    </div>`;
}

function progressBody() {
  const tk = todayKey();
  const p = hp();
  const wl = latestOn('weight', tk), a = avg7(tk), r = weeklyRate(tk);
  const cur = a ?? wl?.v;
  const toGo = p.goalWeight && cur != null ? cur - p.goalWeight : null;
  let verdict = '';
  if (r != null && toGo != null && toGo > 0.05) {
    const planned = p.rate || 0.5;
    const head = r <= -planned * 0.6 ? 'On track.' : r < -0.05 ? 'Slower than planned.' : 'Not losing yet.';
    const eta = r < -0.05 ? ` At this rate you reach ${kg(p.goalWeight)} kg around ${addDays(today(), Math.round((toGo / -r) * 7)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.` : ' Check your food log for a week; if it stays flat for 3 weeks, lower your target a little.';
    verdict = `<div class="note-box mt-3"><b>${head}</b>${eta}</div>`;
  } else if (toGo != null && toGo <= 0.05) verdict = '<div class="note-box mt-3"><b>Goal reached.</b> Set a new goal in Profile → Goals.</div>';

  const firstDay = MEASURES.map(([f]) => firstOf(f)?.day).filter(Boolean).sort()[0];
  const mtiles = MEASURES.map(([f, label]) => {
    const l = latestOn(f, tk), f0 = firstOf(f);
    const diff = l && f0 && f0.day !== l.day ? l.v - f0.v : null;
    const dtxt = diff == null ? '' : Math.abs(diff) < 0.05 ? '<span class="d muted">no change</span>' : `<span class="d ${diff < 0 ? 'c-success' : ''}">${diff > 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)}</span>`;
    return `<div class="m-tile"><span class="k">${label}</span><span class="v">${l ? kg(l.v) : '–'}${l ? ' <small>cm</small>' : ''}</span>${dtxt}</div>`;
  }).join('');

  // Last 7 days averages (days with data only)
  const days = Array.from({ length: 7 }, (_, i) => keyAdd(tk, -i));
  const avg = (vals) => (vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null);
  const kcalDays = days.map((k) => state.meals.filter((m) => m.day === k).reduce((x, m) => x + m.kcal, 0)).filter((v) => v > 0);
  const food = avg(kcalDays), steps = avg(days.map((k) => hget(k, 'steps')).filter((v) => v != null)), sleep = avg(days.map((k) => hget(k, 'sleep')).filter((v) => v != null));
  const T = targets(tk);
  const stat = (k, v, u, sub, good) => `<div><span class="k">${k}</span><span class="v">${v}${u ? ` <small>${u}</small>` : ''}</span><span class="sub ${good ? 'c-success' : 'muted'}">${sub}</span></div>`;

  return `
    <section class="card mt-4" aria-labelledby="wH">
      <div class="row-between"><h2 class="h3" id="wH">Weight</h2><button class="btn subtle sm" data-action="track-weight" data-today="1">Log weight</button></div>
      <div class="kpi mt-2">${wl ? `<span class="kpi-v">${kg(wl.v)}</span><span class="kpi-u">kg ${wl.day === tk ? 'today' : `on ${esc(fmtShort(fromKey(wl.day)))}`}</span>` : '<span class="kpi-v faint">–</span><span class="kpi-u">No weigh-ins yet</span>'}</div>
      <div class="facts mt-2">
        ${a != null ? `<span>7-day average <b>${kg(a)} kg</b></span>` : ''}
        ${toGo != null && toGo > 0.05 ? `<span><b>${kg(toGo)} kg</b> to goal</span>` : ''}
      </div>
      ${r != null ? `<p class="small m-0 mt-1"><b class="${r < 0 ? 'c-success' : ''}">${r > 0 ? '+' : '−'}${Math.abs(r).toFixed(2)} kg</b> <span class="muted">a week</span></p>` : '<p class="small muted m-0 mt-1">Weigh in on 3 or more days across a week to see your trend.</p>'}
      ${weightChart(tk)}
      ${verdict}
    </section>
    <section class="card mt-4" aria-labelledby="mH">
      <div class="row-between"><div><h2 class="h3" id="mH">Measurements</h2><div class="small muted">${firstDay ? `Latest · change since first entry (${esc(fmtShort(fromKey(firstDay)).replace(/^\w+, /, ''))})` : 'In centimetres'}</div></div><button class="btn subtle sm" data-action="track-measure" data-today="1">Log</button></div>
      <div class="m-grid mt-3">${mtiles}</div>
      <p class="small muted m-0 mt-3">Measure every week or two, same time of day. Waist keeps going down even in weeks when the scale doesn't.</p>
    </section>
    <section class="card mt-4 last7" aria-labelledby="l7H">
      <div class="row-between"><h2 class="h3" id="l7H">Last 7 days</h2><span class="small muted">averages</span></div>
      <div class="l7-grid mt-3">
        ${stat('Food', food != null ? nf(food) : '–', food != null ? 'kcal' : '', food == null ? 'not logged' : T ? (food <= T.kcal ? 'under target' : 'over target') : 'no target set', food != null && T && food <= T.kcal)}
        ${stat('Steps', steps != null ? nf(steps) : '–', '', steps != null ? `${Math.round((steps / (p.stepGoal || HDEF.stepGoal)) * 100)}% of goal` : 'not logged', false)}
        ${stat('Sleep', sleep != null ? fmtSleep(sleep) : '–', '', sleep != null ? `${Math.round((sleep / (p.sleepGoal || HDEF.sleepGoal)) * 100)}% of goal` : 'not logged', false)}
      </div>
    </section>`;
}

function progressHistory() {
  const sorted = [...state.workouts].sort((a, b) => b.at.localeCompare(a.at));
  if (!sorted.length) return `<div class="empty">${icon('calendar')}<div>No workouts yet. Your sessions will show up here.</div><a class="btn mt-3" href="#/today">Go to today's session</a></div>`;
  const groups = [];
  sorted.forEach((w) => {
    const label = new Date(w.at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let g = groups[groups.length - 1];
    if (!g || g.label !== label) { g = { label, items: [] }; groups.push(g); }
    g.items.push(w);
  });
  return groups.map((g) => `
    <div class="sec-head"><h2 class="h3 m-0">${esc(g.label)}</h2><span class="small muted">${plural(g.items.length, 'workout')}</span></div>
    <div class="card list-card">${g.items.map(historyRow).join('')}</div>`).join('');
}

VIEWS.progress = () => {
  const { current } = streakStats();
  const body = progTab === 'body' ? progressBody() : progTab === 'history' ? progressHistory() : progressStrength();
  return `
    <h1 class="h1">Progress</h1>
    <div class="stat3">
      <button class="s3 hot" data-action="info-streak"><span class="v">${current} ${icon('flame', 'class="icon-sm c-warn"')}</span><span class="k">Day streak</span></button>
      <button class="s3" data-action="prog-tab" data-tab="history"><span class="v">${state.workouts.length}</span><span class="k">Workouts</span></button>
      <button class="s3" data-action="prog-tab" data-tab="strength"><span class="v">${masteredCount()}<small>/${TOTAL_PROGS}</small></span><span class="k">Mastered</span></button>
    </div>
    <div class="segmented" role="tablist" aria-label="Progress" style="--n:3;--i:${PROG_TABS.indexOf(progTab)}">
      ${[['strength', 'Strength'], ['body', 'Body'], ['history', 'History']].map(([id, label]) =>
        `<button role="tab" aria-selected="${progTab === id}" data-action="prog-tab" data-tab="${id}">${label}</button>`).join('')}
    </div>
    <div role="tabpanel">${body}</div>`;
};
VIEWS.activity = VIEWS.progress;
VIEWS.challenges = VIEWS.progress;

function badgeHtml(b) {
  return `<div class="badge ${b.earned ? 'earned' : ''}" title="${esc(b.hint || '')}">
    <div class="medal">${b.num != null ? `<span class="num">${b.num}</span>` : ''}${b.earned ? icon(b.icon || 'award') : icon('lock')}${b.tier ? `<span class="tier">${icon(b.tier)}</span>` : ''}</div>
    <div>${esc(b.name)}</div>
  </div>`;
}

const THEMES = [
  { id: 'midnight', name: 'Midnight', dot: '#4a3fb5' },
  { id: 'light', name: 'Light', dot: '#ffffff' },
  { id: 'dark', name: 'Dark', dot: '#111111' },
];

function syncSubline() {
  const S = window.PFSync;
  const st = S ? S.status() : { configured: false };
  if (!st.configured) return 'Stored on this device';
  if (!st.user) return 'Not signed in · back up &amp; sync';
  return esc(syncLine(st));
}

function accountSheet() {
  const pf = state.profile;
  openSheet('Account', `
    <div class="field"><label for="pfName">Name</label>
      <input class="input" id="pfName" data-bind="name" value="${esc(pf.name)}" placeholder="Your name" autocomplete="name" maxlength="40" /></div>
    <div class="field"><label for="pfEmail">Email</label>
      <input class="input" id="pfEmail" type="email" data-bind="email" value="${esc(pf.email)}" placeholder="you@example.com" autocomplete="email" maxlength="80" /></div>
    <p class="muted small m-0 mt-2 ml-1">Your email here is only for you; it is never uploaded.</p>
    <h3 class="sheet-sub mt-5">Back up &amp; sync</h3>
    ${accountCard()}`, { onClose: () => rerender() });
}

VIEWS.profile = () => {
  const pf = state.profile, p = hp();
  const T = targets(todayKey());
  const name = pf.name.trim();
  const days = [1, 2, 3, 4, 5, 6, 0].filter((d) => state.trainingDays.includes(d)).map((d) => WEEKDAY_SHORT[d]).join(', ') || 'None';
  const goals = [p.goalWeight ? `${kg(p.goalWeight)} kg` : null, `${nf(p.stepGoal || HDEF.stepGoal)} steps`, fmtSleep(p.sleepGoal || HDEF.sleepGoal), `${((p.waterGoal || HDEF.waterGoal) / 1000).toFixed(1)} L`].filter(Boolean).join(' · ');
  const row = (action, title, sub, end = icon('chevR'), cls = '') => `<button class="list-item ${cls}" data-action="${action}"><span>${title}${sub ? `<span class="li-sub">${sub}</span>` : ''}</span>${end}</button>`;
  return `
    <h1 class="h1">Profile</h1>
    <button class="card acct-card" data-action="account">
      <span class="avatar" aria-hidden="true">${esc((name[0] || '?').toUpperCase())}</span>
      <span class="grow"><span class="h3 d-block">${esc(name || 'Add your name')}</span><span class="small muted" data-sync-line>${syncSubline()}</span></span>
      ${icon('chevR')}
    </button>

    <h2 class="group-label">Training</h2>
    <div class="list-group">
      ${row('pick-routine', 'Routine', esc(routine().name))}
      ${row('routine-days', 'Training days', days)}
      ${row('rest-settings', 'Rest timer', `${state.restSeconds} seconds`)}
      <div class="list-item static"><button class="grow text-left plain" data-action="reminders"><span>Reminder<span class="li-sub">${state.reminder.enabled ? `Daily at ${esc(state.reminder.time)}` : 'Off'}</span></span></button>
        <button class="toggle" role="switch" aria-checked="${state.reminder.enabled}" data-action="toggle-reminder" aria-label="Daily reminder"></button></div>
    </div>

    <h2 class="group-label">Body &amp; targets</h2>
    <div class="list-group">
      ${row('track-setup', 'Calorie target', T ? `${nf(T.kcal)} kcal${T.losing ? ` · losing ${T.rate} kg a week` : ''}` : 'Not set up yet')}
      ${row('track-setup', 'Goals', goals)}
      <div class="list-item static"><button class="grow text-left plain" data-action="plan-reminder"><span>Meal plan reminder<span class="li-sub">${state.planReminder.enabled ? `${WEEKDAYS[state.planReminder.day]}s at ${esc(state.planReminder.time)} · plan &amp; groceries` : 'Off'}</span></span></button>
        <button class="toggle" role="switch" aria-checked="${state.planReminder.enabled}" data-action="toggle-plan-reminder" aria-label="Weekly meal plan reminder"></button></div>
    </div>

    <h2 class="group-label">Appearance</h2>
    <div class="segmented theme-seg" role="radiogroup" aria-label="Theme" style="--n:3;--i:${Math.max(0, THEMES.findIndex((t) => t.id === pf.theme))}">
      ${THEMES.map((t) => `<button role="radio" aria-checked="${pf.theme === t.id}" aria-selected="${pf.theme === t.id}" data-action="theme" data-theme="${t.id}"><i class="tdot" style="background:${t.dot}"></i>${t.name}</button>`).join('')}
    </div>

    <div class="card pro-card mt-5">
      <span class="pill">${icon('crown')} Pro</span>
      <p class="grow m-0 small"><b>Free demo toggle.</b> <span class="muted">Unlocks 4 advanced families and the Strength Builder routine.</span></p>
      <button class="toggle" role="switch" aria-checked="${pf.pro}" data-action="toggle-pro" aria-label="PulseFit Pro"></button>
    </div>

    <h2 class="group-label">Watch &amp; health</h2>
    <div class="list-group">
      ${row('health', 'Galaxy Watch &amp; Samsung Health', isNativeApp() ? (state.health && state.health.enabled ? `Health Connect · synced ${esc(ago(state.health.last))}` : 'Not connected') : 'Needs the PulseFit Android app')}
      ${isNativeApp() ? row('widget', 'Home screen widget', 'Day streak and today\'s session') : ''}
    </div>

    <h2 class="group-label">Data</h2>
    <div class="list-group">
      ${window.PFInstall && !window.PFInstall.installed() ? row('install', 'Install PulseFit app', '', icon('download')) : ''}
      ${window.PFSync && window.PFSync.recovery() ? row('sync-recovery', "Download this device's data from before the reset", `Saved ${esc(ago(window.PFSync.recovery().at))}`, icon('download')) : ''}
      ${row('data-sheet', 'Export or import data', '', icon('upload'))}
      ${row('help', 'Help &amp; privacy', '')}
      ${row('reset', 'Reset all progress', '', icon('trash'), 'danger')}
    </div>
    <input type="file" id="importFile" accept="application/json,.json" hidden />`;
};

const PROFILE_ACTIONS = {
  'account': accountSheet,
  'data-sheet': () => openSheet('Your data', `
    <p class="muted m-0 mb-4">Download a backup file of everything in PulseFit, or load one back in.${window.PFSync && window.PFSync.signedIn() ? ' While signed in, importing merges the file into your synced data.' : ''}</p>
    <button class="btn block lg" data-action="export">${icon('download')} Export data</button>
    <button class="btn ghost block lg mt-3" data-action="import">${icon('upload')} Import data</button>`),
  'help': () => openSheet('Help & privacy', `
    <div class="list-group">
      <button class="list-item" data-action="faq"><span>Help &amp; FAQ</span>${icon('chevR')}</button>
      <button class="list-item" data-action="privacy"><span>Privacy &amp; terms</span>${icon('chevR')}</button>
    </div>`),
};

/* ---------- Track: weight, food, steps, sleep, water, measurements ----------
   Data (all synced, see sync-core.js):
   - state.hprofile: { sex, age, height, activity, goalWeight, rate, stepGoal, sleepGoal (min), waterGoal (ml) }
   - state.hlog: { "YYYY-MM-DD|field": number }  fields: weight (kg), steps, sleep (min), water (ml), MEASURES (cm)
   - state.meals: [{ id, day, at, name, kcal, protein? }]
   - state.foods: { id: { name, kcal, protein? } }   saved foods */
const MEASURES = [['waist', 'Waist'], ['chest', 'Chest'], ['hips', 'Hips'], ['arm', 'Upper arm'], ['thigh', 'Thigh'], ['neck', 'Neck']];
const ACTIVITY = [
  [1.2, 'Mostly sitting, little exercise'],
  [1.375, 'Light: exercise 1–3 days a week'],
  [1.55, 'Moderate: exercise 3–5 days a week'],
  [1.725, 'Active: exercise 6–7 days a week'],
  [1.9, 'Very active: physical job or training twice a day'],
];
const RATES = [[0.25, '0.25 kg a week (gentle)'], [0.5, '0.5 kg a week (steady)'], [0.75, '0.75 kg a week (faster)'], [1, '1 kg a week (aggressive)']];
const KCAL_PER_KG = 7700;
const HDEF = { stepGoal: 8000, sleepGoal: 450, waterGoal: 2500 };

let trackDay = null;                                   // selected day on the Track tab; null = today
const todayKey = () => dayKey(today());
const tKey = () => trackDay || todayKey();
const keyAdd = (key, n) => dayKey(addDays(fromKey(key), n));
const hk = (day, f) => `${day}|${f}`;
const hget = (day, f) => state.hlog[hk(day, f)];
function hset(day, f, v) {
  if (v == null || !Number.isFinite(v)) delete state.hlog[hk(day, f)];
  else state.hlog[hk(day, f)] = v;
}
const hp = () => state.hprofile;
const nf = (n) => Math.round(n).toLocaleString('en-US');
const kg = (n) => (Math.round(n * 10) / 10).toFixed(1);
const fmtSleep = (min) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, '0')}m`;
const newId = (p) => p + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, '0')).join('');
const parseNum = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };

/** All logged values of one field, oldest first: [{ day, v }]. */
function series(field, from = '0000', to = '9999') {
  const out = [];
  for (const [k, v] of Object.entries(state.hlog)) {
    const i = k.indexOf('|');
    if (k.slice(i + 1) === field && k.slice(0, i) >= from && k.slice(0, i) <= to) out.push({ day: k.slice(0, i), v });
  }
  return out.sort((a, b) => (a.day < b.day ? -1 : 1));
}
const latestOn = (field, upTo) => { const s = series(field, '0000', upTo); return s[s.length - 1] || null; };
const firstOf = (field) => series(field)[0] || null;

/** Mean of weigh-ins in the 7 days ending on `day` (smooths daily water swings). */
function avg7(day) {
  const s = series('weight', keyAdd(day, -6), day);
  return s.length ? s.reduce((a, b) => a + b.v, 0) / s.length : null;
}

/** Weekly change from a least-squares line over the last 4 weeks; needs 3+ weigh-ins over 7+ days. */
function weeklyRate(day) {
  const s = series('weight', keyAdd(day, -27), day);
  if (s.length < 3) return null;
  const t0 = fromKey(s[0].day);
  const xs = s.map((p) => Math.round((fromKey(p.day) - t0) / DAY_MS));
  if (xs[xs.length - 1] < 7) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = s.reduce((a, b) => a + b.v, 0) / s.length;
  let num = 0, den = 0;
  xs.forEach((x, i) => { num += (x - mx) * (s[i].v - my); den += (x - mx) ** 2; });
  return den ? (num / den) * 7 : null;
}

/** Daily calorie and protein targets (Mifflin–St Jeor × activity, minus the chosen weekly loss). */
function targets(day) {
  const p = hp();
  const weight = avg7(day) ?? latestOn('weight', day)?.v;
  if (!p.sex || !p.age || !p.height || !weight) return null;
  const bmr = 10 * weight + 6.25 * p.height - 5 * p.age + (p.sex === 'female' ? -161 : 5);
  const tdee = bmr * (p.activity || 1.375);
  const losing = !!p.goalWeight && p.goalWeight < weight - 0.2;
  const rate = losing ? (p.rate || 0.5) : 0;
  const floor = p.sex === 'female' ? 1200 : 1500;
  const raw = tdee - (rate * KCAL_PER_KG) / 7;
  return {
    bmr, tdee, weight, losing, rate,
    kcal: Math.round(Math.max(floor, raw) / 10) * 10,
    floored: raw < floor,
    protein: Math.round(1.6 * (p.goalWeight || weight)),
  };
}


/* ---------- Track view ---------- */
VIEWS.track = () => {
  const day = tKey();
  const isToday = day === todayKey();
  const d = fromKey(day);
  const p = hp();
  const T = targets(day);
  const needsProfile = !p.sex || !p.age || !p.height;
  const thisDay = isToday ? 'today' : 'this day';

  return `
    <a class="link-plain small" href="#/today">${icon('chevL', 'class="icon-sm"')} Today</a>
    <h1 class="h1 mt-2">Daily log</h1>
    <div class="day-nav card flat soft">
      <button class="icon-btn round bare" data-action="track-day" data-n="-1" aria-label="Previous day">${icon('chevL')}</button>
      <div class="text-center">
        <div class="fw-bold t-lg">${isToday ? 'Today' : esc(fmtShort(d))}</div>
        ${isToday ? `<div class="muted small">${esc(fmtShort(d))}</div>` : '<button class="link-btn small" data-action="track-day" data-n="0">Back to today</button>'}
      </div>
      <button class="icon-btn round bare" data-action="track-day" data-n="1" aria-label="Next day" ${isToday ? 'disabled' : ''}>${icon('chevR')}</button>
    </div>
    ${needsProfile ? `
      <section class="card mt-4 callout">
        <h2 class="h3">Set your targets</h2>
        <p class="muted small mt-2 mb-3">Add your age, height and goal weight, and PulseFit works out a daily calorie and protein target for you.</p>
        <button class="btn block" data-action="track-setup">Set up targets</button>
      </section>` : ''}
    ${trackFoodCard(day, T, thisDay)}
    ${planCard(day)}
    ${trackWeightCard(day, T, thisDay, isToday)}
    ${trackHabits(day)}
    ${trackMeasureCard(day)}
    <div class="list-group mt-5">
      <button class="list-item" data-action="track-setup"><span>Targets &amp; body profile<span class="li-sub">${T ? `${nf(T.kcal)} kcal a day${p.goalWeight ? ` · goal ${kg(p.goalWeight)} kg` : ' · no goal weight yet'}` : 'Not set up yet'}</span></span>${icon('chevR')}</button>
    </div>
    <p class="muted small mt-4">Targets are estimates from the Mifflin–St Jeor formula. If your weekly trend is slower or faster than planned for 2–3 weeks, adjust the target. Check with a doctor before big changes to your diet or exercise.</p>`;
};

function trackFoodCard(day, T, thisDay) {
  const meals = state.meals.filter((m) => m.day === day);
  const eaten = meals.reduce((a, m) => a + m.kcal, 0);
  const protein = meals.reduce((a, m) => a + (m.protein || 0), 0);
  const left = T ? T.kcal - eaten : null;
  const pct = T ? Math.min(100, (eaten / T.kcal) * 100) : 0;
  return `
    <section class="card mt-4" aria-labelledby="foodH">
      <div class="row-between"><h2 class="h3" id="foodH">Food</h2>${T ? `<span class="muted small">Target ${nf(T.kcal)} kcal</span>` : ''}</div>
      <div class="kpi mt-3"><span class="kpi-v">${nf(T ? Math.abs(left) : eaten)}</span><span class="kpi-u">${T ? (left >= 0 ? 'kcal left' : 'kcal over') : 'kcal eaten'}</span></div>
      ${T ? `
        <div class="progress mt-3 ${left < 0 ? 'over' : ''}" role="progressbar" aria-label="Calories eaten" aria-valuemin="0" aria-valuemax="${T.kcal}" aria-valuenow="${Math.round(eaten)}"><span style="width:${pct}%"></span></div>
        <div class="row-between small muted mt-2"><span>Eaten ${nf(eaten)} kcal</span><span>Protein ${nf(protein)} / ${T.protein} g</span></div>` : ''}
      <button class="btn block mt-4" data-action="track-food">${icon('plus')} Add food</button>
      ${meals.length ? `<ul class="food-list mt-3">${meals.map((m) => `
        <li>
          <span class="grow"><span class="fw-bold">${esc(m.name)}</span><span class="d-block muted small">${nf(m.kcal)} kcal${m.protein ? ` · ${nf(m.protein)} g protein` : ''}</span></span>
          <button class="icon-btn round bare" data-action="track-meal-del" data-id="${esc(m.id)}" aria-label="Delete ${esc(m.name)}">${icon('trash')}</button>
        </li>`).join('')}</ul>` : `<p class="muted small mt-3 m-0">No food logged ${thisDay} yet.</p>`}
    </section>`;
}

function trackWeightCard(day, T, thisDay, isToday) {
  const p = hp();
  const w = hget(day, 'weight');
  const a = avg7(day);
  const r = weeklyRate(day);
  const cur = a ?? latestOn('weight', day)?.v;
  const toGo = p.goalWeight && cur != null ? cur - p.goalWeight : null;
  let trend;
  if (r == null) trend = 'Weigh in on 3 or more days across a week to see your trend.';
  else if (Math.abs(r) < 0.05) trend = 'Holding steady this month.';
  else {
    trend = `${r < 0 ? 'Losing' : 'Gaining'} about ${Math.abs(r).toFixed(2)} kg a week (last 4 weeks).`;
    if (toGo > 0 && r < -0.05) {
      const eta = addDays(fromKey(day), Math.round((toGo / -r) * 7));
      trend += ` At this rate you reach your goal around ${eta.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`;
    }
  }
  return `
    <section class="card mt-4" aria-labelledby="weightH">
      <div class="row-between"><h2 class="h3" id="weightH">Weight</h2><button class="btn subtle sm" data-action="track-weight">${w != null ? 'Edit' : 'Log weight'}</button></div>
      <div class="kpi mt-3">${w != null
        ? `<span class="kpi-v">${kg(w)}</span><span class="kpi-u">kg${isToday ? ' today' : ''}</span>`
        : `<span class="kpi-v faint">–</span><span class="kpi-u">Not weighed ${thisDay}</span>`}</div>
      <div class="facts mt-2">
        ${a != null ? `<span>7-day average <b>${kg(a)} kg</b></span>` : ''}
        ${toGo != null ? `<span>${toGo > 0.05 ? `<b>${kg(toGo)} kg</b> to goal` : '<b>Goal reached</b>'}</span>` : ''}
      </div>
      <p class="small mt-2 m-0">${trend}</p>
      ${weightChart(day)}
    </section>`;
}

function trackHabits(day) {
  const p = hp();
  const tile = (action, label, val, valText, goal, goalText) => {
    const pct = val != null && goal ? Math.min(100, (val / goal) * 100) : 0;
    return `<button class="tile" data-action="${action}">
      <span class="k">${label}</span>
      <span class="v">${val != null ? valText : '–'}</span>
      <span class="g">of ${goalText}</span>
      <span class="progress thin" aria-hidden="true"><span style="width:${pct}%"></span></span>
    </button>`;
  };
  const steps = hget(day, 'steps'), sleep = hget(day, 'sleep'), water = hget(day, 'water');
  const sg = p.stepGoal || HDEF.stepGoal, lg = p.sleepGoal || HDEF.sleepGoal, wg = p.waterGoal || HDEF.waterGoal;
  return `
    <section class="mt-4" aria-label="Steps, sleep and water">
      <div class="tiles">
        ${tile('track-steps', 'Steps', steps, steps != null ? nf(steps) : '', sg, nf(sg))}
        ${tile('track-sleep', 'Sleep', sleep, sleep != null ? fmtSleep(sleep) : '', lg, fmtSleep(lg))}
        ${tile('track-water', 'Water', water, water != null ? `${(water / 1000).toFixed(1)} L` : '', wg, `${(wg / 1000).toFixed(1)} L`)}
      </div>
      <button class="btn ghost block mt-3" data-action="track-water-add" data-ml="250">${icon('plus')} Glass of water (250 ml)</button>
    </section>`;
}

function trackMeasureCard(day) {
  const rows = MEASURES.map(([f, label]) => {
    const l = latestOn(f, day);
    if (!l) return '';
    const f0 = firstOf(f);
    const diff = l.v - f0.v;
    const delta = f0.day !== l.day && Math.abs(diff) >= 0.05
      ? `<span class="delta">${diff > 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)}</span>` : '';
    return `<li><span>${label}</span><span><b>${kg(l.v)} cm</b>${delta}</span></li>`;
  }).join('');
  return `
    <section class="card mt-4" aria-labelledby="measH">
      <div class="row-between"><h2 class="h3" id="measH">Measurements</h2><button class="btn subtle sm" data-action="track-measure">Log</button></div>
      ${rows
        ? `<ul class="kv-list mt-3">${rows}</ul><p class="muted small m-0 mt-2">Latest value, and change since your first entry.</p>`
        : '<p class="muted small mt-3 m-0">Measure your waist every week or two, at the same time of day. It keeps going down even in weeks when the scale doesn’t.</p>'}
    </section>`;
}

/** 30-day weight chart: daily weigh-ins as dots, the 7-day average as the line, goal as a dashed reference. */
function weightChart(endDay) {
  const N = 30;
  const pts = Array.from({ length: N }, (_, i) => {
    const k = keyAdd(endDay, i - N + 1);
    return { k, i, w: hget(k, 'weight') ?? null, a: avg7(k) };
  });
  const ws = pts.filter((p) => p.w != null);
  if (ws.length < 2) {
    return `<p class="muted small mt-3 m-0">${ws.length ? 'One more weigh-in and your 30-day chart appears here.' : 'Your 30-day chart appears after two weigh-ins.'}</p>`;
  }
  const goal = hp().goalWeight;
  const vals = [...ws.map((p) => p.w), ...pts.filter((p) => p.a != null).map((p) => p.a)];
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const showGoal = !!goal && goal >= lo - 3 && goal <= hi + 3;
  if (showGoal) { lo = Math.min(lo, goal); hi = Math.max(hi, goal); }
  const pad = Math.max(0.6, (hi - lo) * 0.15);
  lo = Math.floor(lo - pad); hi = Math.ceil(hi + pad);
  const W = 320, H = 150, L = 34, R = 8, TP = 10, B = 22;
  const x = (i) => L + (i / (N - 1)) * (W - L - R);
  const y = (v) => TP + ((hi - v) / (hi - lo)) * (H - TP - B);
  const ticks = [lo, (lo + hi) / 2, hi].map((v) => Math.round(v * 10) / 10);
  const line = pts.filter((p) => p.a != null).map((p, j) => `${j ? 'L' : 'M'}${x(p.i).toFixed(1)} ${y(p.a).toFixed(1)}`).join(' ');
  const label = (k) => fromKey(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const step = (W - L - R) / (N - 1);
  const data = pts.map((p) => ({ d: fmtShort(fromKey(p.k)), w: p.w, a: p.a == null ? null : Math.round(p.a * 10) / 10 }));
  const first = ws[0], last = ws[ws.length - 1];
  const summary = `Weight over the last 30 days: ${kg(first.w)} kg on ${label(first.k)}, ${kg(last.w)} kg on ${label(last.k)}.`;
  return `
    <div class="wchart" data-points="${esc(JSON.stringify(data))}">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(summary)}" tabindex="0">
        <g class="grid">${ticks.map((t) => `<line x1="${L}" x2="${W - R}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text x="${L - 6}" y="${(y(t) + 3).toFixed(1)}" text-anchor="end">${t % 1 ? t.toFixed(1) : t}</text>`).join('')}</g>
        ${showGoal ? `<line class="goal" x1="${L}" x2="${W - R}" y1="${y(goal).toFixed(1)}" y2="${y(goal).toFixed(1)}"/><text class="goal-t" x="${W - R}" y="${(y(goal) - 4).toFixed(1)}" text-anchor="end">Goal ${kg(goal)}</text>` : ''}
        <path class="trend" d="${line}"/>
        ${ws.map((p) => `<circle class="wdot" cx="${x(p.i).toFixed(1)}" cy="${y(p.w).toFixed(1)}" r="2.5"/>`).join('')}
        <text x="${L}" y="${H - 6}">${label(pts[0].k)}</text>
        <text x="${W - R}" y="${H - 6}" text-anchor="end">${endDay === todayKey() ? 'Today' : label(endDay)}</text>
        <line class="xh" y1="${TP}" y2="${H - B}" x1="0" x2="0" visibility="hidden"/>
        <circle class="fdot" r="4.5" cx="0" cy="0" visibility="hidden"/>
        ${pts.map((p) => `<rect class="hit" x="${(x(p.i) - step / 2).toFixed(1)}" y="${TP}" width="${step.toFixed(1)}" height="${H - TP - B}" data-i="${p.i}" data-x="${x(p.i).toFixed(1)}" data-y="${p.w != null ? y(p.w).toFixed(1) : p.a != null ? y(p.a).toFixed(1) : ''}"/>`).join('')}
      </svg>
      <div class="chart-tip" hidden></div>
      <div class="chart-key small muted"><span class="key-line"></span>7-day average <span class="key-dot"></span>Weigh-in${showGoal ? '<span class="key-goal"></span>Goal' : ''}</div>
      <details class="mt-2"><summary class="small muted">Show as table</summary>
        <table class="data-table"><thead><tr><th scope="col">Date</th><th scope="col">Weight</th><th scope="col">7-day avg</th></tr></thead>
        <tbody>${[...ws].reverse().map((p) => `<tr><td>${esc(label(p.k))}</td><td>${kg(p.w)} kg</td><td>${p.a != null ? kg(p.a) + ' kg' : '–'}</td></tr>`).join('')}</tbody></table>
      </details>
    </div>`;
}

/** Hover, tap and arrow-key readout for the weight chart. */
function wireWeightChart() {
  const wrap = $('.wchart');
  if (!wrap) return;
  const svg = wrap.querySelector('svg'), tip = wrap.querySelector('.chart-tip');
  const xh = svg.querySelector('.xh'), dot = svg.querySelector('.fdot');
  const data = JSON.parse(wrap.dataset.points);
  const hits = [...svg.querySelectorAll('.hit')];
  let cur = -1;
  const show = (i) => {
    const r = hits[i], p = data[i];
    if (!r || !p) return;
    cur = i;
    const px = Number(r.dataset.x);
    xh.setAttribute('x1', px); xh.setAttribute('x2', px); xh.setAttribute('visibility', 'visible');
    if (r.dataset.y) { dot.setAttribute('cx', px); dot.setAttribute('cy', r.dataset.y); dot.setAttribute('visibility', 'visible'); }
    else dot.setAttribute('visibility', 'hidden');
    tip.textContent = `${p.d} · ${p.w != null ? kg(p.w) + ' kg' : 'no weigh-in'}${p.a != null ? ` · avg ${kg(p.a)}` : ''}`;
    tip.hidden = false;
    const vb = svg.viewBox.baseVal, scale = svg.clientWidth / vb.width;
    const left = Math.min(Math.max(px * scale, tip.offsetWidth / 2), wrap.clientWidth - tip.offsetWidth / 2);
    tip.style.left = `${left}px`;
  };
  const hide = () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); cur = -1; };
  svg.addEventListener('pointermove', (e) => { const r = e.target.closest('.hit'); if (r) show(Number(r.dataset.i)); });
  svg.addEventListener('pointerdown', (e) => { const r = e.target.closest('.hit'); if (r) show(Number(r.dataset.i)); });
  svg.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
  svg.addEventListener('blur', hide);
  svg.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    show(Math.min(data.length - 1, Math.max(0, (cur < 0 ? data.length : cur) + (e.key === 'ArrowLeft' ? -1 : 1))));
  });
}

/* ---------- Track sheets ---------- */
function onDayLabel() {
  const day = tKey();
  return day === todayKey() ? 'today' : `on ${fmtShort(fromKey(day))}`;
}

let foodPick = null;   // { id, qty, edit } while choosing servings in the Add food sheet

function foodSheet() {
  const day = tKey();
  const saved = Object.entries(state.foods).sort((a, b) => a[1].name.localeCompare(b[1].name));
  const savedNames = new Set(saved.map(([, f]) => f.name.toLowerCase()));
  const seen = new Set();
  const recent = [...state.meals].sort((a, b) => (a.at < b.at ? 1 : -1)).filter((m) => {
    const k = m.name.toLowerCase();
    if (seen.has(k) || savedNames.has(k) || /^(breakfast|lunch|snack|dinner):/i.test(m.name)) return false;
    seen.add(k); return true;
  }).slice(0, 6);
  const T = targets(day);
  const eaten = state.meals.filter((m) => m.day === day).reduce((a, m) => a + m.kcal, 0);
  const f = foodPick && state.foods[foodPick.id];
  const pickPanel = f ? `
    <div class="pick">
      <div class="row-between"><span class="fw-bold t-lg">${esc(f.name)}</span>${foodPick.edit ? '' : '<button class="link-btn small" data-action="track-pick-edit">Edit values</button>'}</div>
      <div class="small muted">${nf(f.kcal)} kcal${f.protein ? ` · ${nf(f.protein)} g protein` : ''} each</div>
      ${foodPick.edit ? `
        <div class="grid3">
          <div class="field"><label for="qeName">Name</label><input class="input" id="qeName" maxlength="60" value="${esc(f.name)}" /></div>
          <div class="field"><label for="qeKcal">kcal</label><input class="input" id="qeKcal" type="number" inputmode="numeric" min="0" max="5000" value="${f.kcal}" /></div>
          <div class="field"><label for="qeProt">Protein (g)</label><input class="input" id="qeProt" type="number" inputmode="decimal" min="0" max="500" value="${f.protein ?? ''}" /></div>
        </div>
        <button class="btn block mt-3" data-action="track-pick-save">Save values</button>
        <button class="link-btn small danger-text mt-3" data-action="track-food-forget" data-food="${esc(foodPick.id)}">Remove from my foods</button>` : `
        <div class="row-between mt-3">
          <div class="pill-step" aria-label="Servings">
            <button data-action="track-pick-qty" data-d="-0.5" aria-label="Fewer servings">${icon('minus')}</button>
            <span id="pickQty" aria-live="polite">× ${foodPick.qty}</span>
            <button data-action="track-pick-qty" data-d="0.5" aria-label="More servings">${icon('plus')}</button>
          </div>
          <span class="text-right"><b class="t-xl" id="pickTotal">${nf(f.kcal * foodPick.qty)}</b> <span class="small muted">kcal</span><span class="d-block small muted" id="pickProt">${f.protein ? `${nf(f.protein * foodPick.qty)} g protein` : ''}</span></span>
        </div>
        <button class="btn block lg mt-3" data-action="track-pick-add">Add to ${esc(onDayLabel())}</button>`}
    </div>` : '';
  let planRows = '';
  if (window.PF_MEALS) {
    const di = planIdx(day);
    planRows = dayInfo(di, weekStart(day)).meals.map((m, j) => (planLogged(day, m.label) ? '' : `
      <div class="plan-pick" data-name="${esc((m.label + ' ' + m.text).toLowerCase())}">
        <span class="plan-k accent">${m.label}</span><span class="grow">${esc(m.text)}<span class="d-block small muted">${nf(m.kcal)} kcal · ${nf(m.protein)} g</span></span>
        <button class="icon-btn round" data-action="plan-log" data-day="${di}" data-wk="${weekStart(day)}" data-m="${j}" aria-label="Log ${m.label.toLowerCase()} from the plan">${icon('plus')}</button>
      </div>`)).join('');
  }
  openSheet('Add food', `
    <p class="small muted m-0 sheet-meta">to ${esc(onDayLabel())}${T ? ` · ${nf(Math.max(0, T.kcal - eaten))} kcal left` : ''}</p>
    <label class="search mt-3">${icon('search')}<input id="foodSearch" type="search" placeholder="Search my foods, recent, or the plan" autocomplete="off" /></label>
    ${pickPanel}
    <div class="row-between mt-4"><h3 class="sheet-sub m-0">My foods</h3><span class="small muted">tap · choose servings · add</span></div>
    ${saved.length ? `<div class="chips mt-2">${saved.map(([id, x]) => `<button class="chip ${foodPick && foodPick.id === id ? 'on' : ''}" data-name="${esc(x.name.toLowerCase())}" data-action="track-pick" data-food="${esc(id)}">${esc(x.name)} · ${nf(x.kcal)}</button>`).join('')}</div>` : '<p class="muted small m-0 mt-2">No saved foods yet. Add one under "Other food".</p>'}
    ${recent.length ? `<h3 class="sheet-sub">Recent</h3><div class="chips mt-2">${recent.map((m) => `<button class="chip" data-name="${esc(m.name.toLowerCase())}" data-action="track-food-recent" data-id="${esc(m.id)}">${esc(m.name)} · ${nf(m.kcal)}</button>`).join('')}</div>` : ''}
    ${planRows ? `<h3 class="sheet-sub">From ${day === todayKey() ? "today's" : "this day's"} plan</h3><div class="plan-picks mt-2">${planRows}</div>` : ''}
    <h3 class="sheet-sub">Eating out, or not sure?</h3>
    <div class="rough-grid mt-2">${[['Small', 400], ['Normal', 700], ['Big', 1000]].map(([n, k]) => `<button class="rough" data-action="track-food-rough" data-name="${n} meal" data-kcal="${k}"><b>${n}</b><span class="small muted">${nf(k)} kcal</span></button>`).join('')}</div>
    <details class="other-food mt-3"><summary><span class="fw-bold">Other food</span><span class="small muted">name · kcal · protein</span></summary>
      <div class="field"><label for="fName">Food</label><input class="input" id="fName" maxlength="60" placeholder="e.g. Chicken biryani" autocomplete="off" /></div>
      <div class="grid2">
        <div class="field"><label for="fKcal">Calories (kcal)</label><input class="input" id="fKcal" type="number" inputmode="numeric" min="0" max="5000" /></div>
        <div class="field"><label for="fProt">Protein (g), optional</label><input class="input" id="fProt" type="number" inputmode="decimal" min="0" max="500" /></div>
      </div>
      <label class="check mt-4"><input type="checkbox" id="fSave" checked /> Save to my foods</label>
      <button class="btn block lg mt-4" data-action="track-food-add">Add to ${esc(onDayLabel())}</button>
    </details>
    <p class="muted small mt-3 m-0">Rough is fine. A rough number logged every day beats an exact one logged sometimes.</p>`);
}

/** Live filter for the Add food search box. */
function filterFoodSheet(q) {
  const s = q.trim().toLowerCase();
  $$('#sheetBody [data-name]').forEach((el) => { el.hidden = !!s && !el.dataset.name.includes(s); });
}

/** Starter "My foods": the everyday foods from mealplan.js. Fixed ids, so two devices seeding them don't duplicate. */
function seedQuickFoods() {
  if ((state.foodsSeeded && state.foodsSeededDE) || !window.PF_MEALS) return;
  const add = (list) => { for (const [id, name, kcal, protein] of list) if (!state.foods[id]) state.foods[id] = { name, kcal, ...(protein ? { protein } : {}) }; };
  if (!state.foodsSeeded) add(window.PF_MEALS.QUICK);
  if (!state.foodsSeededDE) add(window.PF_MEALS.QUICK_DE || []);
  state.foodsSeeded = true; state.foodsSeededDE = true;
  save();
}

function addMeal(name, kcal, protein) {
  state.meals.push({ id: newId('m'), day: tKey(), at: new Date().toISOString(), name, kcal: Math.round(kcal), ...(protein ? { protein: Math.round(protein * 10) / 10 } : {}) });
  save(); closeSheet(); rerender();
  toast(`Added ${name} · ${nf(kcal)} kcal`);
}

function numberSheet({ title, field, label, value, unit, step = 1, min = 0, max = 100000, hint = '' }) {
  openSheet(title, `
    <div class="field"><label for="numVal">${esc(label)}</label>
      <div class="input-unit"><input class="input" id="numVal" type="number" inputmode="decimal" step="${step}" min="${min}" max="${max}" value="${value ?? ''}" /><span>${esc(unit)}</span></div></div>
    ${hint ? `<p class="muted small mt-2 m-0">${hint}</p>` : ''}
    <button class="btn block lg mt-5" data-action="track-num-save" data-f="${field}" data-min="${min}" data-max="${max}">Save</button>
    ${hget(tKey(), field) != null ? `<button class="btn ghost block mt-3" data-action="track-clear" data-f="${field}">Remove this entry</button>` : ''}`);
}

function sleepSheet() {
  const v = hget(tKey(), 'sleep');
  openSheet('Sleep', `
    <p class="muted small m-0">How long you slept the night before ${esc(onDayLabel())}.</p>
    <div class="grid2">
      <div class="field"><label for="slH">Hours</label><input class="input" id="slH" type="number" inputmode="numeric" min="0" max="16" value="${v != null ? Math.floor(v / 60) : ''}" /></div>
      <div class="field"><label for="slM">Minutes</label><input class="input" id="slM" type="number" inputmode="numeric" min="0" max="59" value="${v != null ? Math.round(v % 60) : ''}" /></div>
    </div>
    <button class="btn block lg mt-5" data-action="track-sleep-save">Save</button>
    ${v != null ? '<button class="btn ghost block mt-3" data-action="track-clear" data-f="sleep">Remove this entry</button>' : ''}`);
}

function measureSheet() {
  const day = tKey();
  openSheet('Measurements', `
    <p class="muted small m-0">In centimetres, ${esc(onDayLabel())}. Fill in only what you measured; the rest stays as it was.</p>
    <div class="grid2">${MEASURES.map(([f, label]) => {
      const last = latestOn(f, day);
      return `<div class="field"><label for="ms-${f}">${label}</label><input class="input" id="ms-${f}" data-measure="${f}" type="number" inputmode="decimal" step="0.1" min="10" max="300" value="${hget(day, f) ?? ''}" placeholder="${last ? kg(last.v) : ''}" /></div>`;
    }).join('')}</div>
    <p class="muted small mt-3 m-0">Waist: around your belly button, relaxed, after breathing out. Use the same spot every time.</p>
    <button class="btn block lg mt-5" data-action="track-measure-save">Save</button>`);
}

function setupSheet() {
  const p = hp();
  const opt = (list, cur) => list.map(([v, t]) => `<option value="${v}" ${Number(cur) === v ? 'selected' : ''}>${esc(t)}</option>`).join('');
  openSheet('Targets & body profile', `
    <div class="grid2">
      <div class="field"><label for="tpSex">Sex (for the formula)</label><select class="select input" id="tpSex">
        <option value="">Choose</option><option value="male" ${p.sex === 'male' ? 'selected' : ''}>Male</option><option value="female" ${p.sex === 'female' ? 'selected' : ''}>Female</option></select></div>
      <div class="field"><label for="tpAge">Age</label><input class="input" id="tpAge" type="number" inputmode="numeric" min="14" max="100" value="${p.age ?? ''}" /></div>
      <div class="field"><label for="tpHeight">Height (cm)</label><input class="input" id="tpHeight" type="number" inputmode="numeric" min="100" max="250" value="${p.height ?? ''}" /></div>
      <div class="field"><label for="tpGoal">Goal weight (kg)</label><input class="input" id="tpGoal" type="number" inputmode="decimal" step="0.1" min="30" max="300" value="${p.goalWeight ?? ''}" /></div>
    </div>
    <div class="field"><label for="tpAct">Activity outside logged workouts</label><select class="select input" id="tpAct">${opt(ACTIVITY, p.activity ?? 1.375)}</select></div>
    <div class="field"><label for="tpRate">How fast to lose</label><select class="select input" id="tpRate">${opt(RATES, p.rate ?? 0.5)}</select></div>
    <p class="muted small mt-2 m-0">Losing about 0.5–1% of your body weight a week is a common, sustainable pace. Your target never goes below 1,500 kcal (men) or 1,200 kcal (women).</p>
    <h3 class="sheet-sub mt-6">Daily goals</h3>
    <div class="grid3">
      <div class="field"><label for="tpSteps">Steps</label><input class="input" id="tpSteps" type="number" inputmode="numeric" min="1000" max="50000" step="500" value="${p.stepGoal ?? HDEF.stepGoal}" /></div>
      <div class="field"><label for="tpSleep">Sleep (h)</label><input class="input" id="tpSleep" type="number" inputmode="decimal" min="4" max="12" step="0.5" value="${(p.sleepGoal ?? HDEF.sleepGoal) / 60}" /></div>
      <div class="field"><label for="tpWater">Water (L)</label><input class="input" id="tpWater" type="number" inputmode="decimal" min="0.5" max="6" step="0.25" value="${(p.waterGoal ?? HDEF.waterGoal) / 1000}" /></div>
    </div>
    <button class="btn block lg mt-6" data-action="track-setup-save">Save</button>`);
}

const TRACK_ACTIONS = {
  'track-day': (el) => {
    const n = Number(el.dataset.n);
    trackDay = n === 0 ? null : keyAdd(tKey(), n);
    if (trackDay && trackDay >= todayKey()) trackDay = null;
    rerender();
  },
  'track-setup': setupSheet,
  'track-setup-save': () => {
    const v = (id) => parseNum($(id)?.value);
    const sex = $('#tpSex').value;
    const age = v('#tpAge'), height = v('#tpHeight'), goal = v('#tpGoal');
    if (!sex || !age || !height) { toast('Add sex, age and height to get your targets'); return; }
    if (age < 14 || age > 100 || height < 100 || height > 250) { toast('Check age (14–100) and height (100–250 cm)'); return; }
    if (goal != null && (goal < 30 || goal > 300)) { toast('Goal weight should be between 30 and 300 kg'); return; }
    const p = state.hprofile;
    p.sex = sex; p.age = Math.round(age); p.height = Math.round(height);
    if (goal != null) p.goalWeight = Math.round(goal * 10) / 10; else delete p.goalWeight;
    p.activity = Number($('#tpAct').value); p.rate = Number($('#tpRate').value);
    p.stepGoal = clamp(Math.round(v('#tpSteps') || HDEF.stepGoal), 1000, 50000);
    p.sleepGoal = clamp(Math.round((v('#tpSleep') || HDEF.sleepGoal / 60) * 60), 240, 720);
    p.waterGoal = clamp(Math.round((v('#tpWater') || HDEF.waterGoal / 1000) * 1000), 500, 6000);
    save(); closeSheet(); rerender(); toast('Targets saved');
  },
  'track-food': () => { foodPick = null; foodSheet(); },
  'track-food-add': () => {
    const name = ($('#fName').value || '').trim();
    const kcal = parseNum($('#fKcal').value), protein = parseNum($('#fProt').value);
    if (!name) { toast('Name the food'); return; }
    if (kcal == null || kcal < 0 || kcal > 5000) { toast('Enter calories between 0 and 5,000'); return; }
    if (protein != null && (protein < 0 || protein > 500)) { toast('Protein should be between 0 and 500 g'); return; }
    if ($('#fSave').checked) {
      const exists = Object.values(state.foods).some((f) => f.name.toLowerCase() === name.toLowerCase());
      if (!exists) state.foods[newId('f')] = { name, kcal: Math.round(kcal), ...(protein ? { protein } : {}) };
    }
    addMeal(name, kcal, protein);
  },
  'track-food-quick': (el) => { const f = state.foods[el.dataset.food]; if (f) addMeal(f.name, f.kcal, f.protein); },
  'track-food-recent': (el) => { const m = state.meals.find((x) => x.id === el.dataset.id); if (m) addMeal(m.name, m.kcal, m.protein); },
  'track-food-forget': (el) => { delete state.foods[el.dataset.food]; save(); foodSheet(); },
  'track-meal-del': (el) => {
    const m = state.meals.find((x) => x.id === el.dataset.id);
    if (!m || !confirm(`Delete ${m.name} (${nf(m.kcal)} kcal)?`)) return;
    state.meals = state.meals.filter((x) => x.id !== m.id);
    save(); rerender(); toast('Deleted');
  },
  'track-weight': () => numberSheet({
    title: 'Weight', field: 'weight', label: `Weight (kg) ${onDayLabel()}`, unit: 'kg', step: 0.1, min: 30, max: 350,
    value: hget(tKey(), 'weight') ?? latestOn('weight', tKey())?.v,
    hint: 'Weigh yourself in the morning, after the toilet and before eating or drinking. Daily numbers swing by 1–2 kg; the 7-day average shows the real trend.',
  }),
  'track-steps': () => numberSheet({ title: 'Steps', field: 'steps', label: `Steps ${onDayLabel()}`, unit: 'steps', step: 100, min: 0, max: 100000, value: hget(tKey(), 'steps'), hint: 'Copy the total from your phone’s health app or your watch.' }),
  'track-water': () => numberSheet({ title: 'Water', field: 'water', label: `Water ${onDayLabel()} (ml)`, unit: 'ml', step: 50, min: 0, max: 10000, value: hget(tKey(), 'water') }),
  'track-water-add': (el) => {
    const day = tKey();
    hset(day, 'water', (hget(day, 'water') || 0) + Number(el.dataset.ml));
    save(); rerender(); toast(`Water: ${((hget(day, 'water')) / 1000).toFixed(2)} L`);
  },
  'track-num-save': (el) => {
    const v = parseNum($('#numVal').value), min = Number(el.dataset.min), max = Number(el.dataset.max);
    if (v == null || v < min || v > max) { toast(`Enter a number between ${nf(min)} and ${nf(max)}`); return; }
    hset(tKey(), el.dataset.f, el.dataset.f === 'weight' ? Math.round(v * 10) / 10 : Math.round(v));
    save(); closeSheet(); rerender(); toast('Saved');
  },
  'track-sleep': sleepSheet,
  'track-sleep-save': () => {
    const h = parseNum($('#slH').value) || 0, m = parseNum($('#slM').value) || 0;
    const total = Math.round(h * 60 + m);
    if (total <= 0 || total > 16 * 60 || m > 59) { toast('Enter hours (0–16) and minutes (0–59)'); return; }
    hset(tKey(), 'sleep', total);
    save(); closeSheet(); rerender(); toast('Saved');
  },
  'track-measure': measureSheet,
  'track-measure-save': () => {
    const day = tKey();
    let bad = false, n = 0;
    $$('[data-measure]').forEach((inp) => {
      const v = parseNum(inp.value);
      if (inp.value.trim() === '') { if (hget(day, inp.dataset.measure) != null) { hset(day, inp.dataset.measure, null); n++; } return; }
      if (v == null || v < 10 || v > 300) { bad = true; return; }
      hset(day, inp.dataset.measure, Math.round(v * 10) / 10); n++;
    });
    if (bad) { toast('Measurements should be between 10 and 300 cm'); return; }
    save(); closeSheet(); rerender(); toast(n ? 'Measurements saved' : 'Nothing changed');
  },
  'track-clear': (el) => { hset(tKey(), el.dataset.f, null); save(); closeSheet(); rerender(); toast('Entry removed'); },
};

/* ---------- Meal plan & groceries ---------- */
const PLAN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let planTab = 'week';
const planIdx = (key) => (fromKey(key).getDay() + 6) % 7;          // Monday = 0
const weekStart = (key) => keyAdd(key, -planIdx(key));
/** A dish, with any stand-ins you bought applied (subs = { ingredient: stand-in }). */
const dishOf = (id, subs) => window.PF_MEALS.dishWith(id, subs);
/** Stand-ins recorded on a week's grocery list: { ingredient: what you bought instead }. */
function subsFor(wk) {
  const out = {};
  for (const [k, v] of Object.entries(state.grocery)) {
    if (!k.startsWith(wk + '|') || !v || typeof v !== 'object' || !v.sub) continue;
    const ing = k.slice(wk.length + 1);
    if (v.sub === 'other') {                                          // something not on any list, named by you
      if (!v.cn) continue;
      const id = `x:${wk}:${ing}`;
      window.PF_MEALS.registerCustom(id, ing, v.cn, v.ck ?? null, v.cp ?? null);
      out[ing] = id;
    } else out[ing] = v.sub;
  }
  return Object.keys(out).length ? out : null;
}

function mealInfo(items, subs) {
  let kcal = 0, protein = 0;
  const dishes = items.map(([id, n]) => ({ id, n, name: dishOf(id, subs)[0] }));
  const parts = items.map(([id, n]) => {
    const [name, , k, p] = dishOf(id, subs);
    kcal += k * n; protein += p * n;
    return n === 1 ? name : `${n} × ${name}`;
  });
  return { text: parts.join(' + '), kcal, protein, dishes };
}

/* ---------- Recipes (recipes.js) ---------- */
// Dishes that cook the same way with a different protein: a swapped dish borrows the matching one's method.
const RECIPE_STYLES = [
  { chicken: 'chickencurry', fish: 'fishcurry', eggs: 'eggcurry', turkey: 'keema', tuna: 'tunamasala' },
  { chicken: 'tikka', fish: 'fishtikka', paneer: 'paneertikka' },
  { paneer: 'paneerbhurji', eggs: 'eggbhurji', turkey: 'keema', tuna: 'tunamasala' },
];
const RECIPE_NAMES = { curd: 'yoghurt', mixedveg: 'mixed vegetables', fish: 'fish', tuna: 'tuna', chicken: 'chicken', turkey: 'turkey mince', fruit: 'fruit', tinnedtom: 'chopped tomatoes', rajma: 'kidney beans', chana: 'chickpeas', spinach: 'spinach', atta: 'atta' };
const recipeName = (ing) => RECIPE_NAMES[ing] || ingShort(ing).toLowerCase().replace(/^frozen /, '').replace(/, tin$/, '');
const FRACTIONS = [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']];
/** Amount for a recipe ingredient line: "130 g", "½ tin", "¼ lemon", "3 eggs". */
function recipeAmt(ing, v) {
  const unit = window.PF_MEALS.ING[ing][2];
  if (unit === 'g' || unit === 'ml') return `${Math.max(5, Math.round(v / 5) * 5)} ${unit}`;
  const whole = Math.floor(v + 1e-6), rest = v - whole;
  const frac = rest < 0.08 ? '' : FRACTIONS.reduce((a, b) => (Math.abs(b[0] - rest) < Math.abs(a[0] - rest) ? b : a))[1];
  const num = `${whole || ''}${frac}` || '1';
  const noun = { eggs: v > 1 ? 'eggs' : 'egg', bread: v > 1 ? 'slices' : 'slice', lemon: 'lemon', cucumber: 'cucumber', fruit: '' }[ing];
  if (unit === 'tin') return `${num} tin`;
  return noun === undefined ? num : `${num}${noun ? ' ' + noun : ''}`;
}
function recipeSheet(id, n, wk) {
  const R = window.PF_RECIPES;
  if (!R || !window.PF_MEALS.DISH[id]) return;
  const subs = subsFor(wk) || {};
  const [name, serving, kcal, protein, ings] = dishOf(id, subs);
  const swapped = Object.keys(window.PF_MEALS.DISH[id][4]).filter((i) => subs[i]);
  // A swapped protein cooks like the dish built around it (egg curry with chicken uses the chicken curry method).
  let rid = id;
  for (const i of swapped) for (const st of RECIPE_STYLES) if (Object.values(st).includes(id) && st[subs[i]]) rid = st[subs[i]];
  const r = R[rid] || R[id];
  if (!r) return;
  const word = (ing) => recipeName(subs[ing] || ing);
  const fill = (t) => t.replace(/\{cook:(\w+)\}/g, (m, ing) => (window.PF_COOK || {})[subs[ing] || ing] || 'until cooked')
    .replace(/\{(\w+)\}/g, (m, ing) => (window.PF_MEALS.ING[ing] ? word(ing) : m));
  const steps = r.steps.map(fill);
  if (rid !== id) {                                                    // borrowed method: mention anything it leaves out
    const said = new Set([...r.steps.join(' ').matchAll(/\{(?:cook:)?(\w+)\}/g)].map((m) => subs[m[1]] || m[1]));
    const left = Object.keys(ings).filter((i) => i !== 'oil' && !said.has(i));
    if (left.includes('curd')) steps.push('Off the heat, stir in the yoghurt so it doesn\'t split.');
    const rest = left.filter((i) => i !== 'curd');
    if (rest.length) steps.push(`Add the ${rest.map(recipeName).join(' and ')} along with the onions.`);
  }
  const lines = Object.entries(ings).map(([ing, v]) => `<li><b>${esc(recipeAmt(ing, v * n))}</b> ${esc(window.PF_MEALS.ING[ing][0])}</li>`).join('');
  openSheet(name, `
    <p class="small muted m-0 sheet-meta">${n > 1 ? `${n} servings, ${esc(serving)} each` : esc(serving)} · ${nf(kcal * n)} kcal · ${nf(protein * n)} g protein · about ${r.t} min</p>
    ${swapped.length ? `<p class="small m-0 mt-2 accent-text">Made with ${esc(swapped.map((i) => `${recipeName(subs[i])} instead of ${recipeName(i)}`).join(', '))}, from what you bought.</p>` : ''}
    <h3 class="sheet-sub">Ingredients${n > 1 ? ` for ${n}` : ''}</h3>
    <ul class="recipe-ings">${lines}${r.sp ? `<li class="muted">${esc(r.sp)}</li>` : ''}</ul>
    <h3 class="sheet-sub">Method</h3>
    <ol class="recipe-steps">${steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
    ${r.tip ? `<div class="note-box mt-3">${esc(fill(r.tip))}</div>` : ''}`);
}
/** A meal's dishes as recipe links: "2 × Roti + Dal saag + Salad". */
const dishLinks = (m, wk) => m.dishes.map((d) => `<button class="dish-link" data-action="recipe" data-dish="${d.id}" data-n="${d.n}" data-wk="${wk}">${d.n === 1 ? '' : `${d.n} × `}${esc(d.name)}</button>`).join(' + ');

/** Plan day i (0 = Monday) of the week starting on Monday `wk`. A new plan is generated for every week. */
function dayInfo(i, wk = weekStart(todayKey()), raw = false) {
  const subs = raw ? null : subsFor(wk);                             // raw: the plan as generated (for the grocery list)
  const meals = window.PF_MEALS.weekPlan(wk)[i].map(([label, items]) => ({ label, items, ...mealInfo(items, subs) }));
  return { subs, meals, kcal: meals.reduce((a, m) => a + m.kcal, 0), protein: meals.reduce((a, m) => a + m.protein, 0) };
}

/** Protein-first extras that bring a plan day up to your calorie and protein targets. */
function topUps(day, T) {
  if (!T) return [];
  let gap = T.kcal - day.kcal, pgap = T.protein - day.protein;
  const out = [];
  const add = (id, n) => { const [, , k, p] = dishOf(id, day.subs); out.push([id, n]); gap -= k * n; pgap -= p * n; };
  if (pgap >= 25 && gap >= 250) add('tikka', 1);
  if (pgap >= 8 && gap >= 150) add('boiled2', 1);
  if (pgap >= 4 && gap >= 90) add('curd', 1);
  const roti = Math.min(3, Math.floor(gap / 110));
  if (roti > 0) add('roti', roti);
  return out;
}
const topUpText = (list, subs) => list.map(([id, n]) => { const [name, serving] = dishOf(id, subs); return n === 1 ? `${name} (${serving})` : `${n} × ${name}`; }).join(', ');

function planCard(key) {
  if (!window.PF_MEALS) return '';
  const i = planIdx(key);
  const d = dayInfo(i, weekStart(key));
  const T = targets(key) || targets(todayKey());
  const ups = topUps(d, T);
  const upInfo = ups.length ? mealInfo(ups, d.subs) : null;
  return `
    <section class="card mt-4" aria-labelledby="planH">
      <div class="row-between"><h2 class="h3" id="planH">Meal plan · ${PLAN_DAYS[i]}</h2><a class="link-btn small" href="#/plan">Week &amp; groceries</a></div>
      <ul class="plan-list mt-3">${d.meals.map((m, j) => `
        <li>
          <span class="grow"><span class="plan-k">${m.label}</span><span class="d-block">${esc(m.text)}</span><span class="d-block muted small">${nf(m.kcal)} kcal · ${nf(m.protein)} g protein</span></span>
          <button class="btn subtle sm" data-action="plan-log" data-day="${i}" data-wk="${weekStart(key)}" data-m="${j}" aria-label="Log ${m.label.toLowerCase()} ${esc(onDayLabel())}">${icon('plus')} Log</button>
        </li>`).join('')}</ul>
      <p class="small m-0 mt-3">Plan: <b>${nf(d.kcal)} kcal</b> · <b>${nf(d.protein)} g protein</b>${T ? ` (your target ${nf(T.kcal)} kcal · ${T.protein} g)` : ''}.</p>
      ${upInfo ? `<p class="small muted m-0 mt-1">To reach your target, add: ${esc(topUpText(ups, d.subs))}. That's about +${nf(upInfo.kcal)} kcal, +${nf(upInfo.protein)} g protein.</p>` : ''}
      ${T && T.kcal < d.kcal - 100 ? '<p class="small muted m-0 mt-1">Your target is below this plan. Skip a roti at lunch or dinner.</p>' : ''}
    </section>`;
}

/** This week's shopping list from the plan (plus daily top-ups when targets are set), grouped by section. */
function groceryList(start) {
  const M = window.PF_MEALS;
  const tot = {};
  const addItems = (items) => items.forEach(([id, n]) => {
    for (const [ing, amt] of Object.entries(dishOf(id)[4])) tot[ing] = (tot[ing] || 0) + amt * n;
  });
  let withTopUps = false;
  const T = targets(todayKey());                                    // today's target applies to the whole week
  for (let i = 0; i < 7; i++) {
    const d = dayInfo(i, start, true);
    d.meals.forEach((m) => addItems(m.items));
    const ups = topUps(d, T);
    if (ups.length) { withTopUps = true; addItems(ups); }
  }
  const sections = M.SECTIONS.map((s) => ({
    name: s,
    items: Object.keys(tot).filter((ing) => M.ING[ing][1] === s).sort((a, b) => M.ING[a][0].localeCompare(M.ING[b][0]))
      .map((ing) => { const [qty, packs] = fmtQty(ing, tot[ing]); return { id: ing, name: M.ING[ing][0], qty, packs, need: roundQty(ing, tot[ing]) }; }),
  })).filter((s) => s.items.length);
  return { sections, withTopUps };
}

/** A suggested amount rounded for shopping: whole pieces and tins, otherwise up to the next 50 g / 50 ml. */
function roundQty(ing, v) {
  const unit = window.PF_MEALS.ING[ing][2];
  return unit === 'pc' || unit === 'tin' ? Math.ceil(v - 0.001) : Math.ceil(v / 50 - 0.001) * 50;
}
/** "1.5 kg" style text for an amount of an ingredient. */
function fmtAmt(ing, v) {
  const unit = window.PF_MEALS.ING[ing][2];
  const n = Math.round(v * 10) / 10;
  if (unit === 'tin') return `${n} ${n === 1 ? 'tin' : 'tins'}`;
  if (unit === 'pc') return ing === 'eggs' ? `${n} ${n === 1 ? 'egg' : 'eggs'}` : ing === 'bread' ? `${n} ${n === 1 ? 'slice' : 'slices'}` : `${n}`;
  const big = (Math.round(v / 100) / 10).toString();
  if (unit === 'ml') return v >= 1000 ? `${big} L` : `${Math.round(v)} ml`;
  return v >= 1000 ? `${big} kg` : `${Math.round(v)} g`;
}
/** Suggested quantity text plus how many shop packs that is, e.g. ["1.5 kg", "4 × 400 g pack"]. */
function fmtQty(ing, v) {
  const pack = window.PF_MEALS.ING[ing][3];
  const packs = pack && v > pack[0] * 1.05 ? `${Math.ceil(v / pack[0] - 0.05)} × ${pack[1]}` : '';
  return [fmtAmt(ing, roundQty(ing, v)), packs];
}
const ingShort = (ing) => window.PF_MEALS.ING[ing][0].replace(/\s*\(.*\)\s*$/, '');
/** The note under a grocery row: what you bought, or what you got instead. */
function groceryStatus(ing, v) {
  if (!v || typeof v !== 'object') return '';
  const parts = [];
  if (v.b === 0 && !v.sub) parts.push('Not bought');
  else if (v.b > 0) parts.push(`Bought ${fmtAmt(ing, v.b)}`);
  if (v.sub) {
    const other = v.sub === 'other';
    parts.push(`${v.b > 0 ? '+' : 'Instead:'} ${other ? v.cn || 'something else' : ingShort(v.sub)}${v.sb ? ` ${fmtAmt(other ? ing : v.sub, v.sb)}` : ''}`);
  }
  return parts.join(' ');
}
/** Drop grocery records from weeks that are over (this week's and next week's stay). */
function pruneGrocery() {
  const keep = weekStart(todayKey());
  for (const k of Object.keys(state.grocery)) if (k.split('|')[0] < keep) delete state.grocery[k];
}

let groEdit = null;   // grocery item being edited: { k, ing, need, sub }
/** Which planned dishes change if `sub` stands in for `ing` that week: ["Palak paneer → Saag paneer", ...]. */
function swapPreview(wk, ing, sub) {
  const out = new Set();
  for (let i = 0; i < 7; i++) for (const [, items] of window.PF_MEALS.weekPlan(wk)[i]) for (const [id] of items) {
    if (!dishOf(id)[4][ing]) continue;
    const a = dishOf(id)[0], b = dishOf(id, { ...(subsFor(wk) || {}), [ing]: sub })[0];
    if (a !== b) out.add(`${a} → ${b}`);
  }
  return [...out];
}
function grocerySubBox() {
  const { k, ing, need, sub } = groEdit;
  if (!sub) return '';
  const wk = k.split('|')[0];
  const v = state.grocery[k];
  if (sub === 'other') return groceryOtherBox(wk, ing, need, v && v.sub === 'other' ? v : {});
  const unit = window.PF_MEALS.ING[sub][2];
  const def = roundQty(sub, window.PF_MEALS.swapAmount(ing, sub, need));
  const prev = swapPreview(wk, ing, sub);
  return `
    <div class="field mt-3"><label for="gbSubAmt">How much ${esc(ingShort(sub).toLowerCase())} (${unit === 'pc' ? 'pieces' : unit === 'tin' ? 'tins' : unit})</label>
      <input class="input" id="gbSubAmt" type="number" inputmode="decimal" min="0" step="any" value="${v && v.sub === sub && v.sb != null ? v.sb : def}" /></div>
    ${prev.length ? `<div class="note-box mt-3"><b>Your meals that week:</b><ul class="swap-list">${prev.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : `<p class="small muted mt-3 m-0">Your meals use it in place of ${esc(ingShort(ing).toLowerCase())}.</p>`}`;
}
/** "Other…": you name what you bought; kcal and protein are optional (the original's are used otherwise). */
function groceryOtherBox(wk, ing, need, rec) {
  const M = window.PF_MEALS, unit = M.ING[ing][2], sw = M.SWAP[ing];
  const per = unit === 'g' ? '100 g' : unit === 'ml' ? '100 ml' : unit === 'tin' ? 'tin' : 'piece';
  const base = (i) => (sw ? Math.round(unit === 'g' || unit === 'ml' ? sw[i] * 100 : sw[i]) : '');
  return `
    <div class="field mt-3"><label for="gbCustName">What did you buy?</label>
      <input class="input" id="gbCustName" maxlength="30" placeholder="e.g. Lamb chops, Methi, Halloumi" value="${esc(rec.cn || '')}" autocomplete="off" /></div>
    <div class="grid3">
      <div class="field"><label for="gbSubAmt">Amount (${unit === 'pc' ? 'pieces' : unit === 'tin' ? 'tins' : unit})</label><input class="input" id="gbSubAmt" type="number" inputmode="decimal" min="0" step="any" value="${rec.sb ?? need}" /></div>
      <div class="field"><label for="gbCustK">kcal / ${per}</label><input class="input" id="gbCustK" type="number" inputmode="decimal" min="0" step="any" placeholder="${base(1)}" value="${rec.ck ?? ''}" /></div>
      <div class="field"><label for="gbCustP">Protein g / ${per}</label><input class="input" id="gbCustP" type="number" inputmode="decimal" min="0" step="any" placeholder="${base(2)}" value="${rec.cp ?? ''}" /></div>
    </div>
    <p class="small muted m-0 mt-2">Leave kcal and protein empty to keep the ${esc(ingShort(ing).toLowerCase())} values. The packet's nutrition label has them per 100 g.</p>
    <div class="note-box mt-3" id="gbCustPrev">${otherPreview(wk, ing, rec.cn)}</div>`;
}
function otherPreview(wk, ing, name) {
  const n = (name || '').trim();
  if (!n) return `Meals that use ${esc(ingShort(ing).toLowerCase())} that week will use what you bought, renamed to match.`;
  const id = `x:preview:${ing}`;
  window.PF_MEALS.registerCustom(id, ing, n, null, null);
  const out = new Set();
  for (let i = 0; i < 7; i++) for (const [, items] of window.PF_MEALS.weekPlan(wk)[i]) for (const [d] of items) {
    if (!dishOf(d)[4][ing]) continue;
    const a = dishOf(d)[0], b = dishOf(d, { ...(subsFor(wk) || {}), [ing]: id })[0];
    if (a !== b) out.add(`${a} → ${b}`);
  }
  return out.size ? `<b>Your meals that week:</b><ul class="swap-list">${[...out].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : 'No planned dish uses it that week.';
}
function groceryEditSheet(k, ing, need) {
  const M = window.PF_MEALS;
  const [, section, unit, pack] = M.ING[ing];
  const v = state.grocery[k];
  const rec = v && typeof v === 'object' ? v : v ? { b: need } : {};
  groEdit = { k, ing, need, sub: rec.sub || null };
  const [qty, packs] = fmtQty(ing, need);
  const alts = M.altsFor(ing);
  const unitLabel = unit === 'pc' ? (ing === 'eggs' ? 'eggs' : ing === 'bread' ? 'slices' : 'pieces') : unit === 'tin' ? 'tins' : unit;
  openSheet(ingShort(ing), `
    <p class="small muted m-0 sheet-meta">${esc(M.ING[ing][0])} · ${esc(section)}</p>
    <div class="card flat soft mt-3 row-between"><span>Suggested for the week</span><span class="text-right"><b>${esc(qty)}</b>${packs ? `<span class="d-block small muted">${esc(packs)}</span>` : ''}</span></div>
    <div class="field mt-4"><label for="gbAmt">What you bought (${unitLabel})</label>
      <input class="input" id="gbAmt" type="number" inputmode="decimal" min="0" step="any" value="${rec.b ?? ''}" placeholder="${need}" /></div>
    <div class="chips mt-2"><button class="chip" data-action="grocery-amt" data-v="${need}">As suggested</button><button class="chip" data-action="grocery-amt" data-v="0">Not available</button>${pack && unit !== 'pc' ? `<button class="chip" data-action="grocery-amt" data-v="${pack[0] * Math.max(1, Math.round(need / pack[0]))}">${Math.max(1, Math.round(need / pack[0]))} × ${esc(pack[1])}</button>` : ''}</div>
    <h3 class="sheet-sub">Bought something else instead?</h3>
      <p class="small muted m-0">Pick it and that week's meals switch to it.</p>
      <div class="chips mt-2" id="gbSubs">${[...alts, 'other'].map((a) => `<button class="chip ${groEdit.sub === a ? 'on' : ''}" aria-pressed="${groEdit.sub === a}" data-action="grocery-sub" data-sub="${a}">${a === 'other' ? 'Other…' : esc(ingShort(a))}</button>`).join('')}</div>
      <div id="gbSubBox">${grocerySubBox()}</div>
    <button class="btn block lg mt-4" data-action="grocery-save">Save</button>
    ${v ? '<button class="link-btn small danger-text mt-3" data-action="grocery-reset">Clear this item</button>' : ''}`);
}

let planSel = null;   // selected day (0 = Monday) on the Week plan; null = today
let planWeek = null;  // 0 = this week, 1 = next week; null = automatic (Groceries shows next week from Friday)
let planWkShown = 0;  // the week on screen, so switching tabs stays on it

VIEWS.plan = () => {
  if (!window.PF_MEALS) return '<p class="muted">Meal plan data is missing.</p>';
  const tk = todayKey();
  const ti = planIdx(tk);
  const wkOff = planWeek ?? (planTab === 'groceries' && ti >= 4 ? 1 : 0);   // from Friday, shop for next week
  planWkShown = wkOff;
  const start = keyAdd(weekStart(tk), 7 * wkOff);
  const sel = planSel ?? (wkOff ? 0 : ti);
  const T = targets(tk);
  const short = (k) => fromKey(k).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const { sections, withTopUps } = groceryList(start);
  const all = sections.flatMap((s) => s.items);
  const ticked = all.filter((it) => state.grocery[`${start}|${it.id}`]).length;
  let body;
  if (planTab === 'week') {
    const strip = PLAN_DAYS.map((name, i) => {
      const d = dayInfo(i, start);
      return `<button class="pd ${i === sel ? 'sel' : ''}" data-action="plan-sel" data-i="${i}" aria-pressed="${i === sel}" aria-label="${name}, ${nf(d.kcal)} kcal"><span class="wd">${name.slice(0, 3)}</span><span class="kc">${(d.kcal / 1000).toFixed(2).replace(/0$/, '')}k</span></button>`;
    }).join('');
    const d = dayInfo(sel, start);
    const isToday = !wkOff && sel === ti;
    const dayK = keyAdd(start, sel);
    const ups = topUps(d, T);
    const upInfo = ups.length ? mealInfo(ups, d.subs) : null;
    const meals = d.meals.map((m, j) => {
      const logged = isToday && planLogged(tk, m.label);
      return `<li><span class="plan-k">${m.label}</span><span class="grow">${dishLinks(m, start)}<span class="d-block small muted">${nf(m.kcal)} kcal · ${nf(m.protein)} g protein</span></span>
        ${isToday ? (logged ? `<span class="logged">${icon('check', 'class="icon-sm"')} Logged</span>` : `<button class="btn subtle sm" data-action="plan-log" data-day="${sel}" data-wk="${start}" data-m="${j}" aria-label="Log ${m.label.toLowerCase()} today">${icon('plus')} Log</button>`) : ''}</li>`;
    }).join('');
    const nextDays = [1, 2].map((n) => sel + n).filter((i) => i < 7).map((i) => {
      const x = dayInfo(i, start);
      return `<button class="card plan-mini mt-3" data-action="plan-sel" data-i="${i}">
        <span class="row-between"><span class="h3">${PLAN_DAYS[i]}</span><span class="small muted">${nf(x.kcal)} kcal · ${nf(x.protein)} g</span></span>
        ${x.meals.map((m) => `<span class="pm"><span class="plan-k">${m.label}</span><span>${esc(m.text)}</span></span>`).join('')}
      </button>`;
    }).join('');
    body = `
      <div class="pd-strip mt-4">${strip}</div>
      <section class="card mt-4 ${isToday ? 'callout' : ''}" aria-label="${PLAN_DAYS[sel]}">
        <div class="row-between">
          <div><div class="eyebrow">${isToday ? `Today · ${PLAN_DAYS[sel]}` : esc(fmtShort(fromKey(dayK)))}</div><div class="h3 mt-1">${nf(d.kcal)} kcal · ${nf(d.protein)} g protein</div></div>
          ${T ? `<div class="text-right small"><span class="muted d-block">target</span><b>${nf(T.kcal)} · ${T.protein} g</b></div>` : ''}
        </div>
        <ul class="plan-list mt-3">${meals}</ul>
        ${d.subs && d.meals.some((m, j) => m.text !== dayInfo(sel, start, true).meals[j].text) ? `<p class="small muted m-0 mt-2">Using what you bought: ${esc(Object.entries(d.subs).map(([a, b]) => `${ingShort(b).toLowerCase()} instead of ${ingShort(a).toLowerCase()}`).join(', '))}.</p>` : ''}
        ${upInfo ? `<div class="note-box mt-3"><b>To reach your target, add:</b> ${esc(topUpText(ups, d.subs))}. About +${nf(upInfo.kcal)} kcal, +${nf(upInfo.protein)} g protein.</div>` : ''}
      </section>
      ${nextDays}`;
  } else {
    body = `
      <section class="card groc-head mt-4">
        <div class="ring-wrap sm">${ringSvg(all.length ? ticked / all.length : 0, 52, 6)}<div class="ring-c"><b class="small">${ticked}/${all.length}</b></div></div>
        <div class="grow"><div class="fw-bold">${wkOff ? 'Next week' : 'This week'}, one person</div><div class="small muted">Amounts are suggestions${withTopUps ? ', with your daily top-ups' : ''}. Tap an item to note what you bought or a swap.</div></div>
        ${ticked ? `<button class="link-btn" data-action="grocery-clear" data-wk="${start}">Clear</button>` : ''}
      </section>
      ${sections.map((s) => {
        const n = s.items.filter((it) => state.grocery[`${start}|${it.id}`]).length;
        return `<div class="sec-head sm"><h2 class="group-label m-0">${esc(s.name)}</h2><span class="small muted">${n} / ${s.items.length}</span></div>
        <ul class="grocery card list-card">${s.items.map((it) => {
          const k = `${start}|${it.id}`;
          const v = state.grocery[k], st = groceryStatus(it.id, v);
          return `<li><label class="check"><input type="checkbox" data-grocery="${esc(k)}" ${v ? 'checked' : ''} aria-label="Bought ${esc(it.name)}" /></label>
            <button class="g-item grow plain text-left" data-action="grocery-edit" data-k="${esc(k)}" data-ing="${it.id}" data-need="${it.need}" aria-label="${esc(it.name)}: note what you bought"><span class="${v ? 'done' : ''}">${esc(it.name)}</span>${st ? `<span class="d-block small ${v && v.sub ? 'accent-text' : 'muted'}">${esc(st)}</span>` : ''}</button>
            <span class="text-right qty"><b>${esc(it.qty)}</b>${it.packs ? `<span class="d-block small muted">${esc(it.packs)}</span>` : ''}</span></li>`;
        }).join('')}</ul>`;
      }).join('')}
      <p class="muted small mt-4">${esc(window.PF_MEALS.PANTRY_NOTE)}</p>`;
  }
  return `
    <a class="link-plain small" href="#/today">${icon('chevL', 'class="icon-sm"')} Today</a>
    <h1 class="h1 mt-2 m-0">Meal plan</h1>
    <p class="muted m-0 mt-1">Indian, from German shops · ${esc(short(start))} – ${esc(short(keyAdd(start, 6)))}</p>
    <div class="chips wk-switch mt-3" role="group" aria-label="Which week">
      ${['This week', 'Next week'].map((n, w) => `<button class="chip ${wkOff === w ? 'on' : ''}" aria-pressed="${wkOff === w}" data-action="plan-week" data-w="${w}">${n}${w && ti >= 4 ? ' · new' : ''}</button>`).join('')}
    </div>
    <div class="segmented" role="tablist" aria-label="Meal plan" style="--n:2;--i:${planTab === 'week' ? 0 : 1}">
      <button role="tab" aria-selected="${planTab === 'week'}" data-action="plan-tab" data-tab="week">Week plan</button>
      <button role="tab" aria-selected="${planTab === 'groceries'}" data-action="plan-tab" data-tab="groceries">Groceries · ${all.length}</button>
    </div>
    <div role="tabpanel">${body}</div>
    <p class="muted small mt-5">General healthy-eating guidance, not medical advice. If you have diabetes, kidney problems or take regular medication, check the plan with your doctor or a dietitian first.</p>`;
};

const PLAN_ACTIONS = {
  'track-pick': (el) => { foodPick = { id: el.dataset.food, qty: 1 }; foodSheet(); },
  'track-pick-qty': (el) => {
    const f = foodPick && state.foods[foodPick.id];
    if (!f) return;
    foodPick.qty = clamp(Math.round((foodPick.qty + Number(el.dataset.d)) * 2) / 2, 0.5, 10);
    $('#pickQty').textContent = `× ${foodPick.qty}`;
    $('#pickTotal').textContent = nf(f.kcal * foodPick.qty);
    const pr = $('#pickProt'); if (pr && f.protein) pr.textContent = `${nf(f.protein * foodPick.qty)} g protein`;
  },
  'track-pick-add': () => {
    const f = foodPick && state.foods[foodPick.id];
    if (!f) return;
    const q = foodPick.qty;
    foodPick = null;
    addMeal(q === 1 ? f.name : `${q} × ${f.name}`, f.kcal * q, f.protein ? f.protein * q : null);
  },
  'track-pick-edit': () => { if (foodPick) { foodPick.edit = true; foodSheet(); } },
  'track-pick-save': () => {
    const f = foodPick && state.foods[foodPick.id];
    if (!f) return;
    const name = ($('#qeName').value || '').trim(), kcal = parseNum($('#qeKcal').value), protein = parseNum($('#qeProt').value);
    if (!name || kcal == null || kcal < 0 || kcal > 5000 || (protein != null && (protein < 0 || protein > 500))) { toast('Check the name, kcal (0–5,000) and protein (0–500 g)'); return; }
    state.foods[foodPick.id] = { name, kcal: Math.round(kcal), ...(protein ? { protein } : {}) };
    save(); foodPick.edit = false; foodSheet(); toast('Saved');
  },
  'track-food-rough': (el) => addMeal(el.dataset.name, Number(el.dataset.kcal), null),
  'plan-log': (el) => {
    const m = dayInfo(Number(el.dataset.day), el.dataset.wk || undefined).meals[Number(el.dataset.m)];
    if (!m) return;
    if (parseRoute().name !== 'track') trackDay = null;           // only the day log adds to another day
    addMeal(`${m.label}: ${m.text}`.slice(0, 120), m.kcal, m.protein);
  },
  'plan-tab': (el) => { if (planWeek == null && el.dataset.tab === 'week') planWeek = planWkShown; if (planTab !== el.dataset.tab) planSel = null; planTab = el.dataset.tab; rerender(); },
  'recipe': (el) => recipeSheet(el.dataset.dish, Number(el.dataset.n) || 1, el.dataset.wk || weekStart(todayKey())),
  'grocery-edit': (el) => groceryEditSheet(el.dataset.k, el.dataset.ing, Number(el.dataset.need)),
  'grocery-amt': (el) => { const i = $('#gbAmt'); if (i) i.value = el.dataset.v; },
  'grocery-sub': (el) => {
    groEdit.sub = groEdit.sub === el.dataset.sub ? null : el.dataset.sub;
    $$('#gbSubs .chip').forEach((c) => { const on = c.dataset.sub === groEdit.sub; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); });
    $('#gbSubBox').innerHTML = grocerySubBox();
  },
  'grocery-save': () => {
    if (!groEdit) return;
    const { k, ing, sub } = groEdit;
    const amt = parseNum($('#gbAmt').value);
    const subAmt = sub && $('#gbSubAmt') ? parseNum($('#gbSubAmt').value) : null;
    if ((amt != null && (amt < 0 || amt > 100000)) || (subAmt != null && (subAmt < 0 || subAmt > 100000))) { toast('Check the amounts'); return; }
    let custom = {};
    if (sub === 'other') {
      const cn = ($('#gbCustName').value || '').trim().replace(/\s+/g, ' ');
      const ck = parseNum($('#gbCustK').value), cp = parseNum($('#gbCustP').value);
      if (!cn) { toast('Type what you bought'); $('#gbCustName').focus(); return; }
      if ((ck != null && (ck < 0 || ck > 2000)) || (cp != null && (cp < 0 || cp > 100))) { toast('Check kcal (0–2,000) and protein (0–100 g)'); return; }
      custom = { cn, ...(ck != null ? { ck } : {}), ...(cp != null ? { cp } : {}) };
    }
    pruneGrocery();
    if (amt == null && !sub) delete state.grocery[k];
    else state.grocery[k] = { ...(amt != null ? { b: amt } : sub ? { b: 0 } : {}), ...(sub ? { sub, ...custom, ...(subAmt != null ? { sb: subAmt } : {}) } : {}) };
    save(); closeSheet(); rerender();
    toast(sub ? `Meals that week now use ${(sub === 'other' ? custom.cn : ingShort(sub)).toLowerCase()}` : 'Saved');
  },
  'grocery-reset': () => { if (!groEdit) return; delete state.grocery[groEdit.k]; save(); closeSheet(); rerender(); toast('Cleared'); },
  'plan-week': (el) => { planWeek = Number(el.dataset.w); planSel = null; rerender(); },
  'grocery-clear': (el) => {
    const start = el.dataset.wk || weekStart(todayKey());
    for (const k of Object.keys(state.grocery)) if (k.startsWith(start + '|')) delete state.grocery[k];
    save(); rerender();
  },
};

/** One-time import from the old standalone tracker (tracker.html), which kept its data under pf_* keys. */
function importOldTracker() {
  if (state.hmigrated) return;
  state.hmigrated = true;
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) && n > 0 ? n : undefined; };
  const p = read('pf_profile');
  const day = todayKey();
  if (p && typeof p === 'object') {
    const hpNew = { sex: ['male', 'female'].includes(p.sex) ? p.sex : undefined, age: num(p.age), height: num(p.height), activity: num(p.activity) };
    for (const [k, v] of Object.entries(hpNew)) if (v !== undefined && state.hprofile[k] === undefined) state.hprofile[k] = v;
    if (num(p.weight) && !series('weight').length) hset(day, 'weight', Math.round(num(p.weight) * 10) / 10);
    for (const [old, f] of [['chest', 'chest'], ['waist', 'waist'], ['hips', 'hips'], ['biceps', 'arm'], ['thigh', 'thigh'], ['neck', 'neck']]) {
      if (num(p[old]) && !series(f).length) hset(day, f, num(p[old]));
    }
    if (!state.profile.name && typeof p.name === 'string') state.profile.name = p.name.trim().slice(0, 40);
  }
  for (let i = 0; i < localStorage.length; i++) {
    const m = /^pf_day_(\d{4}-\d{2}-\d{2})$/.exec(localStorage.key(i) || '');
    if (!m) continue;
    const d = read(m[0]);
    if (!d || typeof d !== 'object') continue;
    if (num(d.steps) && hget(m[1], 'steps') == null) hset(m[1], 'steps', Math.round(num(d.steps)));
    if (num(d.sleepMinutes) && hget(m[1], 'sleep') == null) hset(m[1], 'sleep', Math.round(num(d.sleepMinutes)));
    (Array.isArray(d.meals) ? d.meals : []).forEach((meal, j) => {
      const id = `pf1-${m[1]}-${j}`;
      if (!meal || !Number.isFinite(meal.kcal) || state.meals.some((x) => x.id === id)) return;
      const at = Number.isFinite(meal.at) ? new Date(meal.at).toISOString() : `${m[1]}T12:00:00.000Z`;
      state.meals.push({ id, day: m[1], at, name: String(meal.name || 'Meal').slice(0, 60), kcal: Math.round(meal.kcal) });
    });
  }
  save();
}

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

/** Flat list of every set in the session draft, in order. */
const draftSets = () => draft.entries.flatMap((e, ei) => e.values.map((v, si) => ({ ei, si, v, done: e.done[si] })));
/** The set being worked on: the chosen one if it isn't done yet, else the first set not done. */
function curSet() {
  const all = draftSets();
  if (draft.cur) {
    const c = all.find((x) => x.ei === draft.cur[0] && x.si === draft.cur[1]);
    if (c && !c.done) return c;
  }
  return all.find((x) => !x.done) || null;
}
const fmtClock = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

VIEWS.workout = () => {
  if (!draft || draft.mode !== 'session') {
    return `<div class="empty">${icon('dumbbell')}<p>No workout in progress.</p><a class="btn" href="#/today">Back to Today</a></div>`;
  }
  const all = draftSets();
  const cur = curSet();
  const doneN = all.filter((x) => x.done).length;
  const ei = cur ? cur.ei : draft.entries.length - 1;
  const e = draft.entries[ei];
  const { p, cat, idx } = PROG[e.progId];
  const lvl = workingLevel(p.id), L = p.levels[lvl - 1];
  const unit = p.type === 'hold' ? 'seconds' : 'reps';
  const after = cur ? all.filter((x) => !x.done && (x.ei > cur.ei || (x.ei === cur.ei && x.si > cur.si)))[0] : null;
  const nameOf = (x) => PROG[draft.entries[x.ei].progId].p.name;
  const resting = !!restTimer && !!cur;
  const restLeft = resting ? Math.max(0, Math.ceil((restTimer.end - Date.now()) / 1000)) : 0;
  const elapsed = Math.max(0, Math.floor((Date.now() - (draft.started || Date.now())) / 1000));

  const segs = draft.entries.map((x, i) => (x.done.every(Boolean) ? 'done' : i === ei && cur ? 'cur' : 'off'));
  let main, helper;
  if (!cur) {
    main = `<button class="btn lg block done-btn" data-action="finish-workout">${icon('check')} Finish workout</button>`;
    helper = 'Every set is done. Save the workout to check your levels.';
  } else if (resting) {
    main = `<button class="btn lg block rest-btn" data-action="skip-rest" aria-live="off">Rest <b id="restTime">${fmtClock(restLeft)}</b> · Skip</button>`;
    helper = `Up next: ${esc(nameOf(cur))} · Set ${cur.si + 1}`;
  } else {
    main = `<button class="btn lg block done-btn" data-action="wo-set-done">${icon('check')} Set done</button>`;
    helper = after
      ? `Starts a ${state.restSeconds} s rest, then moves to ${esc(after.ei === cur.ei ? `set ${after.si + 1}` : nameOf(after))}.`
      : 'Last set of the workout.';
  }

  return `
    <div class="wo-top">
      <button class="icon-btn round bare" data-action="cancel-workout" aria-label="Cancel workout">${icon('x')}</button>
      <div class="text-center"><div class="fw-bold">${esc(routine().name)}</div><div class="small muted"><span id="woElapsed">${fmtClock(elapsed)}</span> elapsed</div></div>
      <span class="fw-bold wo-count" aria-label="Exercise ${ei + 1} of ${draft.entries.length}">${ei + 1}/${draft.entries.length}</span>
    </div>
    ${segBar(segs, 'wo-segs')}
    <div class="wo-hero mt-4">
      ${art(cat.id, { cls: 'hero-art', shift: idx * 4, img: p.id, alt: `Athlete demonstrating ${p.name}` })}
      <div class="wo-hero-txt">
        <div class="eyebrow light">${esc(cat.name)} ${idx + 1} · ${isMastered(p.id) ? 'Mastered' : `Level ${lvl}`}</div>
        <div class="row-between gap-3"><h1 class="m-0">${esc(p.name)}</h1><button class="glass-btn" data-action="wo-howto" data-prog="${p.id}">${icon('info', 'class="icon-sm"')} How to</button></div>
      </div>
    </div>
    ${cur ? `<section class="card set-card mt-4" aria-label="Current set">
      <div class="eyebrow muted text-center">Set ${cur.si + 1} of ${e.values.length} · Target ${L.target}${p.type === 'hold' ? ' s' : ''}</div>
      <div class="big-step">
        <button class="step-btn" data-action="wo-step" data-d="${p.type === 'hold' ? -5 : -1}" aria-label="Less">${icon('minus')}</button>
        <input class="big-num" type="number" inputmode="numeric" min="0" max="999" value="${cur.v}" data-set data-e="${cur.ei}" data-s="${cur.si}" aria-label="${unit}" />
        <button class="step-btn" data-action="wo-step" data-d="${p.type === 'hold' ? 5 : 1}" aria-label="More">${icon('plus')}</button>
      </div>
      <div class="text-center small muted">${unit}${p.perSide ? ' per side' : ''}</div>
      <div class="mt-4">${main}</div>
      ${p.type === 'hold' && !resting ? `<button class="btn subtle block mt-2" data-action="hold-timer" data-e="${cur.ei}">${icon(holdTimer && holdTimer.e === cur.ei ? 'pause' : 'play')} ${holdTimer && holdTimer.e === cur.ei ? 'Stop hold' : 'Time this hold'}</button>` : ''}
      <p class="small muted text-center m-0 mt-3">${helper}</p>
    </section>` : `<section class="card set-card mt-4">${main}<p class="small muted text-center m-0 mt-3">${helper}</p></section>`}
    <section class="card set-list mt-4" aria-label="All sets">
      ${all.map((x) => {
        const pp = PROG[draft.entries[x.ei].progId].p;
        const isCur = cur && x.ei === cur.ei && x.si === cur.si;
        return `<button class="set-li ${x.done ? 'done' : ''} ${isCur ? 'cur' : ''}" data-action="wo-goto" data-e="${x.ei}" data-s="${x.si}" aria-current="${isCur ? 'step' : 'false'}">
          <span class="st">${x.done ? icon('check') : ''}</span><span class="grow">${esc(pp.name)} · Set ${x.si + 1}</span><span>${x.v} ${pp.type === 'hold' ? 's' : 'reps'}</span></button>`;
      }).join('')}
      <button class="link-btn add-set" data-action="add-set" data-e="${ei}">${icon('plus', 'class="icon-sm"')} Add a set</button>
    </section>
    <div class="row-between mt-4 small">
      <span class="muted">${doneN} of ${all.length} sets done</span>
      ${cur ? `<button class="link-btn" data-action="finish-workout" ${doneN ? '' : 'disabled'}>Finish early</button>` : ''}
    </div>`;
};

/** Keep the elapsed clock ticking while the workout screen is open. */
let woTick = null;
function wireWorkout(active) {
  if (!active) { if (woTick) { clearInterval(woTick); woTick = null; } return; }
  if (woTick) return;
  woTick = setInterval(() => {
    const el = $('#woElapsed');
    if (!el || !draft) { clearInterval(woTick); woTick = null; return; }
    el.textContent = fmtClock(Math.floor((Date.now() - (draft.started || Date.now())) / 1000));
  }, 1000);
}

const WORKOUT_ACTIONS = {
  'wo-step': (el) => {
    const c = curSet();
    if (!c) return;
    const e = draft.entries[c.ei];
    e.values[c.si] = clamp((Number(e.values[c.si]) || 0) + Number(el.dataset.d), 0, 999);
    saveDraft();
    const input = $('.big-num');
    if (input) input.value = e.values[c.si];
  },
  'wo-set-done': () => {
    const c = curSet();
    if (!c) return;
    draft.entries[c.ei].done[c.si] = true;
    draft.cur = null;
    saveDraft();
    if (curSet()) startRest(); else stopRest();
    rerender();
  },
  'wo-goto': (el) => {
    const ei = Number(el.dataset.e), si = Number(el.dataset.s);
    const e = draft.entries[ei];
    if (e.done[si]) e.done[si] = false;           // tap a finished set to redo it
    draft.cur = [ei, si];
    saveDraft(); stopRest(); rerender();
  },
  'wo-howto': (el) => {
    const { p } = PROG[el.dataset.prog];
    openSheet(p.name, `<ol class="num-steps">${(p.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <h3 class="h3 mt-4">Form cues</h3><ul class="cues">${(p.cues || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`);
  },
};

function lockedView(c) {
  return `<div class="empty">${art(c.id, { locked: true, img: c.id, cls: 'locked-hero' })}
    <div class="h3">${esc(c.name)} is a Pro movement</div>
    <p>Unlock it, along with the other advanced families, with PulseFit Pro.</p>
    <button class="btn" data-action="pro">See PulseFit Pro</button></div>`;
}
const notFound = () => `<div class="empty">${icon('help')}<p>That page doesn't exist.</p><a class="btn" href="#/today">Go home</a></div>`;

/* ---------------------------------------------------------------
   9. After-render wiring (carousel scroll sync)
   --------------------------------------------------------------- */
/** Width of one carousel step: slide width plus the CSS gap token. */
const slideStep = (car) => car.clientWidth + (parseFloat(getComputedStyle(car).columnGap) || 0);

function afterRender(r) {
  if (r.name === 'track' || (r.name === 'progress' && progTab === 'body')) wireWeightChart();
  wireWorkout(r.name === 'workout');
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
  if (parseRoute().name === 'workout' && draft && draft.mode === 'session') {
    // The workout screen shows the countdown in its main button.
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      const t = $('#restTime');
      if (t) t.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
      if (left <= 0) { beep(); try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch { /* ignore */ } stopRest(); if (parseRoute().name === 'workout') rerender(); toast('Rest over, next set'); }
    };
    restTimer = { end, int: setInterval(tick, 250) };
    return;
  }
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
  restTimer = { end, int: setInterval(tick, 250) };
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

function planReminderSheet() {
  const pr = state.planReminder;
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  openSheet('Meal plan reminder', `
    <div class="row-between mb-4"><div><div class="t fw-bold">Weekly reminder</div><div class="small muted">A new plan starts every Monday. Get a nudge to shop for it.</div></div>
      <button class="toggle" role="switch" aria-checked="${pr.enabled}" data-action="toggle-plan-reminder" aria-label="Weekly meal plan reminder"></button></div>
    <div class="grid2">
      <div class="field"><label for="prDay">Day</label><select class="input" id="prDay" data-bind="planRemDay">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<option value="${d}" ${pr.day === d ? 'selected' : ''}>${WEEKDAYS[d]}</option>`).join('')}</select></div>
      <div class="field"><label for="prTime">Time</label><input class="input" id="prTime" type="time" value="${esc(pr.time)}" data-bind="planRemTime" /></div>
    </div>
    <p class="small muted mt-4 m-0">Next week's plan comes out every Friday, so you can shop on Saturday (shops are closed on Sunday). From Friday, Groceries shows next week's list, and the banner on Today stays until Saturday evening or until you start ticking it off.</p>
    <button class="btn ghost block mt-4" data-action="plan-ics">${icon('calendar')} Add to my calendar</button>
    <p class="small muted mt-2 m-0">Adds a repeating event with an alert to your phone's calendar, so it reminds you even when PulseFit is closed.</p>
    <p class="small muted mt-4 m-0">${perm === 'granted' ? 'In-app: you get a notification while PulseFit is open, and a banner on Today.' : 'In-app: you see a banner on Today on that day.'}</p>`);
}

/** A weekly repeating calendar event (.ics) for the meal plan reminder, in German time. */
function planReminderIcs() {
  const pr = state.planReminder;
  const by = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][pr.day];
  const d = new Date();
  d.setDate(d.getDate() + ((pr.day - d.getDay() + 7) % 7));
  const [hh, mm] = pr.time.split(':').map(Number);
  const p2 = (n) => String(n).padStart(2, '0');
  const start = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(hh)}${p2(mm)}00`;
  const end = `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(Math.min(23, hh + 1))}${p2(mm)}00`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const url = location.href.split('#')[0] + '#/plan';
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PulseFit//Meal plan//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE', 'TZID:Europe/Berlin',
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT', 'UID:pulsefit-meal-plan-reminder@idarkdeveloper.github.io', `DTSTAMP:${now}`,
    `DTSTART;TZID=Europe/Berlin:${start}`, `DTEND;TZID=Europe/Berlin:${end}`, `RRULE:FREQ=WEEKLY;BYDAY=${by}`,
    'SUMMARY:PulseFit: meal plan & groceries', `DESCRIPTION:Check next week's PulseFit meal plan and buy the groceries. ${url}`, `URL:${url}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Meal plan & groceries', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'pulsefit-meal-plan.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
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
    <p><strong>Cloud sync (optional).</strong> Only if you sign in under Profile → Account, a copy of your workouts, levels, progressions, joined ladders, health logs (weight, food, steps, sleep, water, measurements), targets, name and app settings is stored in a private Supabase database so your devices can sync. Your email field, reminders and anything else on this device are never uploaded. Only the owner's account can read or write that copy. Delete cloud data removes it.</p>
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

/* ---------------------------------------------------------------
   Health Connect (Android app only)
   The PulseFit Android app is this same site inside a Capacitor shell. There, Health Connect gives us what
   Samsung Health (and the Galaxy Watch) recorded: steps, sleep, weight, workouts and active calories.
   Values fill your daily log; anything you typed in yourself is never overwritten.
   --------------------------------------------------------------- */
const APK_URL = 'https://github.com/idarkdeveloper/fitnesswebsite/releases/latest/download/pulsefit.apk';
const HC_READ = ['steps', 'sleep', 'weight', 'calories', 'workouts'];
const isNativeApp = () => !!(window.androidBridge || (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()));
let hcPlugins = null;          // { Health, App } once the Capacitor core script is loaded
let hcBusy = false;
function hcLoad() {
  if (hcPlugins) return Promise.resolve(hcPlugins);
  return new Promise((resolve, reject) => {
    const done = () => {
      const reg = window.capacitorExports && window.capacitorExports.registerPlugin;
      if (!reg) { reject(new Error('Capacitor not available')); return; }
      hcPlugins = { Health: reg('Health'), App: reg('App'), Widget: reg('PulseFitWidget') };
      resolve(hcPlugins);
    };
    if (window.capacitorExports) { done(); return; }
    const sc = document.createElement('script');
    sc.src = 'vendor/capacitor-8.6.0.js'; sc.onload = done; sc.onerror = () => reject(new Error('Capacitor script'));
    document.head.appendChild(sc);
  });
}
const hcState = () => (state.health = state.health || { enabled: false, last: '', imported: {}, day: {} });
const localKey = (iso) => dayKey(new Date(iso));

/** Set a log value from Health Connect unless you've changed it by hand since the last import. */
function hcPut(day, field, v, imported) {
  const k = hk(day, field), cur = state.hlog[k];
  if (cur != null && imported[k] !== cur) return false;            // typed in by you: keep it
  if (cur === v) { imported[k] = v; return false; }
  state.hlog[k] = v; imported[k] = v;
  return true;
}

/** Pull the last two weeks from Health Connect into the log. Quiet unless `loud`. */
async function hcSync(loud = false) {
  const h = hcState();
  if (!isNativeApp() || !h.enabled || hcBusy) return;
  hcBusy = true;
  try {
    const { Health } = await hcLoad();
    const end = new Date(), start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 13);
    const span = { startDate: start.toISOString(), endDate: end.toISOString() };
    const imported = h.imported;
    let changed = 0;
    const got = await Promise.allSettled([
      Health.queryAggregated({ dataType: 'steps', ...span, bucket: 'day', aggregation: 'sum' }),
      Health.readSamples({ dataType: 'sleep', startDate: new Date(start.getTime() - 864e5).toISOString(), endDate: span.endDate, limit: 500 }),
      Health.readSamples({ dataType: 'weight', ...span, limit: 500 }),
      Health.queryAggregated({ dataType: 'calories', ...span, bucket: 'day', aggregation: 'sum' }),
      Health.queryWorkouts({ ...span, limit: 200 }),
    ]);
    const ok = (i) => (got[i].status === 'fulfilled' ? got[i].value : null);
    for (const b of (ok(0)?.samples || [])) {
      const v = Math.round(b.values?.sum ?? b.value ?? 0);
      if (v > 0 && hcPut(localKey(b.startDate), 'steps', v, imported)) changed++;
    }
    const sleep = {};                                                  // minutes asleep, counted on the day you woke up
    for (const sm of (ok(1)?.samples || [])) {
      // With sleep stages (Samsung Health writes them), count time asleep; otherwise the whole session.
      const staged = (sm.stages || []).filter((st) => !/awake|inbed|out/i.test(st.stage)).reduce((a, st) => a + (st.durationMinutes || 0), 0);
      const mins = staged > 0 ? staged : sm.value > 0 ? sm.value : (Date.parse(sm.endDate) - Date.parse(sm.startDate)) / 60000;
      if (mins > 0 && mins < 24 * 60) { const d = localKey(sm.endDate); sleep[d] = (sleep[d] || 0) + mins; }
    }
    for (const [d, m] of Object.entries(sleep)) if (d >= dayKey(start) && hcPut(d, 'sleep', Math.round(m), imported)) changed++;
    const wt = {};
    for (const sm of (ok(2)?.samples || [])) { const d = localKey(sm.endDate || sm.startDate); if (!wt[d] || sm.endDate > wt[d].at) wt[d] = { v: sm.value, at: sm.endDate }; }
    for (const [d, x] of Object.entries(wt)) if (x.v > 20 && x.v < 400 && hcPut(d, 'weight', Math.round(x.v * 10) / 10, imported)) changed++;
    const day = {};                                                    // watch activity per day (this device only)
    for (const b of (ok(3)?.samples || [])) { const d = localKey(b.startDate); (day[d] = day[d] || {}).kcal = Math.round(b.values?.sum ?? b.value ?? 0); }
    for (const w of (ok(4)?.workouts || [])) {
      const d = localKey(w.startDate), x = (day[d] = day[d] || {});
      x.workouts = (x.workouts || 0) + 1;
      x.min = (x.min || 0) + Math.round((w.duration ?? (Date.parse(w.endDate) - Date.parse(w.startDate)) / 1000) / 60);
    }
    h.day = day;
    for (const k of Object.keys(imported)) if (k.slice(0, 10) < dayKey(start)) delete imported[k];   // forget old bookkeeping
    h.last = new Date().toISOString();
    const failed = got.filter((g) => g.status === 'rejected').length;
    save();
    if (!sheetOpen() && !document.activeElement?.matches('input, textarea')) rerender();
    if (loud) toast(failed === got.length ? 'Could not read Health Connect. Check its permissions.' : changed ? `Updated ${changed} ${changed === 1 ? 'entry' : 'entries'} from Health Connect` : 'Up to date with Health Connect');
  } catch (e) {
    if (loud) toast('Health Connect: ' + (e.message || 'something went wrong'));
  } finally { hcBusy = false; }
}

async function hcConnect() {
  try {
    const { Health } = await hcLoad();
    const av = await Health.isAvailable();
    if (!av.available) { toast(/install|update|not_installed|unavailable/i.test(av.reason || '') ? 'Install or update "Health Connect" from the Play Store first' : `Health Connect isn't available: ${av.reason || 'unknown reason'}`); return; }
    const res = await Health.requestAuthorization({ read: HC_READ });
    if (!res.readAuthorized || !res.readAuthorized.length) { toast('No access given. You can allow it in Health Connect settings.'); return; }
    hcState().enabled = true; save();
    toast(`Connected: ${res.readAuthorized.join(', ')}`);
    await hcSync(true);
    if (sheetOpen()) healthSheet();
  } catch (e) { toast('Health Connect: ' + (e.message || 'something went wrong')); }
}

/** One line on Today with what the watch recorded. */
function watchLine(tk) {
  const h = state.health;
  if (!isNativeApp() || !h || !h.enabled) return '';
  const x = (h.day || {})[tk] || {};
  const bits = [x.workouts ? `${x.workouts} ${x.workouts === 1 ? 'workout' : 'workouts'}, ${x.min} min` : '', x.kcal ? `${nf(x.kcal)} active kcal` : ''].filter(Boolean);
  return `<button class="watch-line mt-3" data-action="health">${icon('activity')}<span class="grow">${bits.length ? `<b>Watch today:</b> ${bits.join(' · ')}` : 'Steps, sleep and weight come from Samsung Health'}<span class="d-block small muted">Health Connect · synced ${esc(ago(h.last))}</span></span>${icon('chevR')}</button>`;
}

function healthSheet() {
  const h = hcState();
  if (!isNativeApp()) {
    openSheet('Galaxy Watch & Samsung Health', `
      <p class="m-0">Your watch syncs to <b>Samsung Health</b>, and Samsung Health shares with <b>Health Connect</b> on your phone. The <b>PulseFit Android app</b> reads Health Connect and fills in your steps, sleep and weight every time you open it, and shows your watch workouts on Today.</p>
      <p class="small muted">A website can't read Health Connect, so this needs the app. It is this same PulseFit, with the same data once you sign in.</p>
      <a class="btn block lg mt-4" href="${APK_URL}">${icon('download')} Download the Android app (APK)</a>
      <ol class="recipe-steps small mt-4">
        <li>Open the downloaded file and allow "Install unknown apps" for your browser when Android asks.</li>
        <li>Open PulseFit, go to Profile → Account and sign in, so your data comes along.</li>
        <li>Profile → Galaxy Watch &amp; Samsung Health → Connect, and allow access.</li>
        <li>In Samsung Health: Settings → Health Connect, and allow Samsung Health to share Steps, Sleep, Weight and Exercise.</li>
      </ol>`);
    return;
  }
  const d = (h.day || {})[todayKey()] || {};
  openSheet('Galaxy Watch & Samsung Health', h.enabled ? `
    <div class="card flat soft row-between"><span><b>Connected</b><span class="d-block small muted">Health Connect · synced ${esc(ago(h.last))}</span></span><span class="pill">${icon('check')} On</span></div>
    <p class="small mt-3 m-0">Steps, sleep and weight for the last 14 days fill in automatically when you open PulseFit. Anything you type in yourself stays as you wrote it.</p>
    ${d.workouts || d.kcal ? `<p class="small m-0 mt-2">Today from your watch: ${[d.workouts ? `${d.workouts} workouts, ${d.min} min` : '', d.kcal ? `${nf(d.kcal)} active kcal` : ''].filter(Boolean).join(' · ')}.</p>` : ''}
    <button class="btn block lg mt-4" data-action="health-sync">${icon('refresh')} Sync now</button>
    <button class="btn ghost block mt-2" data-action="health-settings">Health Connect permissions</button>
    <p class="small muted mt-4 m-0">Missing steps or sleep? In Samsung Health open Settings → Health Connect and allow Samsung Health to share them. Keep the Galaxy Wearable app connected so the watch syncs to your phone.</p>
    <button class="link-btn small danger-text mt-3" data-action="health-off">Stop using Health Connect</button>` : `
    <p class="m-0">Read what Samsung Health and your Galaxy Watch recorded: <b>steps, sleep, weight, workouts and active calories</b>. PulseFit only reads; it never writes to Health Connect.</p>
    <button class="btn block lg mt-4" data-action="health-connect">${icon('activity')} Connect Health Connect</button>
    <ol class="recipe-steps small mt-4">
      <li>Tap Connect and allow the data types in the Health Connect screen.</li>
      <li>In Samsung Health: Settings → Health Connect, and allow Samsung Health to share Steps, Sleep, Weight and Exercise.</li>
      <li>Values you type in yourself are never overwritten.</li>
    </ol>
    <p class="small muted m-0"><a href="privacy.html">How PulseFit uses this data</a></p>`);
}


/* ---------- Home-screen widget (Android app) ---------- */
/** What the widget shows: streak, today's status and a short detail line. */
function widgetData() {
  const tk = todayKey(), d = today();
  const { current } = streakStats();
  const sess = sessionFor(d);
  const status = workoutsOn(tk).length ? 'Done today ✓'
    : sess.length ? `Today: ${sess.map((c) => CAT[c].name).join(' + ')}`
    : current ? 'Rest day · streak safe' : 'Start today 💪';
  const T = targets(tk);
  const eaten = state.meals.filter((m) => m.day === tk).reduce((a, m) => a + m.kcal, 0);
  const steps = hget(tk, 'steps');
  const detail = [T ? `${nf(Math.max(0, T.kcal - eaten))} kcal left` : '', steps != null ? `${nf(steps)} steps` : ''].filter(Boolean).join(' · ');
  return { streak: current, status, detail, asOf: tk };
}
let widgetTimer = null, widgetLast = '';
function widgetPush(now = false) {
  if (!isNativeApp()) return;
  clearTimeout(widgetTimer);
  widgetTimer = setTimeout(async () => {
    const data = widgetData(), key = JSON.stringify(data);
    if (key === widgetLast) return;
    try { await (await hcLoad()).Widget.update(data); widgetLast = key; } catch { /* older app without the widget */ }
  }, now ? 0 : 800);
}
window.PF_widgetPush = () => widgetPush();

async function widgetSheet() {
  let st = null;
  try { st = await (await hcLoad()).Widget.status(); } catch { /* the installed app is older than the widget */ }
  const w = widgetData();
  const card = `<div class="widget-preview" aria-hidden="true"><div class="wp-k">🔥 Day Streak</div><div class="wp-n">${w.streak}</div><div class="wp-s">${esc(w.status)}</div>${w.detail ? `<div class="wp-d">${esc(w.detail)}</div>` : ''}</div>`;
  openSheet('Home screen widget', `
    <p class="m-0">Your streak and today's session on your home screen, so you never miss a day. Tap it to open PulseFit.</p>
    ${card}
    ${!st ? `<p class="small m-0">This needs the latest PulseFit app. Download it, uninstall the old app, install the new one and sign in again; your synced data comes back.</p>
      <a class="btn block lg mt-4" href="${APK_URL}">${icon('download')} Download the latest app</a>`
    : st.canPin ? `<button class="btn block lg mt-2" data-action="widget-pin">${icon('plus')} Add widget</button>
      ${st.count ? `<p class="small muted mt-3 m-0">${st.count === 1 ? 'One PulseFit widget is' : `${st.count} PulseFit widgets are`} on your home screen.</p>` : ''}`
    : ''}
    ${st ? `<p class="small muted mt-3 m-0">Or: touch and hold an empty spot on your home screen → Widgets → PulseFit.</p>` : ''}`);
}

const HEALTH_ACTIONS = {
  'widget': widgetSheet,
  'widget-pin': async () => {
    try {
      const r = await (await hcLoad()).Widget.pin();
      widgetPush(true);
      toast(r.requested ? 'Confirm on the next screen to place the widget' : 'Touch and hold your home screen → Widgets → PulseFit');
    } catch { toast('Touch and hold your home screen → Widgets → PulseFit'); }
  },
  'health': healthSheet,
  'health-connect': hcConnect,
  'health-sync': () => hcSync(true),
  'health-settings': async () => { try { (await hcLoad()).Health.openHealthConnectSettings(); } catch { toast('Open Health Connect from your phone settings'); } },
  'health-off': () => { const h = hcState(); h.enabled = false; h.day = {}; save(); closeSheet(); rerender(); toast('Stopped. To remove access fully, open Health Connect permissions.'); },
};

/** Native app: sync on start and whenever the app comes back to the front; handle the email sign-in link. */
async function hcBoot() {
  if (!isNativeApp()) return;
  try {
    const { App } = await hcLoad();
    App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) return;
      widgetPush(true);
      if (Date.now() - Date.parse(state.health?.last || 0) > 5 * 60e3) hcSync();
    });
    const onUrl = (url) => { if (url && url.startsWith('pulsefit://login') && window.PFSync && window.PFSync.handleAuthLink) window.PFSync.handleAuthLink(url); };
    App.addListener('appUrlOpen', ({ url }) => onUrl(url));
    const launch = await App.getLaunchUrl();
    if (launch && launch.url) setTimeout(() => onUrl(launch.url), 1500);   // let sync.js load first
  } catch { /* plugins missing: an old app version */ }
  widgetPush(true);
  hcSync();
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
    draft = { mode: 'session', date: selectedDay, started: Date.now(), entries: cats.map((c) => newEntry(currentProg(c).id)) };
    saveDraft();
    go('#/workout');
  },
  'cancel-workout': () => {
    const any = draft && draft.entries.some((e) => e.done.some(Boolean));
    if (any && !confirm('Discard this workout? Sets you marked will not be saved.')) return;
    draft = null; saveDraft(); stopRest(); go('#/today');
  },
  'finish-workout': () => {
    stopRest();
    const s = commitWorkout(draft.date, draft.entries, routine().name);
    draft = null; saveDraft();
    pendingSummary = s;
    go('#/today');
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
  'skip-rest': () => { stopRest(); if (parseRoute().name === 'workout') rerender(); },
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
  'plan-reminder': planReminderSheet,
  'toggle-plan-reminder': async () => {
    state.planReminder.enabled = !state.planReminder.enabled;
    if (state.planReminder.enabled && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }
    save(); if (sheetOpen()) planReminderSheet(); rerender();
  },
  'plan-ics': () => { planReminderIcs(); toast('Calendar file downloaded. Open it to add the reminder'); },
  'open-groceries': (el) => { planTab = 'groceries'; planWeek = Number(el.dataset.w); planSel = null; location.hash = '#/plan'; },
  'toggle-reminder': async () => {
    state.reminder.enabled = !state.reminder.enabled;
    if (state.reminder.enabled && 'Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch { /* ignore */ }
    }
    save(); if (sheetOpen()) remindersSheet(); rerender();
  },
  'export': () => downloadJson(state, 'pulsefit-backup'),
  'import': () => $('#importFile').click(),
  'reset': () => {
    if (!confirm('Reset all progress, workouts, health logs and settings? This cannot be undone.')) return;
    const theme = state.profile.theme;
    state = defaultState(); state.profile.theme = theme; state.hmigrated = true;
    seedQuickFoods();
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

Object.assign(ACTIONS, TRACK_ACTIONS, PLAN_ACTIONS, WORKOUT_ACTIONS, PROFILE_ACTIONS, HEALTH_ACTIONS, {
  'mov-filter': (el) => { movFilter = el.dataset.f; rerender(); },
  'prog-tab': (el) => { progTab = el.dataset.tab; rerender(); if (el.closest('.card, .stat3')) window.scrollTo(0, 0); },
  'plan-sel': (el) => { planSel = Number(el.dataset.i); rerender(); },
});

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  if (el.dataset.today) trackDay = null;
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
  if (t.id === 'foodSearch') { filterFoodSheet(t.value); return; }
  if (t.matches('[data-set]') && draft) {
    draft.entries[t.dataset.e].values[t.dataset.s] = clamp(Number(t.value) || 0, 0, 999);
    saveDraft();
  } else if (t.dataset.bind === 'name' || t.dataset.bind === 'email') {
    state.profile[t.dataset.bind] = t.value;
    save();
  } else if (t.id === 'gbCustName' && groEdit) {
    const box = $('#gbCustPrev');
    if (box) box.innerHTML = otherPreview(groEdit.k.split('|')[0], groEdit.ing, t.value);
  } else if (t.dataset.bind === 'reminderTime') {
    state.reminder.time = t.value || '18:00';
    save();
  } else if (t.dataset.bind === 'planRemTime') {
    state.planReminder.time = t.value || '10:00';
    state.planReminder.lastNotified = '';
    save(); rerender();
  } else if (t.dataset.bind === 'planRemDay') {
    state.planReminder.day = Number(t.value);
    state.planReminder.lastNotified = '';
    save(); rerender();
  }
});

document.addEventListener('change', async (ev) => {
  if (ev.target.dataset && ev.target.dataset.grocery) {
    const k = ev.target.dataset.grocery;
    pruneGrocery();                                                 // past weeks only; this and next week stay
    if (ev.target.checked) state.grocery[k] = 1; else delete state.grocery[k];
    save(); rerender();
    return;
  }
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
    state = { ...d, ...data, profile: { ...d.profile, ...(data.profile || {}) }, reminder: { ...d.reminder, ...(data.reminder || {}) }, planReminder: { ...d.planReminder, ...(data.planReminder || {}) } };
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

function checkPlanReminder() {
  const pr = state.planReminder;
  if (!planReminderDue() || !('Notification' in window) || Notification.permission !== 'granted') return;
  const k = dayKey(today());
  if (pr.lastNotified === k) return;
  const next = planReminderWeek() === 1, wd = new Date().getDay();
  try { new Notification('PulseFit', { body: `${next ? "Next week's" : "This week's"} meal plan is ready.${wd === 6 ? ' Shops are closed tomorrow, so get the groceries today.' : wd === 5 ? ' Check the grocery list and shop tomorrow.' : ' Time to get the groceries.'}` }); } catch { /* ignore */ }
  pr.lastNotified = k;
  save();
}

function checkReminder() {
  checkPlanReminder();
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
importOldTracker();
seedQuickFoods();
applyTheme();
if (!location.hash || location.hash === '#/home') history.replaceState(null, '', '#/today');
render();
checkReminder();
hcBoot();
setInterval(checkReminder, 60000);
