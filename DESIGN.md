# PulseFit Design Language

> Source of truth for PulseFit's visual and interaction decisions.
> The tokens are implemented as CSS custom properties at the top of `styles.css`, set per theme on `<html data-theme>`.
> Status: **v1, extracted from the shipped app.** It covers colour, type, spacing, radius and the component inventory.
> Not covered yet: motion tokens and an icon grid spec.

## 1. Principles

1. **One next step.** Every screen answers "what do I do now?" Home leads with today's exercise and a single primary **Start** button.
2. **Progress is visible.** Levels, dot ladders, streaks and badges always show where you stand and what earns the next step.
3. **Honest and local.** Data stays in the browser, and so does the copy: Pro is labelled as a free demo toggle and nothing is promised that the app can't do.
4. **Forgiving.** Destructive actions ask for confirmation, workouts can be cancelled, and rest days never break a streak.
5. **Calm, sporty surface.** Deep gradient backdrop, rounded cards, one bright accent. Colour signals state and is never the only signal.

## 2. Colour

### 2.1 Palette primitives

The **"PulseFit" palette** was generated with the ui-color-palette tool from harmonies of the original brand blue `#2466d4`:

- **Harmony sources:** primary `#2466d4`; analogous teal `#24bed4`; complementary amber `#d49224`; compound red `#d43a24`; neutral navy `#1c2a55`.
- **Scale:** Material stops 50–900, OKLCH colour space, lightness 96 → 24. Shade 50 is the lightest.

The primitives are defined once in `styles.css` as `--{hue}-{stop}`. **Components never use primitives directly**; they use the role tokens in §2.2.

| Scale | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| `--blue-*` | `#bcf3ff` | `#9dd8ff` | `#7fbdff` | `#63a2ff` | `#4888f5` | `#2e6fdb` | `#1556bf` | `#003ea2` | `#002684` | `#000e63` |
| `--teal-*` | `#a6ffff` | `#81eafc` | `#5cd1e4` | `#31b7cc` | `#009fb3` | `#00869b` | `#006e82` | `#00566a` | `#003f51` | `#002939` |
| `--amber-*` | `#ffe8a2` | `#ffcc7e` | `#edb15c` | `#d59738` | `#bc7e02` | `#a36500` | `#894e00` | `#703700` | `#562200` | `#3c0f00` |
| `--red-*` | `#ffccb5` | `#ffad95` | `#ff8e76` | `#ff7159` | `#e8533d` | `#cc3620` | `#af1200` | `#920000` | `#730000` | `#540000` |
| `--navy-*` | `#e0f1ff` | `#c5d7ff` | `#aabdec` | `#90a3d4` | `#788bbc` | `#6073a3` | `#4a5c8a` | `#364671` | `#233057` | `#121d3e` |

Avoid the hue-drifted ends for UI fills: `--blue-50` leans cyan, and `--red-700` to `--red-900` are very deep reds (suitable only as ink).

### 2.2 Role tokens per theme

Three themes: **Midnight** (default), **Light** and **Dark**. Components must use these role tokens, never raw hex.

| Token | Role | Midnight | Light | Dark |
|---|---|---|---|---|
| `--bg-top` / `--bg-bottom` | Page backdrop gradient | `#33478f` → `#120f45` | `#eef3fb` → `#e3eaf6` | `#0c0e13` → `#0a0b0f` |
| `--surface` | Cards, sheets, list groups | `#1c2a55` (navy source) | `#ffffff` | `#161a22` |
| `--surface-2` | Nested surfaces (options in sheets) | `#17224a` | `#f4f7fc` | `#11141a` |
| `--surface-3` | Translucent fills (chips, hover) | white 6% | ink 5% | white 5% |
| `--border` | Card / control outlines | `rgba(170,186,240,.42)` | `#cfd9ea` | `#2c3443` |
| `--border-soft` | Dividers | `rgba(170,186,240,.14)` | `#e4eaf4` | `#1f2530` |
| `--text` | Primary text | `#ffffff` | `navy-900` | `#f2f4f8` |
| `--muted` | Secondary text | `navy-100` | `navy-600` | `#9aa3b5` |
| `--faint` | Tertiary text (on surfaces only) | `navy-200` | `navy-500` | `#8e96a8` |
| `--primary` | Primary buttons, current state | `blue-600` | `blue-600` | `blue-600` |
| `--link` | Inline links and link buttons | `blue-200` | `blue-600` | `blue-200` |
| `--accent` | Selected tab, stat outline, highlights | `teal-200` | `teal-600` | `teal-200` |
| `--accent-ink` | Text on `--accent` | `teal-900` | `#ffffff` | `teal-900` |
| `--success` | Completed level, mastered, done | `#7ee08a` | `#177a3b` | `#6fdc80` |
| `--warn` | Flame/streak, earned badge, reminder banner | `amber-100` | `amber-600` | `amber-100` |
| `--danger` | Destructive actions | `red-300` | `red-600` | `red-300` |
| `--danger-ink` | Text on `--danger` | `red-900` | `#ffffff` | `red-900` |
| `--track` | Empty progress tracks, locked badge rings | `navy-300` | `#c9d3e6` | `#3a4252` |

The Dark theme keeps its own neutral greys for surfaces and text. It takes only the brand and status scales from the palette.

**Contrast contract (WCAG 2.2 AA).** Measured with the bundled audit; minimum across all three themes:
- `--text`, `--muted` and `--faint` on `--surface`: ≥ 4.6:1 (lowest is Light `--faint`).
- `--text` and `--muted` on the page backdrop: ≥ 5.4:1. Light `--faint` measures 3.9–4.2:1 on the backdrop, so don't place `--faint` text directly on the page backdrop; use `--muted` there. Placeholders use `--muted` for this reason.
- `--primary-ink` (white) on `--primary` (`blue-600`): 6.7:1.
- `--accent-ink` on `--accent`: ≥ 5.9:1. `--danger-ink` on `--danger`: ≥ 5.6:1.
- `--link` on `--surface`: ≥ 6.7:1.
- Status colours (`--success`, `--accent`, `--warn`, `--danger`) are ≥ 5.1:1 on `--surface`, so they're safe for text and icons.

**Colour is never the only signal.** Completed levels show a ✓ icon. Done days show "✓ Done". Locked items show a lock icon. Dot ladders carry an `aria-label` count.

**Palette gap:** the palette has no green, so `--success` keeps its hand-picked values. If a green is added, derive it from the tetradic harmony (`#24d43a`) with the same Material and OKLCH settings.

## 3. Typography

Family: **Roboto** (400 / 500 / 700 / 800), falling back to the system UI font.

| Role | Token | Size / weight | Usage |
|---|---|---|---|
| Display (`.h1`) | `--fs-3xl` | 34 / 800, −0.02em | Page titles ("Activity", greeting) |
| Title (`.h2`) | `--fs-2xl` | 24 / 800 | Section headers |
| Subtitle | `--fs-xl` | 20 / 700 | Exercise names, stat values, tutorial headings |
| Headline (`.h3`) / body large | `--fs-lg` | 18 / 700 or 400 | Card titles; overview, steps, cues |
| Body | `--fs-body` | 16 / 400 | Default |
| Label | `--fs-label` | 14 / 500–700 | Buttons, stats, list secondary text |
| Caption (`.small`) | `--fs-sm` | 13 / 400 | Meta lines ("Progression 2 of 10") |
| Micro | `--fs-xs` | 12 / 700–800 | Pills, 5-up ladder badge labels, sidebar footer |
| Emoji display | `--fs-display` | 54 | Workout summary emoji only |

Minimum text size is 12px (`--fs-xs`).

## 4. Spacing, radius, elevation

**Base unit: 4px.** Use the scale; don't invent new steps.

| Token | Value | Typical use |
|---|---|---|
| `--space-1` | 4px | Icon-label gaps |
| `--space-2` | 8px | Chip gaps, tight stacks |
| `--space-3` | 12px | Control gaps, grid gaps |
| `--space-4` | 16px | Mobile page gutter, card stack gap |
| `--space-5` | 20px | Card inset (default) |
| `--space-6` | 24px | Section separation, card inset (large) |
| `--space-8` | 32px | Desktop page gutter, major breaks |
| `--space-10` | 40px | Desktop top padding |
| `--space-16` | 64px | Desktop bottom padding |

Hairline offsets of 1–3px (borders and badge nudges) stay raw by design. `--nav-clear` (96px) is the mobile bottom padding that clears the tab bar.

| Radius | Value | Usage |
|---|---|---|
| `--r-sm` | 12px | Icon buttons, inputs inside cards, art thumbnails |
| `--r-md` | 16px | Buttons, options, stat tiles |
| `--r-lg` | 22px | Cards, sheets, nav bar corners |
| `--r-pill` | 999px | Chips, segmented control, progress bars |
| `--r-round` | 50% | Rings, dots, medals, round icon buttons |

Elevation: one shadow token, `--shadow`, used on cards, the toast and the rest bar. Sheets use a blurred scrim instead of extra shadow.

## 5. Layout

- **Mobile first.** Single column, 16px gutter, content width capped at **760px**.
- **< 960px:** fixed bottom tab bar (5 items, 26px icons, label always visible). Leave about 96px bottom padding so content clears it.
- **≥ 960px:** a 240px sticky sidebar replaces the tab bar. Content stays centred and capped at 760px.
- Grids: the Movement Library is 2 columns, or 3 from 700px. Stats are 2 columns. Streak badges are 4 columns. Ladder badges are 5 columns.
- Hero art has a max height (320–380px) so it never dominates desktop.
- **Back navigation pattern:** every drill-down page (category, exercise, workout) starts with a `.topbar` that has a 44px back or close button and a centred title.

## 6. Interaction rules

- **Touch targets ≥ 44 × 44px** (WCAG 2.5.8 floor is 24px; we target 44). Small visuals such as carousel dots and the info icon get an invisible padded hit area.
- **One primary button per view.** Use `.btn` for the primary action, `.btn.ghost` or `.btn.subtle` for secondary actions, and `.link-btn` only inside text.
- **Destructive actions** (reset, delete workout, discard workout with ticked sets) always confirm.
- **Feedback:** every save shows a toast or a summary sheet. Ticking a set starts the rest timer.
- **Motion:** tokens `--dur-press` (80ms, pressed scale), `--dur-fast` (150ms, colour and border), `--dur-base` (220ms, tab indicator, sheet settle, page fade) and `--dur-slow` (400ms, progress fill), all on `--ease` (`cubic-bezier(0.2, 0.8, 0.2, 1)`). Everything is disabled under `prefers-reduced-motion`.
- **States:** every clickable surface (options, theme options, day chips, stats, callouts, routine picker, list items, progression and mastery rows, library tiles, buttons, icon buttons, steppers, weekday buttons) has a hover style (tint toward `--accent`, only on hover-capable devices), a pressed style (`scale(0.98)`) and the global focus ring. Text inputs use an accent border plus a 3px ring instead of the outline.
- Focus is always visible: 3px `--accent` outline.

## 7. Component inventory

| Component | Class | Notes |
|---|---|---|
| Card | `.card` | `.flat` removes the shadow; `.soft` uses the soft border |
| List group / item | `.list-group`, `.list-item` | Settings rows with a trailing chevron or icon; `.danger` variant |
| Button | `.btn` (+ `.block`, `.lg`, `.ghost`, `.subtle`, `.accent`, `.danger`) | Height ≥ 48px |
| Icon button | `.icon-btn` (+ `.round`, `.bare`) | 48px square, or 44px round |
| Segmented tabs | `.segmented` | ARIA `tablist`. A sliding `--accent` indicator positioned by `--n` (segment count) and `--i` (selected index); it replays from the old position after a re-render, and focus moves to the selected tab |
| Chip | `.chip` | Muscle tags |
| Progress bar | `.progress > span` | Gradient `--primary` → `--accent` |
| Level ring | `.level-ring` (+ `.done`, `.next`, `.big`) | ✓ icon when done |
| Dot ladder | `.dots .dot` (+ `.done`, `.current`) | One dot per progression |
| Badge / medal | `.badge` (+ `.earned`) | Optional `.num` (top) and `.tier` (bottom) |
| Option row | `.opt` | Radio-style choices in sheets |
| Bottom sheet | `.overlay > .sheet` | Grab handle on mobile. Drag the handle or header down more than 90px (or flick) to close; shorter drags snap back. Esc, the scrim and ✕ also close it, and focus returns to the trigger |
| Field | `.field > label + .input` | Static label above the input |
| Toggle | `.toggle[role=switch]` | |
| Stepper | `.stepper` | − / number / + with a unit suffix. Press and hold ± to repeat (after 400ms, every 70ms) |
| Figure art | `.art` | Gradient by `--h` hue per movement family, plus a stick-figure SVG |
| Toast, banner, rest bar | `.toast`, `.banner`, `.rest-bar` | |
| Day navigator | `.day-nav` | ‹ date › inside a `.card.flat.soft`; "next" is disabled on today; "Back to today" is a `.link-btn` |
| KPI number | `.kpi > .kpi-v + .kpi-u` | One headline number per card (calories left, today's weight); `.faint` for "not logged" |
| Fact row | `.facts` | Secondary numbers under a KPI, values in `<b>` |
| Habit tile | `.tiles > .tile` | Three tappable tiles (label, value, goal, `.progress.thin`) |
| Key–value list | `.kv-list` | Latest measurement + change (`.delta`, always signed, text colour only) |
| Food list | `.food-list` | Name, kcal · protein, trailing delete icon button |
| Chip with remove | `.chip-pair > .chip + .chip-x` | Saved foods: tap to add, ✕ to forget |
| Weight chart | `.wchart` | Inline SVG, 30 days. 7-day average = 2px `--accent` line; weigh-ins = muted dots; goal = dashed muted reference shown only when in range. Hover, tap or ←/→ shows a crosshair and `.chart-tip`; "Show as table" `<details>` gives the data as `.data-table`. Single series, so no legend box, just a small `.chart-key` |
| Form grids | `.grid2`, `.grid3`, `.input-unit`, `.check` | Two- and three-column field rows in sheets |
| Utilities | `.m-0`, `.mt-*`, `.mb-*`, `.ml-*`, `.gap-*`, `.wrap`, `.text-center`, `.fw-*`, `.t-*`, `.c-*`, `.static`, `.icon-sm`, `.d-block`, `.btn.sm` | Token-backed one-liners defined last in the cascade. Use them instead of `style=""` |

## 8. Imagery

**Default art** is original vector stick figures on a per-family gradient (`--h` hue per family, shifted per progression). It is always the fallback.

**Photography (optional, AI-generated).** Images are made in Gemini from prompts in `docs/IMAGE_PROMPTS.md`. Those prompts are generated by `tools/image-prompts.js` from `data.js`, with a hand-written peak pose for each exercise.
- **Meaning.**
  - Form: realistic documentary photography, eye-level side view, soft golden-hour side light, cool blue-teal grade to match the navy and teal UI.
  - Content: the exercise's peak position with textbook form.
  - Context: the exercise's own card, list row or hero. The image is never decoration.
- **Crops.** Covers are 1:1 (Movement Library tiles, category hero). Progression images are 16:9 (home card, list rows, exercise hero, workout thumbnail). Every image keeps the subject centred so it survives the square crop.
- **Registration.** Name each file `img/<id>.webp`, then run `node tools/image-prompts.js manifest`. Ids not in `img/manifest.js` keep the stick figure.
- **Alt text.** On the exercise hero, the alt text is "Athlete demonstrating {name}". Elsewhere the image is decorative (`alt=""`), because the name is printed next to it.
- **Honesty.** Images are labelled AI-generated in Privacy & Terms. Reject and regenerate any image with wrong form, extra fingers, floating equipment or brand marks.

## 9. Naming conventions

- **Components:** `.block`, plus `.block .part` for inner parts, plus modifiers on the block (`.btn.ghost`, `.level-ring.done`).
- **State:** prefer ARIA attributes as the styling hook (`[aria-pressed]`, `[aria-checked]`, `[aria-selected]`, `[aria-current]`) over state classes. The style and the accessibility state then can't drift apart.
- **Reserved names:** `.overlay` means the modal scrim only. Text labels are `.tag-*`. `.badge` means the achievement medal only.
- **Tokens:** `--{category}-{step}`, for example `--space-4` and `--r-md`. Theme colours are semantic roles (`--muted`, `--success`), never hue names.

## 10. Audit: v1 baseline → v2 (stage 2)

Measured by a script over `styles.css` and `app.js`. Re-run it after each cleanup pass.

| Area | v1 | v2 | Target met? |
|---|---|---|---|
| Colour | 10 raw hex + 8 raw `rgba()` in component rules | 1 (`#111` for native `<option>` text). Added `--on-art`, `--on-art-muted`, `--art-dim`, `--scrim`, `--success-ink`, `--pro`, `--pro-bg`; figure SVGs use `currentColor` | ✅ (one native-control exception) |
| Spacing | 7 / 174 tokenised; off-scale 6, 10, 14, 18, 22, 28px | 173 / 200 tokenised. The rest are 1–3px hairlines plus 3 positional offsets | ✅ |
| Type | 15 distinct sizes | 9 sizes, all `--fs-*` tokens | ✅ |
| Radius | 15 distinct values | All on `--r-sm/md/lg/pill/round` (plus `0` and `inherit`) | ✅ |
| Motion | 6 raw durations | 0 raw; `--dur-*` and `--ease` | ✅ |
| Inline styles | 52 | 7, all data-driven: art hue `--h`, progress widths, theme swatch colours, tab indicator index | ✅ |
| States | 7 clickable components without hover or pressed styles | Shared hover, pressed and focus rules (§6) | ✅ |

Other gaps: no illustrations for empty states beyond icons.
