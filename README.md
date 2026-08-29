# PulseFit — Smart Health & Fitness Tracker

A fully responsive, single-page health-tracking web app built with
**HTML5**, **Tailwind CSS**, and **vanilla JavaScript**. It tracks steps,
calories burned, sleep and calorie intake — including an AI-style
photo scanner that estimates a meal's calories from an uploaded image.

> Modern, minimalist design with a vibrant palette and first-class
> dark mode. No build step, no backend, no dependencies to install —
> just open `index.html` in a browser.

---

## Features

### Landing experience
- **Navigation Bar** — sticky, blurred, with mobile drawer & dark-mode toggle.
- **Hero Section** — animated pulse ring, floating stat cards, gradient headline.
- **Services Section** — four core services (steps, calories burned, sleep, snap-log).
- **Portfolio / Showcase Grid** — filterable success-story cards.
- **CTA + Footer** — gradient call-to-action and clean footer.

### Tracker
- **Live dashboard** for steps, calories burned, calories eaten, sleep — persisted
  per-day in `localStorage`.
- Quick actions: `+ Log steps`, `+ Log sleep`, `Reset day`.
- Meal list with per-item remove.

### Tools
- **Profile & BMI** — name, age, sex, weight, height, activity, goal, plus body
  measurements (chest, waist, hips, biceps, thigh, neck).
- **BMI calculator** with category (Underweight / Healthy / Overweight / Obese) and
  ideal weight range (BMI 18.5–24.9).
- **Calorie requirement calculator** — Mifflin-St Jeor BMR × activity → TDEE →
  goal-adjusted target, plus a macro split (Protein / Carbs / Fat).
- **AI Snap Calorie Counter** — upload or drag-drop a meal photo; a lightweight
  in-browser "AI" reads dominant image colors and matches against a small food
  database to output an estimated meal name, calories, macros and a confidence
  score. Log the estimate straight into today's intake.

### Design & UX
- Tailwind with a **custom vibrant palette** (teal `brand`, violet `iris`,
  coral `accent`, amber `sun`).
- **Dark mode** with a persisted user preference and OS default fallback (no
  flash of unstyled theme on load).
- Fully **responsive** for mobile, tablet, and desktop.
- Respects `prefers-reduced-motion`.

---

## Project structure

```
.
├── index.html      # Markup: nav, hero, services, dashboard, tools, portfolio, CTA, footer
├── styles.css      # Reusable component classes and polish on top of Tailwind
├── app.js          # State, tracker, BMI/TDEE, AI scanner, portfolio filter
├── README.md       # This file
└── .gitignore      # Standard ignores
```

---

## Getting started

No install step. Just open the file in a browser:

```bash
# From the project root
open index.html            # macOS
xdg-open index.html        # Linux
start index.html           # Windows
```

Or serve it locally so the `capture="environment"` file input can access a
mobile camera:

```bash
# Python 3
python3 -m http.server 8080
# Then visit http://localhost:8080
```

---

## How the "AI" scanner works

Real on-device food recognition needs a heavy ML model (e.g. TensorFlow.js
MobileNet). PulseFit ships a lightweight, deterministic stand-in so the
feature is fully offline and instant:

1. The uploaded image is drawn onto a 32×32 canvas.
2. Near-white/black pixels (usually plate or background) are ignored.
3. The average color of the remaining pixels is computed.
4. That color is matched against a small food database using Euclidean
   distance in RGB space.
5. Distance is inversely mapped to a 55–98% confidence score.

Swapping this out for a real model — for example TF.js MobileNet or an API
call — only requires replacing `extractDominantColor` + `matchFood` in
`app.js`.

---

## Persistence

All data lives in the browser's `localStorage`:

| Key              | Contents                                             |
|------------------|------------------------------------------------------|
| `pf_theme`       | `"dark"` or `"light"`                                |
| `pf_profile`     | Profile & body-measurement object                    |
| `pf_day_YYYY-MM-DD` | Per-day steps, sleep minutes, meal log            |

Clear via **Reset day** in the dashboard, or `localStorage.clear()` in
DevTools.

---

## Roadmap ideas

- Real image classification via TF.js MobileNet.
- Multi-day trend charts (Chart.js).
- Weekly & monthly digest reports.
- Optional backend sync + auth.
- PWA install & offline mode.

---

## License

MIT — see `LICENSE` if present, otherwise treat as MIT.
