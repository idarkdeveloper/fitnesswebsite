# Design debt

Known gaps between how PulseFit looks or behaves and the rules in DESIGN.md. Each item has a severity
(Critical / Major / Minor / Cosmetic, as in `docs/RESEARCH.md`) and what would close it. Fix the top of the
list first; move an item to "Closed" with its PR when done. Anything Design QA can't measure belongs here.

## Open

| # | Item | Where | Severity | Closes when |
|---|---|---|---|---|
| 1 | **Not yet checked on the real phone**: TalkBack on tiles and the widget, the three notification categories, the largest Android font size | Android app | Major | The phone test in `docs/RESEARCH.md` §2 is done once and its findings are filed |

## Closed

| Item | PR |
|---|---|
| Emoji in notification titles (read aloud by TalkBack) | #56 |
| Chart labels under 12 px; now about 12.4 px at 360 px, and Design QA measures chart labels | #56 |
| Measurements said "History" while everything else said "Trends" | #56 |
| The water toast covered the Today greeting; toasts now sit above the bottom menu | #56 |
| Sideways scroll and a 1,524 px bottom menu on 360 px phones | #53 |
| Squeezed "No workouts yet" card, oversized icons | #52 |
| Ten audit findings (Start off-screen, water "+", Undo, names, primaries, back link, weights, 11 px text, zero state, browser pop-ups) | #51 |
| Screen-reader names for tiles, ladders, Join buttons, badges; editor focus | #51 |

## How debt is measured

- **Escapes**: problems found on the phone after a merge (GitHub issues with the "after a recent update" box ticked). Target: none. Every escape also gets a Design QA check so it can't come back.
- **Design QA first-pass rate**: PRs whose Design QA run passed the first time. Target: above 80%.
- **This list**: open items should go down release over release.
