/* PulseFit meal data: quick foods, an Indian weight-loss meal plan built from what German supermarkets sell,
   and the ingredients that build the grocery list. A new week plan is generated every Monday (see weekPlan).
   Calories and protein are typical home-cooking estimates per serving (moderate oil). They're meant to be roughly
   right and consistent; the weekly weight trend tells you whether to adjust. */
window.PF_MEALS = (function () {
  const V = 'Vegetables & fruit', MT = 'Meat, fish & eggs', DY = 'Dairy', GR = 'Bread, grains & flour',
    TN = 'Tins, lentils & pulses', FZ = 'Frozen', PN = 'Pantry', AS = 'Asia / Indian shop';
  // Grocery sections, in shopping order. The Asia shop goes last: one trip, or skip it when you still have stock.
  const SECTIONS = [V, MT, DY, GR, TN, FZ, PN, AS];

  // id: [name, section, unit, pack?]  unit: g | ml | pc | tin.  pack: [size in unit, label] for "2 × 400 g pack" hints.
  const ING = {
    onion: ['Onions (Zwiebeln)', V, 'g', [1000, '1 kg net']],
    tomato: ['Tomatoes (Tomaten)', V, 'g'],
    cucumber: ['Cucumber (Salatgurke)', V, 'pc'],
    carrot: ['Carrots (Möhren)', V, 'g', [1000, '1 kg bag']],
    capsicum: ['Peppers (Paprika)', V, 'pc'],
    cauliflower: ['Cauliflower (Blumenkohl)', V, 'pc'],
    cabbage: ['White cabbage (Weißkohl)', V, 'g'],
    pumpkin: ['Hokkaido pumpkin (Hokkaido-Kürbis)', V, 'g'],
    zucchini: ['Courgette (Zucchini)', V, 'g'],
    beans: ['Green beans (grüne Bohnen)', V, 'g'],
    lemon: ['Lemons (Zitronen)', V, 'pc'],
    fruit: ['Fruit (apples, oranges, bananas)', V, 'pc'],
    chicken: ['Chicken breast (Hähnchenbrustfilet)', MT, 'g', [400, '400 g pack']],
    turkey: ['Turkey mince (Putenhackfleisch)', MT, 'g', [400, '400 g pack']],
    eggs: ['Eggs (Eier)', MT, 'pc', [10, 'box of 10']],
    quark: ['Low-fat quark (Magerquark)', DY, 'g', [500, '500 g tub']],
    curd: ['Plain yoghurt 1.5 % (Naturjoghurt)', DY, 'g', [500, '500 g tub']],
    milk: ['Milk 1.5 % (fettarme Milch)', DY, 'ml', [1000, '1 L carton']],
    atta: ['Chapati atta or Weizenvollkornmehl', GR, 'g', [1000, '1 kg bag']],
    rice: ['Basmati rice', GR, 'g', [1000, '1 kg bag']],
    bread: ['Wholegrain bread (Vollkornbrot)', GR, 'pc', [10, 'loaf, about 10 slices']],
    oats: ['Oats (Haferflocken)', GR, 'g', [500, '500 g bag']],
    sooji: ['Semolina (Hartweizengrieß)', GR, 'g', [500, '500 g bag']],
    dal: ['Red lentils (rote Linsen)', TN, 'g', [500, '500 g bag']],
    rajma: ['Kidney beans, tin (Kidneybohnen)', TN, 'tin'],
    chana: ['Chickpeas, tin (Kichererbsen)', TN, 'tin'],
    tinnedtom: ['Chopped tomatoes, tin (gehackte Tomaten)', TN, 'g', [400, '400 g tin']],
    tuna: ['Tuna in water, tin (Thunfisch naturell)', TN, 'tin'],
    spinach: ['Frozen leaf spinach (TK Blattspinat)', FZ, 'g', [450, '450 g pack']],
    mixedveg: ['Frozen mixed vegetables (TK Gemüse)', FZ, 'g', [1000, '1 kg bag']],
    peas: ['Frozen peas (TK Erbsen)', FZ, 'g', [450, '450 g bag']],
    fish: ['Frozen pollock fillets (TK Alaska-Seelachs)', FZ, 'g', [400, '400 g pack']],
    peanuts: ['Peanuts, unsalted (Erdnüsse)', PN, 'g', [200, '200 g bag']],
    oil: ['Rapeseed oil (Rapsöl)', PN, 'ml', [1000, '1 L bottle']],
    tea: ['Black tea (for chai)', PN, 'g'],
    sugar: ['Sugar (Zucker)', PN, 'g'],
    paneer: ['Paneer', AS, 'g', [400, '400 g block']],
    besan: ['Gram flour (besan)', AS, 'g', [1000, '1 kg bag']],
    moong: ['Yellow moong dal', AS, 'g', [1000, '1 kg bag']],
    poha: ['Poha', AS, 'g', [500, '500 g bag']],
    roastchana: ['Roasted chana', AS, 'g', [500, '500 g bag']],
  };

  // id: [name, serving, kcal, protein g, { ingredient: amount per serving }]
  const DISH = {
    roti: ['Roti', '1 medium', 110, 3, { atta: 30 }],
    bread: ['Vollkornbrot', '1 slice', 105, 4, { bread: 1 }],
    rice: ['Rice', '1 cup cooked', 200, 4, { rice: 60 }],
    dal: ['Masoor dal', '1 bowl', 180, 11, { dal: 50, onion: 25, tinnedtom: 40, oil: 5 }],
    dalpalak: ['Dal palak', '1 bowl', 190, 11, { dal: 45, spinach: 100, onion: 25, tinnedtom: 30, oil: 5 }],
    rajma: ['Rajma', '1 bowl', 230, 12, { rajma: 0.5, onion: 30, tinnedtom: 60, oil: 5 }],
    chana: ['Chana masala', '1 bowl', 250, 11, { chana: 0.5, onion: 30, tinnedtom: 60, oil: 6 }],
    chickencurry: ['Chicken curry', '1 bowl', 310, 30, { chicken: 130, onion: 50, tinnedtom: 60, curd: 20, oil: 10 }],
    tikka: ['Chicken tikka', '150 g cooked', 260, 38, { chicken: 170, curd: 40, lemon: 0.25, oil: 5 }],
    keema: ['Keema matar (turkey mince)', '1 bowl', 330, 30, { turkey: 150, peas: 60, onion: 40, tinnedtom: 50, oil: 6 }],
    fishcurry: ['Fish curry (Seelachs)', '1 bowl', 260, 30, { fish: 160, onion: 40, tinnedtom: 60, oil: 8 }],
    fishtikka: ['Tandoori fish', '1 fillet, 160 g', 210, 32, { fish: 180, curd: 40, lemon: 0.25, oil: 5 }],
    tunamasala: ['Tuna masala', '1 tin', 190, 26, { tuna: 1, onion: 30, tomato: 40, oil: 4 }],
    eggcurry: ['Egg curry', '3 eggs', 320, 20, { eggs: 3, onion: 40, tinnedtom: 60, oil: 6 }],
    paneerbhurji: ['Paneer bhurji', '100 g paneer', 330, 19, { paneer: 100, onion: 40, tomato: 50, oil: 5 }],
    paneertikka: ['Paneer tikka with peppers', '100 g paneer', 320, 20, { paneer: 100, capsicum: 1, onion: 30, curd: 30, oil: 5 }],
    palakpaneer: ['Palak paneer', '1 bowl', 330, 17, { paneer: 80, spinach: 150, onion: 30, tinnedtom: 30, oil: 8 }],
    omelette: ['Masala omelette', '3 eggs', 290, 19, { eggs: 3, onion: 30, tomato: 30, oil: 5 }],
    eggbhurji: ['Egg bhurji', '3 eggs', 290, 19, { eggs: 3, onion: 30, tomato: 30, oil: 5 }],
    boiled2: ['Boiled eggs', '2 eggs', 150, 12, { eggs: 2 }],
    oatsquark: ['Oats with quark & fruit', '1 bowl', 410, 29, { oats: 50, quark: 150, milk: 100, fruit: 1 }],
    masalaoats: ['Masala oats', '1 bowl', 280, 11, { oats: 60, mixedveg: 60, onion: 20, oil: 4 }],
    moongchilla: ['Moong dal chilla', '2 chillas', 320, 19, { moong: 80, onion: 20, oil: 6 }],
    besanchilla: ['Besan chilla', '2 chillas', 300, 14, { besan: 60, onion: 30, tomato: 30, oil: 6 }],
    poha: ['Vegetable poha', '1 plate', 330, 8, { poha: 60, onion: 30, peas: 40, peanuts: 10, oil: 5 }],
    upma: ['Vegetable upma', '1 bowl', 280, 7, { sooji: 50, mixedveg: 60, onion: 20, oil: 5 }],
    khichdi: ['Moong dal khichdi', '1 bowl', 320, 13, { rice: 40, moong: 40, mixedveg: 50, oil: 5 }],
    sabzi: ['Mixed veg sabzi', '1 bowl', 120, 4, { mixedveg: 150, onion: 20, oil: 7 }],
    gobi: ['Gobi sabzi (cauliflower)', '1 bowl', 130, 5, { cauliflower: 0.33, onion: 20, tomato: 30, oil: 7 }],
    pattagobhi: ['Patta gobhi (white cabbage)', '1 bowl', 110, 4, { cabbage: 200, peas: 30, oil: 6 }],
    kaddu: ['Kaddu sabzi (Hokkaido pumpkin)', '1 bowl', 140, 3, { pumpkin: 200, onion: 20, oil: 6 }],
    gajarmatar: ['Gajar matar (carrot & peas)', '1 bowl', 130, 4, { carrot: 150, peas: 50, oil: 6 }],
    zucchini: ['Zucchini sabzi', '1 bowl', 100, 3, { zucchini: 200, onion: 20, tomato: 30, oil: 6 }],
    beans: ['Beans poriyal (green beans)', '1 bowl', 110, 4, { beans: 150, onion: 20, oil: 6 }],
    salad: ['Salad', 'cucumber, carrot, onion', 40, 2, { cucumber: 0.25, carrot: 40, onion: 20, lemon: 0.25 }],
    raita: ['Cucumber raita', '1 bowl', 90, 6, { curd: 150, cucumber: 0.2 }],
    curd: ['Yoghurt (1.5 %)', '1 bowl, 150 g', 80, 5, { curd: 150 }],
    quarkfruit: ['Quark with fruit', '150 g + 1 fruit', 180, 19, { quark: 150, fruit: 1 }],
    chai: ['Chai', '1 cup, milk + sugar', 100, 3, { milk: 100, sugar: 10, tea: 3 }],
    tea: ['Tea', '1 cup, no sugar', 15, 0, { tea: 3, milk: 20 }],
    roastchana: ['Roasted chana', '30 g', 110, 6, { roastchana: 30 }],
    fruit: ['Fruit', '1 apple / orange', 80, 1, { fruit: 1 }],
    chanachaat: ['Chana chaat', '1 bowl', 190, 9, { chana: 0.33, onion: 20, tomato: 30, lemon: 0.25 }],
  };

  // Your everyday foods, preloaded into "My foods" (values editable in the app). Ids are fixed so devices don't duplicate.
  const QUICK = [
    ['q-roti', 'Roti', 110, 3], ['q-rice', 'Rice (1 plate)', 300, 6], ['q-daal', 'Daal (1 bowl)', 170, 9],
    ['q-chicken-curry', 'Chicken curry (1 bowl)', 300, 25], ['q-chicken-dish', 'Chicken tikka / roast (150 g)', 250, 30],
    ['q-paneer', 'Paneer dish (1 bowl)', 350, 15], ['q-egg', 'Egg, boiled', 75, 6], ['q-chai', 'Chai (milk + sugar)', 100, 3],
    ['q-tea', 'Tea (no sugar)', 15, 0], ['q-biscuit', 'Biscuit', 45, 1], ['q-bread', 'Bread (1 slice)', 75, 3],
    ['q-chai-biscuits', 'Chai + 2 biscuits', 190, 5],
  ];
  // Added for life in Germany (seeded once on devices that already had the list above).
  const QUICK_DE = [
    ['q-quark', 'Magerquark (250 g)', 170, 30], ['q-vollkorn', 'Vollkornbrot (1 slice)', 105, 4],
    ['q-doener', 'Döner kebab', 650, 35], ['q-brezel', 'Brezel (pretzel)', 220, 6], ['q-skyr', 'Skyr (150 g)', 95, 16],
  ];

  // Meal options per slot. p = main protein, used to keep the week varied. 'SABZI' becomes a seasonal vegetable dish.
  const B = 'Breakfast', L = 'Lunch', S = 'Snack', D = 'Dinner';
  const POOLS = {
    [B]: [
      { p: 'egg', items: [['omelette', 1], ['bread', 1]] },
      { p: 'egg', items: [['omelette', 1], ['roti', 1]] },
      { p: 'quark', items: [['oatsquark', 1]] },
      { p: 'dal', items: [['moongchilla', 1], ['curd', 1]] },
      { p: 'dal', items: [['besanchilla', 1], ['curd', 1]] },
      { p: 'egg', items: [['poha', 1], ['boiled2', 1]] },
      { p: 'egg', items: [['upma', 1], ['boiled2', 1]] },
      { p: 'egg', items: [['masalaoats', 1], ['boiled2', 1]] },
      { p: 'egg', items: [['eggbhurji', 1], ['bread', 2]] },
    ],
    [L]: [
      { p: 'chicken', items: [['roti', 2], ['chickencurry', 1], ['salad', 1]] },
      { p: 'dal', items: [['rice', 1], ['dal', 1], ['SABZI', 1], ['raita', 1]] },
      { p: 'beans', items: [['roti', 2], ['rajma', 1], ['salad', 1], ['curd', 1]] },
      { p: 'beans', items: [['roti', 2], ['chana', 1], ['salad', 1], ['curd', 1]] },
      { p: 'dal', items: [['roti', 2], ['dalpalak', 1], ['SABZI', 1]] },
      { p: 'fish', items: [['rice', 1], ['fishcurry', 1], ['salad', 1]] },
      { p: 'turkey', items: [['roti', 2], ['keema', 1], ['salad', 1]] },
      { p: 'egg', items: [['rice', 1], ['eggcurry', 1], ['salad', 1]] },
      { p: 'beans', items: [['rice', 1], ['rajma', 1], ['raita', 1]] },
    ],
    [S]: [
      { p: '', items: [['chai', 1], ['roastchana', 1]] },
      { p: '', items: [['tea', 1], ['quarkfruit', 1]] },
      { p: '', items: [['chai', 1], ['fruit', 1]] },
      { p: '', items: [['tea', 1], ['chanachaat', 1]] },
      { p: '', items: [['tea', 1], ['boiled2', 1]] },
      { p: '', items: [['curd', 1], ['fruit', 1]] },
    ],
    [D]: [
      { p: 'chicken', items: [['tikka', 1], ['salad', 1], ['roti', 1]] },
      { p: 'paneer', items: [['paneertikka', 1], ['SABZI', 1], ['roti', 1]] },
      { p: 'egg', items: [['eggbhurji', 1], ['dal', 1], ['roti', 1]] },
      { p: 'paneer', items: [['palakpaneer', 1], ['roti', 1], ['salad', 1]] },
      { p: 'chicken', items: [['chickencurry', 1], ['roti', 1], ['SABZI', 1]] },
      { p: 'paneer', items: [['paneerbhurji', 1], ['roti', 1], ['salad', 1]] },
      { p: 'dal', items: [['khichdi', 1], ['raita', 1], ['boiled2', 1]] },
      { p: 'fish', items: [['fishtikka', 1], ['SABZI', 1], ['roti', 1]] },
      { p: 'turkey', items: [['keema', 1], ['roti', 1], ['salad', 1]] },
      { p: 'fish', items: [['tunamasala', 1], ['roti', 1], ['SABZI', 1]] },
    ],
  };
  // At most this many meals a week with each protein (paneer is pricey and fatty; fish keeps to twice a week).
  const MAX = { chicken: 3, paneer: 2, fish: 2, turkey: 2 };

  // What's in season (or cheap) in German shops, by month. Frozen mixed veg fills in all year.
  const SEASON = [
    ['pattagobhi', 'gajarmatar', 'gobi', 'sabzi'], ['pattagobhi', 'gajarmatar', 'gobi', 'sabzi'], ['pattagobhi', 'gajarmatar', 'sabzi'],
    ['gajarmatar', 'gobi', 'sabzi'], ['gobi', 'zucchini', 'sabzi'], ['zucchini', 'beans', 'gobi', 'sabzi'],
    ['zucchini', 'beans', 'gobi', 'sabzi'], ['zucchini', 'beans', 'gobi', 'sabzi'], ['kaddu', 'beans', 'gobi', 'zucchini'],
    ['kaddu', 'gobi', 'pattagobhi', 'sabzi'], ['kaddu', 'pattagobhi', 'gobi', 'gajarmatar'], ['pattagobhi', 'gajarmatar', 'gobi', 'sabzi'],
  ];

  // Small seeded random generator, so a week's plan is the same on every device and every reload.
  function rng(seedStr) {
    let h = 2166136261;
    for (let i = 0; i < seedStr.length; i++) { h ^= seedStr.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function shuffle(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  const cache = {};
  /** The 7-day plan (Monday first) for the week starting on `mondayKey` ("YYYY-MM-DD").
      Each day: [[label, [[dish, servings], ...]], ...] in Breakfast, Lunch, Snack, Dinner order. */
  function weekPlan(mondayKey) {
    if (cache[mondayKey]) return cache[mondayKey];
    const r = rng('pulsefit|' + mondayKey);
    const used = {};                                   // protein -> count this week
    const days = Array.from({ length: 7 }, () => ({}));
    for (const slot of [L, D, B, S]) {                 // lunch and dinner first: they carry the protein limits
      const order = shuffle(POOLS[slot], r);
      const taken = new Set();
      for (let i = 0; i < 7; i++) {
        if (taken.size >= order.length) taken.clear();   // small pools (snacks) repeat only after every option was used
        const ok = (o, strict) => {
          if (taken.has(o)) return false;
          if (!strict) return true;
          if (o.p && MAX[o.p] && (used[o.p] || 0) >= MAX[o.p]) return false;
          const other = slot === L ? days[i][D] : slot === D ? days[i][L] : null;
          if (o.p && other && other.p === o.p) return false;                     // not the same protein twice a day
          const prev = i > 0 ? days[i - 1][slot] : null;
          if (o.p && prev && prev.p === o.p && o.p !== 'egg') return false;      // nor two days running
          return true;
        };
        const pick = order.find((o) => ok(o, true)) || order.find((o) => ok(o, false));
        taken.add(pick); days[i][slot] = pick;
        if (pick.p) used[pick.p] = (used[pick.p] || 0) + 1;
      }
    }
    const [y, m, d] = mondayKey.split('-').map(Number);
    const offset = Math.floor(r() * 4);
    const plan = days.map((day, i) => {
      const month = new Date(y, m - 1, d + i).getMonth();
      const veg = SEASON[month];
      let n = 0;
      return [B, L, S, D].map((slot) => [slot, day[slot].items.map(([id, s]) => [id === 'SABZI' ? veg[(i + offset + n++) % veg.length] : id, s])]);
    });
    cache[mondayKey] = plan;
    return plan;
  }

  const PANTRY_NOTE = 'Also check you have: salt, haldi, red chilli powder, jeera, garam masala and tandoori masala (Asia shop, they last for months), plus ginger, garlic, green chillies and fresh coriander (Koriander) from the supermarket. Next week\'s plan comes out on Friday; shops are closed on Sundays, so shop on Saturday.';

  return { SECTIONS, ING, DISH, QUICK, QUICK_DE, POOLS, weekPlan, PANTRY_NOTE };
})();
