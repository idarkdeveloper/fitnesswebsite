# Design debt

Known gaps between how PulseFit looks or behaves and the rules in DESIGN.md. Each item has a severity
(Critical / Major / Minor / Cosmetic, as in `docs/RESEARCH.md`) and what would close it. Fix the top of the
list first; move an item to "Closed" with its PR when done. Anything Design QA can't measure belongs here.

## Open

| # | Item | Where | Severity | Closes when |
|---|---|---|---|---|
| 1 | **Not yet checked on the real phone**: TalkBack on tiles and the widget, the three notification categories, the largest Android font size | Android app | Major | The phone test in `docs/RESEARCH.md` §2 is done once and its findings are filed |
| 2 | Notification titles use emoji ("Time to train 💪", "Drink water 💧"); TalkBack reads them aloud | Reminders | Minor | Titles without emoji, or the emoji moved to the end |
| 3 | Chart labels inside the weight and trends charts render at about 11 px on a 360 px phone (SVG text scales with the chart) | Trends, Progress › Body | Minor | Chart label size set so it is ≥ 12 px at 360 px |
| 4 | Measurements still say "History" while weight, steps, sleep and water say "Trends" | Daily log, Progress › Body | Minor | One word for "list of past values" across the app |
| 5 | The add-water toast sits over the greeting on Today for its 5 s | Today | Cosmetic | Toast placed above the bottom menu on Today, like in sheets |

## Closed

| Item | PR |
|---|---|
| Sideways scroll and a 1,524 px bottom menu on 360 px phones | #53 |
| Squeezed "No workouts yet" card, oversized icons | #52 |
| Ten audit findings (Start off-screen, water "+", Undo, names, primaries, back link, weights, 11 px text, zero state, browser pop-ups) | #51 |
| Screen-reader names for tiles, ladders, Join buttons, badges; editor focus | #51 |

## How debt is measured

- **Escapes**: problems found on the phone after a merge (GitHub issues with the "after a recent update" box ticked). Target: none. Every escape also gets a Design QA check so it can't come back.
- **Design QA first-pass rate**: PRs whose Design QA run passed the first time. Target: above 80%.
- **This list**: open items should go down release over release.
