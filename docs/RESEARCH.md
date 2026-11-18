# PulseFit user research

PulseFit has one user: its owner. That changes the methods, not the need. The questions are still "does it
fit the day it lives in?" and "where does it get in the way?". Research here is a few minutes a day, run by
the owner on his own phone, with the app's own logs as the behavioural record.

## 1. What we already know (synthesis of the build so far)

Every feature request and bug report since the start (PRs #1–#53) is a research note: it says what the
owner tried to do and where the app fell short. Grouped by the job he was trying to get done:

| Job ("when …, I want to …") | Evidence (requests and reports) | Status |
|---|---|---|
| When I eat, log it in seconds, including Indian dishes and restaurant food | Asked for dishes like pizza and Amritsari kulcha, then for them in food search; label nutrients from a supermarket pack (fat, sat, sugar, salt); deleting a logged food | Built: dish search, nutrients, delete. **Unknown:** how long logging a meal actually takes on the phone |
| Trust what the watch recorded, without typing it twice | Steps and sleep from Health Connect; "sleep does not update" | Built: sync, sleep status. **Unknown:** how often sync is late or missing |
| Be reminded at the right moment, and only for what I want | "Reminders don't send notifications", exact alarms, water reminders, titles | Built: reminders, three categories. **Unknown:** which reminders get acted on vs swiped away |
| See whether I'm moving toward 85–90 kg | Weight trend, history of steps, sleep and water, weight in History | Built: Trends. **Unknown:** whether the weekly trend changes behaviour |
| Fix yesterday's mistakes | Edit past days, water amount mismatch (1.25 vs 1.3) | Built: date field, Undo, consistent litres |
| Cook the plan without guessing | "Tell diced or long" for chopped vegetables | Built: cut style in recipes |
| Use it comfortably on my Galaxy | Sideways scroll, squeezed card, big bottom menu | Fixed in #52, #53; now guarded by Design QA on every PR |

Pattern: most problems were found by **using the app on the real phone**, not by reading code. The plan
below makes that deliberate instead of accidental.

## 2. Phone usability test (15 minutes, once after each big release)

Do each task on the phone, with the app as you normally use it. Note the time, whether it worked first try,
and anything that made you hesitate. Five of these over a few releases find most usability problems.

1. **Log lunch**: add a dish you actually ate (search by name), then its drink. Target: under 30 s.
2. **Undo a mistake**: tap "+ 250 ml" on Water, then undo it from the message.
3. **Fix yesterday**: open Trends → Steps, change yesterday's value, come back.
4. **Check the watch**: open the Galaxy Watch line on Today. Did last night's sleep arrive? Does the status make sense?
5. **Start a workout** from Today and finish the warm-up.
6. **Reminders**: Android Settings › Apps › PulseFit › Notifications. Are Workout, Water and Meal plan listed separately? Turn one off.
7. **TalkBack** (Settings › Accessibility › TalkBack): touch the Water tile and the home-screen widget. Is what you hear useful?
8. **Big text**: Settings › Display › Font size to the largest. Open Today, Progress and Meal plan. Anything cut off or sideways?

Report a problem with: a screenshot, what you tried, what you expected, what happened.

## 3. Two-week diary study

Every evening, one line in your phone's notes app (or a chat message), for 14 days:

- **Today the app helped me …** (one thing)
- **Today the app got in my way when …** (one thing, or "nothing")
- **I didn't log … because …** (if anything was skipped)

The app's own data is the behavioural half of the diary, read at the end of the two weeks (Profile › Export or
import data gives the full log):

| Measure | From | Why it matters |
|---|---|---|
| Days with any food logged / 14 | food log | Is logging sustainable? |
| Food entries per logged day | food log | Are whole days captured or just lunch? |
| Days water goal met / 14 | water | Are water reminders working? |
| Workouts done vs planned | workouts | Does the plan fit the week? |
| Weigh-ins / 14, and 7-day average change | weight | Is the trend visible and moving? |
| Days steps and sleep came from the watch / 14 | Health Connect marks | Is sync reliable? |

## 4. Synthesis and what happens next

At the end of each two weeks (10 minutes):

1. Put the diary lines into three piles: **helped**, **got in the way**, **skipped**.
2. Pick the **three most repeated** "got in the way" items. Those are the next PRs.
3. Compare the measures with the previous two weeks. One measure going the wrong way is worth a question.

Decisions this research should inform:

- Is food logging fast enough to keep, or does it need a "same as yesterday" shortcut?
- Which reminders earn their notification, and which should go?
- Is the Trends sheet used, or should one number move onto Today?
- Does Progress motivate, or is the Today streak enough?

## 5. How changes are made (design ops for a team of one)

- **Request → draft PR → you say "merge it".** Nothing merges without that.
- **Every PR that touches the site runs Design QA** (`.github/workflows/design-qa.yml`): three phone sizes ×
  three Android text sizes × eight screens and two sheets. It blocks sideways overflow, tiny targets, text
  under 12 px, oversized icons, a stretched bottom menu, page errors and browser pop-ups. Run it locally with
  `node tools/design-qa.js` while serving the repo on port 8765.
- **The PR template** asks for screenshots at phone width and the tests that were run.
- **Report a problem** with the GitHub issue form "Something looks or works wrong": where, what you
  expected, what happened (screenshot), how bad, which phone. Tick "after a recent update" when a merge
  caused it: that is an *escape*, and each escape gets a new Design QA check.
- **Design debt** (`docs/DESIGN-DEBT.md`) lists what is known and not yet fixed, with the measures:
  escapes (target none), Design QA first-pass rate (target above 80%), and open items going down.
- **Bug severity** (used in PR descriptions): *Critical*: you can't do the task. *Major*: you can, but it is
  confusing or wrong. *Minor*: looks off. *Cosmetic*: only a designer would notice.
- **DESIGN.md is the source of truth** for tokens and rules; change it in the same PR as the code.
