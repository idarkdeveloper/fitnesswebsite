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

## 2. Themes and colour tokens

Three themes: **Midnight** (default), **Light** and **Dark**. Components must use tokens, never raw hex.

| Token | Role | Midnight | Light | Dark |
|---|---|---|---|---|
| `--bg-top` / `--bg-bottom` | Page backdrop gradient | `#33478f` → `#120f45` | `#eef3fb` → `#e3eaf6` | `#0c0e13` → `#0a0b0f` |
| `--surface` | Cards, sheets, list groups | `#1c2a55` | `#ffffff` | `#161a22` |
| `--surface-2` | Nested surfaces (options in sheets) | `#17224a` | `#f4f7fc` | `#11141a` |
| `--surface-3` | Translucent fills (chips, hover) | white 6% | ink 5% | white 5% |
| `--border` | Card / control outlines | `rgba(170,186,240,.42)` | `#cfd9ea` | `#2c3443` |
| `--border-soft` | Dividers | `rgba(170,186,240,.14)` | `#e4eaf4` | `#1f2530` |
| `--text` | Primary text | `#ffffff` | `#0f1b33` | `#f2f4f8` |
| `--muted` | Secondary text | `#bcc5e8` | `#56637e` | `#9aa3b5` |
| `--faint` | Tertiary text (on surfaces only) | `#a3aed6` | `#5a6680` | `#8e96a8` |
| `--primary` | Primary buttons, links, current state | `#2466d4` | `#1f6fe0` | `#2566d6` |
| `--accent` | Selected tab, streak/stat outline, highlights | `#4fd1c5` | `#0b7a72` | `#36d6c8` |
| `--success` | Completed level, mastered, done | `#7ee08a` | `#177a3b` | `#6fdc80` |
| `--warn` | Flame/streak, earned badge, reminder banner | `#f5b942` | `#946200` | `#f5b942` |
| `--danger` | Destructive actions | `#ff6b7a` | `#d33b4c` | `#ff6b7a` |
| `--track` | Empty progress tracks, locked badge rings | `#8e9bd0` | `#c9d3e6` | `#3a4252` |

**Contrast contract (WCAG 2.2 AA).** Measured with the bundled audit:
- `--text`, `--muted` and `--faint` reach ≥ 4.5:1 on `--surface` in every theme.
- `--text` and `--muted` also reach ≥ 4.5:1 on the page backdrop. Midnight `--faint` measures 3.9:1 at `--bg-top`, so don't place `--faint` text directly on the page backdrop; use `--muted` there.
- `--primary-ink` (white) on `--primary` is ≥ 5:1.
- Status colours (`--success`, `--accent`, `--warn`, `--danger`) are ≥ 4.5:1 on `--surface`, so they're safe for text and icons.

**Colour is never the only signal.** Completed levels show a ✓ icon. Done days show "✓ Done". Locked items show a lock icon. Dot ladders carry an `aria-label` count.

## 3. Typography

Family: **Roboto** (400 / 500 / 700 / 800), falling back to the system UI font.

| Role | Size / weight | Usage |
|---|---|---|
| Display (`.h1`) | 34 / 800, −0.02em | Page titles ("Activity", greeting) |
| Title (`.h2`) | 24 / 800 | Section headers |
| Headline (`.h3`) | 18 / 700 | Card titles |
| Body large | 17–18 / 400 | Exercise overview, tutorial steps, cues |
| Body | 16 / 400 | Default |
| Label | 14–15 / 500–700 | Buttons, stats, list secondary text |
| Caption (`.small`) | 13 / 400 | Meta lines ("Progression 2 of 10") |

Minimum text size is 12px, used only for the 5-up ladder badge labels.

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

| Radius | Value | Usage |
|---|---|---|
| `--r-sm` | 12px | Icon buttons, inputs inside cards, art thumbnails |
| `--r-md` | 16px | Buttons, options, stat tiles |
| `--r-lg` | 22px | Cards, sheets, nav bar corners |
| pill | 999px | Chips, segmented control, progress bars |

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
- **Motion:** 150–250ms fades and slides only, all disabled under `prefers-reduced-motion`.
- Focus is always visible: 3px `--accent` outline.

## 7. Component inventory

| Component | Class | Notes |
|---|---|---|
| Card | `.card` | `.flat` removes the shadow; `.soft` uses the soft border |
| List group / item | `.list-group`, `.list-item` | Settings rows with a trailing chevron or icon; `.danger` variant |
| Button | `.btn` (+ `.block`, `.lg`, `.ghost`, `.subtle`, `.accent`, `.danger`) | Height ≥ 48px |
| Icon button | `.icon-btn` (+ `.round`, `.bare`) | 48px square, or 44px round |
| Segmented tabs | `.segmented` | ARIA `tablist`; the selected tab uses `--accent` |
| Chip | `.chip` | Muscle tags |
| Progress bar | `.progress > span` | Gradient `--primary` → `--accent` |
| Level ring | `.level-ring` (+ `.done`, `.next`, `.big`) | ✓ icon when done |
| Dot ladder | `.dots .dot` (+ `.done`, `.current`) | One dot per progression |
| Badge / medal | `.badge` (+ `.earned`) | Optional `.num` (top) and `.tier` (bottom) |
| Option row | `.opt` | Radio-style choices in sheets |
| Bottom sheet | `.overlay > .sheet` | Esc, the scrim and ✕ all close it; focus returns to the trigger |
| Field | `.field > label + .input` | Static label above the input |
| Toggle | `.toggle[role=switch]` | |
| Stepper | `.stepper` | − / number / + with a unit suffix |
| Figure art | `.art` | Gradient by `--h` hue per movement family, plus a stick-figure SVG |
| Toast, banner, rest bar | `.toast`, `.banner`, `.rest-bar` | |

## 8. Imagery

Movement art is **original vector stick figures** on a per-family gradient. Each family has a fixed hue, shifted slightly per progression. This art is a deliberate placeholder system rather than final photography. If photography is added later, keep the 16:9 / 1:1 crops and the same gradient as a loading state.

## 9. Naming conventions

- **Components:** `.block`, plus `.block .part` for inner parts, plus modifiers on the block (`.btn.ghost`, `.level-ring.done`).
- **State:** prefer ARIA attributes as the styling hook (`[aria-pressed]`, `[aria-checked]`, `[aria-selected]`, `[aria-current]`) over state classes. The style and the accessibility state then can't drift apart.
- **Reserved names:** `.overlay` means the modal scrim only. Text labels are `.tag-*`. `.badge` means the achievement medal only.
- **Tokens:** `--{category}-{step}`, for example `--space-4` and `--r-md`. Theme colours are semantic roles (`--muted`, `--success`), never hue names.

## 10. Audit baseline (v1) and known gaps

Measured by a script over `styles.css` and `app.js`. Re-run it after each cleanup pass.

| Area | State at v1 | Target |
|---|---|---|
| Colour | All theme colours tokenised. 10 raw hex and 8 raw `rgba()` values remain in component rules: art overlays, success-ink `#0b2a14`, Pro gold `#ffd76a` and the sheet scrim. | Add `--success-ink`, `--pro`, `--scrim` and `--on-art` tokens; 0 raw colours |
| Spacing | 7 of 174 spacing declarations use `--space-*`. Off-scale values: 6, 10, 14, 18, 22 and 28px. | ≥ 90% tokenised; no off-scale values |
| Type | 15 distinct font sizes against 7 documented roles | `--fs-*` tokens for the 7 roles; at most 9 sizes |
| Radius | 15 distinct radius values against 4 tokens | Use `--r-sm`, `--r-md`, `--r-lg` and pill only |
| Motion | 6 distinct durations, none tokenised | `--dur-fast` (150ms), `--dur-base` (220ms), plus one easing |
| Inline styles | 52 `style=""` attributes in rendered HTML | Replace with utilities or modifiers; inline styles only for the dynamic `--h` hue |
| States | No hover state on `.opt`, `.theme-opt`, `.day-chip`, `.prog-row`, `.mastery-row`, `.stat` or `.badge-callout` | Every clickable surface gets a hover style and a pressed style |

Other gaps: no illustrations for empty states beyond icons.
