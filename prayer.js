/* Prayer times, worked out on the device from the date and a location (no network).
   Astronomy after the PrayTimes.org method (Hamid Zarrabi-Zadeh, LGPL):
   sun position -> solar noon, then the hour angle for each prayer's sun angle.
   PF_PRAYER.times(date, { lat, lon, method, asr }) -> { fajr, sunrise, dhuhr, asr, maghrib, isha } as minutes after local midnight. */
(function () {
  const METHODS = {
    mwl: { name: 'Muslim World League', fajr: 18, isha: 17 },
    diyanet: { name: 'Diyanet (Turkey, many German mosques)', fajr: 18, isha: 17 },
    karachi: { name: 'Karachi (University of Islamic Sciences)', fajr: 18, isha: 18 },
    isna: { name: 'ISNA (North America)', fajr: 15, isha: 15 },
    makkah: { name: 'Umm al-Qura, Makkah', fajr: 18.5, ishaMin: 90 },
    egypt: { name: 'Egyptian General Authority', fajr: 19.5, isha: 17.5 },
  };
  const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
  const sin = (d) => Math.sin(rad(d)), cos = (d) => Math.cos(rad(d)), tan = (d) => Math.tan(rad(d));
  const asin = (x) => deg(Math.asin(x)), acos = (x) => deg(Math.acos(x)), atan2 = (y, x) => deg(Math.atan2(y, x));
  const acot = (x) => deg(Math.atan(1 / x));
  const fix = (a, b) => { a -= b * Math.floor(a / b); return a < 0 ? a + b : a; };
  const fixAngle = (a) => fix(a, 360), fixHour = (h) => fix(h, 24);

  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  }
  function sun(jd) {
    const D = jd - 2451545.0;
    const g = fixAngle(357.529 + 0.98560028 * D), q = fixAngle(280.459 + 0.98564736 * D);
    const L = fixAngle(q + 1.915 * sin(g) + 0.020 * sin(2 * g)), e = 23.439 - 0.00000036 * D;
    const RA = fixHour(atan2(cos(e) * sin(L), cos(L)) / 15);
    return { decl: asin(sin(e) * sin(L)), eqt: q / 15 - RA };
  }

  function times(date, opt) {
    const lat = Number(opt.lat), lon = Number(opt.lon);
    if (!isFinite(lat) || !isFinite(lon)) return null;
    const M = METHODS[opt.method] || METHODS.mwl, asrFactor = opt.asr === 'hanafi' ? 2 : 1;
    const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate();
    const tz = -new Date(y, mo - 1, d, 12).getTimezoneOffset() / 60;      // follows summer time
    const jd = julian(y, mo, d) - lon / (15 * 24);
    const noon = (t) => fixHour(12 - sun(jd + t).eqt);
    const angleTime = (angle, t, before) => {
      const { decl } = sun(jd + t);
      const T = acos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat))) / 15;
      return noon(t) + (before ? -T : T);
    };
    const asrTime = (t) => { const { decl } = sun(jd + t); return angleTime(-acot(asrFactor + tan(Math.abs(lat - decl))), t); };

    const r = {
      fajr: angleTime(M.fajr, 5 / 24, true),
      sunrise: angleTime(0.833, 6 / 24, true),
      dhuhr: noon(12 / 24),
      asr: asrTime(13 / 24),
      sunset: angleTime(0.833, 18 / 24),
    };
    r.maghrib = r.sunset;
    r.isha = M.ishaMin ? r.maghrib + M.ishaMin / 60 : angleTime(M.isha, 18 / 24);

    // Summer nights in Germany: the sun may never reach 18° below the horizon. Then Fajr/Isha use
    // the "angle-based" rule: at most angle/60 of the night before sunrise / after sunset.
    const night = fixHour(r.sunrise - r.sunset);
    const fajrMax = (M.fajr / 60) * night;
    if (!isFinite(r.fajr) || fixHour(r.sunrise - r.fajr) > fajrMax) r.fajr = r.sunrise - fajrMax;
    if (!M.ishaMin) {
      const ishaMax = (M.isha / 60) * night;
      if (!isFinite(r.isha) || fixHour(r.isha - r.sunset) > ishaMax) r.isha = r.sunset + ishaMax;
    }
    r.dhuhr += 1 / 60;   // a minute after the sun passes noon

    const out = {};
    for (const k of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      out[k] = Math.round(fixHour(r[k] + tz - lon / 15) * 60) % 1440;
    }
    return out;
  }

  // German cities for a quick pick when location access is off.
  const CITIES = [
    ['Berlin', 52.52, 13.405], ['Hamburg', 53.551, 9.994], ['Munich', 48.137, 11.575], ['Cologne', 50.938, 6.96],
    ['Frankfurt', 50.11, 8.682], ['Stuttgart', 48.776, 9.183], ['Düsseldorf', 51.227, 6.774], ['Dortmund', 51.514, 7.468],
    ['Essen', 51.456, 7.012], ['Leipzig', 51.34, 12.375], ['Bremen', 53.079, 8.802], ['Dresden', 51.05, 13.738],
    ['Hanover', 52.375, 9.732], ['Nuremberg', 49.452, 11.077], ['Duisburg', 51.435, 6.763], ['Bochum', 51.482, 7.216],
    ['Wuppertal', 51.256, 7.151], ['Bielefeld', 52.03, 8.532], ['Bonn', 50.737, 7.098], ['Mannheim', 49.487, 8.466],
  ];

  window.PF_PRAYER = { times, METHODS, CITIES, NAMES: { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' } };
})();
