# PulseFit Accounts and Cloud Sync: Backend Design (light version)

Status: **proposed: light version chosen 2026-11-07, awaiting approval to build**. No backend code exists yet. Implementation starts only after approval.

Scope: optional sign-in, cloud backup and phone-and-laptop sync for one person. The SPA files are `index.html`, `app.js` and `data.js`.

The earlier full design is in git history (commit `73b0faf`). It covered up to 1,000 users, with an op log, a custom sync API and revision cursors. Go back to it only if the app is ever opened to other people.

## 0. Decisions

| # | Decision | Source |
|---|---|---|
| 1 | Stay on GitHub Pages (`<user>.github.io`). No custom domain. | Owner, 2026-11-07 |
| 2 | Theme syncs. Reminders stay on each device. | Default accepted |
| 3 | A reset wins over unsynced work on other devices. That work is offered as a backup download. | Default accepted |
| 4 | Import while signed in **merges** into the synced data. | Owner, 2026-11-07 |
| 5 | A different account on the same device starts fresh. Local data is offered as a backup download first. | Default accepted |
| 6 | Personal use: only the owner's email can sync. | Owner, 2026-11-07 |
| 7 | **Light version:** one cloud document per user, merged on the device. No custom server. | Owner, 2026-11-07 |

Non-goals: sharing, leaderboards, payments, real-time push, server-side logic, or more than a handful of devices.

## 1. How it works

```
 phone ──┐                              ┌── laptop
         │  1. download doc + version   │
         │  2. merge with local copy    │
         │  3. upload if changed,       │
         │     only if version still N  │
         └──────►  sync_doc row  ◄──────┘
                 (Postgres + RLS)
```

1. The device downloads the user's single document and its `version` number.
2. It merges that document with its own local data using the rules in section 3. The merge function is pure: the same inputs always give the same output, in either order.
3. If the merged result differs from what the cloud has, it uploads the result with the condition "only if the version is still N". The upload gets version N+1.
4. If another device saved first, the upload matches 0 rows. The device downloads again, merges again and retries, up to 3 times. Because merging is order-independent, the retry always converges.

`localStorage["pf2_state"]` stays the working copy, so the app keeps working fully offline. The cloud is only a backup and a meeting point.

## 2. Hosting

**Recommended: Supabase (free tier).** It provides Postgres with row-level security, built-in Google and email-link sign-in, and a REST API the browser can call directly. That means there is no server code to write, deploy or pay for.

Keeping it vendor-neutral: all provider calls sit behind one small adapter in `sync.js`, with `signIn()`, `signOut()`, `getDoc()` and `putDoc(doc, expectedVersion)`. Moving to Firebase, PocketBase or a small Neon-backed function later changes only that adapter.

Free-tier facts to know:
- Supabase pauses free projects after about a week with no activity. While paused, sync shows "Cloud paused" and the app keeps working locally. Un-pause it from the Supabase dashboard; nothing is lost.
- Limits are 500 MB of database space and 50,000 monthly users. One person uses a tiny fraction (section 3.4).

### 2.1 Database (one migration)

```sql
-- The one synced document per user.
create table public.sync_doc (
  user_id    uuid primary key default auth.uid() references auth.users on delete cascade,
  doc        jsonb not null,
  version    integer not null default 1,
  updated_at timestamptz not null default now(),
  constraint doc_size check (pg_column_size(doc) < 5000000)   -- 5 MB guard
);

-- The version is bumped by the server, never trusted from the client.
create function public.bump_version() returns trigger language plpgsql as $$
begin
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end $$;
create trigger sync_doc_bump before update on public.sync_doc
  for each row execute function public.bump_version();

-- Allowlist: only these emails can read or write anything.
create table public.allowed_emails (email text primary key);
insert into public.allowed_emails values ('<owner email, lower case>');

create function public.is_allowed() returns boolean
  language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.allowed_emails
                 where email = lower(auth.jwt() ->> 'email'))
$$;

alter table public.sync_doc       enable row level security;
alter table public.allowed_emails enable row level security;   -- no policies: clients can't read it

create policy own_doc on public.sync_doc for all to authenticated
  using      (user_id = (select auth.uid()) and public.is_allowed())
  with check (user_id = (select auth.uid()) and public.is_allowed());
```

The client makes two calls:
- **Download:** `GET /rest/v1/sync_doc?select=doc,version`. It returns 0 or 1 rows.
- **Upload:**
  - first time: `POST` with `Prefer: resolution=ignore-duplicates`;
  - after that: `PATCH /rest/v1/sync_doc?version=eq.N` with `Prefer: return=representation`;
  - an empty result means another device saved first, so download, merge and retry.

### 2.2 Sign-in

- Enable Google and email magic link in Supabase Auth.
- Set the redirect URL to the GitHub Pages address.
- Turn off "Allow new signups" once the owner's account exists.
- The allowlist policy is the real guarantee: a stranger who manages to sign in still gets 0 rows and cannot write anything.

## 3. The synced document and merge rules

### 3.1 Shape

```js
{
  schema: 1,
  gen: 0,                          // reset counter (3.3)
  data: {                          // the synced part of pf2_state
    profile: { name, theme, pro },  // email is never uploaded
    routineId, trainingDays, restSeconds,
    current: {}, levels: {}, joined: {}, workouts: []
  },
  stamps:  { "profile.theme": "2026-11-07T09:00:00Z", "current.push": "…", … },
  deleted: { "<workoutId>": "2026-11-07T09:00:00Z" }
}
```

These stay on the device and are never uploaded:
- `profile.email`
- `reminder`
- `challengeStart` (dead code: it is set in `defaultState()` and never used)

The device keeps its sync bookkeeping in a separate key, `pf2_sync`:
- `owner`: the signed-in user id
- `version`: the last version seen
- `gen`
- `stamps`
- `deleted`
- `lastSynced`: a snapshot used to detect changes

Keeping these out of `pf2_state` means Export and Import never see them.

### 3.2 Rules (applied when both copies have the same `gen`)

| Field | Rule | Why |
|---|---|---|
| `workouts` | Union by `id`, minus any id in `deleted` (the union of both tombstone maps) | Workouts from either device are kept. Deletes stick. |
| `levels.<progId>` | Highest value wins | Progress only moves up, except on reset (3.3). |
| `current.<cat>`, `joined.<id>` | Newer stamp wins. Leaving a ladder is stored as `null` with a stamp. | The user can move these down or remove them. |
| `profile.name`, `profile.theme`, `profile.pro`, `routineId`, `trainingDays`, `restSeconds` | Newer stamp wins | These are settings, so the latest choice wins. |

- A stamp more than 5 minutes in the future is treated as now, so a device with a wrong clock can't win forever.
- If two stamps are equal, the cloud copy wins, so both devices end up with the same result.
- Workout ids stay as they are today: 8 random base-36 characters. With one person logging a few hundred workouts a year, a collision is practically impossible. Keeping the ids also means existing backups and history work without any migration.

### 3.3 Reset (decision 3)

- The Reset action raises `gen` by 1 and clears local data, as it does today, keeping the theme.
- Merging a copy with a lower `gen` into one with a higher `gen` keeps only the higher one. Nothing is mixed back in.
- If the losing copy (on this device) had workouts the winner doesn't have, the app offers them as a backup download. The toast reads: "Progress was reset on another device. Download what this device had?"

### 3.4 Size

A workout is about 0.5-1 KB. Five years of training 4 days a week is about 1,000 workouts, or roughly 1 MB, well under the 5 MB guard. The download is about 100-300 KB compressed.

## 4. Client changes

**New file `sync.js` (about 250 lines):**
- the provider adapter (2.1)
- a pure `merge(a, b)` function
- the sync loop
- a status line

It is loaded after `app.js`. The Supabase client is **vendored**: a pinned copy lives in `vendor/`. It is never loaded from a CDN, so no third-party script runs on the origin.

**Changes to `app.js` (small):**

| Where | Change |
|---|---|
| `save()` (`app.js:212`) | After writing `pf2_state`, call `Sync.noteSave(state)`. That function compares synced fields with the last snapshot, stamps any field that changed with the current time, adds a tombstone for each workout id that disappeared, then schedules a sync 3 seconds later. Individual actions don't need to change. |
| `reset` action (`app.js:1302`) | Call `Sync.noteReset()` before `save()` (raises `gen`). |
| Import handler (`app.js:1358-1372`) | Signed out: unchanged (the file replaces local data). Signed in: confirm "Merge this file into your synced data?", then `state = merge(state, file)`. The file has no stamps, so local settings win while workouts and levels are combined. Then save. Importing the same file twice adds nothing. |
| Profile view | Add an **Account** card above Export, Import and Reset (details below). |
| `privacySheet` | Add one paragraph: what is stored (section 3.1), where (Supabase, region chosen at setup), and that deleting the account removes it. |

The Account card contains:
- signed out: "Back up & sync" (Google / email link);
- signed in: the email, "Synced 2 min ago", "Sync now" and "Sign out";
- "Delete cloud data", which removes the row; the auth user is deleted from the dashboard.

**Sync runs:**
- on load;
- when the tab gets focus;
- when the device comes back online;
- 3 seconds after a save;
- with no polling timer.

Each run downloads, merges, uploads if anything changed, and updates the status line.

**Account guard (decision 5):** if a different user signs in on a device that already has data, the app offers a backup download, then clears local data and pulls the new account's document.

**First sign-in:** if the cloud has no document, upload the local one. If it has one, merge as usual. Existing local history is never thrown away.

## 5. Failure modes

| What happens | What the user sees | Recovery |
|---|---|---|
| Offline, or the project is paused | "Offline: changes saved on this device" / "Cloud paused" | Automatic retry on the next trigger. Data stays local. |
| Two devices save at the same moment | Nothing | Version check, then re-merge and retry (up to 3 times). |
| Session expired | "Sign in again to sync" | Sign in. Local data is untouched. |
| Upload rejected (not on the allowlist) | "This account can't sync" | Use the owner account. |
| A device with a wrong clock | A setting may revert | Clamp future stamps. Workouts and levels don't use stamps, so they are unaffected. |
| A bad document in the cloud | "Couldn't read cloud data" | The download is validated before merging. If it fails, the app never overwrites local data, keeps a copy, and offers Export. |

## 6. Security

- **The Supabase "anon" key is public by design** and ships in the page. RLS plus the allowlist protect the data. The **service-role key is never** put in the site, the repo or chat. The same rule applies to the OpenAI key.
- The session token lives in `localStorage`. All pages on the `github.io` origin belong to the owner (decision 1), so this risk is accepted on these conditions:
  1. Remove `cdn.tailwindcss.com` from `tracker.html:10` before sign-in ships, using vendored or plain CSS.
  2. Publish no untrusted Pages projects on the same account.
  3. Keep using `esc()` (`app.js:15`) for every user string inserted into the page.
- A CSP `<meta>` tag allows scripts only from `'self'` and connections only to `'self'` and the Supabase project host.
- No email or IP address is stored in the document.

## 7. Tests

- **Merge unit tests** (`tools/test-merge.js`, plain Node, no dependencies):
  - merge is order-independent (`merge(a,b)` equals `merge(b,a)`);
  - merging twice changes nothing (`merge(a, merge(a,b))` equals `merge(a,b)`);
  - delete tombstones stick;
  - the higher `gen` wins;
  - importing a file twice adds nothing;
  - future stamps are clamped.
- **Manual two-browser test** (two Chrome profiles):
  - log a workout offline on each, then reconnect: both appear;
  - change the theme on one: it updates on the other;
  - delete a workout: it stays deleted;
  - reset on one: the other offers a backup;
  - sign in with an account not on the allowlist: it is refused.

## 8. Build steps

1. **Supabase project:** create the project, run the SQL in 2.1, enable Google and email link, set the redirect URL, add the owner email, then turn off new signups. (The owner does this in the dashboard; I'll write the click-by-click steps.)
2. **Origin cleanup:** vendor the Supabase client and remove the Tailwind CDN from `tracker.html`.
3. **`merge()` and its unit tests.**
4. **`sync.js`:** the adapter, the sync loop, the `save()` hook and the reset hook.
5. **UI:** the Account card, the status line, the account guard, import merge and the privacy paragraph.
6. **Try it** on your phone and laptop for a week.

## 9. Open items

- Pick the Supabase region nearest to you at setup. The privacy paragraph states it.
- Check during step 1 that turning off signups still lets your existing account sign in with Google. If it doesn't, leave signups on: the allowlist already blocks everyone else.
