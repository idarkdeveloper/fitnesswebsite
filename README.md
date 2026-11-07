# PulseFit — Bodyweight Progression Trainer

A mobile-first fitness web app for mastering bodyweight training one
progression at a time. Each movement family is a ladder of exercises from
easiest to hardest, and every exercise has three levels. When you hit a
level's target, it's marked complete. Finish level 3 and the next
progression unlocks.

There's no build step, no backend and nothing to install. Open `index.html`
in a browser, or deploy the folder to any static host. The included workflow
deploys it to GitHub Pages.

**Install it as a phone app.** PulseFit is an installable web app (PWA): it
gets a home-screen icon, opens full screen and works offline.
- **Android (Chrome):** Profile → **Install PulseFit app**, or the browser menu → **Install app**.
- **iPhone (Safari):** Share → **Add to Home Screen**.

On iPhone, the installed app has its own storage, so sign in to sync again
inside it, using the 6-digit code from the sign-in email.

## Features

| Tab | What it does |
|-----|--------------|
| **Home** | Greeting, a 30-day workout challenge bar, and the routine card. The card has a routine picker, a swipeable carousel of today's exercises showing your current progression and level, swap-progression and rest-timer buttons, **Start**, and a day navigator ("Day 3 of 7", status). Also shows 14 upcoming days and a "micro fitness hit" tip. |
| **Movements** | A library of 11 movement families and 74 progressions. Each family page lists its progressions with your level status. Each exercise page has an overview, primary and secondary muscles, and three tabs: **Levels**, **Tutorial** (steps, plus how to make it harder or easier) and **Form Cues**. **Log sets** records a single exercise. |
| **Activity** | Activity streak, total workouts, an achievements summary, "X / 74 Progressions Mastered" with a dot ladder per family, and workout history grouped by month. You can open and delete past workouts. |
| **Challenges** | Streak badges (3 / 5 / 10 / 30 days) and joinable Pushup, Pullup and Squat ladders (15 steps each, with a badge per progression), plus the full set of 14 badges. |
| **Profile** | Achievements, name and email (kept locally), three themes (Midnight, Light, Dark), PulseFit Pro (a demo toggle that unlocks four advanced families and a routine), training days, rest timer, reminders, data export, import and reset, FAQ, and Privacy. |

**Workout session.** Each set has a stepper input and a ✓ button. Ticking
a set starts the rest countdown, which beeps and vibrates when it ends. Hold
exercises include a "Time a hold" stopwatch. When you finish, the app checks
each exercise against its level target, levels you up, unlocks the next
progression and shows any new badges.

**Schedule.** Pick your training days. Each routine's sessions rotate across
those days, and the other days are rest days. Rest days never break your
streak.

The older steps, sleep, calorie and BMI tracker still works at
`tracker.html`. Profile links to it as "Daily Health Tracker".

## Project structure

```
index.html    App shell (sidebar on desktop, bottom tab bar on mobile)
styles.css    Theme tokens and components
app.js        Router, views, progress model, workout logic
data.js       Exercise database: 11 families, 74 progressions
sync-core.js  Cloud sync merge rules (pure functions)
sync.js       Cloud sync engine + Supabase adapter (optional)
sync-config.js  Supabase URL and public key (empty = fully local)
theme-boot.js Applies the saved theme before first paint
manifest.webmanifest, sw.js, pwa.js, icons/   Installable app: manifest, offline service worker, install helpers
vendor/       Pinned supabase-js 2.118.0 (no CDN scripts)
supabase/     Database migration for cloud sync
DESIGN.md     Design language: tokens, type, spacing, components, rules
img/          Optional exercise images + manifest.js + prompts.json
tools/        image-prompts.js (prompts, manifest), generate-images.js (OpenAI generation)
docs/         IMAGE_PROMPTS.md, BACKEND_DESIGN.md, SUPABASE_SETUP.md
tracker.*     The original PulseFit daily health tracker (tracker.tw.css is prebuilt Tailwind)
```

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Exercise images (optional)

The app shows stick-figure art until you add photos. To make them with Gemini:

1. Open `docs/image-prompts.html`, which has a **Copy** button on every prompt, filters for to do, redo and done, and search. The same 85 prompts (11 category covers and 74 exercises) are also in `docs/IMAGE_PROMPTS.md`.
2. Save each image as `img/<id>.webp`, using the filename shown with each prompt.
3. Run `node tools/image-prompts.js manifest` to register the images.

### Generating images with the OpenAI API (optional)

`tools/generate-images.js` creates the images for you with OpenAI's image models. It runs on **your computer**. Never put an API key in the website: PulseFit is a public static site, so anyone could read the key and spend your credits.

1. Create a key at <https://platform.openai.com/api-keys>. Copy `.env.example` to `.env` in the repo root (git-ignored) and paste the key in:
   ```
   OPENAI_API_KEY=sk-...
   # optional: OPENAI_IMAGE_MODEL=gpt-image-2
   ```
2. Preview what would be made, without calling the API or spending anything:
   ```bash
   node tools/generate-images.js --dry-run
   ```
3. Generate a small batch. The default is 5 missing images (to do + redo) at medium quality, and new images go to `img/review/`, which is never deployed:
   ```bash
   node tools/generate-images.js --limit 5
   node tools/generate-images.js --only full-pushups,close-pushups --quality high
   ```
4. Check each image in `img/review/` against the exercise's Tutorial and Form Cues. Approve the good ones:
   ```bash
   node tools/generate-images.js approve full-pushups close-pushups
   ```
   Regenerate rejects with `--force`. Every generation is logged in `img/review/generation-log.json`.

**Half price with batch mode.** The OpenAI Batch API charges 50% less. Results arrive within 24 hours, usually much sooner:
```bash
node tools/generate-images.js batch submit --status missing --limit 30   # same options as above; prints a batch id
node tools/generate-images.js batch status                              # check progress (last batch by default)
node tools/generate-images.js batch collect                             # download finished images into img/review/
```
Then review and `approve` as usual. Costs in the log are recorded at batch price.

Prompt caching wouldn't lower the cost here. It only discounts *input* tokens, and only for prompts of 1,024 tokens or more. Our prompts are about 250 tokens, and prompt text costs well under a cent per image. The image output is about 99% of the bill.

Requires Node 18+, with no `npm install`. The script retries rate limits and server errors with backoff. **Cost:** `--dry-run` prints an estimate, and real runs print what each image actually cost, using the token usage the API reports. Both also go into the log. Here are the estimates for all 74 missing images at medium quality, using OpenAI's per-token prices as of November 2026:

| Model | One pass | With redos (~1.8×) |
|---|---|---|
| `gpt-image-1.5` (default) | ≈ $4.55 (batch ≈ $2.30) | ≈ $8.20 (batch ≈ $4.10) |
| `gpt-image-2` | ≈ $4.25 (batch ≈ $2.15) | ≈ $7.70 (batch ≈ $3.85) |
| `gpt-image-1-mini` | ≈ $1.15 (batch ≈ $0.60) | ≈ $2.10 (batch ≈ $1.05) |

Low quality costs about a quarter of medium, and high about four times as much. Re-check <https://openai.com/api/pricing/> before big runs, and set a monthly limit in your OpenAI billing settings. Some newer models require organisation verification; if you get a 403, try `--model gpt-image-1`.

### Generating images on GitHub (no local setup)

`.github/workflows/generate-images.yml` runs the same script in GitHub Actions, using a key stored as a GitHub secret. Nothing needs to be installed on your computer, and you can start runs from the GitHub mobile app.

One-time setup in the repo's **Settings**:
1. **Environments → New environment →** `image-generation` **→ Add environment secret** `OPENAI_API_KEY`. You can also add yourself under **Required reviewers**, so every run waits for your approval before it spends money.
2. **Actions → General → Workflow permissions →** tick **Allow GitHub Actions to create and approve pull requests**.

To run it: **Actions → Generate exercise images → Run workflow**. Choose a **mode**:
- `direct`: generate now at full price, then open the review pull request.
- `batch-submit`: queue the images at **50% off**. The run summary shows a batch id.
- `batch-collect`: paste that batch id later to download the images and open the review pull request. If the batch isn't finished yet, the run says so; try again later.

Then pick the ids, or a status (`redo`, `missing`, `todo`), plus a limit (1–30), the quality and the model. The run shows a cost estimate, generates the images, and opens a **pull request with every image shown**. Check the form in each one, and delete any bad images from the pull request (with their lines in `img/manifest.js`) or close it. Merging publishes the images.

Token usage and cost for each run are saved in `img/generation-logs/run-<id>.json`. The workflow appears in the Actions tab only once this file is on the default branch.

To regenerate the prompts after editing `data.js`, run `node tools/image-prompts.js`. `img/prompts.json` has the same prompts for batch use with the Gemini API.

## Data

Everything is stored in the browser's `localStorage` under `pf2_state`. Use
**Profile → Export Data** to back it up or move it to another device.

**Cloud sync (optional).** Sign in under **Profile → Back up & sync** to keep
your phone and computer in sync. It's built for one person: data lives in
your own free Supabase project, and only your email can read or write it. Your
devices merge changes themselves: workouts are combined, the highest level
wins, the most recent setting wins, and a reset wins everywhere (other devices
offer a backup of what they lose). Set it up with
[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md); the design is in
[docs/BACKEND_DESIGN.md](docs/BACKEND_DESIGN.md). Until `sync-config.js` is
filled in, the app stays fully local.

Tests: `node tools/test-merge.js` (merge rules) and
`node tools/test-sync-browser.js` (two simulated devices; needs Playwright and
a local server on port 8765).

## Editing content

Add or edit exercises in `data.js`. Each progression has `type`
(`reps` or `hold`), an optional `perSide`, three `levels` (`{ sets, target }`),
`steps`, `harder`, `easier` and `cues`. The app picks up changes automatically.

## Disclaimer

PulseFit is general fitness education, not medical advice. Train within your
abilities and stop if anything hurts.

## License

MIT
