#!/usr/bin/env node
/* =============================================================
   PulseFit image tooling (no dependencies)

   node tools/image-prompts.js            -> writes docs/IMAGE_PROMPTS.md and img/prompts.json
   node tools/image-prompts.js manifest   -> scans img/ for <id>.webp|png|jpg and rewrites img/manifest.js

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
  "full-pushups": "in a straight-body pushup at the bottom, chest just above the floor, elbows about 45 degrees",
  "close-pushups": "in a pushup with hands touching under the chest, elbows tucked to the ribs, chest lowered",
  "uneven-pushups": "in a pushup with one hand on a basketball, the other on the floor, chest lowered",
  "half-one-arm-pushups": "in a wide-stance one-arm pushup, other hand behind the back, elbow bent to 90 degrees",
  "lever-pushups": "in a pushup, one hand under the chest, the other arm straight out to the side on a ball",
  "assisted-one-arm-pushups": "doing a one-arm pushup on a waist-high bench, feet wide, other hand behind the back",
  "one-arm-pushups": "in a one-arm pushup, feet wide, free hand behind the back, chest just above the floor",
  "vertical-pulls": "gripping a vertical pole at chest height, leaning back with straight arms, feet near its base",
  "horizontal-rows": "under a waist-high bar, body straight and inclined, heels on the ground, chest pulled to the bar",
  "jackknife-pullups": "pulling up on a bar with legs straight forward, heels resting on a bench, chin over the bar",
  "half-pullups": "hanging from a bar, overhand grip, pulled halfway with elbows bent at 90 degrees",
  "full-pullups": "at the top of a pullup, overhand grip, chin over the bar, legs straight together",
  "close-pullups": "at the top of a pullup with hands touching on the bar, chin over the bar",
  "uneven-pullups": "pulling up, one hand on the bar, the other gripping a lower hanging towel, chin over the bar",
  "half-one-arm-pullups": "hanging from one hand with the elbow bent at 90 degrees, free hand at the side",
  "one-arm-pullups": "at the top of a one-arm pullup, chin over the bar, free arm by the side",
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
  "angled-bridges": "arched backbend with hands on a bench behind, feet on the ground, hips pushed up",
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
  "one-arm-hangs": "hanging from one hand on a high bar, shoulder engaged, free arm by the side",
  "split-squats": "in a split stance, back knee just above the ground, torso upright",
  "reverse-lunges": "stepping back into a lunge, both knees bent 90 degrees, torso upright",
  "walking-lunges": "mid walking lunge, front knee over the ankle, back knee near the ground",
  "bulgarian-split-squats": "rear foot on a bench behind, front leg bent deep, back knee near the ground",
  "jumping-lunges": "in mid-air switching legs during a jumping lunge, arms driving",
  "shrimp-squats": "on one leg, holding the other foot behind, rear knee lowering toward the ground",
  "bench-dips": "hands on a bench behind the hips, legs forward, elbows bent 90 degrees",
  "support-holds": "holding the top of parallel bars with straight locked arms, feet off the ground",
  "negative-dips": "slowly lowering on parallel bars, elbows half bent, torso slightly forward",
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

function brief(subject, aspect, file) {
  const core = [
    `Subject: ${subject}`,
    `Style: ${STYLE}`,
    `Composition: ${COMPOSITION}`,
    `Lighting: ${LIGHTING}`,
    `Color/mood: ${COLOR}`,
  ];
  const count = words(core.map((l) => l.replace(/^[\w/]+: /, '')).join(' '));
  return { core, count, aspect, file, prompt: `${core.map((l) => l.replace(/^[\w/]+: /, '')).join(' ')} ${NEGATIVE} Aspect ratio ${aspect}.` };
}

function buildAll() {
  const items = [];
  CATS.forEach((c) => {
    const signature = c.progressions[Math.min(c.progressions.length - 1, Math.floor(c.progressions.length * 0.6))];
    items.push({
      id: c.id, kind: 'cover', title: `${c.name} (cover)`,
      ...brief(`Athlete performing ${signature.name.toLowerCase()} ${SETTING[c.id] || 'outdoors'}, strong and controlled.`, '1:1', `img/${c.id}.webp`),
      usedIn: 'Movement Library tile, category hero, Activity row before starting',
    });
    c.progressions.forEach((p, i) => {
      items.push({
        id: p.id, kind: 'progression', title: `${c.name} ${i + 1}: ${p.name}`,
        ...brief(`Athlete doing ${p.name.toLowerCase()} ${SETTING[c.id] || 'outdoors'}: ${keyPose(p)}.`, '16:9', `img/${p.id}.webp`),
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
  console.log(`Wrote ${items.length} prompts → docs/IMAGE_PROMPTS.md, img/prompts.json`);
  const counts = items.map((x) => x.count);
  console.log(`Core word counts: min ${Math.min(...counts)}, max ${Math.max(...counts)}${over.length ? ` — OVER 60: ${over.map((x) => x.id).join(', ')}` : ' (all ≤ 60)'}`);
}

function writeManifest() {
  const dir = path.join(ROOT, 'img');
  const known = new Set([...CATS.map((c) => c.id), ...CATS.flatMap((c) => c.progressions.map((p) => p.id))]);
  const found = {};
  const unknown = [];
  for (const f of fs.readdirSync(dir).sort()) {
    const m = f.match(/^(.+)\.(webp|png|jpe?g|avif)$/i);
    if (!m) continue;
    if (known.has(m[1])) found[m[1]] = `img/${f}`; else unknown.push(f);
  }
  const body = `/* Generated by \`node tools/image-prompts.js manifest\`. Maps a category or progression id to its image.
   Ids not listed here fall back to the stick-figure art. */
window.PF_IMAGES = ${JSON.stringify(found, null, 2)};
`;
  fs.writeFileSync(path.join(dir, 'manifest.js'), body);
  console.log(`Manifest: ${Object.keys(found).length} / ${known.size} images registered.`);
  if (unknown.length) console.log(`Ignored (name doesn't match an id): ${unknown.join(', ')}`);
}

if (process.argv[2] === 'manifest') writeManifest(); else writePrompts();
