/* Installable-app support: registers the service worker and exposes install helpers to app.js. */
(function () {
  'use strict';
  let deferred = null;
  const listeners = [];
  const notify = () => listeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } });

  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);

  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; notify(); });
  window.addEventListener('appinstalled', () => { deferred = null; notify(); });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ }); });
  }

  window.PFInstall = {
    installed: standalone,
    isIOS,
    canPrompt: () => !!deferred,
    async prompt() {
      if (!deferred) return false;
      const e = deferred; deferred = null;
      e.prompt();
      const choice = await e.userChoice.catch(() => null);
      notify();
      return !!choice && choice.outcome === 'accepted';
    },
    onChange(fn) { listeners.push(fn); },
  };
})();
