# PulseFit Accounts and Cloud Sync: Backend Design

Status: **proposed — open questions answered (2026-11-07), awaiting approval to build**. No backend code exists yet; implementation starts only after approval.

**Decisions from review (2026-11-07):**
1. **Origin:** stay on GitHub Pages (`<user>.github.io`); no custom domain. Section 11 records the accepted risk.
2. **Theme sync:** synced (default). Reminders stay device-local.
3. **Reset:** reset wins over unsynced work on other devices, with the recovery backup (default).
4. **Import while signed in:** **merge** into the synced data, not replace (section 10.2).
5. **Different account on the same device:** start fresh, with local data offered as a backup download (default).
6. **Audience:** personal use. The owner is the only intended user, so sign-in is restricted to an allowlist (section 0.1).
Scope: optional accounts, backup, and multi-device merge for the static SPA (`index.html`, `app.js`, `data.js`).

## 0. Summary and non-goals

PulseFit stays offline-first. `localStorage["pf2_state"]` remains the working copy (`app.js:182-214`). Accounts are optional. When a user signs in, the server becomes a backup and merge point.

Everything runs through one workflow endpoint, `POST /v1/sync`. The client sends pending operations ("ops") and its cursor. The server applies the ops transactionally, then returns whatever changed since the cursor. The merge rules are commutative, so devices converge without a conflict UI.

Two further endpoints cover export and account deletion. A health endpoint covers monitoring.

Scale target: personal use (one owner, a handful of devices). The design still holds up to 1,000 users and 5 req/s, but nothing is sized beyond one Postgres and one stateless HTTP function: no queues, no cache, no websockets. Everything fits in free tiers.

### 0.1 Personal-use profile

Because the owner is the only intended user:
- **Sign-in allowlist.** The provider is set to invite-only, or the API rejects any verified identity whose email is not in `ALLOWED_EMAILS` (a function secret) with 403 `not_allowed`. Strangers who find the site can still use it signed out, but cannot create accounts or use the database.
- **No beta stage** (section 15, step 10) and no public sign-up copy.
- **Privacy sheet** shrinks to a short note on what is stored and where, since no third-party personal data is collected.
- The account deletion, export and rate-limit paths stay: they are cheap and protect against a lost device or a leaked token.

Non-goals for v1:
- No social features, leaderboards, or sharing. The `LADDERS` "join" state is a private per-user flag.
- No admin console or admin API. Support is done with documented SQL runbooks.
- No payments. `profile.pro` stays a demo toggle. It is synced as a plain preference and the server never gates anything on it.
- No server-side workout analytics, no catalog validation, no push notifications.
- No real-time push to other devices. Pull happens on load, focus, reconnect, and a timer.

Terms:
- **Op**: one client-generated mutation record.
- **Register**: a single synced setting merged by last-writer-wins.
- **Revision**: a per-user counter incremented once per applied batch.
- **Generation**: a per-user reset counter.

## 1. Context (answer 1, refined)

The component is a synchronous HTTP API behind CORS. The only caller is the PulseFit SPA served from GitHub Pages. Sign-in is delegated to a managed OIDC provider. Our API only verifies the provider's JWTs.

| Endpoint | Purpose | Latency budget |
|---|---|---|
| `POST /v1/sync` | Apply ops and return changes. This is a workflow, not CRUD. | p95 < 400 ms, hard timeout 5 s |
| `GET /v1/export` | Self-service export of all user data | p95 < 1.5 s |
| `DELETE /v1/account` | Hard delete | p95 < 3 s |
| `GET /v1/healthz` | Unauthenticated liveness plus DB check | < 100 ms |

Failure model:
- The client is the source of truth while offline. The server may be unreachable for days.
- Every sync is a retry-safe request. The server is never assumed to be up.
- Server writes are one Postgres transaction per request. No cross-store writes except account deletion (see 5.5).

Concurrency model:
- Many stateless function instances.
- Per-user serialization via a row lock on the `users` row.
- Different users never contend.

Changes from the brief, with reasons:
1. Pull is served from the materialized, revision-stamped rows (section 2), not from an op log. This avoids log compaction and snapshot-gap logic entirely. A "snapshot" is just a pull from revision 0.
2. LWW for registers orders by clamped client timestamp, with server arrival order as tie-break. This is not pure arrival order. Pure arrival order lets a phone that was offline for a week overwrite a theme chosen yesterday on another device. The server remains the sole arbiter, so all devices converge on the server's result. See 2.3.

## 2. Data model

### 2.1 Grounding in the current client state

The following comes from `defaultState()` (`app.js:184-198`) and `evaluate`/`commitWorkout` (`app.js:944-979`).

| Local field | Sync class | Server home |
|---|---|---|
| `workouts[]` | Append-only set, tombstone deletes | `workouts` |
| `levels{progId}` | Monotonic MAX (0..3) | `levels` |
| `current{catId}` | LWW register per category | `registers` key `current.<catId>` |
| `joined{ladderId}` | LWW register with tombstone (`null`) | `registers` key `joined.<ladderId>` |
| `profile.name`, `profile.theme`, `profile.pro` | LWW registers | `registers` |
| `routineId`, `trainingDays`, `restSeconds` | LWW registers | `registers` |
| `challengeStart` | Not synced: only ever initialised to `null` (`app.js:196`), never set — dead code | none |
| `profile.email` | Not synced. The provider owns identity. Also a PII minimisation win. | none |
| `reminder.enabled`, `reminder.time` | Not synced (my call). They depend on this device's Notification permission and timezone habits. | none |
| `reminder.lastNotified`, `seenIntro` | Device-local | none |
| `v` | Client schema marker, bumped to 2 | none |

My calls, flagged for the user in section 16:
- `theme` is synced, per the brief.
- Reminders are not synced.

### 2.2 Entities and invariants

Entities: `users`, `workouts`, `levels`, `registers`, `applied_ops`, `pending_identity_deletions`.

Storage choice: **materialized per-user state plus a thin applied-ops ledger. No full op log.**

Why this works:
- Every op kind is naturally idempotent. Workout add and delete are keyed by id. Level raise is MAX. Register set is LWW. Reset is generation-guarded.
- The ledger therefore only provides per-op result reporting and a replay fast path. It is not needed for correctness.

Retention and compaction:
- Prune `applied_ops` rows older than 90 days with a daily scheduled SQL job. Replaying an op after that is still safe because of the natural idempotence.
- Tombstones are kept for the life of the account. They are about 40 bytes each and are required for correct deltas. Their payload is nulled at delete time.
- Registers with a `null` value (for example a left ladder) are retained as tombstones.
- Row `rev` stamps drive deltas. There is nothing to compact.

Invariants enforced in the schema:
- One account per auth subject: `UNIQUE(auth_sub)`. The provider enforces one account per email.
- A workout belongs to exactly one user: PK `(user_id, id)`, FK to `users` with `ON DELETE CASCADE`.
- `0 <= level <= 3`: CHECK constraint.
- `op_id` is unique per user: PK `(user_id, op_id)` on `applied_ops`.
- A deleted workout has no payload, and a live workout has a full one: CHECK constraint.
- Register keys match a strict pattern: CHECK constraint.
- Row-size caps: `pg_column_size` CHECKs on JSONB.
- Per-user row quotas are checked in the sync transaction (section 3).

### 2.3 Merge semantics

**Workouts (union plus tombstone)**
- `workout.add` is `INSERT ... ON CONFLICT DO NOTHING`.
- `workout.delete` is an upsert that sets `deleted=true`, nulls the payload, and stamps `rev`.
- A delete that arrives before its add (two devices) creates a payload-less tombstone. The late add then conflicts and is a no-op. Deleted workouts never resurrect.

**Levels (MAX)**
- Upsert with `level = GREATEST(old, new)`. A change is stamped with `rev` only if the level actually rose.

**Registers (LWW)**
- Order key is `eff_ts = min(client_ts, server_now)`, clamped to at least epoch. Tie-break is server apply order, via `rev`.
- Apply only if `eff_ts > stored.ts`, or `eff_ts = stored.ts AND incoming rev > stored rev`. Because the incoming batch always gets a newer `rev`, an exact tie is won by the later arrival.
- Replaying the same op is a no-op: same `eff_ts`, and a tie only re-writes an identical value.
- A client clock far in the future is clamped to server now, so it cannot win forever (incident 5).
- Seed ops carry `client_ts: null` and mean set-if-absent. They are used for first sign-in so server values beat stale local defaults.

**Reset**
- `users.reset_generation` is an integer. Every op carries the generation the client believed current.
- An op whose generation is lower than the server's is discarded with result status `discarded`, not an error.
- A `reset` op carrying the current generation `g`:
  - deletes all workouts (including tombstones), levels, and registers,
  - bumps the generation to `g+1`,
  - re-seeds `profile.theme` from the op payload (the local reset keeps the theme, `app.js:1304-1305`).
- Ops after a reset in the same batch carry `g+1` and are applied.
- If two devices reset from the same generation, the second reset is `discarded` and the data is already clean.
- This is what stops MAX and union from resurrecting reset data.

Convergence argument:
- Union, MAX, and "LWW under a total order" are each commutative, associative, and idempotent.
- Reset is a barrier keyed by generation.
- The server is the single arbiter, so any delivery order and any duplication yields the same state per generation.
- Clients converge by pulling the server's result.

### 2.4 Schema changes required

All new. There is no existing server. Postgres 14 or later, standard features only. Cited as one migration `0001_init.sql`.

```sql
CREATE SCHEMA app;
CREATE ROLE pulsefit_api LOGIN NOBYPASSRLS;   -- API connects as this; NOT the table owner

CREATE TABLE users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_sub         text NOT NULL UNIQUE,            -- OIDC "sub"; no email stored
  reset_generation integer NOT NULL DEFAULT 0 CHECK (reset_generation >= 0),
  revision         bigint  NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  last_sync_at     timestamptz
);
```

```sql
CREATE TABLE workouts (
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id           uuid NOT NULL,                       -- client-generated
  at           timestamptz,
  routine_name text CHECK (char_length(routine_name) <= 80),
  entries      jsonb,
  deleted      boolean NOT NULL DEFAULT false,
  rev          bigint  NOT NULL,
  PRIMARY KEY (user_id, id),
  CHECK (
    (deleted AND at IS NULL AND entries IS NULL AND routine_name IS NULL)
    OR (NOT deleted AND at IS NOT NULL AND entries IS NOT NULL
        AND jsonb_typeof(entries) = 'array' AND pg_column_size(entries) <= 8192)
  )
);
CREATE INDEX workouts_delta ON workouts (user_id, rev);
```

```sql
CREATE TABLE levels (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prog_id text NOT NULL CHECK (prog_id ~ '^[a-z0-9_-]{1,40}$'),
  level   smallint NOT NULL CHECK (level BETWEEN 0 AND 3),
  rev     bigint NOT NULL,
  PRIMARY KEY (user_id, prog_id)
);
CREATE INDEX levels_delta ON levels (user_id, rev);

CREATE TABLE registers (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key     text NOT NULL CHECK (key ~ '^(profile\.(name|theme|pro)|routineId|trainingDays|restSeconds|(current|joined)\.[a-z0-9_-]{1,40})$'),
  value   jsonb NOT NULL DEFAULT 'null'::jsonb CHECK (pg_column_size(value) <= 512),
  ts      timestamptz NOT NULL,                     -- effective (clamped) LWW time
  rev     bigint NOT NULL,
  PRIMARY KEY (user_id, key)
);
CREATE INDEX registers_delta ON registers (user_id, rev);
```

```sql
CREATE TABLE applied_ops (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  op_id      uuid NOT NULL,
  rev        bigint NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, op_id)
);
CREATE INDEX applied_ops_prune ON applied_ops (applied_at);

-- No FK and no PII beyond the opaque provider subject: retry queue for provider-side deletion.
CREATE TABLE pending_identity_deletions (
  auth_sub     text PRIMARY KEY,
  requested_at timestamptz NOT NULL DEFAULT now(),
  attempts     integer NOT NULL DEFAULT 0
);
```

### 2.5 Row-level security

Policies call one function, `app.current_user_id()`. The hosting stack redefines that single function (section 9).

```sql
CREATE FUNCTION app.current_user_id() RETURNS uuid
  LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('app.user_id', true), '')::uuid $$;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;  ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY users_own ON users FOR ALL
  USING (id = app.current_user_id()) WITH CHECK (id = app.current_user_id());
-- Same pattern on workouts, levels, registers, applied_ops, keyed by user_id:
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;  ALTER TABLE workouts FORCE ROW LEVEL SECURITY;
CREATE POLICY workouts_own ON workouts FOR ALL
  USING (user_id = app.current_user_id()) WITH CHECK (user_id = app.current_user_id());
```

Details:
- `pending_identity_deletions` has no policy. `pulsefit_api` gets no grant on it. Only the SECURITY DEFINER delete function and the scheduled job touch it.
- The user lookup by `auth_sub` happens before a user id exists. It goes through `app.resolve_user(sub text) RETURNS uuid`, a `SECURITY DEFINER` function owned by the migration role. It does `INSERT ... ON CONFLICT (auth_sub) DO UPDATE SET last_sync_at = now() RETURNING id`. The API role has `EXECUTE` on it and no other path to cross-user rows.
- Every request transaction begins with `SELECT set_config('app.user_id', $1, true)`. The `true` makes it transaction-local. This is safe with transaction-mode poolers and leaks nothing across pooled connections.
- If the setting is absent, `current_user_id()` is NULL and every policy matches zero rows (fail closed).
- Grants: `pulsefit_api` gets `SELECT, INSERT, UPDATE, DELETE` on the five user tables. No DDL.

### 2.6 Queries the design implies

| Query | Access path |
|---|---|
| Resolve user | `UNIQUE(auth_sub)` index, inside `resolve_user` |
| Lock and read counters | `users` PK, `SELECT ... FOR UPDATE` |
| Dedup check | `applied_ops` PK `(user_id, op_id)`, batched with `= ANY($ids)` |
| Workout upsert | PK `(user_id, id)` |
| Level and register upsert | PK `(user_id, prog_id)` and PK `(user_id, key)` |
| Delta pull | Three index range scans on `(user_id, rev > $since)`, merged and ordered by `(rev, kind, key)` |
| Snapshot (since = 0) | Same scans, with `deleted = false` filter |
| Export | PK-prefix scans by `user_id` |
| Ledger prune | `applied_ops_prune` index |

## 3. API contract

Base URL is `https://<api-host>/v1`. All bodies are `application/json; charset=utf-8`. Every request except `/healthz` carries `Authorization: Bearer <access_token>`.

Headers the client may send: `X-Request-Id` (uuid) and `traceparent` (W3C). The server echoes `X-Request-Id` and returns a `trace_id` in error bodies.

### 3.1 The op format

```json
{ "op_id": "0b0f...uuid", "kind": "workout.add",
  "payload": { "id": "uuid", "at": "2026-11-05T18:02:11.000Z",
               "routine_name": "Foundation A",
               "entries": [{"progId":"pushup-std","level":2,"values":[12,11,9],"passed":true}] },
  "client_ts": "2026-11-05T18:02:12.311Z", "reset_generation": 3 }
```

| kind | payload | Server effect |
|---|---|---|
| `workout.add` | `{id, at, routine_name, entries[]}` | Insert if absent |
| `workout.delete` | `{id}` | Tombstone |
| `level.raise` | `{prog_id, level}` | `GREATEST` |
| `register.set` | `{key, value}`. Value is a JSON value, or `null` to clear. | LWW by `client_ts`. A `client_ts` of `null` means seed (set-if-absent). |
| `reset` | `{keep: {"profile.theme": "<theme>"}}` | Wipe and bump generation |

Validation rules (pure, performed before any DB work):
- `op_id` and workout `id` must be lowercase UUIDs (any version, canonical 36-char form).
- `client_ts` must be a valid ISO-8601 UTC string. Workout `at` must lie in `[2020-01-01, now + 1 day]`.
- `level` must be an integer 0..3.
- `entries` has at most 30 items. Each `values` array has at most 20 numbers in `0..100000`. The `progId` pattern is `^[a-z0-9_-]{1,40}$`. The server does NOT validate against the `data.js` catalog, which avoids coupling server releases to content releases.
- Register value validators by key:

| Key | Value rule |
|---|---|
| `profile.name` | string, 0..60 chars |
| `profile.theme` | string matching `^[a-z0-9-]{1,24}$` |
| `profile.pro` | boolean |
| `routineId` | string matching the id pattern |
| `trainingDays` | 1..7 unique ints in 0..6 |
| `restSeconds` | int 10..600 |
| `current.<cat>` | int 0..50 |
| `joined.<ladder>` | `YYYY-MM-DD` or null |

- Within a batch, a repeated `op_id` is a client bug and fails with `invalid_op/duplicate_op_id`.

### 3.2 POST /v1/sync

Request:

```json
{ "schema_version": 1, "client_id": "uuid-per-install",
  "since_revision": 42, "page_after": null, "reset_generation": 3,
  "ops": [ /* 0..200 ops */ ] }
```

Response 200:

```json
{ "schema_version": 1, "revision": 45, "reset_generation": 3, "server_time": "2026-11-05T18:02:13Z",
  "results": [ {"op_id": "…", "status": "applied"} ],
  "pull": { "mode": "delta", "has_more": false, "next": null,
    "workouts":  [ {"id":"…","at":"…","routine_name":"…","entries":[…],"deleted":false} ],
    "levels":    [ {"prog_id":"pushup-std","level":3} ],
    "registers": [ {"key":"profile.theme","value":"midnight"} ] } }
```

Result statuses:

| Status | Meaning |
|---|---|
| `applied` | The op changed server state. |
| `noop` | The op was valid but changed nothing: already present, lower level, or older LWW. |
| `duplicate` | `op_id` was in the ledger. |
| `discarded` | Stale generation. The client must reconcile (flow 5.4). |
| `unsupported` | Well-formed but unknown kind or register key from a newer client. It is not applied and does not fail the batch. |

Pull semantics:
- `mode` is one of:
  - `none`: no changes since `since_revision`.
  - `delta`: rows with `rev > since_revision`, including tombstones.
  - `snapshot`: the client should replace its synced fields. The first page is authoritative and later pages merge. Tombstones are omitted.
- The server returns `snapshot` when any of the following holds:
  - `since_revision` is 0.
  - The request's `reset_generation` differs from the server's.
  - `since_revision` is greater than the server's `revision`. This is the restored-from-backup case (incident 3).
- Pages hold at most 500 rows (about 250 KB).
- Pages are ordered by `(rev, kind, key)`.
- `next` is an opaque cursor. The client re-calls with `page_after = next` (and zero ops) until `has_more` is false.
- The client persists `since_revision = response.revision` only after the last page is applied locally.
- Page boundaries never split a revision's rows incorrectly. The cursor includes the `(rev, kind, key)` position.

Server algorithm, in order:
1. Verify JWT, size, JSON shape, and per-op validation. Reject with 4xx, no DB access.
2. Begin the transaction (`READ COMMITTED`), then `set_config('app.user_id', …, true)`, then `SET LOCAL lock_timeout='3s', statement_timeout='5s'`.
3. Resolve the user, then `SELECT revision, reset_generation FROM users WHERE id=$1 FOR UPDATE` (skip the lock when `ops` is empty, see 5.2).
4. Look up the batch's `op_id`s in `applied_ops`. Mark those as `duplicate`.
5. Apply remaining ops in array order. A stale-generation op becomes `discarded`. A `reset` bumps the generation in-memory and in the row. Enforce quotas: live workouts at most 5,000, registers at most 200, levels at most 200. Over quota is `422 quota_exceeded` and the transaction rolls back.
6. If at least one op was `applied`, set `rev = revision + 1` on all touched rows, update `users.revision`, and insert ledger rows (`ON CONFLICT DO NOTHING`).
7. Commit. If there are no ops, the pull runs in a separate `REPEATABLE READ READ ONLY` transaction (consistent three-table read).
8. Compute and return the pull. Pull rows are read after the batch applies, so the client sees its own effects.

### 3.3 GET /v1/export

Returns 200 with `Content-Disposition: attachment; filename="pulsefit-export-YYYY-MM-DD.json"`. The body is the existing local export shape, so the Import action (`app.js:1358-1372`) can load it, plus a `server` block:

```json
{ "v": 2, "profile": {…}, "routineId": "…", "workouts": […], "levels": {…}, "current": {…},
  "joined": {…}, "trainingDays": […], "restSeconds": 90,
  "server": { "revision": 45, "reset_generation": 3, "exported_at": "…", "account_created_at": "…" } }
```

Tombstones are not included. The export is read in one `REPEATABLE READ` transaction.

### 3.4 DELETE /v1/account

- Requires header `X-Confirm: delete-my-account`.
- Requires a token whose `auth_time` (or `iat`) is at most 5 minutes old. Otherwise `401 reauth_required` and the client runs the provider's re-authentication flow (`prompt=login`).
- Response: `204`.
- Behaviour: see flow 5.5 and section 7.4.

### 3.5 GET /v1/healthz

No auth. Returns `200 {"status":"ok","db":"ok","jwks_age_s":1234}` or `503`. Details in section 12.

### 3.6 Error format and codes

Body: `{"error": {"code": "...", "message": "...", "trace_id": "...", "details": {…}}}`. Messages are human text and codes are stable.

| HTTP | code | When | Client behaviour |
|---|---|---|---|
| 400 | `bad_request` | Not JSON, missing required fields | Log locally, do not retry the same body |
| 401 | `unauthenticated` | Missing, malformed, or invalid token. `details.reason` is `expired` / `signature` / `audience` / `issuer`. | Silent token refresh once, retry. Else show "Sign in again". Never drop local data. |
| 401 | `reauth_required` | Delete needs a fresh login | Prompt for re-authentication |
| 403 | `not_allowed` | Valid token, but the identity is not on the owner allowlist (section 0.1) | Show "This account can't sync". Keep working signed out. |
| 403 | `origin_not_allowed` | Origin header present but not the configured one (non-browser guard, defence in depth) | None |
| 413 | `payload_too_large` | Body over 256 KiB | Split the batch. Never silently drop. |
| 415 | `unsupported_media_type` | Not JSON | Bug |
| 422 | `invalid_op` | `details: {index, op_id, reason}`. Reasons: `unknown_field`, `bad_uuid`, `bad_timestamp`, `level_out_of_range`, `bad_register_value`, `entries_too_large`, `duplicate_op_id`. Whole batch rolled back. | Quarantine that op, retry the rest (section 8) |
| 422 | `quota_exceeded` | A row quota would be exceeded | Surface "sync limit reached", stop auto-retry |
| 426 | `client_upgrade_required` | `schema_version` below the server minimum. `details.min_schema_version`. | Show "Reload to update PulseFit" |
| 429 | `rate_limited` | Per-user or per-IP limit. `Retry-After` header. | Honour `Retry-After`, then backoff |
| 500 | `internal` | Unhandled | Backoff and retry |
| 503 | `busy` / `unavailable` | Lock timeout, statement timeout, DB down. `Retry-After`. | Backoff and retry |

### 3.7 Size limits

| Limit | Value |
|---|---|
| Request body | 256 KiB |
| Ops per batch | 200 |
| One workout | 8 KiB |
| Pull page | 500 rows |
| Live workouts per account | 5,000 |
| Registers / levels per account | 200 / 200 |
| Sustained sync rate per user | 1 req/s, burst 20 (a 2,000-workout bootstrap is 10 requests) |
| DB statement / lock timeouts | 5 s / 3 s |

### 3.8 Versioning and skew

- `/v1` in the URL covers breaking HTTP changes. Within v1 only additive changes are made.
- `schema_version` (integer, currently 1) covers the op format.
- The server supports the current version and one version back, and advertises `min_schema_version` in 426 errors and in the sync response.
- Deployment order is always server first, then client. A client therefore is never newer than the server unless the server is rolled back.
- Well-formed ops of an unknown kind or key return `unsupported`, not a failure. The client keeps them in the outbox with an attempt counter and parks them in quarantine after 5 attempts.
- Unknown fields on ops fail with `invalid_op/unknown_field`. Unknown fields in a pull response are ignored by the client.
- The client's local `state.v` bumps from 1 to 2 (UUID migration, section 10.7). `loadState()` already spreads unknown fields (`app.js:200-209`), so older and newer clients tolerate each other's local data.

## 4. Architecture

```
 GitHub Pages origin                            Managed OIDC provider
 +-------------------------+   1. Auth Code     +-----------------------+
 | PulseFit SPA            |   + PKCE redirect  | Google / email magic  |
 |  app.js  localStorage   | <----------------> | link, JWKS, refresh   |
 |   pf2_state  pf2_sync   |                    | rotation, admin delete|
 |   (outbox, cursor)      |                    +-----------+-----------+
 |   pf2_auth (refresh tok)|                                ^
 +-----------+-------------+                                | JWKS fetch (cached)
             | 2. HTTPS + Bearer JWT (CORS)                 | + delete-user call
             v                                              |
 +-----------+----------------------------------------------+---------+
 | HTTP API (stateless function; host TBD)                            |
 |  CORS -> size/rate guard -> JWT verify -> validate -> sync handler |
 +-----------+--------------------------------------------------------+
             | 3. pooled connection, role pulsefit_api, tx-local
             |    set_config('app.user_id', ...)
             v
 +-----------+--------------------------------------+
 | Postgres  users | workouts | levels | registers   |
 |  (RLS on)  applied_ops | pending_identity_deletions|
 +----------------------------------------------------+
```

Components the user does not run: the OIDC provider, the CDN, and the connection pooler. The user runs one function and one database.

## 5. Request flows

### 5.1 First sign-in merge (local data plus any server data)

1. The user taps "Back up and sync" in Profile. The SPA redirects to the provider (Google or email link) with Auth Code and PKCE. It returns with a code, exchanges it for tokens, and keeps the access token in memory.
2. Owner check: `pf2_sync.owner_sub` is empty, so continue. If it holds a different subject, see the guard in 10.8.
3. The client runs the legacy-id migration (10.7) and builds bootstrap ops from current local state:
   - one `workout.add` per workout,
   - one `level.raise` per level above 0,
   - seed `register.set` (with `client_ts: null`) for every field that differs from `defaultState()`.
   - Op ids are random UUIDs, persisted in the outbox before the first send.
4. `since_revision` is 0 and `reset_generation` is 0, so the first response is a `snapshot` pull. The client sends its outbox in batches of up to 200 ops, one request at a time.
5. Server per batch: union workouts, MAX levels, and apply seeds set-if-absent. If server data already exists from a second device, the server's settings win and local workouts are added to the set.
6. The client merges each pulled page into local state by the same rules (union, MAX, LWW except where the outbox has a pending op for that key). It saves `owner_sub`, `since_revision`, and `reset_generation` after the final page.
7. The user sees "Synced". There is no conflict prompt.

### 5.2 Routine sync (after a workout, on load, on reconnect)

1. `commitWorkout` (`app.js:963`) emits `workout.add`, any `level.raise`, and any `register.set current.<cat>` into the outbox, then triggers a debounced sync.
2. The client sends `{since_revision, ops}`.
3. The server locks the user row, applies ops, bumps the revision if anything applied, and returns `results` and the pull.
4. The client removes acknowledged ops (`applied`, `noop`, `duplicate`) from the outbox, merges the pull, and advances the cursor.
5. A pull-only sync (empty `ops`) takes no row lock and reads in a read-only snapshot transaction. Most calls are of this type.

### 5.3 Second device bootstrap

1. The user signs in on a new device with empty local data. The owner check passes.
2. The bootstrap ops are only the non-default local fields. A fresh install has none.
3. The first sync returns `snapshot`. Page 1 replaces local synced fields and further pages merge.
4. The client stores the cursor. Pull-only syncs follow.
5. If the new device already has local workouts, they are uploaded exactly as in 5.1.

### 5.4 Reset all progress

1. The user confirms the existing prompt (`app.js:1302-1306`).
2. Locally: state is reset as today, keeping the theme. The client sets its local generation to `g+1`, discards outbox ops of generation `g` (they are meaningless now), and enqueues `{kind:"reset", reset_generation: g, payload:{keep:{"profile.theme":…}}}`.
3. The server locks the row. If its generation equals `g`, it deletes workouts (including tombstones), levels, and registers, writes the theme register, and sets generation `g+1`.
4. If the server is already at `g+1` (another device reset first), the op is `discarded` and nothing changes.
5. Another device, with a stale generation, syncs:
   - Its ops come back `discarded`.
   - The pull is a `snapshot` with `reset_generation = g+1`.
   - The client moves its discarded and unsent generation-`g` ops into `pf2_sync.recovery` and replaces its synced state with the snapshot.
   - It shows one toast: "Progress was reset on another device. N unsynced workouts were saved as a backup." with a "Download backup" action (section 10.5).
6. If the reset is made offline, the generation is bumped locally. The reset op is queued until the next successful sync.

### 5.5 Delete account

1. The user opens Profile > Account > "Delete account". The app explains what is deleted and offers "Export my data first".
2. The client forces re-authentication (`prompt=login`), then calls `DELETE /v1/account` with the confirm header.
3. The server verifies the `auth_time` freshness, then in one transaction:
   - runs `app.delete_account()` (SECURITY DEFINER, but it acts only on `app.current_user_id()`),
   - deletes the `users` row (cascades to all child rows),
   - inserts `(auth_sub)` into `pending_identity_deletions`.
4. After commit, the API calls the provider's admin delete-user API once, inline with a 3 s timeout. On success it deletes the pending row. On failure the row stays, and a daily scheduled job retries (max 10 attempts, then alert).
5. The response is `204`. The client wipes `pf2_auth` and `pf2_sync`, keeps local `pf2_state` (it is the user's device copy), and shows "Account deleted".
6. Order rationale: database first, then provider. The reverse order could orphan data with no login, which violates deletion promises. A leftover provider identity with no data is the lesser failure, and it is retried.

## 6. Authorization

- **Principal.** Any user holding a valid provider-issued JWT for this application. There is no anonymous write and no admin role.
- **Token verification** (app code, jose-style library, never hand-rolled crypto):
  - Algorithm allowlist (RS256 and ES256 only). Reject `none` and HS*.
  - `iss` equals the configured issuer. `aud` equals our API/client id.
  - `exp` and `nbf` are checked with 60 s clock skew.
  - JWKS is cached in memory for 1 h. An unknown `kid` triggers at most one refetch per 5 minutes per instance.
  - `sub` is mapped to `users.id` through `app.resolve_user(sub)`.
- **Scope.** Own rows only. The API never accepts a `user_id` from the client. Any such field in a body fails `invalid_op/unknown_field`.
- **Enforcement point.** Postgres RLS (section 2.5) is the primary guard. The app does not add `WHERE user_id =` filters for security (it may for index use). A bug in a handler therefore cannot cross tenants, because the connection role has no `BYPASSRLS` and tables use `FORCE ROW LEVEL SECURITY`.
- **No admin API.** Operators use the DB owner role in a runbook, outside the API path.
- **CORS is not authorization.** It only tells browsers who may read responses.

## 7. Idempotence and concurrency

### 7.1 Replay safety

Running the same batch twice produces the same state:
- Workout add and delete are keyed by id.
- Level raise is MAX.
- Register set is LWW under a fixed order key.
- Reset is generation-guarded.
- On top of that, `UNIQUE(user_id, op_id)` returns `duplicate` without re-applying.

The revision does not move when the batch has no `applied` ops.

### 7.2 Concurrency model

- Write path: `SELECT ... FOR UPDATE` on the user's `users` row. This serializes devices of one user, assigns revisions in apply order, and holds until commit, so revisions commit in order.
- The write transaction is `READ COMMITTED`. Under the lock no one else writes this user's rows, so mid-transaction reads are consistent. (`REPEATABLE READ` would raise serialization failures after waiting on the lock.)
- Read path: `REPEATABLE READ READ ONLY`, so the three delta scans see one snapshot with no mixed revisions.
- `lock_timeout` of 3 s returns `503 busy`. This only happens if one user's sync hangs.
- Out-of-order delivery is safe: delete-before-add, older-before-newer register ops, and old-generation ops after reset all resolve by the rules in 2.3.

### 7.3 Idempotency key contract

`op_id` is required on every op: a client-generated UUIDv4, stable across retries because it is persisted in the outbox before the first send. There is no per-request idempotency header. The batch is the unit of retry and the ops are the unit of idempotence.

### 7.4 Cross-store writes

Only account deletion crosses stores (Postgres and the identity provider). It uses the `pending_identity_deletions` table as an outbox, drained inline and then by a daily scheduled job. See 5.5.

## 8. Failure modes

| Failure | Detect | Surface | Recover |
|---|---|---|---|
| Client offline or request fails | `fetch` rejects or times out (15 s) | Profile shows "Offline, will sync". The app is fully usable. | Ops stay in the persisted outbox. Retry on `online`, focus, timer, with exponential backoff from 2 s to 5 min with jitter. |
| Access token expired | 401 `unauthenticated/expired` | Nothing visible if refresh works | Refresh once and retry. If the refresh token is dead, show "Sign in again". Outbox and local data are untouched. |
| Refresh token revoked or reused | Provider returns `invalid_grant` | "Sign in again" banner in Profile | Interactive sign-in. Owner check (10.8) then runs and the cursor is kept if the same subject. |
| Malformed or poison op | 422 `invalid_op` with `index` | Silent, plus a small "1 item couldn't sync" row in Profile | Client moves that op to `pf2_sync.quarantine` and retries the rest. Quarantined ops are kept 30 days and retried after a server `min_schema_version` change. |
| Payload too large | 413 | Silent | Halve the batch and resend. A single op over 8 KiB is quarantined. |
| Rate limited | 429 | Silent | Wait `Retry-After`, then backoff. Bootstrap proceeds batch by batch. |
| Account quota hit | 422 `quota_exceeded` | Profile: "Sync limit reached" with Export action | Auto-retry stops. User exports or trims data. |
| Version skew | 426, or `unsupported` results | "Reload to update PulseFit" | Reload picks up the new static files. Unsupported ops are parked after 5 attempts. |
| Stale generation (remote reset) | `discarded` results and a snapshot with a new generation | One toast with a backup download | Replace synced state, keep recovery ops (5.4). |
| Server rolled back (revision regression) | `since_revision` greater than the server's revision, so a `snapshot` is returned | Silent | Client merges the snapshot, then re-uploads its full local state as seed ops (idempotent). |
| Lock or statement timeout, DB down | 503 `busy` / `unavailable` | Same as offline | Backoff and retry. Alert fires on error rate. |
| Provider outage or JWKS fetch failure | JWT verify errors, JWKS age in health | Existing sessions keep working on cached keys. New sign-ins fail at the provider. | The app keeps working offline. Verification uses stale cached keys for up to 24 h (health reports degraded). |
| Function crash after commit, before response | The client sees a network error | Silent | Retry. The ledger returns `duplicate`, and the pull catches up the client. |
| Browser storage cleared | Client boots with empty state and a valid session | None | Next sync is a snapshot that restores the data. This is the main benefit of the feature. |

## 9. Hosting mapping (not chosen)

The design needs only: standard Postgres with RLS, a function runtime, and an OIDC provider with JWKS. Nothing is host-specific except `app.current_user_id()` and the DB connection method.

| Stack | Auth | API runtime | How the design maps | Watch out for |
|---|---|---|---|---|
| Neon Postgres + Neon Auth | Neon Auth (OIDC/JWT with JWKS, hosted) | Any serverless function (Vercel, Netlify, Cloudflare) | Pooled connection string, transaction-local `set_config`. `current_user_id()` reads the setting as designed. | Confirm Neon Auth supports Google plus magic link, refresh rotation, and admin user deletion before committing. Prepared statements need care behind the pooler. |
| Supabase | Supabase Auth (GoTrue, JWT with JWKS) | Edge Function, or the `sync` workflow as a plpgsql RPC | Redefine `app.current_user_id()` as `auth.uid()` mapped through `auth_sub` (Supabase `sub` is a uuid). Policies are unchanged. | If sync runs as an RPC, the validation logic moves into SQL. Prefer an Edge Function to keep validation in testable app code. |
| Cloudflare Workers + Hyperdrive + external Postgres | Any OIDC provider (Auth0, Clerk, Stytch, Cognito, and so on) | Worker verifying JWTs with a Workers-compatible JOSE library | Hyperdrive pools connections. Transaction-local `set_config` works. | Node-only DB drivers may not run in Workers. Use a driver Hyperdrive supports. Cold CPU limits are fine at this scale. |

Provider requirements, whichever stack is chosen:
- Authorization Code + PKCE for a public SPA client.
- Google and email magic link.
- Refresh-token rotation with reuse detection.
- JWKS endpoint.
- Admin API to delete a user.
- Redirect URI allowing the GitHub Pages path.

## 10. Client-side changes (design level)

### 10.1 New module and storage

Add `sync.js` (loaded before `app.js` in `index.html:52-54`). It has no build step and no dependencies beyond the platform (`fetch`, `crypto.subtle`, `crypto.randomUUID`). It exposes `Sync.emit(op)`, `Sync.kick()`, `Sync.status()`, and auth helpers.

| localStorage key | Content |
|---|---|
| `pf2_state` | Unchanged working copy, now `v: 2`. Export and Import keep working on it. |
| `pf2_sync` | `{v, client_id, owner_sub, since_revision, reset_generation, outbox[], quarantine[], recovery[]}` |
| `pf2_auth` | Refresh token and its expiry only. The access token lives in memory. |

Keeping sync metadata out of `pf2_state` means the existing Export cannot leak it and Import cannot corrupt it.

### 10.2 Where ops are emitted (map to existing code)

All emits happen next to the existing `save()` call so the local write stays the source of truth.

| Existing code | Op(s) emitted |
|---|---|
| `commitWorkout` (`app.js:963-979`, id line 971) | `workout.add`. The id becomes `crypto.randomUUID()` instead of `Math.random()...`. |
| `evaluate` (`app.js:944-961`) | `level.raise` when `state.levels[p.id]` is set. `register.set current.<cat>` when `current` changes (first start or unlock). |
| ACTION `delete-workout` (`app.js:1310`) | `workout.delete` |
| ACTION `set-current` (`app.js:1264`) | `register.set current.<cat>` |
| ACTION `join` (`app.js:1268`) | `register.set joined.<id>` = date. Also `current.<cat>` if it was started by join. |
| ACTION `leave` (`app.js:1275`) | `register.set joined.<id>` = `null` (tombstone) |
| ACTION `theme` (`app.js:1276`) | `register.set profile.theme` |
| ACTION `toggle-pro` (`app.js:1267`) | `register.set profile.pro` |
| ACTIONS `set-routine` (`app.js:1180`), `set-rest` (`app.js:1184`), `toggle-day` (`app.js:1278`) | `register.set routineId` / `restSeconds` / `trainingDays` |
| Wherever `profile.name` is edited | `register.set profile.name` (locate by grep in milestone 4) |
| ACTION `reset` (`app.js:1302`) | `reset` op (flow 5.4) |
| Import handler (`app.js:1358-1372`) | While signed in: **merge**. After a confirm ("Merge this file into your synced data?"), run the legacy-id migration (10.7) on the file, merge it into local state with the sync rules (union workouts by id, MAX levels, registers keep the newer value), and emit bootstrap ops for what changed, as in 5.1. No `reset` is sent, so nothing on other devices is discarded. Deterministic legacy ids mean importing the same file twice adds nothing. Signed out: unchanged (replaces local state). |
| ACTION `export` (`app.js:1293`) | Unchanged (exports local state). A separate "Download my server data" action calls `GET /v1/export`. |

Implementation shape: change `save()` into `save(ops = [])`. It writes `pf2_state`, appends ops to `pf2_sync.outbox` in the same synchronous tick, then calls `Sync.kick()`. When signed out, ops are not accumulated (the outbox would grow unbounded); first sign-in rebuilds ops from state instead (5.1).

### 10.3 Sync triggers

- On load, after the auth state is resolved.
- 2 s debounce after any emit.
- `online` event.
- `visibilitychange` to visible, if the last sync was over 60 s ago.
- Interval every 5 minutes while visible.
- Manual "Sync now" in Profile.

Rules:
- Single-flight. If a sync is running, flag a rerun.
- Never sync while signed out.
- Outbox batches are chunked to at most 200 ops and 200 KiB.

### 10.4 Applying pulled data

- Workouts: upsert by id. Remove local workouts whose tombstone arrives.
- Levels: MAX.
- Registers: apply the server value unless the outbox holds a pending `register.set` for that key (the user's newer local intent wins until sent).
- Snapshot after reset or user switch: replace synced fields, then replay surviving outbox ops over the result.
- Pulled `profile.theme` also calls `applyTheme()`.
- After applying, call `rerender()` only if the visible data changed. Do not interrupt an in-progress workout screen.

### 10.5 Conflict UX

Invisible by design. The only user-visible messages are:
- The remote-reset toast with backup download.
- The "sign in again" and "reload to update" banners.
- The different-account prompt (10.8).

### 10.6 Sign-in UI placement

An "Account" card at the top of the Profile tab, above the data section that holds Export, Import, and Reset.
- **Signed out:** a one-line pitch ("Back up your progress and use it on another device"), "Continue with Google", and "Email me a sign-in link". The privacy sheet (`app.js` `privacy` action) is updated to describe what the server stores.
- **Signed in:** account email (read from the ID token, never persisted in `pf2_state`), status line ("Synced 2 min ago" / "Offline, will sync" / "Sign in again"), "Sync now", "Download my server data", "Sign out", "Delete account" (in the same danger area as Reset).
- The app never forces sign-in. Every existing feature works signed out.

### 10.7 Legacy id and data migration

- Existing workout ids are 8-character base36 strings from `Math.random()` (`app.js:971`) and collide-prone. Server ids must be UUIDs.
- At first sign-in (not at boot, because hashing is async), rewrite each legacy id to a deterministic UUID: SHA-256 over `"pf2-legacy:" + id + ":" + at`, formatted as a UUID (version nibble 8). Deterministic means the same backup imported on two devices dedupes instead of duplicating.
- Rewrite the ids in `pf2_state` in one write, then set `state.v = 2`.
- New workouts from this release onward use `crypto.randomUUID()`.
- Old exported files still import. Import runs the same migration.

### 10.8 Sign-out and account switching guard

- `pf2_sync.owner_sub` records whose data this device holds.
- If a different subject signs in, prompt: "This device has data from another account." The default is "Start fresh with this account": local state is saved to `recovery` with a download offered, then replaced by the new snapshot. The alternative is "Merge into this account".
- Sign out keeps local state (the user's device copy) and clears the outbox, cursor, and tokens after a final sync attempt.

## 11. Security review

**Token storage in the SPA.**
- Recommendation: Authorization Code with PKCE. Access token (about 15 min) lives only in memory. Refresh token with rotation and reuse detection lives in `localStorage` under `pf2_auth`.
- Reasoning: a static site has no server to hold an HttpOnly cookie, and third-party cookies to a separate API domain are unreliable.
- Accepted risk: an XSS can read the refresh token. Mitigations are the CSP below, consistent `esc()` use (`app.js:15`), short rotation lifetime, and provider-side revocation.
- Alternative: a same-site API on a custom domain (`app.example.com` and `api.example.com`) with a BFF issuing an HttpOnly SameSite=Lax cookie. This is safer and is the recommended upgrade if the project gets a custom domain.

**Origin sharing risk (accepted: no custom domain).**
- `localStorage` on `<user>.github.io` is shared by every project page of that GitHub account. Any other page there can read `pf2_state` and `pf2_auth`.
- Decision: stay on GitHub Pages. The risk is accepted because every page on that origin belongs to the owner, and the app is for personal use.
- Conditions that keep it acceptable:
  - Don't publish untrusted or third-party code as another Pages project on the same account.
  - Remove the `cdn.tailwindcss.com` script from `tracker.html:10` (replace with plain CSS or a vendored file) before sign-in ships, so no third-party script runs on the origin.
  - Revisit this decision if the app is ever opened to other users.
- Consequences: tokens stay in `localStorage` (no HttpOnly cookie), and clickjacking protection (`frame-ancestors`) is not available. The impact is limited to one person's workout data.

**CORS.**
- `Access-Control-Allow-Origin` is the exact Pages origin (scheme and host, no path). No wildcard.
- `Access-Control-Allow-Headers: authorization, content-type, x-request-id, traceparent`.
- `Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS`.
- `Access-Control-Max-Age: 600`.
- `Vary: Origin`.
- No `Allow-Credentials`: we use a Bearer header, never cookies.
- `OPTIONS` is answered before auth.
- Origin checks are not authorization (any non-browser client can fake `Origin`). The JWT is the security boundary.

**CSP implications.**
- `index.html:16` has an inline script. A strict CSP needs a nonce or hash, or moving it to a file.
- Target policy: `default-src 'self'; script-src 'self'; connect-src 'self' https://<api-host> https://<provider-host>; frame-ancestors 'none'; base-uri 'none'`. Delivered by `<meta http-equiv>` because Pages cannot set headers. `frame-ancestors` is ignored in a meta tag, so clickjacking is only mitigable with a custom-domain host that sets headers.
- The sign-in redirect needs no extra CSP source (full-page navigation).

**Rate limiting.**
- Edge or WAF rule per IP (120 req/min), which every candidate stack offers.
- Per-user token bucket in-process (1 req/s, burst 20), best effort across instances.
- Hard limits come from payload caps, op counts, and per-account quotas, which cannot be bypassed by spreading requests.
- Provider-side limits cover magic-link email abuse.

**PII minimisation.**
- Server stores: opaque `auth_sub`, workout data, preferences, `profile.name` (optional free text, 60 chars).
- Server does not store: email (the provider holds it), IP addresses beyond transient infra logs, device identifiers other than the random `client_id` (logged only, never persisted in tables).
- The `profile.email` field in local state is never sent.
- Logs contain no PII (section 12).

**GDPR-style export and delete.**
- Export: `GET /v1/export` returns everything held, machine-readable and re-importable.
- Delete: hard delete with cascade, plus provider identity deletion with an outbox retry.
- Retained after deletion: aggregate metrics with no identifiers, and database backups until their rotation (Neon/Supabase/other PITR window, 7-30 days; stated in the privacy sheet). Logs hold only internal ids (the user id no longer maps to anyone after deletion) and expire in 14 days.
- Restores from backup must replay the deletions: runbook step "after any restore, re-run deletions recorded in `pending_identity_deletions` and the deletion audit log".

**Other controls.**
- All SQL is parameterized.
- JSON is validated by explicit allowlist validators (no schema-less pass-through).
- `entries` is stored as JSONB and rendered by the client through `esc()`, so stored strings are never trusted as HTML.
- The DB role has no DDL or `BYPASSRLS`.
- Secrets (DB URL, provider admin key) live only in the function runtime's secret store.
- Dependency footprint: one JWT library, one Postgres driver.

## 12. Observability

**Logs.** One structured JSON line per request, at INFO (4xx at WARN, 5xx at ERROR).

Fields: `ts`, `level`, `trace_id`, `request_id`, `route`, `status`, `error_code`, `duration_ms`, `user_id` (internal uuid), `client_id`, `schema_version`, `ops_total`, `ops_by_status` (applied, noop, duplicate, discarded, unsupported), `ops_by_kind`, `rev_before`, `rev_after`, `pull_mode`, `pull_rows`, `lock_wait_ms`, `reset_generation`.

Never logged: emails, names, tokens, request or response bodies, workout contents, raw `auth_sub`. Log lines are produced at three boundaries: request received (after auth), transaction committed or rolled back, response sent.

**Metrics (RED plus sync-specific).**
1. Rate and errors: `sync_requests_total{status, error_code}`.
2. Duration: `sync_duration_seconds` histogram (p50/p95/p99), and `db_lock_wait_seconds`.
3. `sync_ops_per_batch` histogram.
4. `sync_ops_rejected_total{code}` and `sync_ops_result_total{status}`.

Also useful: `sync_pull_rows`, `accounts_total` (gauge from a daily job), and `pending_identity_deletions` count.

**Alerts.**
- 5xx above 2% for 5 minutes.
- p95 above 1 s for 10 minutes.
- 401 rate above 20% (JWKS or provider issue).
- 422 `invalid_op` rate above 1% (bad deploy, incident 2).
- `pending_identity_deletions` older than 48 h.
- DB connection saturation above 80%.

**Healthcheck.** `GET /v1/healthz` is unauthenticated and runs a real query as `pulsefit_api` (`SELECT 1 FROM users LIMIT 1`), which proves connectivity and grants. It also reports JWKS cache age. It returns 503 only when the DB check fails. A JWKS age over 24 h reports `"status":"degraded"` with 200. An external uptime probe hits it every minute.

**Trace propagation.**
- Inbound: the client generates `X-Request-Id` and optionally sends `traceparent`. If absent, the server generates a trace id.
- Outbound: the same `traceparent` goes to the provider's admin delete call and is attached to the DB session as `application_name` suffix for slow-query correlation.
- The `trace_id` is returned in error bodies so a user can quote it.

## 13. Incident scenarios

| # | Scenario | Detect | Recover |
|---|---|---|---|
| 1 | Provider outage or JWKS rotation breaks token verification | 401 rate alert, JWKS age in health | The cache serves stale keys for up to 24 h. An unknown `kid` triggers a single refetch. Users keep working offline and the outbox drains on recovery. If keys are misconfigured, fix config and redeploy. No data loss. |
| 2 | A deploy tightens a validator and rejects valid ops | 422 `invalid_op` alert, quarantine growth in client reports | Roll back the function. Clients retain quarantined ops for 30 days and retry them after a server version change. For a permanent loosening, ship the fix and the clients retry. |
| 3 | Database restored from backup (revision goes backward) | Clients see `since_revision` above the server's revision and get a snapshot. Log line `pull_mode=snapshot reason=rewind`. | Automatic. Clients merge the snapshot then re-upload full local state as idempotent seed ops. Unsynced accounts recover from devices. |
| 4 | Reset on one device discards offline work on another | The user sees the recovery toast. Metric: `ops_result{status=discarded}`. | The backup file (`pf2_sync.recovery`) can be downloaded and imported. Decision recorded: reset wins by design, because otherwise MAX and union would resurrect reset data. |
| 5 | A device clock is years in the future | Register timestamps clamp to server now, so there is no permanent win. Workout `at` beyond now plus 1 day is a 422 `bad_timestamp`. | The client quarantines the op and shows a "check your device clock" hint on repeated `bad_timestamp`. The user fixes the clock, then the op is retried (it still holds the original `at`, so the user may need to edit it manually). |
| 6 | Connection exhaustion from serverless cold starts | DB connection saturation alert, 503 `unavailable` rate | Use the host's pooler in transaction mode (pooled connection string, Hyperdrive, or Supavisor). Limit per-instance pool size to 1-2. Backoff in clients absorbs the spike. |
| 7 | A runaway client loop or abuse hammering `/v1/sync` | 429 rate, per-user request counts in logs | Per-IP edge rule blocks. Operator adds the `user_id` to the deny list config (a deploy-time env var, because there is no admin API). Clients back off on 429. |
| 8 | Account deletion succeeded in the DB but the provider call failed | `pending_identity_deletions` count and age alert | The daily job retries. After 10 failures, an operator deletes the provider user manually using the runbook, then deletes the pending row. |
| 9 | Browser storage cleared or a device is lost | Not an incident, but the headline use case | Sign in again, receive a snapshot. Data not yet synced at the time is the only loss, which is why the sync indicator is visible. |

## 14. Test plan

What is worth testing, in priority order:

1. **Merge convergence (property-based).** Use fast-check (or similar) against the pure merge functions and the real handler.
   - Generate random op sequences from 2-3 simulated devices.
   - Deliver them in random batch splits, random order, with random duplication and dropped-then-retried batches.
   - Assert the final server state is identical to a canonical sequential application, and that each client replica equals the server state after a final sync.
   - Include resets in the generator and assert that no pre-reset workout or level ever reappears.
2. **Idempotent replay.** For any batch, apply twice: state identical, revision unchanged on the second apply, second results are `duplicate`. Repeat after pruning `applied_ops`: state is still identical (the natural idempotence claim).
3. **RLS isolation, against real Postgres in CI (service container, not a mock).**
   - Two users, same API role. With `app.user_id` for user A, every select returns zero of B's rows.
   - Inserts with B's `user_id` fail `WITH CHECK`.
   - With no setting, every table returns zero rows.
   - The setting does not leak across pooled transactions (run two transactions on the same connection).
   - The API role cannot disable RLS or read `pending_identity_deletions`.
4. **Validation table tests.** One case per `invalid_op` reason, per register key, plus boundary values (level 3 and 4, 8 KiB, 200 and 201 ops, 256 KiB body).
5. **JWT verification.** `alg=none`, HS256 with the public key as secret, wrong `aud`, wrong `iss`, expired, not-yet-valid, unknown `kid` with refetch limit.
6. **Concurrency.** 20 parallel syncs for one user (assert gap-free revisions and no lost ops) and for 20 different users (assert no lock contention).
7. **Pull correctness.** Delta paging boundaries with a revision spanning pages. Snapshot on generation mismatch. Snapshot on revision rewind. Tombstone delivery.
8. **Client unit tests (plain Node, no build step).** Outbox survives reload. Backoff schedule. Quarantine on 422 with the remaining ops sent. Legacy-id migration is deterministic and equal across two devices. Pending-op-wins rule when applying pulled registers.
9. **Account delete.** The cascade leaves zero rows. The pending-identity row is created. The provider failure path retries.
10. **One end-to-end smoke test** in CI: a headless browser runs sign-in against a provider test tenant or stub, completes a workout, syncs, and verifies a second profile bootstraps the same data.

Not worth testing: UI snapshots, CSS, the `data.js` catalog on the server (it is not validated there).

## 15. Build sequence

1. **Schema and RLS.** Migration `0001_init.sql`, roles, `app.current_user_id()`, `resolve_user`. RLS isolation tests (test plan 3) pass first.
2. **Pure merge core.** Validators, op appliers, and the pull builder as functions. Property tests (1, 2) pass against Postgres.
3. **HTTP layer.** CORS, size and rate guards, JWT verification against a stub issuer, `POST /v1/sync`, error mapping, structured logs, `/v1/healthz`. Deploy to a throwaway environment.
4. **Client outbox (signed-out safe).** `sync.js` storage layer, `save(ops)` refactor and op emission at all sites in 10.2, UUID ids for new workouts, `state.v = 2`. No network calls yet. Verify the existing app behaviour is unchanged.
5. **Auth wiring.** Provider tenant, Google and magic link, PKCE flow, in-memory access token, refresh rotation. Account card in Profile.
6. **Sync engine.** Triggers, backoff, pull apply, bootstrap and legacy-id migration, owner guard, status line. Run the second-device and first-merge scenarios manually.
7. **Reset, import, and recovery path.** Generation handling, recovery toast and backup download, import-while-signed-in merge.
8. **Export and delete.** `GET /v1/export`, `DELETE /v1/account`, pending-identity outbox plus daily job, UI flows.
9. **Hardening.** CSP, remove the Tailwind CDN from `tracker.html`, sign-in allowlist, edge rate limits, alerts, runbooks (restore, manual identity delete), short privacy note, ledger-prune job.
10. **Personal rollout.** Use it on your own phone and laptop for a week and watch the 422 and 401 metrics. No public beta.

## 16. Risks and open questions

Questions answered by the owner on 2026-11-07 (see the decisions at the top):
1. ~~**Origin.**~~ No custom domain; stay on GitHub Pages. Risk accepted in section 11.
2. ~~**Theme and reminders sync.**~~ Theme synced; reminders device-local.
3. ~~**Reset semantics.**~~ Reset wins, with the recovery backup.
4. ~~**Import while signed in.**~~ Merge (section 10.2).
5. ~~**Different account on the same device.**~~ Start fresh, local data offered as a backup download.
6. ~~**`challengeStart`.**~~ Resolved during review: it is only initialised in `defaultState()` (`app.js:196`) and never set, so it is dead code and is not synced.
7. **Retention statement.** Backup retention depends on the chosen host (typically 7-30 days). The privacy note must state the real number once the host is picked.
8. **Provider capability check.** Verify the chosen provider supports refresh-token rotation, admin user deletion, and magic link plus Google before committing (especially for Neon Auth, whose feature set I could not verify here).

Risks:
- **Stale offline LWW.** A register set offline for weeks can still win if its clamped timestamp is newer than the stored one, which is intended, but a device with a clock that is wrong in the past will lose. Impact is a preference, not progress data.
- **XSS exposure of the refresh token.** Accepted for v1 with CSP and `esc()` discipline. Audit every `innerHTML` site for `profile.name` and `routineName` before launch.
- **Tombstone growth.** Tombstones are kept forever. At 5,000 workouts the worst case is under 1 MB per user, which is negligible.
- **Pooler quirks.** Transaction-mode poolers forbid session state. All design choices use transaction-local settings, but the chosen driver must be verified against prepared statements.
- **Op ordering assumption in batches.** Ops in a batch are applied in array order. The client must keep emit order. A test covers this (test plan 8).
- **Backup restore resurrects deleted accounts.** Mitigated only by the runbook step in section 11.

Files referenced (all in /home/user/fitnesswebsite): `app.js` (lines 15, 182-214, 944-979, 1180-1184, 1264-1314, 1358-1372), `index.html` (lines 16, 52-54), `tracker.html` (line 10).