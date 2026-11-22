# Mizan Design Language

> Source of truth for Mizan's visual and interaction decisions.
> The tokens are implemented as CSS custom properties at the top of `styles.css`, set per theme on `<html data-theme>`.
> Status: **v1, extracted from the shipped app.** It covers colour, type, spacing, radius and the component inventory.
> Not covered yet: an icon grid spec. Last synced with the code: the design-system audit after PR #93.

## 1. Principles

1. **One next step.** Every screen answers "what do I do now?" Home leads with today's exercise and a single primary **Start** button.
2. **Progress is visible.** Levels, dot ladders, streaks and badges always show where you stand and what earns the next step.
3. **Honest and local.** Data is saved on the device first and only synced when you sign in, and the copy says so. Nothing is promised that the app can't do. Every feature is unlocked; there is no paid tier.
4. **Forgiving.** Destructive actions either ask for confirmation or offer Undo, workouts can be cancelled, and rest days never break a streak.
5. **Calm, sporty surface.** Deep gradient backdrop, rounded cards, one bright accent. Colour signals state and is never the only signal.

## 2. Colour

### 2.1 Source colours

The palette is **"Lime on Graphite"**: lime `#c6f432` (brand), lemon `#d8f86a` (secondary data), amber `#ffb86b` (streaks, warnings), coral `#ff8a7a` (danger) and mint `#3ddc97` (done, dark themes), on graphite neutrals. There are no primitive ramps in `styles.css` any more (the old `--blue/teal/amber/red/navy` ramps were removed as unused); each theme sets its role tokens directly. **No blue anywhere in the UI.**

### 2.2 Role tokens per theme — "Lime on Graphite"

Three themes: **Graphite** (default, stored as `midnight`), **Light** and **Dark**. Graphite surfaces, lime for the main action and progress, lemon for secondary data (rings, steps, water, sleep bar), amber for streaks and warnings, mint for done. Components must use these role tokens (or the semantic layer in §2.3), never raw hex.

| Token | Role | Graphite | Light | Dark |
|---|---|---|---|---|
| `--bg-top` / `--bg-bottom` | Page backdrop | `#121722` → `#0e1116` | `#f4f6f8` → `#eef1f4` | `#0a0b0e` → `#08090b` |
| `--surface` | Cards, tiles, sheets, nav | `#161b24` | `#ffffff` | `#121418` |
| `--surface-2` | Nested surfaces, stepper buttons | `#1b212c` | `#f3f5f8` | `#171a1f` |
| `--surface-3` | Translucent fills | white 5% | ink 5% | white 5% |
| `--border` | Decorative outlines | `#4a5466` | `#8a94a3` | `#474e5a` |
| `--control-border` | Outlines of controls (ticks, inputs, steppers, ghost buttons), 3:1 or more on bg and cards | `#616c80` | `#767f8e` | `#606878` |
| `--border-soft` | Card outlines, dividers | `#262d3a` | `#e1e5ea` | `#22262d` |
| `--text` | Primary text | `#f2f4f7` | `#0e1116` | `#f2f4f7` |
| `--muted` / `--faint` | Secondary / tertiary text | `#98a2b3` / `#8d97a8` | `#4b5565` / `#5b6574` | `#9aa2b0` / `#8e96a4` |
| `--primary` / `--primary-ink` | Main buttons, selected tab, progress, training-day numbers | lime `#c6f432` / `#0e1116` | olive `#3f6212` / white | lime / `#0e1116` |
| `--link` | Links | lime | olive | lime |
| `--accent` / `--accent-ink` | Secondary data (food ring, steps, water, focus ring) | lemon `#d8f86a` / `#0e1116` | olive `#4d6b06` / white | lemon / `#0e1116` |
| `--success` / `--success-ink` | Done, mastered, ticked | mint `#3ddc97` / `#0e1116` | `#2f6b10` / white | mint / `#08090b` |
| `--warn` | Streak flame, warnings | amber `#ffb86b` | `#9a4d00` | amber |
| `--danger` / `--danger-ink` | Destructive | `#ff8a7a` / `#2a0b06` | `#b42318` / white | `#ff8a7a` / `#2a0b06` |
| `--feature-bg` / `--feature-ink` (+ `-line`, `-fill`, `-fill-hover`, `-cta-ink`, `-glow`) | Today's workout card: lemon-olive gradient `#5f7d08` → `#3a5203`, white text 4.75–8.8:1 (same in every theme) | gradient / white | same | same |
| `--state-mix` | What hover/pressed fills mix toward | white | black | white |
| `--info-bg` / `--info-ink` | Info boxes, rest row (lemon-tinted) | `#232b16` / `#eef7d0` | `#eef5dc` / `#1f2a05` | `#1c2312` / `#eef7d0` |

Light uses olive instead of lime for buttons and text because lime on white is under 3:1.

**Colour is never the only signal.** Completed levels show a ✓ icon. Done days show "✓ Done". Locked items show a lock icon. Dot ladders carry an `aria-label` count.

### 2.3 Semantic layer (use this in new components)

`--color-<role>-<prominence>` for the roles **brand, info, success, warning, danger, neutral**: `-fill` (strong background), `-on-fill` (text on it), `-ink` (text/icon on a surface), `-tint` (subtle background, 12% over the surface). States: `--color-brand-fill-hover` / `-pressed`, `--color-success-fill-hover`, `--color-danger-fill-hover` (mixed toward `--state-mix`) and `--color-fill-disabled`. Surfaces: `--color-surface`, `--color-surface-raised`, `--color-bg`, `--color-control-border`, `--color-neutral-border`. Every ink and on-fill pair is 4.5:1 or more in all three themes.

## 3. Typography

Families: **Space Grotesk** (`--font-display`, 500–700) for headings and every big number (tiles, rings, week strip, set counter, stepper); **Inter** (`--font-body`, 400–800) for everything else. Both fall back to the system UI font.

| Role | Token | Size / weight | Usage |
|---|---|---|---|
| Display (`.h1`) | `--fs-3xl` | 34 / 800, −0.02em | Page titles ("Activity", greeting) |
| Title (`.h2`) | `--fs-2xl` | 24 / 800 | Section headers |
| Subtitle | `--fs-xl` | 20 / 700 | Exercise names, stat values, tutorial headings |
| Headline (`.h3`) / body large | `--fs-lg` | 18 / 700 or 400 | Card titles; overview, steps, cues |
| Body | `--fs-body` | 16 / 400 | Default |
| Label | `--fs-label` | 14 / 500–700 | Buttons, stats, list secondary text |
| Caption (`.small`) | `--fs-sm` | 13 / 400 | Meta lines ("Stage 2 of 10") |
| Micro | `--fs-xs` | 12 / 700–800 | Pills, 5-up ladder badge labels, sidebar footer |
| Nav label | `--fs-2xs` | 11 / 600 | Bottom menu labels only (six items) |
| Numbers | `--fs-num-sm` / `-md` / `-lg` | 26 / 28 / 40 | Big values in tiles, the food card and stat tiles |
| Emoji display | `--fs-display` | 54 | Workout summary emoji only |

Minimum text size is 12px (`--fs-xs`), except the bottom-menu labels (11px). Raw `font-size` px values are only used for one-off display numbers.

## 4. Spacing, radius, elevation

**Base unit: 4px.** Use the scale; don't invent new steps.

| Token | Value | Typical use |
|---|---|---|
| `--space-0_5` | 2px | Hairline gaps (label over value) |
| `--space-1` | 4px | Icon-label gaps |
| `--space-1_5` | 6px | Tight chip and strip gaps |
| `--space-2` | 8px | Chip gaps, tight stacks |
| `--space-2_5` | 10px | Tile and card internal gaps |
| `--space-3` | 12px | Control gaps, grid gaps |
| `--space-3_5` | 14px | Quick-tile padding |
| `--space-4` | 16px | Mobile page gutter, card stack gap |
| `--space-5` | 20px | Card inset (default) |
| `--space-6` | 24px | Section separation, card inset (large) |
| `--space-8` | 32px | Desktop page gutter, major breaks |
| `--space-10` | 40px | Desktop top padding |
| `--space-16` | 64px | Desktop bottom padding |

Hairline offsets of 1px and 3px (borders and badge nudges) stay raw by design; every other padding, margin and gap uses the scale. `--nav-clear` (96px) is the mobile bottom padding that clears the tab bar.

| Radius | Value | Usage |
|---|---|---|
| `--r-sm` | 14px | Buttons, inputs, week-strip days, quick-add button |
| `--r-md` | 20px | Cards, tiles, hero card, large buttons |
| `--r-lg` | 24px | Stepper card, sheets, floating nav |
| `--r-pill` | 999px | Chips, segmented control, progress bars |
| `--r-round` | 50% | Rings, dots, medals, round icon buttons |

Elevation: one shadow token, `--shadow`, used on cards and the rest bar; the workout card uses `--feature-glow`. Sheets use a blurred scrim instead of extra shadow.

## 5. Layout

- **Mobile first.** Single column, 16px gutter, content width capped at **760px**.
- **< 960px:** a floating rounded bottom menu, 12px from the sides and bottom, 24px corners (six items: Today, Exercise, Meal, Care, Routine, Profile; 22px icons, label always visible; the current one is lime with a Material-style pill behind the icon). `--nav-clear` (104px) keeps content clear of it.
- **Never wider than the screen.** `html, body` clip horizontal overflow; scroll rows (`.h-scroll`) and anything holding positioned children (`.badge`, `.ch-mini`) are `position: relative`; labels that could grow at large Android text sizes wrap instead of `nowrap`.
- **≥ 960px:** a 240px sticky sidebar replaces the tab bar. Content stays centred and capped at 760px.
- Grids: the Movement Library is 2 columns, or 3 from 700px. Stats are 2 columns. Streak badges are 4 columns. Ladder badges are 5 columns.
- Hero art has a max height (320–380px) so it never dominates desktop.
- **Summaries on Today, details in sheets.** Today holds only what you act on now, in this order: greeting with streak; **My day** (progress ring, next item, one-tap tick); **Today's workout** (lemon-olive `--feature-*` card, white text); the **week strip** (rolling: the last five days, today and tomorrow); the **14-week plan** (a plain card with lime numbers); the dismissible "New here?" tip; **Today at a glance**: the food card and the four quick tiles. Anything with a list opens a sheet. Don't add another full card to Today: add a summary row and a sheet.
- **Week strip:** today has a dark fill with a lime ring; workout days (Tue, Thu, Sat) an olive tint with a lime number; no dot on plain rest days.
- **Rest day:** the workout card shows "Rest day", one line of advice and two actions: **Log a walk** and **10-min mobility** (a sheet of 9 warm-up moves).
- **Food card:** a bold **FOOD** title with the barcode and **+** buttons in a top row; the ring shows only the %; the kcal eaten is large, with "of 2,190 · 840 left" under it (no target: "–" in the ring and "No target yet · Set your target"); **Protein, Fat, Sugar, Salt** as four small tiles on one line (Protein highlighted, the others turn amber when over); the day's planned meals as tick rows (a tick logs the meal); "Today's food (n)" opens the logged list.
- **Quick tiles:** an icon on a tinted square in front of the name, one colour per tile (`.t-lime` weight, `.t-accent` steps and water, `.t-amber` sleep); empty tiles say "Not logged · goal …".
- **Today's workout card:** on a training day a picture header (first exercise) with a time badge, the routine name, exercise and set counts, a row of 56px exercise thumbnails, a full-width white Start button, and the full list folded into "See all" (`<details>`).
- **Routine page:** the day as a timeline (wake, care routines, meals, prayers, workout, walk, wind down, sleep), each with a tick; previews for day off, early and late shift. **Prayer times** are worked out on the phone (`prayer.js`) and pinned at their time, with "before you wake: set an alarm" and "during your shift: pray in your break" notes; Friday shows Jumu'ah.
- **Exercises page:** a picture grid (2 columns, 3 from 700px), dumbbell exercises first under "With dumbbells", then "Bodyweight".
- **Workout set screen:** "Exercise n of N" eyebrow, "Set x of y" 34px title, Target and Last set tiles, a stepper card with 56px buttons and a 64px number, a rest row with Change, and a full-width 60px "Set done" button.
- **Daily log is split into tabs** (Food · Body · Steps & sleep, a `.segmented` control). Each tab can be linked as `#/track/<tab>`. Body holds weight, body fat & muscle, and measurements.
- **Back navigation pattern:** every drill-down page (category, exercise, workout) starts with a `.topbar` that has a 44px back or close button and a centred title.

## 6. Interaction rules

- **Touch targets ≥ 44 × 44px** (WCAG 2.5.8 floor is 24px; we target 44). Small visuals such as carousel dots and the info icon get an invisible padded hit area.
- **One primary button per view.** Use `.btn` for the primary action, `.btn.ghost` or `.btn.subtle` for secondary actions, and `.link-btn` only inside text.
- **Destructive actions** that lose a lot (reset, delete workout, discard workout with ticked sets) always confirm. Small, quick removals (a logged food) skip the confirm and show an **Undo** toast for 5 s instead.
- **Feedback:** every save shows a toast (a one-line pill above the menu; Undo is a small lime button) or a summary sheet. Ticking a set starts the rest timer.
- **Motion:** tokens `--dur-press` (80ms, pressed scale), `--dur-fast` (150ms, colour and border), `--dur-base` (220ms, tab indicator, sheet settle, page fade) and `--dur-slow` (400ms, progress fill), all on `--ease` (`cubic-bezier(0.2, 0.8, 0.2, 1)`). Everything is disabled under `prefers-reduced-motion`.
- **Motion patterns** (the 12 principles, applied sparingly):
  - **Sheets** rise in on `--ease` and leave the way they came: down and fading, 170ms, accelerating (`.closing`), for the close button, Esc, the back gesture and tapping outside alike.
  - **Dragging a sheet up** gives at most 28px with resistance (rubber banding), then springs back past rest and settles (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
  - **Lists** (exercises, ladders, Trends, measurement dates) rise in one after another, 30ms apart, capped at 210ms.
  - **The segmented control's pill** slides from the tab you left (`.seg-slide`) even though the view re-renders.
  - **A ticked set** squashes and overshoots (`.pop`, 320ms).
  - **The end of a workout** grows the medal in with an overshoot. A level-up or new badge adds a burst of 12 sparks on curved paths (peak-end rule: the best moment is the most designed one).
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
| Bottom sheet | `dialog.sheet` (native, `showModal()`) | Grab handle on mobile; centred card from 700px. Drag the handle or header down more than 90px (or flick) to close; shorter drags snap back. Esc, the Android back gesture, tapping the scrim (`closedby="any"`, with a fallback for Safari) and ✕ also close it. The browser makes the page inert, keeps focus inside and returns it to the trigger, so there is no hand-written focus trap. Scroll on the scrim doesn't move the page (`overscroll-behavior: contain`) |
| Field | `.field > label + .input` | Static label above the input |
| Toggle | `.toggle[role=switch]` | |
| Stepper | `.stepper` | − / number / + with a unit suffix. Press and hold ± to repeat (after 400ms, every 70ms) |
| Figure art | `.art` | Gradient by `--h` hue per movement family, plus a stick-figure SVG |
| Toast, banner, rest bar | `.toast` (`popover="manual"`), `.banner`, `.rest-bar` | The toast is a top-layer popover. While a sheet is open it is placed inside the sheet so its Undo button stays usable, and moves back to the page when the sheet closes |
| Day navigator | `.day-nav` | ‹ date › inside a `.card.flat.soft`; "next" is disabled on today; "Back to today" is a `.link-btn` |
| KPI number | `.kpi > .kpi-v + .kpi-u` | One headline number per card (calories left, today's weight); `.faint` for "not logged" |
| Fact row | `.facts` | Secondary numbers under a KPI, values in `<b>` |
| Habit tile | `.tiles > .tile` | Three tappable tiles (label, value, goal, `.progress.thin`) |
| Key–value list | `.kv-list` | Latest measurement + change (`.delta`, always signed, text colour only) |
| Food list | `.food-list` | Name, kcal · protein, trailing delete icon button |
| Chip with remove | `.chip-pair > .chip + .chip-x` | Saved foods: tap to add, ✕ to forget |
| Weight chart | `.wchart` | Inline SVG, 30 days. 7-day average = 2px `--accent` line; weigh-ins = muted dots; goal = dashed muted reference shown only when in range. Hover, tap or ←/→ shows a crosshair and `.chart-tip`; "Show as table" `<details>` gives the data as `.data-table`. Single series, so no legend box, just a small `.chart-key` |
| Form grids | `.grid2`, `.grid3`, `.input-unit`, `.check` | Two- and three-column field rows in sheets |
| Navigation | `.tabbar` / `.sidebar` | Four tabs: Today, Movements, Progress, Profile. Hidden during a workout (`body[data-route="workout"]`) |
| Week strip | `.wk-strip > .wk-day` | Mon–Sun; `.sel` (accent outline), `.done` (success ✓), dumbbell = training day, dot = rest |
| Session row | `.sess-row` | Thumbnail, name, meta, level dots (`.segs.dots`) |
| Segment bar | `.segs` (+ `.wide`, `.dots`) | `i.done` success, `i.cur` primary, `i.lock` dimmed, others `--track` |
| Ring | `ringSvg()` + `.ring-wrap > .ring-c` | `--accent` arc on `--track`; calories left on Today, grocery progress |
| Quick tile | `.q-grid > .q-tile` (+ `.t-lime`, `.t-accent`, `.t-amber`) | An icon on a tinted square in front of the name (`.q-head > .q-ic + .k`), value, one status line, a 6px bar. One colour per tile (`--tone`): lime weight, lemon steps and water, amber sleep. The whole tile opens its editor; water also has a `+ 250 ml` button (`.q-chip`) in place of the bar |
| Tick | `.rt-tick` (+ `.sm`, `.on`) | A 44px (40px `.sm`) round tick with a `--control-border` outline; `.on` fills mint with a check. Used on Routine, My day and meal ticks. `aria-pressed` carries the state |
| Macro tiles | `.mac-row > .mac` (+ `.protein`, `.over`) | Four equal tiles on one line (two per row under 380px): label, value / limit, 4px bar. Protein is lime; Fat, Sugar, Salt turn amber when over the daily amount |
| Meal ticks | `.meal-ticks > li` | A tick, the meal name and dish, and kcal on the right; ticking logs the planned meal, a logged meal is struck through |
| Feature card | `.workout-card.lime-card` | Today's workout on the `--feature-*` tokens: lemon-olive gradient, white text, frosted outline buttons, a white Start button |
| Status list | `.mv-list > .mv-row` | Movements; `.fchip` filter chips |
| Hero header | `.ex-hero2`, `.wo-hero` | Photo with fade, glass controls (`.glass`, `.glass-chip`, `.glass-btn`) |
| Level card | `.lvl-card .lv-row > .lv` | Three bars: done / current (sets hit) / off |
| Set card | `.set-card .big-step` | 64px number, 56px round steppers; main button `.done-btn` (success) or `.rest-btn` (countdown) |
| Stat trio | `.stat3 > .s3` | Progress header; `.hot` accent border for the streak |
| Ladder row | `.lad-row` | Family dot (`--h` hue), name, wide segment bar, count (mastered / total) |
| Group label | `.group-label` | Uppercase section label above list groups (Profile, Groceries) |
| Food picker | `.search`, `.pick .pill-step`, `.plan-pick`, `.rough` | Add food sheet |
| Loading | `.boot`, `.sk`, `.load-ring` | Three, each for one kind of wait. **Launch** (`#boot`): the heart mark with the pulse line drawing itself, shown while the app's files load; its content appears only after 250 ms. **Skeleton** (`.sk` blocks in `.sk-page`): the page's shape while a newly signed-in device with nothing saved fetches its data; 8 s at most, never over local data. **Progress ring** (`.load-ring > .ring-wrap.lg`): only where progress is really known (Health Connect reads, one step each). No spinner anywhere else |
| Step tick list | `.care-steps > li > .cs-row` (+ `.cs-box`) | The steps of a care routine; each row is a button with `aria-pressed`. On Routine a routine's card (`.rt-fold > .rt-head[aria-expanded]`) unfolds it; the same list is in the routine's sheet. All steps ticked = routine done |
| Plan day strip | `.pd-strip > .pd` | Day + kcal; `.logged` state on planned meals |
| Utilities | `.m-0`, `.mt-*`, `.mb-*`, `.ml-*`, `.gap-*`, `.wrap`, `.text-center`, `.fw-*`, `.t-*`, `.c-*`, `.static`, `.icon-sm`, `.d-block`, `.btn.sm` | Token-backed one-liners defined last in the cascade. Use them instead of `style=""` |

## 8. Imagery

- **Icons are Google Material Symbols** (Rounded, weight 400, Apache-2.0), inlined in `ICONS` in `app.js` as one filled path each, so they work offline and within the CSP. `icon(name)` draws them in the text colour on a 24 grid. Add a new one by taking the symbol's 24px SVG path from Google Fonts and wrapping it in `G(...)`. Only the three exercise figures (pushup, pullup, squat) are drawn for Mizan, because Google has no symbol for them.

- **Dumbbell exercises use pencil sketches** (`img/sketch/<id>.svg`, drawn by `node tools/sketches.js`): an outlined side-view figure on paper `#f4f1ea`, the working muscles filled lime, a dashed arrow for the direction of movement. Every weight step of an exercise shows that exercise's sketch. They are shown whole (`object-fit: contain`), never cropped.

**Default art** is original vector stick figures on a per-family gradient (`--h` hue per family, shifted per progression). It is always the fallback.

**Photography (optional, AI-generated).** Images are made in Gemini from prompts in `docs/IMAGE_PROMPTS.md`. Those prompts are generated by `tools/image-prompts.js` from `data.js`, with a hand-written peak pose for each exercise.
- **Meaning.**
  - Form: realistic documentary photography, eye-level side view, soft golden-hour side light, cool blue-teal grade to match the navy and teal UI.
  - Content: the exercise's peak position with textbook form.
  - Context: the exercise's own card, list row or hero. The image is never decoration.
- **Crops.** Covers are 1:1 (Movement Library tiles, category hero). Progression images are 16:9 (home card, list rows, exercise hero, workout thumbnail). Every image keeps the subject centred so it survives the square crop.
- **Registration.** Name each file `img/<id>.webp`, then run `node tools/image-prompts.js manifest`. Ids not in `img/manifest.js` keep the stick figure.
- **Alt text.** On the exercise hero, the alt text is "Athlete demonstrating {name}". Elsewhere the image is decorative (`alt=""`), because the name is printed next to it.
- **Photos are AI-generated in Figma** (`generate_image`, prompts from `img/prompts.json`, one fixed athlete description so it is the same person everywhere). Reject and regenerate any image with wrong form. Sketches (`img/sketch/`) are the fallback.
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

## 11. Design QA

Every PR that changes the site runs `tools/design-qa.js` (`.github/workflows/design-qa.yml`): Galaxy S24,
Galaxy S8 and Pixel 7 widths × Android text size 100 / 130 / 160% × eight screens and two sheets. It fails on:

- anything reaching past the screen edge (sideways scroll);
- a control smaller than 24 × 24px (a checkbox counts its label);
- text under 12px at the default text size, including chart labels as drawn (SVG text scales with its chart);
- an inline icon larger than 48px (an unsized `<svg>`);
- a bottom menu wider than the screen or taller than 72px;
- page errors, console errors, or a browser `confirm()`/`alert()` (use `askConfirm`).

And once per theme (Midnight, Light, Dark) on the Galaxy S24 width:

- text contrast below 4.5:1 (3:1 for large text) against what is really behind it, composited through
  semi-transparent surfaces and checked against both ends of the page gradient;
- a Tab stop that is invisible or has no 2px+ focus ring.

Known gaps that Design QA can't measure are listed in `docs/DESIGN-DEBT.md`. Report problems with the
"Something looks or works wrong" issue form on GitHub.

Run it locally while serving the repo on port 8765: `node tools/design-qa.js`. It writes `design-qa/design-qa.md`
and a screenshot per phone and screen. Research and process notes: `docs/RESEARCH.md`.

## Words

One name per thing, everywhere in the app:

| Say | Means | Not |
|---|---|---|
| **Exercise** | A family such as Pushups or Squats (the Exercises tab) | movement, family |
| **Progression** | One step on an exercise's ladder, such as Incline Pushups | exercise, variation |
| **Level** | One of the three targets inside a progression | stage |
| Position | `Pushups · 2 of 10` | `Pushups 2`, `Day 7 of 7` |

Numbers use `toLocaleString('en-US')` (`1,775 kcal`), and weights always carry their unit (`25.2 kg to goal`).


## 11b. Layout rules (from the layout audit)

- **Page header:** every page starts with a 34px `.h1` and one muted line of context under it (Today: the date; Exercise: "23 exercises · 0 mastered"; Meal, Routine, Care: what the page covers). Profile's account card plays that role.
- **Rhythm:** 16px between cards, 24px above a section title (`.sec-head`, `.mv-h`), 12px from a title to its content. Section titles are 20px `.h2` outside cards; small uppercase group labels are only for Profile settings.
- **One food card:** Today, Meal and the Daily log all use the same food card (ring, FOOD title, kcal eaten, four macro tiles). Meal adds Add food / Scan and the list of logged items. History lives in a sheet ("History · last 14 days ›").
- **One day-strip look:** the Today week strip and the Meal plan strip use the same cells (64px, `--r-sm`, today/selected with a lime ring).
- **Routine rows:** plain items are text on the timeline (no box); only the next item and fold-out routines are boxed cards.
- **Switches:** "on" is lime (`--primary`); mint (`--success`) is only for done ticks.
- **Chip rows** must fit one line at 390px: Routine "This day · Off · Early · Late"; Care tabs "Skin · Teeth · Hair · Home · Products".
- **Exercise art placeholder:** graphite with a lime figure (shown while a photo loads), never a neon gradient.

## 12. Formats and words

- **Dates are day-first:** "Sunday 22 November", short "Sun 22 Nov" (no ordinals). Times are 24-hour ("15:00"). Use `fmtLong` / `fmtShort` or `toLocaleDateString('en-GB', …)`, never `en-US`.
- **Exercise ladder:** an exercise has **stages** (was "progressions"); a stage has **levels**. "Steps" only means walking.
- **Empty states** say what is missing and what to do: "Nothing logged in the last 2 weeks. Foods you add appear here by day."

## 13. States checklist

Every interactive component has: a visible focus (global `:focus-visible`, 2px), a pressed state, a hover on pointer devices (`@media (hover: hover)`), and a disabled state (`opacity .45`, `cursor: not-allowed`). Unchecked controls use `--control-border` (3:1).
