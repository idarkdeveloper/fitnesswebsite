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
tracker.*     The original PulseFit daily health tracker
```

## Run locally

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

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
