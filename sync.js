/* PulseFit cloud sync (light version). Design: docs/BACKEND_DESIGN.md.
   - Local data stays the working copy; the cloud holds one document per user.
   - A sync run downloads the document, merges it with local data (sync-core.js),
     and uploads the result only if the cloud version hasn't changed meanwhile.
   Loaded after app.js. Talks to the app only through window.PF_APP. */
(function () {
  'use strict';
  const C = window.PFSyncCore;
  const APP = () => window.PF_APP;
  const KEY = 'pf2_sync';
  const RECOVERY_KEY = 'pf2_sync_recovery';
  const cfg = window.PF_SYNC_CONFIG || {};
  const configured = !!(cfg.url && cfg.anonKey) || !!window.__PF_SYNC_ADAPTER__;

  /* ---------- device bookkeeping (pf2_sync) ---------- */
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (s && typeof s === 'object' && s.meta) return s;
    } catch { /* fall through */ }
    return { owner: null, version: null, lastSynced: null, meta: C.emptyMeta() };
  }
  let store = load();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* storage full */ } };
  const nowIso = () => new Date().toISOString();

  /* ---------- status, shown in Profile → Account ---------- */
  const status = { configured, ready: false, user: null, state: configured ? 'idle' : 'off', detail: '', lastSynced: store.lastSynced };
  const listeners = [];
  function setStatus(state, detail = '') {
    status.state = state; status.detail = detail; status.lastSynced = store.lastSynced;
    listeners.forEach((fn) => { try { fn(status); } catch { /* ignore */ } });
  }

  /* ---------- Supabase adapter (the only provider-specific code) ---------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = () => reject(Object.assign(new Error('script'), { code: 'offline' }));
      document.head.appendChild(s);
    });
  }
  function syncError(res) {
    const e = res.error || {};
    const msg = String(e.message || '');
    let code = 'server';
    if (res.status === 0 || /fetch|network|load failed/i.test(msg)) code = navigator.onLine === false ? 'offline' : 'unreachable';
    else if (res.status === 401 || /jwt/i.test(msg) || e.code === 'PGRST301' || e.code === 'PGRST303') code = 'auth';
    else if (res.status === 403 || e.code === '42501') code = 'not_allowed';
    return Object.assign(new Error(msg || 'sync failed'), { code });
  }
  function supabaseAdapter() {
    let client = null;
    let user = null;
    const toUser = (session) => (session && session.user ? { id: session.user.id, email: session.user.email || '' } : null);
    const redirectTo = () => location.origin + location.pathname;
    return {
      async init(onAuth) {
        await loadScript('vendor/supabase-2.118.0.js');
        client = window.supabase.createClient(cfg.url, cfg.anonKey, {
          auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'pf2_auth' },
        });
        const { data } = await client.auth.getSession();
        user = toUser(data.session);
        // Don't call Supabase inside this callback (it can deadlock); just hand the user over.
        client.auth.onAuthStateChange((_ev, session) => { user = toUser(session); setTimeout(() => onAuth(user), 0); });
        return user;
      },
      user: () => user,
      async signInGoogle() {
        const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } });
        if (error) throw error;
      },
      async signInEmail(email) {
        const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: redirectTo() } });
        if (error) throw error;
      },
      async verifyCode(email, token) {
        const { error } = await client.auth.verifyOtp({ email, token, type: 'email' });
        if (error) throw error;
      },
      async signOut() { await client.auth.signOut(); user = null; },
      async getDoc() {
        const res = await client.from('sync_doc').select('doc,version').maybeSingle();
        if (res.error) throw syncError(res);
        return res.data ? { doc: res.data.doc, version: res.data.version } : null;
      },
      async putDoc(doc, version) {
        if (version == null) {
          const res = await client.from('sync_doc').insert({ doc }).select('version').single();
          if (res.error && res.error.code === '23505') return { conflict: true };   // another device created it first
          if (res.error) throw syncError(res);
          return { version: res.data.version };
        }
        const res = await client.from('sync_doc').update({ doc }).eq('version', version).select('version');
        if (res.error) throw syncError(res);
        if (!res.data || !res.data.length) return { conflict: true };              // version moved on
        return { version: res.data[0].version };
      },
      async deleteDoc() {
        const res = await client.from('sync_doc').delete().eq('user_id', user.id);
        if (res.error) throw syncError(res);
      },
    };
  }

  // Tests can inject an in-memory adapter with the same shape.
  const adapter = !configured ? null : (window.__PF_SYNC_ADAPTER__ || supabaseAdapter());

  /* ---------- the sync run ---------- */
  let running = false;
  let again = false;
  let timer = null;
  let lastRun = 0;

  function schedule(ms) {
    clearTimeout(timer);
    timer = setTimeout(run, ms);
  }

  function saveRecovery(state, reason) {
    try { localStorage.setItem(RECOVERY_KEY, JSON.stringify({ at: nowIso(), reason, state })); } catch { /* ignore */ }
  }

  async function run() {
    if (!adapter || !status.user) return;
    if (running) { again = true; return; }
    running = true; lastRun = Date.now();
    setStatus('syncing');
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const remote = await adapter.getDoc();
        const rdoc = remote ? remote.doc : null;
        if (rdoc) {
          const bad = C.validateDoc(rdoc);
          if (bad) { setStatus('error', `Couldn't read cloud data (${bad}). Your data on this device is unchanged.`); return; }
        }
        // From here to setState there is no await, so no local edit can slip in between.
        const app = APP();
        const state = app.getState();
        const { doc, lostLocal } = C.merge(C.toDoc(state, store.meta), rdoc, nowIso());
        if (lostLocal) saveRecovery(state, 'reset-elsewhere');
        const next = C.applyDoc(state, doc);
        store.meta = C.metaFromDoc(doc, next);
        persist();
        if (C.stable(C.pick(next)) !== C.stable(C.pick(state))) app.setState(next);
        if (lostLocal) app.toast('Progress was reset on another device. Profile → Account has a backup of this device.');

        if (!rdoc || C.stable(doc) !== C.stable(rdoc)) {
          const res = await adapter.putDoc(doc, remote ? remote.version : null);
          if (res.conflict) continue;                      // someone saved first: download, merge, retry
          store.version = res.version;
        } else {
          store.version = remote.version;
        }
        store.lastSynced = nowIso();
        persist();
        setStatus('ok');
        return;
      }
      setStatus('error', 'Another device kept saving at the same time. Will retry.');
      schedule(10000);
    } catch (e) {
      const code = e && e.code;
      if (code === 'offline') setStatus('offline');
      else if (code === 'unreachable') setStatus('unreachable');
      else if (code === 'auth') setStatus('auth');
      else if (code === 'not_allowed') setStatus('not_allowed');
      else setStatus('error', (e && e.message) || 'Sync failed');
    } finally {
      running = false;
      if (again) { again = false; schedule(500); }
    }
  }

  /* ---------- sign-in, account guard ---------- */
  function hasLocalData(state) {
    const d = C.pick(state);
    return d.workouts.length > 0 || Object.keys(d.levels).length > 0 || Object.keys(d.current).length > 0;
  }

  function onUser(user) {
    const prev = status.user;
    status.user = user;
    if (!user) { setStatus('signedOut'); return; }
    if (prev && prev.id === user.id) {
      // Same account (e.g. a token refresh). If the session had expired, sync again now.
      if (status.state === 'auth' || status.state === 'signedOut') { setStatus('idle'); schedule(0); }
      return;
    }
    const app = APP();
    if (store.owner && store.owner !== user.id && hasLocalData(app.getState())) {
      // A different account on this device: back up local data, then start fresh (decision 5).
      const ok = confirm('This device has data from a different account. Download it as a backup and start fresh for this account?');
      if (!ok) { api.signOut(); return; }
      app.downloadJson(app.getState(), 'pulsefit-other-account');
      const fresh = app.freshState();
      store = { owner: user.id, version: null, lastSynced: null, meta: C.noteSave(C.emptyMeta(), fresh, nowIso()) };
      persist();
      app.setState(fresh);
    } else if (store.owner !== user.id) {
      store.owner = user.id; store.version = null; persist();
    }
    setStatus('idle');
    schedule(0);
  }

  /* ---------- public API ---------- */
  const api = {
    status: () => ({ ...status }),
    onChange(fn) { listeners.push(fn); },
    signedIn: () => !!status.user,

    /** Called by app.js save(): stamp what changed, then sync a few seconds later. */
    noteSave(state) {
      store.meta = C.noteSave(store.meta, state, nowIso());
      persist();
      if (status.user) schedule(3000);
    },
    /** Called by the Reset action after state is replaced. */
    noteReset(state) {
      store.meta = C.noteReset(store.meta, state);
      persist();
    },
    mergeImport: (state, file) => C.mergeImport(state, file),

    syncNow() { schedule(0); },
    async signInGoogle() {
      try { await adapter.signInGoogle(); } catch (e) { APP().toast('Sign-in failed: ' + (e.message || 'try again')); }
    },
    async signInEmail(email) {
      try { await adapter.signInEmail(email); APP().toast('Check your email for the sign-in link'); return true; }
      catch (e) { APP().toast(/signups not allowed|not found|otp_disabled/i.test(e.message || '') ? "That email can't sign in here" : 'Sign-in failed: ' + (e.message || 'try again')); return false; }
    },
    /** Sign in with the 6-digit code from the email (works inside an installed app, where links open elsewhere). */
    async verifyCode(email, code) {
      try { await adapter.verifyCode(email, code); return true; }
      catch (e) { APP().toast(/expired|invalid/i.test(e.message || '') ? 'That code is wrong or expired' : 'Sign-in failed: ' + (e.message || 'try again')); return false; }
    },
    async signOut() {
      try { await adapter.signOut(); } catch { /* still signed out locally */ }
      onUser(null);
    },
    /** Delete the cloud copy and sign out. Data on this device stays. */
    async deleteCloud() {
      try {
        await adapter.deleteDoc();
        store.owner = null; store.version = null; store.lastSynced = null; persist();
        await api.signOut();
        APP().toast('Cloud data deleted. Your data on this device is unchanged.');
      } catch (e) {
        APP().toast("Couldn't delete cloud data: " + (e.message || 'try again'));
      }
    },
    recovery() {
      try { return JSON.parse(localStorage.getItem(RECOVERY_KEY) || 'null'); } catch { return null; }
    },
    clearRecovery() { try { localStorage.removeItem(RECOVERY_KEY); } catch { /* ignore */ } setStatus(status.state, status.detail); },
  };
  window.PFSync = api;
  if (typeof window.PF_onSyncReady === 'function') window.PF_onSyncReady();

  /* ---------- boot ---------- */
  if (!store.meta.snap && APP()) { store.meta = C.noteSave(store.meta, APP().getState(), nowIso()); persist(); }
  if (!adapter) return;
  window.addEventListener('online', () => schedule(0));
  window.addEventListener('offline', () => { if (status.user) setStatus('offline'); });
  const onFocus = () => { if (document.visibilityState === 'visible' && Date.now() - lastRun > 15000) schedule(0); };
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onFocus);
  adapter.init(onUser)
    .then((user) => { status.ready = true; onUser(user); })
    .catch(() => { status.ready = true; setStatus('unreachable'); });
})();
