#!/usr/bin/env node
/* =============================================================
   Generate PulseFit exercise images with the OpenAI Images API.

   Runs on YOUR computer only. The API key never goes into the website:
   PulseFit is a public static site, so a key in app.js would be readable
   by anyone and billed to you.

   Setup (once):
     1. Create a key at https://platform.openai.com/api-keys
     2. Put it in a .env file in the repo root (already git-ignored):
          OPENAI_API_KEY=sk-...
        or export it in your shell.
     3. Node 18+ (uses the built-in fetch). No npm install needed.

   Usage:
     node tools/generate-images.js                     # 5 missing images (to do + redo) → img/review/
     node tools/generate-images.js --dry-run           # show what would be generated, no API calls
     node tools/generate-images.js --only full-pushups,close-pushups
     node tools/generate-images.js --status redo --limit 9
     node tools/generate-images.js --quality high --model gpt-image-2
     node tools/generate-images.js approve full-pushups close-pushups
                                                       # move reviewed images into img/ and register them

   Options:
     --status todo|redo|missing|all   which prompts (default: missing = todo + redo)
     --only id1,id2                   explicit ids (overrides --status)
     --limit N                        max images this run (default 5; protects your bill)
     --quality low|medium|high        default medium
     --model NAME                     default $OPENAI_IMAGE_MODEL or gpt-image-1.5
     --force                          regenerate even if img/review/<id>.webp exists
     --dry-run                        list only

   Generated images land in img/review/ (never deployed). Check each one against the
   exercise's Tutorial and Form Cues, then `approve` the good ones. Every generation is
   recorded in img/review/generation-log.json (model, prompt, time) for provenance.
   ============================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildAll, scanImages, writeManifest, REDO_IDS, ROOT } = require('./image-prompts.js');

const REVIEW = path.join(ROOT, 'img', 'review');
const LOG = path.join(REVIEW, 'generation-log.json');

/* ---------- tiny .env loader (no dependency) ---------- */
function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

function parseArgs(argv) {
  const o = { status: 'missing', only: null, limit: 5, quality: 'medium', model: null, force: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { if (i + 1 >= argv.length) fail(`${a} needs a value`); return argv[++i]; };
    if (a === '--status') o.status = next();
    else if (a === '--only') o.only = next().split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--limit') o.limit = Number(next());
    else if (a === '--quality') o.quality = next();
    else if (a === '--model') o.model = next();
    else if (a === '--force') o.force = true;
    else if (a === '--dry-run') o.dryRun = true;
    else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]); process.exit(0); }
    else fail(`Unknown option: ${a}`);
  }
  if (!['todo', 'redo', 'missing', 'all'].includes(o.status)) fail('--status must be todo, redo, missing or all');
  if (!['low', 'medium', 'high'].includes(o.quality)) fail('--quality must be low, medium or high');
  if (!Number.isInteger(o.limit) || o.limit < 1 || o.limit > 85) fail('--limit must be 1..85');
  return o;
}

function fail(msg) { console.error(`✖ ${msg}`); process.exit(1); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- selection ---------- */
function select(opts) {
  const items = buildAll();
  const { found } = scanImages();
  const statusOf = (id) => (found[id] ? 'done' : REDO_IDS.has(id) ? 'redo' : 'todo');
  let list;
  if (opts.only) {
    const known = new Set(items.map((x) => x.id));
    const bad = opts.only.filter((id) => !known.has(id));
    if (bad.length) fail(`Unknown id(s): ${bad.join(', ')}`);
    list = items.filter((x) => opts.only.includes(x.id));
  } else {
    list = items.filter((x) => {
      const s = statusOf(x.id);
      return opts.status === 'all' || s === opts.status || (opts.status === 'missing' && s !== 'done');
    });
  }
  if (!opts.force) list = list.filter((x) => !fs.existsSync(path.join(REVIEW, `${x.id}.webp`)));
  return list.slice(0, opts.limit).map((x) => ({ ...x, status: statusOf(x.id) }));
}

/* ---------- API call with retry ---------- */
async function generate(item, opts) {
  const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const body = {
    model: opts.model,
    prompt: item.prompt,
    n: 1,
    // Standard sizes supported by all GPT image models. 16:9 art uses 1536x1024 (3:2);
    // the app crops with object-fit: cover, so the centred subject survives.
    size: item.aspect === '1:1' ? '1024x1024' : '1536x1024',
    quality: opts.quality,
    output_format: 'webp',
    output_compression: 80,
  };
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 180000);
    let res, text;
    try {
      res = await fetch(`${base}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      text = await res.text();
    } catch (e) {
      clearTimeout(timer);
      if (attempt === maxAttempts) throw new Error(`network: ${e.name === 'AbortError' ? 'timed out after 180 s' : e.message}`);
      await backoff(attempt, null, `network error (${e.message})`);
      continue;
    }
    clearTimeout(timer);
    if (res.ok) {
      const json = JSON.parse(text);
      const b64 = json && json.data && json.data[0] && json.data[0].b64_json;
      if (!b64) throw new Error('response had no image data');
      return { bytes: Buffer.from(b64, 'base64'), size: body.size, revised: json.data[0].revised_prompt || null };
    }
    let msg = text.slice(0, 300);
    try { msg = JSON.parse(text).error.message || msg; } catch { /* keep raw */ }
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt === maxAttempts) {
      const hint = res.status === 401 ? ' (check OPENAI_API_KEY)'
        : res.status === 403 ? ' (your organisation may need verification for this model, or try --model gpt-image-1)'
        : res.status === 400 && /safety|policy/i.test(msg) ? ' (blocked by the safety system; adjust the prompt)'
        : res.status === 404 ? ' (unknown model? try --model gpt-image-1)' : '';
      throw new Error(`HTTP ${res.status}: ${msg}${hint}`);
    }
    await backoff(attempt, res.headers.get('retry-after'), `HTTP ${res.status}`);
  }
}

async function backoff(attempt, retryAfter, why) {
  const ms = retryAfter && !Number.isNaN(Number(retryAfter))
    ? Number(retryAfter) * 1000
    : Math.min(30000, 2000 * 2 ** (attempt - 1)) * (0.75 + Math.random() * 0.5);
  console.log(`   ↻ ${why}, retrying in ${Math.round(ms / 1000)} s`);
  await sleep(ms);
}

function appendLog(entry) {
  let log = [];
  try { log = JSON.parse(fs.readFileSync(LOG, 'utf8')); } catch { log = []; }
  log.push(entry);
  fs.writeFileSync(LOG, JSON.stringify(log, null, 2) + '\n');
}

/* ---------- approve: review → img/ ---------- */
function approve(ids) {
  if (!ids.length) fail('Name the ids to approve, e.g. approve full-pushups close-pushups');
  let moved = 0;
  for (const id of ids) {
    const from = path.join(REVIEW, `${id}.webp`);
    if (!fs.existsSync(from)) { console.log(`✖ ${id}: no img/review/${id}.webp`); continue; }
    fs.renameSync(from, path.join(ROOT, 'img', `${id}.webp`));
    console.log(`✔ ${id} → img/${id}.webp`);
    moved++;
  }
  if (moved) writeManifest(); // an image in img/ marks the prompt as done, even if it was on the redo list
}

/* ---------- main ---------- */
async function main() {
  loadEnv();
  const argv = process.argv.slice(2);
  if (argv[0] === 'approve') return approve(argv.slice(1));
  const opts = parseArgs(argv);
  opts.model = opts.model || process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5';

  const list = select(opts);
  if (!list.length) { console.log('Nothing to generate (all selected images exist in img/ or img/review/; use --force to redo).'); return; }

  console.log(`${opts.dryRun ? 'Would generate' : 'Generating'} ${list.length} image(s) with ${opts.model}, quality ${opts.quality}:`);
  list.forEach((x) => console.log(`  • ${x.id.padEnd(28)} ${x.aspect === '1:1' ? '1024x1024' : '1536x1024'}  [${x.status}]`));
  if (opts.dryRun) { console.log('\nDry run: no API calls made. See your plan\'s per-image price at https://openai.com/api/pricing/'); return; }
  if (!process.env.OPENAI_API_KEY) fail('OPENAI_API_KEY is not set. Add it to .env (git-ignored) or export it in your shell.');

  fs.mkdirSync(REVIEW, { recursive: true });
  const ok = [], failed = [];
  for (const [i, x] of list.entries()) {
    process.stdout.write(`\n[${i + 1}/${list.length}] ${x.id} … `);
    const t0 = Date.now();
    try {
      const r = await generate(x, opts);
      const file = path.join(REVIEW, `${x.id}.webp`);
      fs.writeFileSync(file, r.bytes);
      appendLog({
        id: x.id, file: `img/review/${x.id}.webp`, model: opts.model, quality: opts.quality, size: r.size,
        prompt_sha256: crypto.createHash('sha256').update(x.prompt).digest('hex').slice(0, 16),
        prompt: x.prompt, revised_prompt: r.revised, generated_at: new Date().toISOString(), ai_generated: true,
      });
      console.log(`saved (${Math.round(r.bytes.length / 1024)} KB, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
      ok.push(x.id);
    } catch (e) {
      console.log(`failed: ${e.message}`);
      failed.push(x.id);
    }
  }
  console.log(`\nDone: ${ok.length} saved to img/review/, ${failed.length} failed.`);
  if (ok.length) {
    console.log('\nNext: open each image in img/review/ and compare it with the exercise\'s Tutorial and Form Cues.');
    console.log('Approve the good ones (others stay in review; regenerate with --force):');
    console.log(`  node tools/generate-images.js approve ${ok.join(' ')}`);
  }
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => fail(e.stack || e.message));
