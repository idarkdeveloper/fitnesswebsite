/* Draws the pencil-sketch pictures for the dumbbell exercises and the floor moves (img/sketch/<id>.svg).
   Run: node tools/sketches.js. Each pose is a side-view figure built from joint angles
   (0° = forward/right, 90° = down, -90° = up); the working muscles are filled lime. */
const fs = require('fs');
const path = require('path');

const L = { T: 70, UA: 40, FA: 38, TH: 52, SH: 50, HEAD: 22 };
const GROUND = 268;
const INK = '#23262b', FAR = '#9aa0a8', PAPER = '#f4f1ea', LIME = '#c6f432', PLATE = '#34383e', WOOD = '#d9d2c3';
const rad = (a) => (a * Math.PI) / 180;
const step = (p, a, len) => [p[0] + len * Math.cos(rad(a)), p[1] + len * Math.sin(rad(a))];
const r1 = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${r1(p[0])} ${r1(p[1])}`;

/** Build joints from a pose: hip, torso angle, arms [upper, fore], legs [thigh, shin]. */
function joints(P) {
  const hip = P.hip, sh = step(hip, P.torso, L.T), head = step(sh, P.headA ?? P.torso, L.HEAD);
  const arm = (a) => { const e = step(sh, a[0], L.UA); return [sh, e, step(e, a[1], L.FA)]; };
  const leg = (a) => { const k = step(hip, a[0], L.TH); const an = step(k, a[1], L.SH); return [hip, k, an, step(an, a[2] ?? 0, 14)]; };
  return { hip, sh, head, nearArm: arm(P.nearArm), farArm: arm(P.farArm || P.nearArm), nearLeg: leg(P.nearLeg), farLeg: leg(P.farLeg || P.nearLeg) };
}
const poly = (pts) => `M${pts.map(pt).join(' L')}`;
/** A limb drawn as an outlined tube: dark outer stroke, light (or lime) inner stroke. */
function tube(pts, w, color, fill) {
  return { outer: `<path d="${poly(pts)}" stroke="${color}" stroke-width="${w}" />`, inner: `<path d="${poly(pts)}" stroke="${fill}" stroke-width="${w - 4.5}" />` };
}
function dumbbell(c, angle = 0, size = 1) {
  const [x, y] = c, half = 15 * size;
  const a = step(c, angle, half), b = step(c, angle + 180, half);
  const plate = (p) => `<rect x="${r1(p[0] - 6)}" y="${r1(p[1] - 12 * size)}" width="12" height="${r1(24 * size)}" rx="4" transform="rotate(${angle} ${r1(p[0])} ${r1(p[1])})" fill="${PLATE}" stroke="${INK}" stroke-width="2" />`;
  return `<g><path d="M${pt(a)} L${pt(b)}" stroke="${INK}" stroke-width="5" />${plate(a)}${plate(b)}</g>`;
}
function bench(x1, x2, top, legs = true) {
  return `<g><rect x="${x1}" y="${top}" width="${x2 - x1}" height="12" rx="5" fill="${WOOD}" stroke="${INK}" stroke-width="2.5" />
    ${legs ? `<path d="M${x1 + 14} ${top + 12} L${x1 + 10} ${GROUND} M${x2 - 14} ${top + 12} L${x2 - 10} ${GROUND}" stroke="${INK}" stroke-width="4" />` : ''}</g>`;
}
function figure(P, hl = {}) {
  const J = joints(P);
  const parts = [];
  const add = (pts, w, far, key) => parts.push({ ...tube(pts, w, far ? FAR : INK, hl[key] ? LIME : PAPER), far });
  add(J.farLeg, 15, true, 'farLeg'); add(J.farArm, 12, true, 'farArm');
  const farOut = parts.map((p) => p.outer).join(''), farIn = parts.map((p) => p.inner).join('');
  const torso = tube([J.hip, J.sh], 28, INK, hl.torso ? LIME : PAPER);
  const nl = tube(J.nearLeg, 16, INK, hl.nearLeg ? LIME : PAPER), na = tube(J.nearArm, 13, INK, hl.nearArm ? LIME : PAPER);
  const head = `<circle cx="${r1(J.head[0])}" cy="${r1(J.head[1])}" r="15" fill="${PAPER}" stroke="${INK}" stroke-width="3" />`;
  return { J, svg: `${farOut}${farIn}${torso.outer}${torso.inner}${nl.outer}${nl.inner}${head}${na.outer}${na.inner}` };
}
function arrow(d) {
  return `<path d="${d}" stroke="${INK}" stroke-width="2.5" stroke-dasharray="6 5" fill="none" marker-end="url(#ah)" />`;
}
function wrap(body, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
<defs>
  <filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>
  <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V7" stroke="${INK}" stroke-width="1.2" opacity="0.35"/></pattern>
  <marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${INK}"/></marker>
</defs>
<rect width="400" height="300" fill="${PAPER}"/>
<g stroke="${INK}" stroke-width="1" opacity="0.08"><path d="M0 60 H400 M0 120 H400 M0 180 H400 M0 240 H400"/></g>
<g filter="url(#rough)" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="200" cy="${GROUND + 6}" rx="150" ry="9" fill="url(#hatch)" stroke="none"/>
  <path d="M24 ${GROUND} C120 ${GROUND - 2} 280 ${GROUND + 2} 376 ${GROUND}" stroke="${INK}" stroke-width="2.5"/>
  ${body}
</g>${extra}
</svg>
`;
}

const POSES = {
  'db-goblet': () => {
    const f = figure({ hip: [168, 200], torso: -70, nearArm: [60, -62], nearLeg: [10, 105, 0] }, { nearLeg: 1, farLeg: 1 });
    const h = f.J.nearArm[2];
    return wrap(f.svg + dumbbell([h[0] + 2, h[1] + 4], 90, 0.9) + arrow('M300 110 V200'));
  },
  'db-bench': () => {
    const f = figure({ hip: [232, 196], torso: 180, nearArm: [-90, -90], farArm: [-88, -92], nearLeg: [35, 92, 0], farLeg: [40, 88, 0] }, { torso: 1, nearArm: 1 });
    return wrap(bench(100, 270, 206) + f.svg + dumbbell(f.J.nearArm[2], 0) + arrow('M100 150 V90'));
  },
  'db-row': () => {
    const f = figure({ hip: [160, 168], torso: -8, nearArm: [150, 90], farArm: [92, 88], nearLeg: [100, 95, 0], farLeg: [80, 92, 0] }, { torso: 1, nearArm: 1 });
    return wrap(bench(200, 330, 236) + f.svg + dumbbell(f.J.nearArm[2], 0) + arrow('M120 250 V200'));
  },
  'db-shoulder': () => {
    const f = figure({ hip: [180, 218], torso: -90, nearArm: [-62, -96], farArm: [-58, -100], nearLeg: [0, 90, 0], farLeg: [-4, 92, 0] }, { nearArm: 1, farArm: 1 });
    return wrap(bench(130, 230, 226) + f.svg + dumbbell(f.J.nearArm[2], 0) + dumbbell(f.J.farArm[2], 0, 0.9) + arrow('M280 120 V60'));
  },
  'db-rdl': () => {
    const f = figure({ hip: [176, 166], torso: -14, headA: -24, nearArm: [94, 92], farArm: [92, 92], nearLeg: [96, 90, 0], farLeg: [92, 92, 0] }, { nearLeg: 1, torso: 1 });
    return wrap(f.svg + dumbbell(f.J.nearArm[2], 0) + arrow('M330 200 C330 160 300 130 270 120'));
  },
  'db-split': () => {
    const f = figure({ hip: [192, 205], torso: -80, nearArm: [94, 90], farArm: [90, 90], nearLeg: [10, 95, 0], farLeg: [118, 200, 180] }, { nearLeg: 1 });
    return wrap(bench(70, 150, 228) + f.svg + dumbbell(f.J.nearArm[2], 90, 0.8) + arrow('M300 130 V200'));
  },
  'db-curl': () => {
    const f = figure({ hip: [196, 166], torso: -90, nearArm: [95, -58], farArm: [90, 90], nearLeg: [92, 90, 0], farLeg: [88, 90, 0] }, { nearArm: 1 });
    return wrap(f.svg + dumbbell(f.J.nearArm[2], 32) + dumbbell(f.J.farArm[2], 0, 0.9) + arrow('M262 170 C285 140 275 110 250 96'));
  },
  'db-benchsquat': () => {
    const f = figure({ hip: [162, 213], torso: -66, nearArm: [60, -62], nearLeg: [5, 100, 0] }, { nearLeg: 1, farLeg: 1 });
    const h = f.J.nearArm[2];
    return wrap(bench(90, 165, 224) + f.svg + dumbbell([h[0] + 2, h[1] + 4], 90, 0.9) + arrow('M310 200 V120'));
  },
  'db-hipthrust': () => {
    const f = figure({ hip: [220, 200], torso: 170, headA: 200, nearArm: [-4, -20], nearLeg: [10, 90, 0], farLeg: [14, 88, 0] }, { nearLeg: 1, torso: 1 });
    return wrap(bench(60, 150, 214) + f.svg + dumbbell([f.J.hip[0] + 2, f.J.hip[1] - 14], 0) + arrow('M300 210 V150'));
  },
  'db-carry': () => {
    const f = figure({ hip: [196, 166], torso: -90, nearArm: [92, 90], farArm: [88, 90], nearLeg: [72, 98, 0], farLeg: [108, 86, 0] }, { nearArm: 1, torso: 1 });
    return wrap(f.svg + dumbbell(f.J.nearArm[2], 90, 0.85) + arrow('M240 60 H330'));
  },
  'db-lateral': () => {
    // front view: built by hand from two mirrored arms and legs
    const sh = [[172, 100], [228, 100]], hip = [[184, 166], [216, 166]];
    const arms = [[sh[0], [134, 104], [98, 100]], [sh[1], [266, 104], [302, 100]]];
    const legs = [[hip[0], [180, 216], [178, 264], [166, 266]], [hip[1], [220, 216], [222, 264], [234, 266]]];
    const t = (pts, w, hl) => tube(pts, w, INK, hl ? LIME : PAPER);
    const parts = [...legs.map((l) => t(l, 16)), t([[200, 166], [200, 100]], 50), ...arms.map((a) => t(a, 13, true))];
    const svg = parts.map((p) => p.outer + p.inner).join('') + `<circle cx="200" cy="76" r="15" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
      + `<path d="M172 100 H228" stroke="${LIME}" stroke-width="10"/>`;
    return wrap(svg + dumbbell([98, 100], 90, 0.85) + dumbbell([302, 100], 90, 0.85) + arrow('M70 170 C60 140 70 120 84 108') + arrow('M330 170 C340 140 330 120 316 108'));
  },
  'db-triceps': () => {
    const f = figure({ hip: [232, 196], torso: 180, nearArm: [-90, 214], farArm: [-88, 212], nearLeg: [35, 92, 0], farLeg: [40, 88, 0] }, { nearArm: 1 });
    return wrap(bench(100, 270, 206) + f.svg + dumbbell(f.J.nearArm[2], 90, 0.85) + arrow('M96 104 C110 80 140 74 160 80'));
  },
};

/* Floor and home moves (moves.js): one sketch per exercise group. Lying figures rest on the ground line. */
const wall = (x) => `<g><path d="M${x} 36 V${GROUND}" stroke="${INK}" stroke-width="5" /><rect x="${x - 26}" y="36" width="26" height="${GROUND - 36}" fill="url(#hatch)" stroke="none" /></g>`;
Object.assign(POSES, {
  crunches: () => {
    const f = figure({ hip: [236, 252], torso: 200, headA: 218, nearArm: [24, 196], nearLeg: [-52, 68, 0], farLeg: [-46, 72, 0] }, { torso: 1 });
    return wrap(f.svg + arrow('M150 150 C168 126 196 118 220 124'));
  },
  bicycle: () => {
    const f = figure({ hip: [196, 250], torso: 194, headA: 210, nearArm: [22, 190], nearLeg: [-112, -8, 0], farLeg: [-24, -24, 0] }, { torso: 1, nearLeg: 1 });
    return wrap(f.svg + arrow('M300 150 C318 172 318 196 300 214'));
  },
  planks: () => {
    const f = figure({ hip: [215, 232], torso: 190, headA: 184, nearArm: [90, 180], nearLeg: [10, 10, 90] }, { torso: 1 });
    return wrap(f.svg + arrow('M150 150 H280'));
  },
  'flutter-kicks': () => {
    const f = figure({ hip: [168, 252], torso: 180, headA: 180, nearArm: [6, 2], nearLeg: [-24, -24, 0], farLeg: [-7, -7, 0] }, { torso: 1, nearLeg: 1 });
    return wrap(f.svg + arrow('M300 170 V214') + arrow('M322 214 V170'));
  },
  'russian-twists': () => {
    const f = figure({ hip: [186, 250], torso: -122, headA: -108, nearArm: [24, -8], farArm: [30, -4], nearLeg: [-36, 42, 0], farLeg: [-32, 44, 0] }, { torso: 1 });
    return wrap(f.svg + arrow('M196 120 C222 104 250 110 262 132'));
  },
  'mountain-climbers': () => {
    const f = figure({ hip: [238, 212], torso: 198, headA: 190, nearArm: [90, 90], farArm: [92, 90], nearLeg: [150, 22, 90], farLeg: [22, 22, 90] }, { torso: 1, nearLeg: 1 });
    return wrap(f.svg + arrow('M286 196 C262 186 240 190 224 204'));
  },
  'wall-sits': () => {
    const f = figure({ hip: [142, 218], torso: -90, nearArm: [82, 24], nearLeg: [0, 90, 0], farLeg: [-3, 90, 0] }, { nearLeg: 1, farLeg: 1 });
    return wrap(wall(124) + f.svg + arrow('M270 150 V214'));
  },
  'calf-raises': () => {
    const f = figure({ hip: [196, 154], torso: -90, nearArm: [94, 90], farArm: [88, 90], nearLeg: [90, 90, 62], farLeg: [88, 92, 62] }, { nearLeg: 1, farLeg: 1 });
    return wrap(f.svg + arrow('M270 250 V190'));
  },
  'glute-kicks': () => {
    const f = figure({ hip: [236, 212], torso: 196, headA: 186, nearArm: [90, 90], farArm: [92, 90], nearLeg: [-10, -88, 0], farLeg: [90, 0, 0] }, { nearLeg: 1 });
    return wrap(f.svg + arrow('M330 220 C340 190 330 164 312 150'));
  },
  supermans: () => {
    const f = figure({ hip: [212, 250], torso: 189, headA: 202, nearArm: [196, 190], farArm: [200, 194], nearLeg: [-9, -9, 0], farLeg: [-5, -5, 0] }, { torso: 1 });
    return wrap(f.svg + arrow('M84 190 V150') + arrow('M318 196 V156'));
  },
  'pike-pushups': () => {
    const f = figure({ hip: [222, 166], torso: 155, headA: 118, nearArm: [110, 110], farArm: [106, 108], nearLeg: [78, 78, 0], farLeg: [74, 78, 0] }, { nearArm: 1, farArm: 1 });
    return wrap(f.svg + arrow('M120 140 V200'));
  },
});

const out = path.join(__dirname, '..', 'img', 'sketch');
fs.mkdirSync(out, { recursive: true });
for (const [id, fn] of Object.entries(POSES)) fs.writeFileSync(path.join(out, `${id}.svg`), fn());
console.log(`wrote ${Object.keys(POSES).length} sketches to img/sketch/`);
