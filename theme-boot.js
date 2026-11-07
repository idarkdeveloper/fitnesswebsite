/* Apply the saved theme before first paint (kept out of index.html so the CSP can forbid inline scripts). */
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('pf2_state') || '{}');
    var t = s.profile && s.profile.theme;
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
