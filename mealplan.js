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
    capsicum: ['Peppers (Paprika)', V, 'g', [500, '3-pack, about 500 g']],
    cauliflower: ['Cauliflower (Blumenkohl)', V, 'g', [700, 'head, about 700 g']],
    cabbage: ['White cabbage (Weißkohl)', V, 'g'],
    pumpkin: ['Hokkaido pumpkin (Hokkaido-Kürbis)', V, 'g'],
    zucchini: ['Courgette (Zucchini)', V, 'g'],
    beans: ['Green beans (grüne Bohnen)', V, 'g'],
    broccoli: ['Broccoli (Brokkoli)', V, 'g', [500, 'head, about 500 g']],
    kale: ['Kale (Grünkohl)', V, 'g'],
    chard: ['Chard (Mangold)', V, 'g'],
    aubergine: ['Aubergine (Aubergine)', V, 'g'],
    leek: ['Leek (Lauch)', V, 'g'],
    mushrooms: ['Mushrooms (Champignons)', V, 'g', [250, '250 g box']],
    lemon: ['Lemons (Zitronen)', V, 'pc'],
    fruit: ['Fruit (apples, oranges, bananas)', V, 'pc'],
    potato: ['Potatoes, floury (mehligkochende Kartoffeln)', V, 'g', [1500, '1.5 kg bag']],
    chicken: ['Chicken breast (Hähnchenbrustfilet)', MT, 'g', [400, '400 g pack']],
    turkey: ['Turkey mince (Putenhackfleisch)', MT, 'g', [400, '400 g pack']],
    eggs: ['Eggs (Eier)', MT, 'pc', [10, 'box of 10']],
    chickenthigh: ['Chicken thighs, boneless (Hähnchenschenkel)', MT, 'g', [400, '400 g pack']],
    beef: ['Beef mince (Rinderhackfleisch)', MT, 'g', [500, '500 g pack']],
    lamb: ['Lamb (Lammfleisch)', MT, 'g', [400, '400 g pack']],
    salmon: ['Salmon fillet (Lachs)', MT, 'g', [250, '2-fillet pack']],
    tofu: ['Tofu (natur)', DY, 'g', [200, '200 g block']],
    quark: ['Low-fat quark (Magerquark)', DY, 'g', [500, '500 g tub']],
    curd: ['Plain yoghurt 1.5 % (Naturjoghurt)', DY, 'g', [500, '500 g tub']],
    milk: ['Milk 1.5 % (fettarme Milch)', DY, 'ml', [1000, '1 L carton']],
    mozzarella: ['Mozzarella light', DY, 'g', [125, '125 g ball']],
    atta: ['Chapati atta or Weizenvollkornmehl', GR, 'g', [1000, '1 kg bag']],
    rice: ['Basmati rice', GR, 'g', [1000, '1 kg bag']],
    bread: ['Wholegrain bread (Vollkornbrot)', GR, 'pc', [10, 'loaf, about 10 slices']],
    oats: ['Oats (Haferflocken)', GR, 'g', [500, '500 g bag']],
    sooji: ['Semolina (Hartweizengrieß)', GR, 'g', [500, '500 g bag']],
    flour: ['Wheat flour (Weizenmehl Type 550)', GR, 'g', [1000, '1 kg bag']],
    wraps: ['Wholewheat wraps (Vollkorn-Wraps)', GR, 'pc', [6, 'pack of 6']],
    pasta: ['Wholewheat pasta (Vollkornnudeln)', GR, 'g', [500, '500 g pack']],
    buns: ['Wholegrain rolls (Vollkornbrötchen)', GR, 'pc', [4, '4 rolls']],
    dal: ['Red lentils (rote Linsen)', TN, 'g', [500, '500 g bag']],
    rajma: ['Kidney beans, tin (Kidneybohnen)', TN, 'tin'],
    chana: ['Chickpeas, tin (Kichererbsen)', TN, 'tin'],
    tinnedtom: ['Chopped tomatoes, tin (gehackte Tomaten)', TN, 'g', [400, '400 g tin']],
    tuna: ['Tuna in water, tin (Thunfisch naturell)', TN, 'tin'],
    passata: ['Passata (passierte Tomaten)', TN, 'g', [500, '500 g carton']],
    spinach: ['Frozen leaf spinach (TK Blattspinat)', FZ, 'g', [450, '450 g pack']],
    mixedveg: ['Frozen mixed vegetables (TK Gemüse)', FZ, 'g', [1000, '1 kg bag']],
    peas: ['Frozen peas (TK Erbsen)', FZ, 'g', [450, '450 g bag']],
    fish: ['Frozen pollock fillets (TK Alaska-Seelachs)', FZ, 'g', [400, '400 g pack']],
    prawns: ['Frozen prawns (TK Garnelen)', FZ, 'g', [400, '400 g pack']],
    peanuts: ['Peanuts, unsalted (Erdnüsse)', PN, 'g', [200, '200 g bag']],
    oil: ['Rapeseed oil (Rapsöl)', PN, 'ml', [1000, '1 L bottle']],
    tea: ['Black tea (for chai)', PN, 'g'],
    sugar: ['Sugar (Zucker)', PN, 'g'],
    paneer: ['Paneer', AS, 'g', [400, '400 g block']],
    besan: ['Gram flour (besan)', AS, 'g', [1000, '1 kg bag']],
    moong: ['Yellow moong dal', AS, 'g', [1000, '1 kg bag']],
    poha: ['Poha', AS, 'g', [500, '500 g bag']],
    roastchana: ['Roasted chana', AS, 'g', [500, '500 g bag']],
    okra: ['Okra (bhindi)', AS, 'g'],
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
    paneertikka: ['Paneer tikka with peppers', '100 g paneer', 320, 20, { paneer: 100, capsicum: 150, onion: 30, curd: 30, oil: 5 }],
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
    gobi: ['Gobi sabzi (cauliflower)', '1 bowl', 130, 5, { cauliflower: 230, onion: 20, tomato: 30, oil: 7 }],
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
    // Added for weeks from V3_FROM: parathas, kulcha, rolls, wrap pizzas, rice dishes and more sabzis.
    alooparatha: ['Aloo paratha', '1 paratha', 320, 8, { atta: 60, potato: 80, oil: 6 }],
    paneerparatha: ['Paneer paratha', '1 paratha', 400, 18, { atta: 60, paneer: 50, onion: 15, oil: 5 }],
    kulcha: ['Amritsari aloo kulcha', '1 kulcha', 390, 10, { flour: 70, potato: 90, onion: 20, curd: 15, oil: 7 }],
    vegsandwich: ['Paneer-veg sandwich', '2 slices', 360, 19, { bread: 2, paneer: 50, tomato: 40, cucumber: 0.15, onion: 10 }],
    eggtoast: ['Masala egg toast', '2 slices, 2 eggs', 400, 21, { bread: 2, eggs: 2, onion: 15, tomato: 20, oil: 4 }],
    biryani: ['Chicken biryani', '1 plate', 520, 37, { rice: 70, chicken: 130, onion: 50, curd: 40, oil: 8 }],
    vegpulao: ['Veg pulao', '1 plate', 360, 9, { rice: 70, mixedveg: 80, peas: 30, onion: 30, oil: 6 }],
    aloogobi: ['Aloo gobi', '1 bowl', 200, 6, { potato: 120, cauliflower: 150, onion: 20, tomato: 30, oil: 7 }],
    bharta: ['Baingan bharta', '1 bowl', 150, 4, { aubergine: 250, onion: 40, tomato: 60, oil: 7 }],
    bhindi: ['Bhindi masala', '1 bowl', 160, 5, { okra: 200, onion: 40, tomato: 40, oil: 8 }],
    mushroommatar: ['Mushroom matar', '1 bowl', 170, 9, { mushrooms: 150, peas: 60, onion: 30, tinnedtom: 50, oil: 7 }],
    kadhi: ['Kadhi', '1 bowl', 230, 11, { besan: 25, curd: 150, onion: 15, oil: 6 }],
    pavbhaji: ['Pav bhaji', '1 bowl + 2 rolls', 500, 16, { buns: 2, potato: 100, mixedveg: 120, cauliflower: 60, tinnedtom: 80, onion: 40, oil: 10 }],
    wrappizza: ['Wrap pizza (chicken & peppers)', '1 large wrap', 440, 36, { wraps: 1, passata: 60, mozzarella: 60, chicken: 80, capsicum: 60, onion: 20 }],
    paneerpizza: ['Wrap pizza (paneer & mushroom)', '1 large wrap', 480, 23, { wraps: 1, passata: 60, mozzarella: 50, paneer: 50, capsicum: 60, mushrooms: 40, onion: 20 }],
    chickenroll: ['Chicken kathi roll', '1 roll', 410, 35, { wraps: 1, chicken: 110, onion: 30, curd: 30, capsicum: 40, oil: 5 }],
    paneerroll: ['Paneer kathi roll', '1 roll', 460, 21, { wraps: 1, paneer: 70, onion: 30, capsicum: 40, curd: 20, oil: 4 }],
    eggfriedrice: ['Egg fried rice', '1 plate', 470, 18, { rice: 60, eggs: 2, mixedveg: 100, onion: 20, oil: 8 }],
    masalapasta: ['Masala pasta with chicken', '1 plate', 520, 39, { pasta: 80, chicken: 110, capsicum: 60, tinnedtom: 120, onion: 30, oil: 7 }],
    curdrice: ['Curd rice', '1 bowl', 300, 10, { rice: 50, curd: 150, cucumber: 0.15, oil: 3 }],
  };

  // Label nutrients per serving, estimated for home cooking: [fat, of which saturates, sugar, salt] in g.
  // Carbohydrate is not listed: it is derived from kcal, protein and fat (4/4/9 kcal per g), so the numbers always add up.
  const NUT = {
    roti: [2.5, 0.4, 0.5, 0.2], bread: [1, 0.2, 1.5, 0.5], rice: [0.5, 0.1, 0.1, 0],
    dal: [5.5, 0.6, 3, 1], dalpalak: [5.5, 0.6, 2.5, 1], rajma: [6, 0.7, 4, 1.1], chana: [7.5, 0.8, 5, 1.1],
    chickencurry: [15, 2.5, 5, 1.3], tikka: [9, 2, 3, 1.2], keema: [15, 3.5, 6, 1.2], fishcurry: [10, 1, 5, 1.2],
    fishtikka: [7, 1.5, 2, 1], tunamasala: [6, 0.8, 3, 1], eggcurry: [22, 5, 6, 1.3],
    paneerbhurji: [25, 13, 4, 1], paneertikka: [22, 12, 7, 1], palakpaneer: [24, 12, 4, 1.1],
    omelette: [21, 5, 2.5, 1], eggbhurji: [21, 5, 2.5, 1], boiled2: [10, 3, 0.5, 0.3],
    oatsquark: [7, 2.5, 22, 0.2], masalaoats: [9, 1.3, 3, 0.9], moongchilla: [7, 0.8, 2, 0.9], besanchilla: [10, 1, 3, 0.9],
    poha: [11, 1.3, 3, 0.9], upma: [6, 0.7, 3, 0.9], khichdi: [6, 1, 2, 1],
    sabzi: [7.5, 0.8, 5, 0.8], gobi: [7.5, 0.8, 5, 0.8], pattagobhi: [6.5, 0.7, 6, 0.7], kaddu: [6.5, 0.7, 8, 0.7],
    gajarmatar: [6.5, 0.7, 9, 0.7], zucchini: [6.5, 0.7, 4, 0.7], beans: [6.5, 0.7, 4, 0.7],
    salad: [0.2, 0, 5, 0.1], raita: [2.5, 1.6, 7, 0.5], curd: [2.3, 1.5, 6, 0.2], quarkfruit: [0.5, 0.2, 18, 0.1],
    chai: [3.5, 2.2, 13, 0.1], tea: [0.7, 0.4, 1, 0], roastchana: [1.8, 0.3, 3, 0.3], fruit: [0.3, 0, 16, 0],
    chanachaat: [3, 0.3, 5, 0.9],
    alooparatha: [7, 1, 1.5, 0.8], paneerparatha: [18, 9, 1.5, 0.8], kulcha: [9, 1.5, 2, 1.2], vegsandwich: [14, 7, 4, 1.2],
    eggtoast: [16, 4, 3, 1.3], biryani: [13, 3, 5, 1.5], vegpulao: [7, 1, 4, 1], aloogobi: [7.5, 0.8, 5, 0.8],
    bharta: [7.5, 0.8, 8, 0.8], bhindi: [8.5, 0.9, 6, 0.8], mushroommatar: [7.5, 0.8, 6, 0.9], kadhi: [10, 2.5, 7, 1.1],
    pavbhaji: [13, 3, 10, 2], wrappizza: [13, 6, 7, 2], paneerpizza: [22, 12, 7, 2], chickenroll: [12, 3, 5, 1.6],
    paneerroll: [22, 11, 5, 1.5], eggfriedrice: [16, 3.5, 4, 1.6], masalapasta: [11, 2, 9, 1.3], curdrice: [6, 2.5, 7, 0.8],
    // eating out
    'q-pizza-slice': [11, 5, 3, 1.5], 'q-pizza-whole': [30, 13, 10, 5.5], 'q-kulcha-chole': [28, 9, 6, 3.5],
    'q-chole-bhature': [40, 8, 6, 3.5], 'q-samosa': [15, 3, 1.5, 0.6], 'q-biryani-out': [28, 7, 5, 3],
    'q-butter-chicken': [32, 15, 8, 2.5], 'q-naan': [10, 5, 2, 1.2], 'q-dosa': [16, 3, 3, 1.5],
    'q-pav-bhaji-out': [26, 12, 10, 3], 'q-burger': [24, 9, 8, 2.2], 'q-fries': [17, 2, 0.5, 0.8], 'q-currywurst': [45, 16, 18, 4.5],
    // starter "My foods"
    'q-roti': [2.5, 0.4, 0.5, 0.2], 'q-rice': [0.7, 0.2, 0.1, 0], 'q-daal': [5, 0.6, 3, 1],
    'q-chicken-curry': [15, 2.5, 5, 1.3], 'q-chicken-dish': [9, 2, 3, 1.2], 'q-paneer': [26, 13, 5, 1.1],
    'q-egg': [5, 1.6, 0.3, 0.2], 'q-chai': [3.5, 2.2, 13, 0.1], 'q-tea': [0.7, 0.4, 1, 0], 'q-biscuit': [1.5, 0.7, 2.5, 0.1],
    'q-bread': [1, 0.2, 1.5, 0.4], 'q-chai-biscuits': [6.5, 3.6, 18, 0.3], 'q-quark': [0.5, 0.2, 10, 0.2],
    'q-vollkorn': [1, 0.2, 1.5, 0.5], 'q-doener': [30, 11, 8, 3.5], 'q-brezel': [2, 0.5, 1, 2.2], 'q-skyr': [0.3, 0.2, 5, 0.1],
  };
  /** Full label nutrients for something with `kcal` and `protein` and an estimate row [fat, sat, sugar, salt]. */
  function nutFrom(kcal, protein, row) {
    if (!row) return null;
    const [fat, sat, sugar, salt] = row;
    const carbs = Math.max(0, (kcal - 4 * (protein || 0) - 9 * fat) / 4);
    return { fat, sat: Math.min(sat, fat), carbs: Math.round(carbs * 10) / 10, sugar: Math.min(sugar, Math.round(carbs * 10) / 10), salt };
  }
  /** Nutrients of one serving of dish `id` (base recipe), or null if unknown. */
  const dishNut = (id) => (DISH[id] ? nutFrom(DISH[id][2], DISH[id][3], NUT[id]) : null);

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

  // Restaurant and takeaway favourites (seeded once into My foods). Typical portions; restaurants vary a lot.
  const QUICK_OUT = [
    ['q-pizza-slice', 'Pizza, 1 slice (Pizzeria)', 280, 12], ['q-pizza-whole', 'Pizza Margherita, whole', 850, 35],
    ['q-kulcha-chole', 'Amritsari kulcha with chole (restaurant)', 750, 20], ['q-chole-bhature', 'Chole bhature', 800, 20],
    ['q-samosa', 'Samosa (1 piece)', 260, 4], ['q-biryani-out', 'Chicken biryani (restaurant)', 700, 35],
    ['q-butter-chicken', 'Butter chicken (restaurant bowl)', 500, 30], ['q-naan', 'Butter naan', 300, 8],
    ['q-dosa', 'Masala dosa', 400, 8], ['q-pav-bhaji-out', 'Pav bhaji (restaurant)', 600, 12],
    ['q-burger', 'Burger (fast food)', 500, 25], ['q-fries', 'Fries, medium', 340, 4],
    ['q-currywurst', 'Currywurst mit Pommes', 800, 25],
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
      { p: '', v3: 1, items: [['alooparatha', 1], ['curd', 1]] },
      { p: 'paneer', v3: 1, items: [['paneerparatha', 1], ['curd', 1]] },
      { p: 'treat', v3: 1, items: [['kulcha', 1], ['chana', 1]] },
      { p: 'paneer', v3: 1, items: [['vegsandwich', 1]] },
      { p: 'egg', v3: 1, items: [['eggtoast', 1]] },
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
      { p: 'chicken', v2: 1, items: [['roti', 2], ['tikka', 1], ['raita', 1]] },
      { p: 'fish', v2: 1, items: [['roti', 2], ['fishtikka', 1], ['SABZI', 1]] },
      { p: 'chicken', v3: 1, items: [['biryani', 1], ['raita', 1]] },
      { p: 'egg', v3: 1, items: [['vegpulao', 1], ['boiled2', 1], ['raita', 1]] },
      { p: 'dal', v3: 1, items: [['roti', 2], ['dal', 1], ['aloogobi', 1]] },
      { p: 'dal', v3: 1, items: [['rice', 1], ['kadhi', 1], ['SABZI', 1]] },
      { p: 'chicken', v3: 1, items: [['chickenroll', 1], ['salad', 1]] },
      { p: 'chicken', v3: 1, items: [['masalapasta', 1], ['salad', 1]] },
      { p: 'egg', v3: 1, items: [['eggfriedrice', 1], ['raita', 1]] },
      { p: 'treat', v3: 1, items: [['kulcha', 1], ['chana', 1], ['salad', 1]] },
      { p: 'treat', v3: 1, items: [['pavbhaji', 1], ['salad', 1]] },
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
      { p: 'egg', v2: 1, items: [['eggcurry', 1], ['roti', 1], ['salad', 1]] },
      { p: 'chicken', v2: 1, items: [['chickencurry', 1], ['rice', 1], ['salad', 1]] },
      { p: 'treat', v3: 1, items: [['wrappizza', 1], ['salad', 1]] },
      { p: 'treat', v3: 1, items: [['paneerpizza', 1], ['salad', 1]] },
      { p: 'dal', v3: 1, items: [['bharta', 1], ['dal', 1], ['roti', 1]] },
      { p: 'dal', v3: 1, items: [['bhindi', 1], ['dal', 1], ['roti', 1]] },
      { p: '', v3: 1, items: [['mushroommatar', 1], ['roti', 2], ['raita', 1]] },
      { p: 'paneer', v3: 1, items: [['paneerroll', 1], ['salad', 1]] },
      { p: 'dal', v3: 1, items: [['curdrice', 1], ['SABZI', 1], ['boiled2', 1]] },
    ],
  };
  // Non-veg is fine any day; only paneer (pricey and fatty) is kept to twice a week. Weeks before V2_FROM keep the
  // first version's rules (fewer non-veg meals), so a plan you've already shopped for never changes.
  const V2_FROM = '2026-11-16';
  const MAX_V1 = { chicken: 3, paneer: 2, fish: 2, turkey: 2 }, MAX_V2 = { paneer: 2 };
  // From V3_FROM the pools also hold the newer dishes. Treats (kulcha, pav bhaji, wrap pizza) at most twice a week.
  const V3_FROM = '2026-11-16', MAX_V3 = { paneer: 2, treat: 2 };

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
    const v2 = mondayKey >= V2_FROM, v3 = mondayKey >= V3_FROM, MAX = v3 ? MAX_V3 : v2 ? MAX_V2 : MAX_V1;
    const used = {};                                   // protein -> count this week
    const days = Array.from({ length: 7 }, () => ({}));
    for (const slot of [L, D, B, S]) {                 // lunch and dinner first: they carry the protein limits
      const order = shuffle(POOLS[slot].filter((o) => (v2 || !o.v2) && (v3 || !o.v3)), r);
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

  /* ---- Swaps: bought something else instead? ----
     Ingredients in the same group can stand in for each other. Dishes with a "role" for an ingredient get renamed
     (Palak paneer + kale -> Saag paneer) and their kcal/protein adjusted. */
  const GROUPS = {
    veg: ['spinach', 'kale', 'chard', 'cauliflower', 'broccoli', 'cabbage', 'pumpkin', 'zucchini', 'aubergine', 'beans', 'okra', 'mushrooms', 'carrot', 'peas', 'capsicum', 'leek', 'mixedveg'],
    protein: ['chicken', 'chickenthigh', 'turkey', 'beef', 'lamb', 'fish', 'salmon', 'prawns', 'tuna', 'eggs', 'paneer', 'tofu'],
    lentils: ['dal', 'moong'],
    beans: ['rajma', 'chana'],
  };
  // Short name used in dish names, per-unit [kcal, protein g], and one serving's amount (so swaps keep portions sensible).
  const SWAP = {
    spinach: ['Palak', 0.25, 0.03, 100], kale: ['Saag', 0.45, 0.04, 100], chard: ['Saag', 0.2, 0.02, 100],
    cauliflower: ['Gobi', 0.25, 0.02, 100], broccoli: ['Broccoli', 0.35, 0.03, 100], cabbage: ['Patta gobhi', 0.25, 0.013, 100],
    pumpkin: ['Kaddu', 0.4, 0.01, 100], zucchini: ['Zucchini', 0.2, 0.015, 100], aubergine: ['Baingan', 0.25, 0.01, 100],
    beans: ['Beans', 0.3, 0.02, 100], carrot: ['Gajar', 0.4, 0.01, 100], peas: ['Matar', 0.8, 0.05, 100],
    capsicum: ['Shimla mirch', 0.3, 0.01, 100], leek: ['Leek', 0.3, 0.02, 100], mixedveg: ['Mixed veg', 0.5, 0.03, 100],
    okra: ['Bhindi', 0.33, 0.02, 100], mushrooms: ['Mushroom', 0.22, 0.03, 100],
    chickenthigh: ['Chicken', 1.8, 0.2, 150], beef: ['Beef', 2.5, 0.2, 150], lamb: ['Lamb', 2.4, 0.2, 150],
    salmon: ['Salmon', 2.0, 0.2, 150], prawns: ['Prawn', 0.8, 0.18, 160], tofu: ['Tofu', 1.2, 0.13, 150],
    chicken: ['Chicken', 1.1, 0.23, 150], turkey: ['Turkey', 1.5, 0.2, 150], fish: ['Fish', 0.8, 0.18, 160],
    tuna: ['Tuna', 130, 30, 1], eggs: ['Egg', 75, 6, 3], paneer: ['Paneer', 3.0, 0.18, 100],
    dal: ['Masoor', 3.5, 0.24, 50], moong: ['Moong', 3.5, 0.24, 50], rajma: ['Rajma', 280, 18, 0.5], chana: ['Chana', 300, 17, 0.5],
  };
  // Dish name templates: {ingredient} is replaced by that ingredient's (or its stand-in's) short name.
  const ROLE = {
    dal: '{dal} dal', dalpalak: 'Dal {spinach}', rajma: '{rajma} masala', chana: '{chana} masala',
    chickencurry: '{chicken} curry', tikka: '{chicken} tikka', keema: '{turkey} keema matar', fishcurry: '{fish} curry',
    fishtikka: 'Tandoori {fish}', tunamasala: '{tuna} masala', eggcurry: '{eggs} curry', paneerbhurji: '{paneer} bhurji', eggbhurji: '{eggs} bhurji',
    paneertikka: '{paneer} tikka with {capsicum}', palakpaneer: '{spinach} {paneer}', khichdi: '{moong} dal khichdi',
    sabzi: '{mixedveg} sabzi', gobi: '{cauliflower} sabzi', pattagobhi: '{cabbage} sabzi', kaddu: '{pumpkin} sabzi',
    gajarmatar: '{carrot} {peas}', zucchini: '{zucchini} sabzi', beans: '{beans} sabzi', moongchilla: '{moong} dal chilla',
  };
  /** Register something you bought that isn't on any list ("Other…"), standing in for `base`.
      kcal/protein are per 100 g (or per piece / tin); left out, the original's values are used. */
  function registerCustom(id, base, name, kcal, protein) {
    const b = ING[base];
    if (!b) return;
    ING[id] = [name, b[1], b[2]];
    const perUnit = (v) => (v == null ? null : b[2] === 'g' || b[2] === 'ml' ? v / 100 : v);
    const sw = SWAP[base];
    const short = name.length > 18 ? name.slice(0, 18).trim() : name;
    // Without a nutrition model for the original (e.g. atta), dishes are renamed but kcal stay as planned.
    SWAP[id] = [short.charAt(0).toUpperCase() + short.slice(1), perUnit(kcal) ?? (sw ? sw[1] : 0), perUnit(protein) ?? (sw ? sw[2] : 0), sw ? sw[3] : 1];
  }
  const groupOf = (ing) => Object.keys(GROUPS).find((g) => GROUPS[g].includes(ing));
  /** Ingredients you could buy instead of `ing` (same group), or [] if it has no stand-ins. */
  const altsFor = (ing) => { const g = groupOf(ing); return g ? GROUPS[g].filter((x) => x !== ing) : []; };
  /** How much of `to` matches `amount` of `from` (same number of servings). */
  const swapAmount = (from, to, amount) => (SWAP[from] && SWAP[to] ? amount / SWAP[from][3] * SWAP[to][3] : amount);

  /** A dish with stand-ins applied: subs = { ingredient: stand-in }. Returns [name, serving, kcal, protein, ingredients]. */
  function dishWith(id, subs) {
    const d = DISH[id];
    if (!d || !subs) return d;
    const hit = Object.keys(d[4]).filter((ing) => subs[ing] && subs[ing] !== ing);
    if (!hit.length) return d;
    let [name, serving, kcal, protein, ings] = d;
    ings = { ...ings };
    for (const ing of hit) {
      const to = subs[ing], a = ings[ing], b = swapAmount(ing, to, a);
      if (SWAP[ing] && SWAP[to]) {
        kcal += b * SWAP[to][1] - a * SWAP[ing][1];
        protein += b * SWAP[to][2] - a * SWAP[ing][2];
      }
      delete ings[ing]; ings[to] = (ings[to] || 0) + b;
    }
    if (ROLE[id]) {
      name = ROLE[id].replace(/\{(\w+)\}/g, (m, ing, at) => {
        const w = SWAP[subs[ing] || ing] ? SWAP[subs[ing] || ing][0] : ing;
        return at === 0 ? w : w.toLowerCase();                     // capital only at the start of the name
      });
    } else name += ` (with ${hit.map((i) => SWAP[subs[i]] ? SWAP[subs[i]][0].toLowerCase() : subs[i]).join(', ')})`;
    if (/\d/.test(serving) && hit.some((i) => serving.includes(String(d[4][i])))) serving = '1 portion';
    return [name, serving, Math.max(0, Math.round(kcal / 5) * 5), Math.max(0, Math.round(protein)), ings];
  }

  const PANTRY_NOTE = 'Also check you have: salt, haldi, red chilli powder, jeera, garam masala and tandoori masala (Asia shop, they last for months), plus ginger, garlic, green chillies and fresh coriander (Koriander) from the supermarket. Next week\'s plan comes out on Friday; shops are closed on Sundays, so shop on Saturday.';

  return { NUT, nutFrom, dishNut, SECTIONS, ING, DISH, QUICK, QUICK_DE, QUICK_OUT, POOLS, weekPlan, PANTRY_NOTE, GROUPS, SWAP, altsFor, swapAmount, dishWith, registerCustom };
})();
