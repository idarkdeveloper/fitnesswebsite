# PulseFit — Bodyweight Progression Trainer

A mobile-first fitness web app for mastering bodyweight training one
progression at a time. Each movement family is a ladder of exercises from
easiest to hardest, and every exercise has three levels. When you hit a
level's target, it's marked complete. Finish level 3 and the next
progression unlocks.

There's no build step, no backend and nothing to install. Open `index.html`
in a browser, or deploy the folder to any static host. The included workflow
deploys it to GitHub Pages.

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
DESIGN.md     Design language: tokens, type, spacing, components, rules
img/          Optional exercise images + manifest.js + prompts.json
tools/        image-prompts.js (prompts, manifest), generate-images.js (OpenAI generation)
docs/         IMAGE_PROMPTS.md (Gemini prompts)
tracker.*     The original PulseFit daily health tracker
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

1. Create a key at <https://platform.openai.com/api-keys> and add it to a `.env` file in the repo root (already git-ignored):
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

Requires Node 18+, with no `npm install`. The script retries rate limits and server errors with backoff. Prices depend on model, size and quality; see <https://openai.com/api/pricing/>. Some newer models require organisation verification; if you get a 403, try `--model gpt-image-1`.

To regenerate the prompts after editing `data.js`, run `node tools/image-prompts.js`. `img/prompts.json` has the same prompts for batch use with the Gemini API.

## Data

Everything is stored in the browser's `localStorage` under `pf2_state`. Use
**Profile → Export Data** to back it up or move it to another device.

## Editing content

Add or edit exercises in `data.js`. Each progression has `type`
(`reps` or `hold`), an optional `perSide`, three `levels` (`{ sets, target }`),
`steps`, `harder`, `easier` and `cues`. The app picks up changes automatically.

## Disclaimer

PulseFit is general fitness education, not medical advice. Train within your
abilities and stop if anything hurts.

## License

MIT
