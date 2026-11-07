#!/usr/bin/env node
/* =============================================================
   PulseFit image tooling (no dependencies)

   node tools/image-prompts.js            -> writes docs/IMAGE_PROMPTS.md, docs/image-prompts.html, img/prompts.json
   node tools/image-prompts.js manifest   -> scans img/ for <id>.webp|png|jpg, rewrites img/manifest.js
                                             and refreshes the statuses in docs/image-prompts.html

   Prompts are built from data.js so they stay in sync with the exercise content.
   Brief format follows DESIGN.md §8: the promptable core (subject → colour/mood)
   is capped at 60 words.
   ============================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'data.js'));
const CATS = window.PF_DATA.categories;

/* ---------- shared style block (identical in every prompt for a consistent set) ---------- */
const STYLE = 'Realistic documentary fitness photography, crisp detail.';
const COMPOSITION = '35mm eye-level side view, whole body in frame, centred with generous margin.';
const LIGHTING = 'Soft golden-hour side light.';
const COLOR = 'Cool blue-teal grade, calm and focused.';
const NEGATIVE = 'No text, logos, watermarks or brand marks; plain unbranded sportswear; anatomically correct hands and joints.';
/* Same person in every image. API models don't remember earlier images (unlike one long Gemini chat),
   so the description has to travel with each prompt. Matches the approved Gemini set. */
const ATHLETE = 'Same athlete in every image: a fit man in his late twenties with short dark hair and light stubble, plain light-beige t-shirt, grey shorts, barefoot.';
/* Family-wide form rules, added outside the 60-word core because they fix recurring generation faults. */
const FORM_NOTE = {
  pushups: 'Form: hips level, body in one straight line from head to heels (or knees for kneeling pushups); no sagging or piking.',
  pullups: 'Form: when hanging, feet are clearly off the ground.',
  grip: 'Form: when hanging, feet are clearly off the ground.',
};
/* Per-exercise corrections for faults seen in generated images (outside the 60-word core). */
const ID_NOTE = {
  'close-pushups': 'Arms fully straight with shoulders directly above the hands; chest and forearms are well off the ground (this is not a plank). Hands lie flat on the ground, not clasped.',
  'angled-bridges': 'The hands are on top of the bench seat and carry weight; the head and back touch nothing; the body forms an upside-down U.',
  'one-arm-hangs': 'The bar is above head height and one hand is the only support; both feet hang at least 30 cm above the ground.',
  'negative-dips': 'Two parallel bars about hip height, side by side, one in each hand; the feet do not touch the ground.',
  'close-pullups': 'Both hands wrap over the bar side by side, palms facing away; the hands are not clasped together.',
  'uneven-pullups': 'The towel hangs from the same high bar about 30 cm below it, gripped firmly; both arms pull.',
};

/* Where each movement family is performed (keeps equipment consistent). */
const SETTING = {
  pushups: 'in an outdoor calisthenics park',
  pullups: 'on a steel pull-up bar in an outdoor calisthenics park',
  squats: 'on a paved path in an outdoor calisthenics park',
  'leg-raises': 'in an outdoor calisthenics park',
  bridges: 'on a mat on grass in a park',
  twists: 'on a mat on grass in a park',
  grip: 'on a steel bar in an outdoor calisthenics park',
  lunges: 'on a paved path in an outdoor calisthenics park',
  dips: 'on parallel bars in an outdoor calisthenics park',
  'elbow-levers': 'on a rubber floor in an outdoor calisthenics park',
  'clutch-flag': 'on a vertical steel pole in an outdoor calisthenics park',
};

/* Hand-written peak positions (what the camera sees). Ids missing here fall back to the tutorial steps. */
const POSE_OVERRIDE = {
  "wall-pushups": "standing leaning into a wall, palms at shoulder height, elbows bent, chest close to the wall, body straight",
  "incline-pushups": "hands on a waist-high bench, body straight and angled, chest lowered to the bench edge",
  "knee-pushups": "knees on a mat, hands on the floor, body straight from knees to head, chest lowered near the floor",
  "full-pushups": "in a straight-body pushup on the toes, knees off the ground, chest just above the floor",
  "close-pushups": "at the top of a pushup on the toes, arms straight and vertical, palms flat on the ground touching under the chest",
  "uneven-pushups": "in a full plank pushup on the toes, knees off the ground, one hand on a basketball",
  "half-one-arm-pushups": "in a wide-stance one-arm pushup, other hand behind the back, elbow bent to 90 degrees",
  "lever-pushups": "in a pushup, one hand under the chest, the other arm straight out to the side on a ball",
  "assisted-one-arm-pushups": "doing a one-arm pushup on a waist-high bench, feet wide, other hand behind the back",
  "one-arm-pushups": "in a one-arm pushup, feet wide, free hand behind the back, chest just above the floor",
  "vertical-pulls": "gripping a vertical pole at chest height, leaning back with straight arms, feet near its base",
  "horizontal-rows": "under a waist-high bar, body nearly horizontal and straight, heels down, chest pulled to the bar",
  "jackknife-pullups": "pulling up on a bar with legs straight forward, heels resting on a bench, chin over the bar",
  "half-pullups": "hanging from a bar, overhand grip, pulled halfway with elbows bent at 90 degrees",
  "full-pullups": "hanging from a high bar, feet well off the ground, chin clearly above the bar, legs straight together",
  "close-pullups": "hanging from a high bar, hands side by side and touching, chin above the bar",
  "uneven-pullups": "hanging from a high bar, one hand on the bar, other on a towel looped over it",
  "half-one-arm-pullups": "hanging by one hand from a high bar, feet well off the ground, elbow bent 90 degrees",
  "one-arm-pullups": "hanging by one hand from a high bar, feet well off the ground, chin above the bar",
  "jackknife-squats": "bent forward with hands on a knee-high bench, squatting deep, thighs below parallel",
  "supported-squats": "holding a pole at waist height for support, squatting deep, heels down",
  "half-squats": "in a half squat, thighs halfway to parallel, arms forward, back straight",
  "full-squats": "at the bottom of a deep bodyweight squat, heels down, arms forward, chest up",
  "close-squats": "in a deep squat with feet together, arms reaching forward for balance",
  "uneven-squats": "squatting with one foot raised on a basketball, most weight on the floor leg",
  "half-one-leg-squats": "standing on one leg, bent to a half squat, free leg straight forward, arms forward",
  "assisted-one-leg-squats": "in a deep one-leg squat holding a pole with one hand, free leg straight forward",
  "pistol-squats": "at the bottom of a pistol squat on one leg, free leg straight forward, arms forward",
  "knee-tucks": "seated on a mat, leaning back on the hands, knees tucked toward the chest, feet lifted",
  "flat-knee-raises": "lying flat on a mat, knees bent and lifted toward the chest, hands by the hips",
  "bent-leg-raises": "lying on a mat, legs bent 45 degrees and raised high, lower back flat",
  "frog-raises": "lying on a mat, knees tucked toward the chest, lower back pressed down",
  "straight-flat-leg-raises": "lying flat on a mat, straight legs raised to point at the sky",
  "hanging-knee-raises": "hanging from a bar with straight arms, knees raised to hip height",
  "hanging-bent-leg-raises": "hanging from a bar with straight arms, bent legs raised to hip height",
  "hanging-straight-leg-raises": "hanging from a bar with straight arms, straight legs raised parallel to the ground",
  "glute-bridges": "lying on the back, knees bent, hips lifted high in a straight line from knees to shoulders",
  "straight-bridges": "reverse tabletop, hands behind the hips, legs straight, body lifted in one straight line",
  "angled-bridges": "arched backbend, straight arms pressing on a park bench seat behind the head, feet flat on the ground, hips high",
  "head-bridges": "arched backbend with the top of the head and hands on a mat, hips pushed high",
  "half-bridges": "arched backbend over a padded box, hands and feet pressing, hips high",
  "full-bridges": "in a full wheel backbend on a mat, arms and legs straight, hips high",
  "wall-walking-bridges": "standing with back to a wall, arching backward, hands walking down the wall",
  "straight-leg-twists": "seated with legs straight, torso twisted, one hand behind the hips, other arm across the knee",
  "bent-leg-twists": "seated twist with one leg bent across the other, torso rotated, elbow hooked on the knee",
  "full-twists": "in a deep twisting bridge: hand and feet on the mat, hips lifted, chest rotated toward the sky",
  "lean-hangs": "gripping a waist-high bar, leaning back with straight arms and straight body, heels on the ground",
  "assisted-bar-hangs": "hanging from a head-height bar with knees bent, feet on the ground, arms straight",
  "bar-hangs": "dead hang from a high bar, overhand grip, arms straight, feet off the ground",
  "towel-hangs": "hanging from two towels looped over a high bar, arms straight, feet off the ground",
  "assisted-one-arm-hangs": "hanging from one hand, two fingers of the other hand lightly on the bar for balance",
  "one-arm-hangs": "hanging from one hand on a high bar, body fully suspended, feet off the ground",
  "split-squats": "in a split stance, back knee just above the ground, torso upright",
  "reverse-lunges": "stepping back into a lunge, both knees bent 90 degrees, torso upright",
  "walking-lunges": "mid walking lunge, front knee over the ankle, back knee near the ground",
  "bulgarian-split-squats": "rear foot on a bench behind, front leg bent deep, back knee near the ground",
  "jumping-lunges": "in mid-air switching legs during a jumping lunge, arms driving",
  "shrimp-squats": "on one leg, holding the other foot behind, rear knee lowering toward the ground",
  "bench-dips": "hands on a bench behind the hips, legs forward, elbows bent 90 degrees",
  "support-holds": "holding the top of parallel bars with straight locked arms, feet off the ground",
  "negative-dips": "suspended between two parallel dip bars, one hand on each, knees bent, feet off the ground, elbows half bent",
  "parallel-bar-dips": "at the bottom of a dip on parallel bars, elbows at 90 degrees, knees bent behind",
  "ring-dips": "at the bottom of a dip on gymnastic rings, rings close to the body",
  "frog-stands": "crouched balance on the hands, knees resting on the backs of the elbows, feet lifted",
  "elbow-lever-tucks": "balancing on both hands, elbows dug into the hips, knees tucked, feet off the ground",
  "one-leg-elbow-levers": "elbow lever balance on both hands, one leg extended straight back, other tucked",
  "full-elbow-levers": "full elbow lever: body horizontal and straight, balanced on both hands, elbows in the hips",
  "one-arm-elbow-levers": "body horizontal, balanced on one hand with elbow in the hip, other arm out",
  "straight-arm-planche-leans": "in a pushup position with straight arms, shoulders leaning well past the hands",
  "side-planks": "side plank on one forearm, feet stacked, body in a straight line",
  "clutch-holds": "hugging a vertical pole, lower arm wrapped around it, top hand gripping above, feet on the ground",
  "tucked-clutch-flags": "clutch grip on a vertical pole, body sideways, knees tucked to the chest, feet off the ground",
  "straddle-clutch-flags": "clutch flag on a vertical pole, body horizontal, legs straddled wide",
  "full-clutch-flags": "clutch flag on a vertical pole, body fully horizontal and straight, legs together"
};

const POSE_WORDS = /\b(lower|hold|hang|lean|bend|lift|extend|squat|bridge|raise|twist|press|pull|sit|balance|tuck|kneel|rotate|drop|arch|reach|curl)/i;
const SETUP_WORDS = /^(stand|grip|step up|start|set up|lie|place|sit on)/i;

function keyPose(p) {
  if (POSE_OVERRIDE[p.id]) return POSE_OVERRIDE[p.id];
  const steps = p.steps || [];
  const pick = steps.find((s) => POSE_WORDS.test(s) && !SETUP_WORDS.test(s)) || steps[1] || steps[0] || '';
  return pick.replace(/\.$/, '').replace(/^\w/, (c) => c.toLowerCase());
}

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/* Ids whose generated image was rejected for wrong form; their prompts were tightened afterwards.
   Remove an id once a good image for it is in img/. */
const REDO_IDS = new Set(['close-pushups', 'angled-bridges', 'one-arm-hangs', 'negative-dips']);

const STYLE_ANCHOR = () => `You are producing a consistent series of exercise photos for a calisthenics app. Every image: ${STYLE} ${COMPOSITION} ${LIGHTING} ${COLOR} Keep the subject centred so the image can be cropped to a square. ${ATHLETE} ${NEGATIVE} Show safe, textbook form.`;

/** Images present in img/ that match a known id → { id: 'img/<file>' }. */
function scanImages() {
  const dir = path.join(ROOT, 'img');
  const known = new Set([...CATS.map((c) => c.id), ...CATS.flatMap((c) => c.progressions.map((p) => p.id))]);
  const found = {};
  const unknown = [];
  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    const m = f.match(/^(.+)\.(webp|png|jpe?g|avif)$/i);
    if (!m) continue;
    if (known.has(m[1])) found[m[1]] = `img/${f}`; else unknown.push(f);
  }
  return { found, unknown, known };
}

function brief(subject, aspect, file, note = '') {
  const core = [
    `Subject: ${subject}`,
    `Style: ${STYLE}`,
    `Composition: ${COMPOSITION}`,
    `Lighting: ${LIGHTING}`,
    `Color/mood: ${COLOR}`,
  ];
  const count = words(core.map((l) => l.replace(/^[\w/]+: /, '')).join(' '));
  const tail = [note, ATHLETE, NEGATIVE].filter(Boolean).join(' ');
  return { core, count, aspect, file, prompt: `${core.map((l) => l.replace(/^[\w/]+: /, '')).join(' ')} ${tail} Aspect ratio ${aspect}.` };
}

function buildAll() {
  const items = [];
  CATS.forEach((c) => {
    const signature = c.progressions[Math.min(c.progressions.length - 1, Math.floor(c.progressions.length * 0.6))];
    items.push({
      id: c.id, kind: 'cover', title: `${c.name} (cover)`,
      ...brief(`Athlete performing ${signature.name.toLowerCase()} ${SETTING[c.id] || 'outdoors'}, strong and controlled.`, '1:1', `img/${c.id}.webp`, FORM_NOTE[c.id]),
      usedIn: 'Movement Library tile, category hero, Activity row before starting',
    });
    c.progressions.forEach((p, i) => {
      items.push({
        id: p.id, kind: 'progression', title: `${c.name} ${i + 1}: ${p.name}`,
        ...brief(`Athlete doing ${p.name.toLowerCase()} ${SETTING[c.id] || 'outdoors'}: ${keyPose(p)}.`, '16:9', `img/${p.id}.webp`, [FORM_NOTE[c.id], ID_NOTE[p.id]].filter(Boolean).join(' ')),
        usedIn: 'Home exercise card, progression list, exercise hero, workout session',
      });
    });
  });
  return items;
}

function writePrompts() {
  const items = buildAll();
  const over = items.filter((x) => x.count > 60);
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'img'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'img', 'prompts.json'), JSON.stringify(items.map(({ id, kind, aspect, file, prompt }) => ({ id, kind, aspect, file, prompt })), null, 2) + '\n');

  let md = `# PulseFit image prompts (for Gemini)

> Generated by \`node tools/image-prompts.js\` from \`data.js\` — edit the script, not this file.
> ${items.length} images: ${CATS.length} category covers (1:1) + ${items.length - CATS.length} progression images (16:9).
> Every image is **AI-generated** and must stay labelled as such (see Privacy & Terms in the app and DESIGN.md §8).
> **Want copy buttons?** Open [\`docs/image-prompts.html\`](image-prompts.html): every prompt has a Copy button, with To do / Redo / Done filters and search.

## How to use with Gemini

1. **Lock the look first.** In a new Gemini chat, paste the *Style anchor* below together with the first cover prompt.
   Regenerate until you like the athlete, light and colour grade. Keep using **the same chat** for the rest so Gemini
   stays consistent (you can also say "same athlete and style as the previous image").
2. **Set the aspect ratio** shown on each prompt (covers 1:1, progressions 16:9). If the UI has no ratio picker, the
   prompt text already ends with "Aspect ratio …".
3. **Check form before saving.** Compare the pose with the exercise's Tutorial and Form Cues. Reject images with
   extra fingers, bent "straight" arms, wrong grip, floating bars or unsafe positions — regenerate with a correction
   such as "arms fully straight, body in one line".
4. **Export** as WebP (or PNG/JPG), about 1600×900 for 16:9 and 1024×1024 for 1:1, under ~200 KB each.
   Name the file exactly as shown (e.g. \`img/wall-pushups.webp\`).
5. **Register the images:** run \`node tools/image-prompts.js manifest\` (or add the ids to \`img/manifest.js\` by hand).
   Anything without an image keeps the stick-figure art, so you can add images gradually.

### Style anchor (paste once at the start of the chat)

> You are producing a consistent series of exercise photos for a calisthenics app. Every image: ${STYLE} ${COMPOSITION}
> ${LIGHTING} ${COLOR} Keep the subject centred so the image can be cropped to a square. ${NEGATIVE}
> Show safe, textbook form.

### Using the API instead

\`img/prompts.json\` holds every prompt with its id, aspect ratio and output filename, ready for a batch script against
the Gemini image API.

---
`;
  let cat = null;
  items.forEach((x) => {
    const catName = x.kind === 'cover' ? x.title.replace(' (cover)', '') : null;
    if (catName && catName !== cat) { cat = catName; md += `\n## ${cat}\n`; }
    md += `\n### ${x.title}\n\n\`${x.file}\` · aspect **${x.aspect}** · ${x.count} words · used in: ${x.usedIn}\n\n\`\`\`text\n${x.prompt}\n\`\`\`\n`;
  });
  fs.writeFileSync(path.join(ROOT, 'docs', 'IMAGE_PROMPTS.md'), md);
  writeHtml(items);
  console.log(`Wrote ${items.length} prompts → docs/IMAGE_PROMPTS.md, docs/image-prompts.html, img/prompts.json`);
  const counts = items.map((x) => x.count);
  console.log(`Core word counts: min ${Math.min(...counts)}, max ${Math.max(...counts)}${over.length ? ` — OVER 60: ${over.map((x) => x.id).join(', ')}` : ' (all ≤ 60)'}`);
}

function writeManifest() {
  const dir = path.join(ROOT, 'img');
  const { found, unknown, known } = scanImages();
  const body = `/* Generated by \`node tools/image-prompts.js manifest\`. Maps a category or progression id to its image.
   Ids not listed here fall back to the stick-figure art. */
window.PF_IMAGES = ${JSON.stringify(found, null, 2)};
`;
  fs.writeFileSync(path.join(dir, 'manifest.js'), body);
  console.log(`Manifest: ${Object.keys(found).length} / ${known.size} images registered.`);
  if (unknown.length) console.log(`Ignored (name doesn't match an id): ${unknown.join(', ')}`);
  writeHtml(buildAll());
}

/* ---------- interactive prompts page with copy buttons ---------- */
function writeHtml(items) {
  const { found } = scanImages();
  const nameOf = {};
  CATS.forEach((c) => { nameOf[c.id] = 'Cover'; c.progressions.forEach((p, i) => { nameOf[p.id] = `${i + 1}. ${p.name}`; }); });
  const status = (id) => (found[id] ? 'done' : REDO_IDS.has(id) ? 'redo' : 'todo');
  const groups = CATS.map((c) => ({
    id: c.id, name: c.name,
    items: items.filter((x) => x.id === c.id || c.progressions.some((p) => p.id === x.id))
      .map((x) => ({ id: x.id, name: nameOf[x.id], file: x.file, aspect: x.aspect, prompt: x.prompt, status: status(x.id) })),
  }));
  const data = { anchor: STYLE_ANCHOR(), groups };
  const html = PAGE.replace('/*__DATA__*/null', JSON.stringify(data).replace(/</g, '\\u003c'));
  fs.writeFileSync(path.join(ROOT, 'docs', 'image-prompts.html'), html);
}

const PAGE = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>PulseFit Image Prompts</title>
<meta name="description" content="Copy-ready Gemini prompts for every PulseFit exercise image, with status filters." />
<style>
  :root { --bg:#eef3fb; --surface:#ffffff; --text:#121d3e; --muted:#4a5c8a; --border:#cfd9ea; --primary:#1556bf; --primary-ink:#fff;
    --done:#177a3b; --done-bg:#e1f3e7; --redo:#894e00; --redo-bg:#fff1d6; --todo:#4a5c8a; --todo-bg:#eef3fb; --code-bg:#f4f7fc; }
  @media (prefers-color-scheme: dark) { :root { --bg:#120f45; --surface:#1c2a55; --text:#fff; --muted:#c5d7ff; --border:rgba(170,186,240,.35);
    --primary:#1556bf; --done:#7ee08a; --done-bg:rgba(126,224,138,.14); --redo:#ffcc7e; --redo-bg:rgba(255,204,126,.14);
    --todo:#c5d7ff; --todo-bg:rgba(197,215,255,.1); --code-bg:#17224a; } }
  * { box-sizing: border-box; }
  body { margin: 0; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 28px; margin: 0 0 4px; letter-spacing: -.01em; }
  .sub { color: var(--muted); margin: 0 0 18px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 14px 16px; }
  .toolbar { position: sticky; top: 0; z-index: 5; display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
    padding: 10px 0; background: var(--bg); }
  .chip { border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 999px;
    min-height: 40px; padding: 0 14px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
  .chip[aria-pressed="true"] { background: var(--primary); border-color: var(--primary); color: var(--primary-ink); }
  input[type=search] { flex: 1 1 200px; min-height: 40px; border: 1px solid var(--border); border-radius: 999px;
    padding: 0 16px; font: inherit; font-size: 15px; background: var(--surface); color: var(--text); }
  h2 { font-size: 20px; margin: 26px 0 10px; display: flex; justify-content: space-between; align-items: baseline; }
  h2 small { font-size: 13px; color: var(--muted); font-weight: 500; }
  .item { margin-bottom: 10px; }
  .head { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 8px; }
  .name { font-weight: 700; }
  .tag { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; padding: 2px 8px; border-radius: 999px; }
  .tag.done { color: var(--done); background: var(--done-bg); } .tag.redo { color: var(--redo); background: var(--redo-bg); }
  .tag.todo { color: var(--todo); background: var(--todo-bg); }
  .meta { font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); }
  .row { display: flex; gap: 10px; align-items: flex-start; }
  .prompt { flex: 1; margin: 0; padding: 10px 12px; border-radius: 10px; background: var(--code-bg); white-space: pre-wrap;
    word-break: break-word; font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
  .copy { flex-shrink: 0; min-width: 88px; min-height: 44px; border: 0; border-radius: 12px; background: var(--primary);
    color: var(--primary-ink); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
  .copy.copied { background: var(--done); color: #fff; }
  .copy:focus-visible, .chip:focus-visible, input:focus-visible { outline: 3px solid #5cd1e4; outline-offset: 2px; }
  .seen { font-size: 12px; color: var(--muted); }
  .empty { color: var(--muted); text-align: center; padding: 30px 0; }
  .hidden { display: none !important; }
  @media (max-width: 560px) { .row { flex-direction: column; } .copy { width: 100%; } }
</style>
</head>
<body>
<main>
  <h1>PulseFit image prompts</h1>
  <p class="sub" id="summary"></p>

  <section class="card">
    <div class="head"><span class="name">Style anchor</span><span class="meta">paste once at the start of the Gemini chat</span></div>
    <div class="row"><p class="prompt" id="anchor"></p><button class="copy" data-copy="anchor">Copy</button></div>
  </section>

  <div class="toolbar" role="toolbar" aria-label="Filter prompts">
    <button class="chip" data-filter="all" aria-pressed="true">All</button>
    <button class="chip" data-filter="todo" aria-pressed="false">To do</button>
    <button class="chip" data-filter="redo" aria-pressed="false">Redo</button>
    <button class="chip" data-filter="done" aria-pressed="false">Done</button>
    <input type="search" id="q" placeholder="Search exercises…" aria-label="Search exercises" />
  </div>
  <div id="list"></div>
  <p class="empty hidden" id="empty">No prompts match.</p>
  <p class="sr-only" aria-live="polite" id="live" style="position:absolute;left:-9999px"></p>
</main>
<script>
const DATA = /*__DATA__*/null;
const LABEL = { done: 'Done', redo: 'Redo · prompt updated', todo: 'To do' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let copied = {};
try { copied = JSON.parse(localStorage.getItem('pf_prompts_copied') || '{}') || {}; } catch (e) { copied = {}; }

const all = DATA.groups.flatMap((g) => g.items);
const n = (s) => all.filter((x) => x.status === s).length;
document.getElementById('summary').textContent =
  all.length + ' prompts · ' + n('done') + ' done · ' + n('redo') + ' to redo · ' + n('todo') + ' to do. Copy a prompt, paste it into Gemini, save the image as the filename shown.';
document.getElementById('anchor').textContent = DATA.anchor;

document.getElementById('list').innerHTML = DATA.groups.map((g) =>
  '<section data-group><h2>' + esc(g.name) + ' <small>' + g.items.filter((x) => x.status === 'done').length + ' / ' + g.items.length + ' done</small></h2>' +
  g.items.map((x) =>
    '<article class="card item" data-status="' + x.status + '" data-text="' + esc((g.name + ' ' + x.name + ' ' + x.id).toLowerCase()) + '">' +
      '<div class="head"><span class="name">' + esc(x.name) + '</span><span class="tag ' + x.status + '">' + LABEL[x.status] + '</span>' +
      '<span class="meta">' + esc(x.file) + ' · ' + esc(x.aspect) + '</span>' +
      '<span class="seen" data-seen="' + esc(x.id) + '">' + (copied[x.id] ? '✓ copied before' : '') + '</span></div>' +
      '<div class="row"><p class="prompt">' + esc(x.prompt) + '</p>' +
      '<button class="copy" data-copy="' + esc(x.id) + '" aria-label="Copy prompt for ' + esc(g.name + ' ' + x.name) + '">Copy</button></div>' +
    '</article>').join('') + '</section>').join('');

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove(); return ok;
  }
}

document.addEventListener('click', async (ev) => {
  const btn = ev.target.closest('[data-copy]');
  if (btn) {
    const id = btn.dataset.copy;
    const text = id === 'anchor' ? DATA.anchor : (all.find((x) => x.id === id) || {}).prompt;
    const ok = await copyText(text);
    btn.textContent = ok ? 'Copied ✓' : 'Select & copy';
    btn.classList.toggle('copied', ok);
    document.getElementById('live').textContent = ok ? 'Prompt copied' : 'Copy failed. Select the text and copy it manually.';
    if (!ok) { const r = document.createRange(); r.selectNodeContents(btn.previousElementSibling); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
    if (ok && id !== 'anchor') {
      copied[id] = true;
      try { localStorage.setItem('pf_prompts_copied', JSON.stringify(copied)); } catch (e) {}
      const s = document.querySelector('[data-seen="' + CSS.escape(id) + '"]'); if (s) s.textContent = '✓ copied before';
    }
    return;
  }
  const chip = ev.target.closest('[data-filter]');
  if (chip) {
    document.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    apply();
  }
});
document.getElementById('q').addEventListener('input', apply);

function apply() {
  const f = document.querySelector('[data-filter][aria-pressed="true"]').dataset.filter;
  const q = document.getElementById('q').value.trim().toLowerCase();
  let shown = 0;
  document.querySelectorAll('[data-group]').forEach((sec) => {
    let any = false;
    sec.querySelectorAll('.item').forEach((it) => {
      const ok = (f === 'all' || it.dataset.status === f) && (!q || it.dataset.text.includes(q));
      it.classList.toggle('hidden', !ok); if (ok) { any = true; shown++; }
    });
    sec.classList.toggle('hidden', !any);
  });
  document.getElementById('empty').classList.toggle('hidden', shown > 0);
}
</script>
</body>
</html>
`;

module.exports = { buildAll, scanImages, writeManifest, writePrompts, REDO_IDS, ROOT };

if (require.main === module) {
  if (process.argv[2] === 'manifest') writeManifest(); else writePrompts();
}
