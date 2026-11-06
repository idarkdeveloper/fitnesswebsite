#!/usr/bin/env node
/* =============================================================
   Generate PulseFit exercise images with the OpenAI Images API.

   Runs on YOUR computer only. The API key never goes into the website:
   PulseFit is a public static site, so a key in app.js would be readable
   by anyone and billed to you.

   Setup (once):
     1. Create a key at https://platform.openai.com/api-keys
     2. Copy .env.example to .env in the repo root (git-ignored) and paste your key:
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
   recorded in img/review/generation-log.json (model, prompt, time, tokens, cost) for provenance.
   --dry-run prints an estimated cost; real runs total the cost from the token usage the API returns.
   ============================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildAll, scanImages, writeManifest, REDO_IDS, ROOT } = require('./image-prompts.js');

const REVIEW = path.join(ROOT, 'img', 'review');

/* USD per 1M tokens, from OpenAI's pricing page (checked 2026-11-06). Re-check before big runs:
   https://openai.com/api/pricing/  (image output tokens dominate the cost). */
const PRICES = {
  'gpt-image-2.6-sunburst': { textIn: 5, imageIn: 8, imageOut: 30 },
  'gpt-image-2.6-flare':    { textIn: 5, imageIn: 8, imageOut: 30 },
  'gpt-image-2.5-sunburst': { textIn: 5, imageIn: 8, imageOut: 30 },
  'gpt-image-2.5-flare':    { textIn: 5, imageIn: 8, imageOut: 30 },
  'gpt-image-2':            { textIn: 5, imageIn: 8, imageOut: 30 },
  'gpt-image-1.5':          { textIn: 5, imageIn: 8, imageOut: 32 },
  'chatgpt-image-latest':   { textIn: 5, imageIn: 8, imageOut: 32 },
  'gpt-image-1-mini':       { textIn: 2, imageIn: 2.5, imageOut: 8 },
};
/* Output tokens per image for the GPT image 1.x family (OpenAI docs). Used only for --dry-run
   estimates; real runs total the token usage the API returns. Newer models may differ. */
const EST_TOKENS = {
  '1024x1024': { low: 272, medium: 1056, high: 4160 },
  '1536x1024': { low: 400, medium: 1568, high: 6208 },
};
const EST_PROMPT_TOKENS = 110;

function costOf(model, usage) {
  const p = PRICES[model];
  if (!p || !usage) return null;
  const d = usage.input_tokens_details || {};
  const textIn = d.text_tokens ?? usage.input_tokens ?? 0;
  const imageIn = d.image_tokens ?? 0;
  const out = usage.output_tokens ?? 0;
  return (textIn * p.textIn + imageIn * p.imageIn + out * p.imageOut) / 1e6;
}
const usd = (n) => '$' + n.toFixed(n < 1 ? 3 : 2);
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
      return { bytes: Buffer.from(b64, 'base64'), size: body.size, revised: json.data[0].revised_prompt || null, usage: json.usage || null };
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
  const price = PRICES[opts.model];
  if (price) {
    const est = list.reduce((sum, x) => {
      const size = x.aspect === '1:1' ? '1024x1024' : '1536x1024';
      return sum + (EST_TOKENS[size][opts.quality] * price.imageOut + EST_PROMPT_TOKENS * price.textIn) / 1e6;
    }, 0);
    console.log('\nEstimated cost: about ' + usd(est) + ' for this run (' + opts.model + ' at $' + price.imageOut + ' per 1M output tokens).');
    console.log('Expect roughly 1.8x that if you regenerate images that show wrong form.');
  } else {
    console.log('\nNo price on file for ' + opts.model + '; check https://openai.com/api/pricing/');
  }
  if (opts.dryRun) { console.log('Dry run: no API calls made.'); return; }
  if (!process.env.OPENAI_API_KEY) fail('OPENAI_API_KEY is not set. Add it to .env (git-ignored) or export it in your shell.');

  fs.mkdirSync(REVIEW, { recursive: true });
  const ok = [], failed = [];
  let spent = 0, unpriced = 0;
  for (const [i, x] of list.entries()) {
    process.stdout.write(`\n[${i + 1}/${list.length}] ${x.id} … `);
    const t0 = Date.now();
    try {
      const r = await generate(x, opts);
      const file = path.join(REVIEW, `${x.id}.webp`);
      fs.writeFileSync(file, r.bytes);
      const cost = costOf(opts.model, r.usage);
      if (cost == null) unpriced++; else spent += cost;
      appendLog({
        id: x.id, file: `img/review/${x.id}.webp`, model: opts.model, quality: opts.quality, size: r.size,
        prompt_sha256: crypto.createHash('sha256').update(x.prompt).digest('hex').slice(0, 16),
        prompt: x.prompt, revised_prompt: r.revised, generated_at: new Date().toISOString(), ai_generated: true,
        usage: r.usage, cost_usd: cost == null ? null : Number(cost.toFixed(5)),
      });
      console.log(`saved (${Math.round(r.bytes.length / 1024)} KB, ${((Date.now() - t0) / 1000).toFixed(1)} s` + (cost == null ? '' : ', ' + usd(cost)) + ')');
      ok.push(x.id);
    } catch (e) {
      console.log(`failed: ${e.message}`);
      failed.push(x.id);
    }
  }
  console.log(`\nDone: ${ok.length} saved to img/review/, ${failed.length} failed.`);
  console.log('Cost this run: ' + usd(spent) + ' from reported token usage' + (unpriced ? ' (+' + unpriced + ' image(s) without usage data or price)' : '') + '. Failed requests are normally not billed.');
  if (ok.length) {
    console.log('\nNext: open each image in img/review/ and compare it with the exercise\'s Tutorial and Form Cues.');
    console.log('Approve the good ones (others stay in review; regenerate with --force):');
    console.log(`  node tools/generate-images.js approve ${ok.join(' ')}`);
  }
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => fail(e.stack || e.message));
