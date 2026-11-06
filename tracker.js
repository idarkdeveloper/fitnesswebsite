/* =============================================================
   PulseFit – client-side application logic
   -------------------------------------------------------------
   Concerns handled here:
     • Dark-mode toggle & mobile menu
     • User profile persistence (localStorage)
     • BMI, ideal weight, BMR (Mifflin-St Jeor), TDEE, macros
     • Dashboard metrics (steps, calories burned/intake, sleep)
     • AI-style meal photo scanner (heuristic on image data)
     • Portfolio grid rendering & filtering
   All state lives in localStorage under the `pf_*` prefix so
   nothing is lost between sessions.
   ============================================================= */

'use strict';

/* ---------- tiny helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  del(key) { try { localStorage.removeItem(key); } catch {} },
};

function toast(msg, ms = 2200) {
  const box = $('#toast');
  box.firstElementChild.textContent = msg;
  box.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => box.classList.add('hidden'), ms);
}

const todayKey = () => 'pf_day_' + new Date().toISOString().slice(0, 10);

/* =============================================================
   1. Theme toggle
   ============================================================= */
(function initTheme() {
  const btn = $('#themeToggle');
  btn.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('pf_theme', dark ? 'dark' : 'light');
  });
})();

/* =============================================================
   2. Mobile menu + smooth-scroll close
   ============================================================= */
(function initMobileMenu() {
  const btn  = $('#menuBtn');
  const menu = $('#mobileMenu');
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  $$('.mobile-link').forEach(a =>
    a.addEventListener('click', () => menu.classList.add('hidden'))
  );
})();

/* =============================================================
   3. Profile + BMI + Calorie requirement
   ============================================================= */
const ProfileStore = {
  KEY: 'pf_profile',
  defaults: {
    name: '', age: 28, sex: 'male',
    weight: 70, height: 175,
    activity: 1.55, goal: 'maintain',
    chest: '', waist: '', hips: '', biceps: '', thigh: '', neck: '',
  },
  load() { return { ...this.defaults, ...(store.get(this.KEY) || {}) }; },
  save(p) { store.set(this.KEY, p); },
};

function computeBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}
function bmiCategory(bmi) {
  if (bmi == null) return { label: '—', color: 'text-slate-500' };
  if (bmi < 18.5)  return { label: 'Underweight', color: 'text-sun-500' };
  if (bmi < 25)    return { label: 'Healthy',     color: 'text-brand-500' };
  if (bmi < 30)    return { label: 'Overweight',  color: 'text-sun-500' };
  return             { label: 'Obese',            color: 'text-accent-500' };
}
// Robinson formula for ideal body weight range (BMI 18.5–24.9)
function idealWeightRange(heightCm) {
  if (!heightCm) return null;
  const m = heightCm / 100;
  const low  = 18.5 * m * m;
  const high = 24.9 * m * m;
  return [low, high];
}
// Mifflin-St Jeor BMR
function computeBMR({ sex, weight, height, age }) {
  if (!weight || !height || !age) return null;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'female' ? base - 161 : base + 5;
}
function computeMacros(kcal, goal) {
  // Reasonable defaults; adjusted slightly by goal
  const proteinPerKg = goal === 'gain' ? 2.0 : goal === 'lose' ? 1.8 : 1.6;
  const p = ProfileStore.load();
  const proteinG = Math.round(proteinPerKg * (p.weight || 70));
  const fatKcal  = kcal * 0.25;
  const fatG     = Math.round(fatKcal / 9);
  const remaining = Math.max(0, kcal - proteinG * 4 - fatKcal);
  const carbG    = Math.round(remaining / 4);
  return { proteinG, carbG, fatG };
}
function targetKcalForGoal(tdee, goal) {
  if (!tdee) return null;
  if (goal === 'lose') return Math.max(1200, Math.round(tdee - 500));
  if (goal === 'gain') return Math.round(tdee + 300);
  return Math.round(tdee);
}

function renderProfileMetrics(p) {
  const bmi = computeBMI(+p.weight, +p.height);
  const cat = bmiCategory(bmi);
  $('#bmiVal').textContent = bmi ? bmi.toFixed(1) : '—';
  const catEl = $('#bmiCat');
  catEl.textContent = cat.label;
  catEl.className = 'stat-num text-sm sm:text-base ' + cat.color;

  const iw = idealWeightRange(+p.height);
  $('#idealWeight').textContent = iw ? `${iw[0].toFixed(0)}–${iw[1].toFixed(0)} kg` : '—';

  const bmr  = computeBMR({ sex: p.sex, weight: +p.weight, height: +p.height, age: +p.age });
  const tdee = bmr ? bmr * +p.activity : null;
  const target = targetKcalForGoal(tdee, p.goal);

  $('#bmrVal').innerHTML  = bmr  ? `${Math.round(bmr)} <span class="text-xs font-medium text-slate-500">kcal</span>`  : '— <span class="text-xs font-medium text-slate-500">kcal</span>';
  $('#tdeeVal').innerHTML = tdee ? `${Math.round(tdee)} <span class="text-xs font-medium text-slate-500">kcal</span>` : '— <span class="text-xs font-medium text-slate-500">kcal</span>';
  $('#targetKcal').innerHTML = target ? `${target} <span class="text-sm font-medium text-slate-500">kcal / day</span>` : '— <span class="text-sm font-medium text-slate-500">kcal / day</span>';

  if (target) {
    const macros = computeMacros(target, p.goal);
    $('#macroP').textContent = `${macros.proteinG} g`;
    $('#macroC').textContent = `${macros.carbG} g`;
    $('#macroF').textContent = `${macros.fatG} g`;
  } else {
    $('#macroP').textContent = '— g';
    $('#macroC').textContent = '— g';
    $('#macroF').textContent = '— g';
  }
}

(function initProfileForm() {
  const form = $('#profileForm');
  const p = ProfileStore.load();
  // Populate form from saved profile
  Object.entries(p).forEach(([k, v]) => {
    if (form.elements[k] != null) form.elements[k].value = v ?? '';
  });
  renderProfileMetrics(p);
  refreshDashboard();

  // Save
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    ProfileStore.save(data);
    renderProfileMetrics(data);
    refreshDashboard();
    const badge = $('#profileSaved');
    badge.classList.remove('hidden');
    setTimeout(() => badge.classList.add('hidden'), 1800);
    toast(`Saved profile${data.name ? ' for ' + data.name : ''}`);
  });

  // Live update BMI/TDEE as user types
  form.addEventListener('input', () => {
    const data = Object.fromEntries(new FormData(form).entries());
    renderProfileMetrics(data);
  });
})();

/* =============================================================
   4. Dashboard: steps, burned, sleep, intake
   ============================================================= */
function loadDay() {
  return store.get(todayKey(), { steps: 0, sleepMinutes: 0, meals: [] });
}
function saveDay(d) { store.set(todayKey(), d); }

function refreshDashboard() {
  const day = loadDay();
  const p   = ProfileStore.load();

  // Steps
  $('#metricSteps').textContent = day.steps.toLocaleString();
  const pct = Math.min(100, (day.steps / 10000) * 100);
  $('#stepsBar').style.width = pct + '%';

  // Calories burned: rough estimate — 0.04 kcal per step per kg body weight / 70
  const kgFactor = (+p.weight || 70) / 70;
  const burned = Math.round(day.steps * 0.04 * kgFactor);
  $('#metricBurned').innerHTML = `${burned} <span class="text-base font-medium text-slate-500">kcal</span>`;

  // Intake from meal log
  const intake = day.meals.reduce((s, m) => s + m.kcal, 0);
  $('#metricIntake').innerHTML = `${intake} <span class="text-base font-medium text-slate-500">kcal</span>`;
  $('#intakeSummary').textContent = day.meals.length
    ? `${day.meals.length} meal${day.meals.length > 1 ? 's' : ''} logged today.`
    : 'No meals logged yet.';

  // Sleep
  const h = Math.floor(day.sleepMinutes / 60);
  const m = day.sleepMinutes % 60;
  $('#metricSleep').textContent = `${h}h ${m}m`;
  $('#sleepScore').textContent  = day.sleepMinutes ? `Score: ${sleepScore(day.sleepMinutes)}/100` : 'Score: —';

  // Meal list
  const list = $('#mealList');
  if (!day.meals.length) {
    list.innerHTML = '<li class="py-4 text-slate-500">Nothing logged yet — try the AI Snap Scanner below.</li>';
  } else {
    list.innerHTML = day.meals.map((meal, i) => `
      <li class="py-3 flex items-center justify-between">
        <div>
          <p class="font-semibold">${escapeHtml(meal.name)}</p>
          <p class="text-xs text-slate-500">${new Date(meal.at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} · ${meal.confidence}% confidence</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold text-accent-500">${meal.kcal} kcal</span>
          <button data-i="${i}" class="removeMeal text-slate-400 hover:text-accent-500" aria-label="Remove">✕</button>
        </div>
      </li>`).join('');
    $$('.removeMeal', list).forEach(btn => btn.addEventListener('click', () => {
      const d = loadDay();
      d.meals.splice(+btn.dataset.i, 1);
      saveDay(d);
      refreshDashboard();
    }));
  }
}
function sleepScore(minutes) {
  // Simple bell-curve-ish score peaking at 8h
  const hours = minutes / 60;
  const score = 100 - Math.min(100, Math.abs(hours - 8) * 12);
  return Math.max(0, Math.round(score));
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
}

(function initDashboardControls() {
  $('#logStepsBtn').addEventListener('click', () => {
    const v = prompt('Steps to add:', '1500');
    const n = Math.max(0, parseInt(v, 10));
    if (!n) return;
    const d = loadDay(); d.steps += n; saveDay(d);
    refreshDashboard();
    toast(`+${n.toLocaleString()} steps`);
  });

  $('#logSleepBtn').addEventListener('click', () => {
    const v = prompt('Hours slept (e.g. 7.5):', '7.5');
    const h = parseFloat(v);
    if (isNaN(h) || h < 0 || h > 24) return;
    const d = loadDay(); d.sleepMinutes = Math.round(h * 60); saveDay(d);
    refreshDashboard();
    toast(`Sleep logged: ${h}h`);
  });

  $('#resetDayBtn').addEventListener('click', () => {
    if (!confirm('Reset today\'s tracker?')) return;
    store.del(todayKey());
    refreshDashboard();
    toast('Day reset.');
  });
})();

/* =============================================================
   5. AI Snap Calorie Counter
   -------------------------------------------------------------
   True on-device food recognition would require a heavy ML
   model. Instead we implement a lightweight, deterministic
   "AI" that reads dominant colours from the uploaded image and
   maps them onto a small food database. This gives realistic-
   looking, repeatable results without any network call.
   ============================================================= */

const FOOD_DB = [
  { name: 'Green Salad',      kcal: 180,  color: [ 90, 160,  80], macros: {p: 5,  c: 15, f: 10} },
  { name: 'Grilled Chicken',  kcal: 420,  color: [200, 150,  90], macros: {p:45,  c:  5, f: 20} },
  { name: 'Cheeseburger',     kcal: 620,  color: [170, 100,  60], macros: {p:30,  c: 45, f: 35} },
  { name: 'Pasta Bolognese',  kcal: 550,  color: [200, 120,  70], macros: {p:22,  c: 65, f: 20} },
  { name: 'Sushi Platter',    kcal: 380,  color: [230, 210, 180], macros: {p:20,  c: 55, f:  8} },
  { name: 'Fresh Fruit Bowl', kcal: 210,  color: [230, 120, 120], macros: {p: 3,  c: 50, f:  1} },
  { name: 'Oatmeal & Berries',kcal: 320,  color: [200, 180, 150], macros: {p: 9,  c: 55, f:  6} },
  { name: 'Pizza Slice',      kcal: 285,  color: [220, 150,  90], macros: {p:12,  c: 36, f: 10} },
  { name: 'Chocolate Cake',   kcal: 450,  color: [ 80,  50,  40], macros: {p: 5,  c: 60, f: 22} },
  { name: 'Smoothie',         kcal: 260,  color: [220, 170, 200], macros: {p: 6,  c: 45, f:  4} },
];

let lastScan = null; // holds detection result awaiting log

async function extractDominantColor(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const size = 32; // small for speed
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < data.length; i += 4) {
        // Skip near-white/black which are usually background
        const R = data[i], G = data[i+1], B = data[i+2];
        const bright = (R + G + B) / 3;
        if (bright < 25 || bright > 240) continue;
        r += R; g += G; b += B; n++;
      }
      if (n === 0) { resolve([128,128,128]); return; }
      resolve([r/n, g/n, b/n]);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
function colorDistance(a, b) {
  const dr = a[0]-b[0], dg = a[1]-b[1], db = a[2]-b[2];
  return Math.sqrt(dr*dr + dg*dg + db*db);
}
function matchFood(color) {
  let best = FOOD_DB[0], bestD = Infinity;
  FOOD_DB.forEach(f => {
    const d = colorDistance(color, f.color);
    if (d < bestD) { bestD = d; best = f; }
  });
  // Convert distance (0–441) into a 55–98% confidence score
  const conf = Math.max(55, Math.min(98, 100 - Math.round(bestD / 5)));
  return { ...best, confidence: conf };
}

(function initSnapScanner() {
  const zone     = $('#dropZone');
  const input    = $('#mealPhoto');
  const preview  = $('#previewImg');
  const hint     = $('#dropHint');
  const scanBtn  = $('#scanBtn');
  const logBtn   = $('#logMealBtn');
  const clearBtn = $('#clearScanBtn');
  const status   = $('#aiStatus');
  const result   = $('#aiResult');

  let currentFile = null;

  function acceptFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      toast('Please choose an image file.');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast('Image is over 6 MB.');
      return;
    }
    currentFile = file;
    preview.src = URL.createObjectURL(file);
    preview.classList.remove('hidden');
    hint.classList.add('hidden');
    scanBtn.disabled = false;
    logBtn.disabled  = true;
    lastScan = null;
    status.textContent = 'Ready to scan';
    result.innerHTML = '<p class="text-slate-500">Click <b>Analyze</b> to estimate calories.</p>';
  }

  input.addEventListener('change', (e) => acceptFile(e.target.files[0]));

  // Drag & drop
  ['dragenter', 'dragover'].forEach(ev =>
    zone.addEventListener(ev, e => {
      e.preventDefault();
      zone.classList.add('border-brand-500');
    })
  );
  ['dragleave', 'drop'].forEach(ev =>
    zone.addEventListener(ev, e => {
      e.preventDefault();
      zone.classList.remove('border-brand-500');
    })
  );
  zone.addEventListener('drop', e => {
    const file = e.dataTransfer.files[0];
    acceptFile(file);
  });

  scanBtn.addEventListener('click', async () => {
    if (!currentFile) return;
    status.textContent = 'Analyzing…';
    scanBtn.disabled = true;
    result.innerHTML = `
      <div class="flex items-center gap-3 text-slate-500">
        <span class="inline-block h-3 w-3 rounded-full bg-brand-500 animate-pulse"></span>
        Reading pixels & matching against food database…
      </div>`;
    try {
      // Fake a tiny delay so the UI shows the working state
      await new Promise(r => setTimeout(r, 700));
      const color = await extractDominantColor(currentFile);
      const match = matchFood(color);
      lastScan = match;

      result.innerHTML = `
        <div class="flex items-center justify-between">
          <p class="font-bold text-lg">${escapeHtml(match.name)}</p>
          <span class="chip bg-brand-100 text-brand-700 dark:bg-brand-700/20 dark:text-brand-300">${match.confidence}% match</span>
        </div>
        <p class="text-2xl font-extrabold text-accent-500 mt-2">${match.kcal} kcal</p>
        <div class="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div class="rounded-lg bg-brand-500/10 p-2 text-center">
            <p class="text-slate-500">Protein</p><p class="font-bold text-brand-500">${match.macros.p}g</p>
          </div>
          <div class="rounded-lg bg-sun-500/10 p-2 text-center">
            <p class="text-slate-500">Carbs</p><p class="font-bold text-sun-500">${match.macros.c}g</p>
          </div>
          <div class="rounded-lg bg-accent-500/10 p-2 text-center">
            <p class="text-slate-500">Fat</p><p class="font-bold text-accent-500">${match.macros.f}g</p>
          </div>
        </div>
        <p class="mt-3 text-xs text-slate-500">Estimate based on dominant color analysis. You can adjust when logging.</p>`;
      status.textContent = 'Done';
      scanBtn.disabled = false;
      logBtn.disabled  = false;
    } catch (err) {
      console.error(err);
      status.textContent = 'Error';
      result.innerHTML = '<p class="text-accent-500">Couldn\'t read that image — try another.</p>';
      scanBtn.disabled = false;
    }
  });

  logBtn.addEventListener('click', () => {
    if (!lastScan) return;
    const kcalAdj = parseInt(prompt('Confirm calories to log:', lastScan.kcal), 10);
    if (isNaN(kcalAdj)) return;
    const d = loadDay();
    d.meals.push({
      name: lastScan.name,
      kcal: kcalAdj,
      confidence: lastScan.confidence,
      at: Date.now(),
    });
    saveDay(d);
    refreshDashboard();
    toast(`Logged ${lastScan.name} · ${kcalAdj} kcal`);
    clearScan();
  });

  clearBtn.addEventListener('click', clearScan);

  function clearScan() {
    currentFile = null;
    lastScan = null;
    input.value = '';
    preview.src = '';
    preview.classList.add('hidden');
    hint.classList.remove('hidden');
    scanBtn.disabled = true;
    logBtn.disabled  = true;
    status.textContent = 'Idle';
    result.innerHTML = '<p class="text-slate-500">Snap a meal to see estimated calories and macros here.</p>';
  }
})();

/* =============================================================
   6. Portfolio grid: static stories with filters
   ============================================================= */
const STORIES = [
  { name: 'Alex R.',   tag: 'weight', result: 'Lost 12 kg in 6 months',   quote: 'Snapping meals killed my mindless snacking.',                  hue: 'from-brand-500 to-iris-500' },
  { name: 'Priya S.',  tag: 'sleep',  result: 'Sleep score 62 → 91',      quote: 'Bedtime nudges finally made routine stick.',                    hue: 'from-iris-500 to-accent-500' },
  { name: 'Marcus T.', tag: 'muscle', result: 'Gained 4 kg lean mass',    quote: 'Macros hit the mark every day thanks to PulseFit.',            hue: 'from-sun-500 to-accent-500' },
  { name: 'Emiko K.',  tag: 'weight', result: 'Dropped 2 dress sizes',    quote: 'The photo scanner takes the guesswork out of eating out.',     hue: 'from-brand-500 to-sun-500' },
  { name: 'Jordan L.', tag: 'muscle', result: '+18% bench press',         quote: 'Body measurements make progress visible even on stale scale days.', hue: 'from-iris-500 to-brand-500' },
  { name: 'Fatima H.', tag: 'sleep',  result: '2h more deep sleep / wk',  quote: 'Weekly trend reports helped me spot caffeine issues.',         hue: 'from-accent-500 to-iris-500' },
];

(function initPortfolio() {
  const grid = $('#portfolioGrid');
  grid.innerHTML = STORIES.map(s => `
    <article class="story-card" data-tag="${s.tag}">
      <div class="story-media bg-gradient-to-br ${s.hue} relative">
        <div class="absolute inset-0 bg-black/10"></div>
        <div class="absolute bottom-3 left-3 right-3 text-white">
          <p class="text-xs uppercase tracking-widest opacity-90">${s.tag}</p>
          <p class="text-lg font-extrabold">${s.result}</p>
        </div>
      </div>
      <div class="p-5">
        <p class="text-sm text-slate-600 dark:text-slate-300">"${s.quote}"</p>
        <p class="mt-3 text-xs font-semibold text-slate-500">— ${s.name}</p>
      </div>
    </article>`).join('');

  // Filter behaviour
  $$('.chip-filter').forEach(btn => btn.addEventListener('click', () => {
    $$('.chip-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.story-card', grid).forEach(card => {
      card.classList.toggle('hide', !(f === 'all' || card.dataset.tag === f));
    });
  }));
})();

/* =============================================================
   7. Misc: current year in footer
   ============================================================= */
$('#year').textContent = new Date().getFullYear();
