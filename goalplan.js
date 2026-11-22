/* Mizan 14-week plan: 23 Nov 2026 – 28 Feb 2027, the first stretch towards the owner's goal of 85 kg.
   A safe pace is 0.7–1 kg a week, so this block aims for about 100 kg by the end of February and 85 kg around
   September–October 2027. Three phases raise steps and add conditioning; week 9 is an easier recovery week. */
window.PF_GOALPLAN = (function () {
  const START = '2026-11-23', WEEKS = 14, START_KG = 112.7, GOAL_KG = 85;
  const PHASES = [
    { name: 'Foundation', from: 1, to: 4, steps: 7000,
      strength: '3 dumbbell sessions (Tue, Thu, Sat): leave 2 reps in reserve on every set.',
      cardio: ['Sunday: brisk walk, 45 min.', 'One shift day: 20 min walk after a meal.'],
      focus: 'Learn the lifts, find your working weights, build the walking habit.' },
    { name: 'Build', from: 5, to: 9, steps: 9000,
      strength: '3 dumbbell sessions, then a 10-minute finisher: every minute, 10 goblet squats, 8 incline pushups on the bench, 10 rows.',
      cardio: ['Sunday: brisk walk, 60 min.', 'One shift day: 20 min walk after a meal.'],
      focus: 'More steps and a short circuit to burn extra calories without jumping.' },
    { name: 'Push', from: 10, to: 14, steps: 10000,
      strength: '3 dumbbell sessions with the finisher. Keep adding reps and weight.',
      cardio: ['Sunday: brisk walk, 60 min.', 'One day: intervals, 8 × 30 s fast (stairs or uphill) + 90 s easy.'],
      focus: 'Highest activity of the block. Low impact only: no jumping at this weight.' },
  ];
  const RECOVERY = 9;   // week 9 (18–24 Jan): 2 sets per exercise, no finisher
  const keyAdd = (k, n) => { const [y, m, d] = k.split('-').map(Number); const t = new Date(y, m - 1, d + n); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`; };
  /** Week number (1–14) for a date, 0 before the start, WEEKS + 1 after the end. */
  function weekOf(dayKey) {
    if (dayKey < START) return 0;
    const [y, m, d] = START.split('-').map(Number), [y2, m2, d2] = dayKey.split('-').map(Number);
    const days = Math.round((new Date(y2, m2 - 1, d2) - new Date(y, m - 1, d)) / 86400000);
    return Math.min(WEEKS + 1, Math.floor(days / 7) + 1);
  }
  const phaseOf = (wk) => PHASES.find((p) => wk >= p.from && wk <= p.to) || null;
  /** Target weight at the end of week `wk`: a faster first week (water), then 0.9 kg a week. */
  const targetKg = (wk) => Math.round((START_KG - 1.3 - 0.9 * (wk - 1)) * 10) / 10;
  const weekStart = (wk) => keyAdd(START, (wk - 1) * 7);
  const weekEnd = (wk) => keyAdd(START, wk * 7 - 1);
  return { START, WEEKS, START_KG, GOAL_KG, PHASES, RECOVERY, weekOf, phaseOf, targetKg, weekStart, weekEnd };
})();
