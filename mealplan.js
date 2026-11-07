/* PulseFit meal data: quick foods, Indian weight-loss meal plan, and the ingredients that build the grocery list.
   Calories and protein are typical home-cooking estimates per serving (moderate oil). They're meant to be roughly
   right and consistent; the weekly weight trend tells you whether to adjust. */
window.PF_MEALS = (function () {
  // Grocery sections, in shopping order.
  const SECTIONS = ['Vegetables & fruit', 'Protein', 'Dairy', 'Grains & flours', 'Dals & pulses', 'Pantry'];

  // id: [name, section, unit]  unit: g | ml | pc
  const ING = {
    onion: ['Onions', 'Vegetables & fruit', 'g'],
    tomato: ['Tomatoes', 'Vegetables & fruit', 'g'],
    spinach: ['Spinach (palak)', 'Vegetables & fruit', 'g'],
    mixedveg: ['Mixed vegetables (beans, carrot, peas, capsicum)', 'Vegetables & fruit', 'g'],
    cucumber: ['Cucumber', 'Vegetables & fruit', 'g'],
    carrot: ['Carrots', 'Vegetables & fruit', 'g'],
    lemon: ['Lemons', 'Vegetables & fruit', 'pc'],
    fruit: ['Fruit (apple, orange, guava)', 'Vegetables & fruit', 'pc'],
    sprouts: ['Moong sprouts', 'Vegetables & fruit', 'g'],
    chicken: ['Chicken, boneless', 'Protein', 'g'],
    eggs: ['Eggs', 'Protein', 'pc'],
    paneer: ['Paneer', 'Dairy', 'g'],
    curd: ['Curd / dahi (low-fat)', 'Dairy', 'g'],
    milk: ['Milk (toned)', 'Dairy', 'ml'],
    atta: ['Whole-wheat atta', 'Grains & flours', 'g'],
    rice: ['Rice', 'Grains & flours', 'g'],
    bread: ['Whole-wheat bread', 'Grains & flours', 'pc'],
    poha: ['Poha', 'Grains & flours', 'g'],
    sooji: ['Sooji (semolina)', 'Grains & flours', 'g'],
    besan: ['Besan (gram flour)', 'Grains & flours', 'g'],
    idli: ['Idli batter', 'Grains & flours', 'g'],
    dal: ['Toor / masoor dal', 'Dals & pulses', 'g'],
    moong: ['Moong dal (yellow)', 'Dals & pulses', 'g'],
    rajma: ['Rajma (dry)', 'Dals & pulses', 'g'],
    chana: ['Kabuli chana (dry)', 'Dals & pulses', 'g'],
    roastchana: ['Roasted chana', 'Dals & pulses', 'g'],
    peanuts: ['Peanuts', 'Pantry', 'g'],
    oil: ['Cooking oil', 'Pantry', 'ml'],
    tea: ['Tea leaves', 'Pantry', 'g'],
    sugar: ['Sugar', 'Pantry', 'g'],
  };

  // id: [name, serving, kcal, protein g, { ingredient: amount per serving }]
  const DISH = {
    roti: ['Roti', '1 medium', 110, 3, { atta: 30 }],
    bread: ['Whole-wheat bread', '1 slice', 75, 3, { bread: 1 }],
    rice: ['Rice', '1 cup cooked', 200, 4, { rice: 60 }],
    dal: ['Daal', '1 bowl', 170, 9, { dal: 45, onion: 25, tomato: 40, oil: 5 }],
    dalpalak: ['Dal palak', '1 bowl', 190, 10, { dal: 45, spinach: 100, onion: 25, tomato: 30, oil: 5 }],
    rajma: ['Rajma', '1 bowl', 220, 12, { rajma: 50, onion: 30, tomato: 50, oil: 5 }],
    chana: ['Chana masala', '1 bowl', 240, 12, { chana: 50, onion: 30, tomato: 50, oil: 6 }],
    chickencurry: ['Chicken curry', '1 bowl', 300, 27, { chicken: 120, onion: 50, tomato: 60, curd: 20, oil: 10 }],
    tikka: ['Chicken tikka / tandoori', '150 g cooked', 250, 32, { chicken: 170, curd: 30, oil: 5 }],
    pulao: ['Chicken pulao', '1 plate', 480, 32, { rice: 60, chicken: 120, onion: 40, oil: 10 }],
    paneerbhurji: ['Paneer bhurji', '100 g paneer', 330, 19, { paneer: 100, onion: 40, tomato: 50, oil: 5 }],
    paneertikka: ['Paneer tikka with peppers', '100 g paneer', 310, 19, { paneer: 100, mixedveg: 80, curd: 30, oil: 5 }],
    palakpaneer: ['Palak paneer', '1 bowl', 330, 17, { paneer: 80, spinach: 150, onion: 30, tomato: 30, oil: 8 }],
    omelette: ['Masala omelette', '3 eggs', 290, 19, { eggs: 3, onion: 30, tomato: 30, oil: 5 }],
    eggbhurji: ['Egg bhurji', '3 eggs', 290, 19, { eggs: 3, onion: 30, tomato: 30, oil: 5 }],
    boiled2: ['Boiled eggs', '2 eggs', 150, 12, { eggs: 2 }],
    moongchilla: ['Moong dal chilla', '2 chillas', 320, 19, { moong: 80, onion: 20, oil: 6 }],
    besanchilla: ['Besan chilla with paneer', '2 chillas', 420, 22, { besan: 60, paneer: 50, onion: 30, oil: 6 }],
    poha: ['Vegetable poha', '1 plate', 330, 7, { poha: 60, onion: 30, mixedveg: 50, peanuts: 10, oil: 5 }],
    upma: ['Vegetable upma', '1 bowl', 280, 7, { sooji: 50, mixedveg: 60, onion: 20, oil: 5 }],
    idli: ['Idli with sambar', '3 idli + 1 bowl', 340, 13, { idli: 150, dal: 25, mixedveg: 60, tomato: 30, oil: 3 }],
    khichdi: ['Moong dal khichdi', '1 bowl', 320, 13, { rice: 40, moong: 40, mixedveg: 50, oil: 5 }],
    sabzi: ['Mixed veg sabzi', '1 bowl', 120, 3, { mixedveg: 150, onion: 20, oil: 7 }],
    salad: ['Salad', 'cucumber, carrot, onion',  40, 2, { cucumber: 80, carrot: 40, onion: 20, lemon: 0.25 }],
    raita: ['Cucumber raita', '1 bowl', 100, 6, { curd: 150, cucumber: 40 }],
    curd: ['Curd (low-fat)', '1 bowl, 150 g', 90, 6, { curd: 150 }],
    chai: ['Chai', '1 cup, milk + sugar', 100, 3, { milk: 100, sugar: 10, tea: 3 }],
    tea: ['Tea', '1 cup, no sugar', 15, 0, { tea: 3, milk: 20 }],
    roastchana: ['Roasted chana', '30 g', 110, 6, { roastchana: 30 }],
    fruit: ['Fruit', '1 apple / orange', 80, 1, { fruit: 1 }],
    sprouts: ['Sprouts chaat', '1 bowl', 140, 10, { sprouts: 100, onion: 20, tomato: 20, lemon: 0.25 }],
  };

  // Your everyday foods, preloaded into "My foods" (values editable in the app).
  const QUICK = [
    ['q-roti', 'Roti', 110, 3], ['q-rice', 'Rice (1 plate)', 300, 6], ['q-daal', 'Daal (1 bowl)', 170, 9],
    ['q-chicken-curry', 'Chicken curry (1 bowl)', 300, 25], ['q-chicken-dish', 'Chicken tikka / roast (150 g)', 250, 30],
    ['q-paneer', 'Paneer dish (1 bowl)', 350, 15], ['q-egg', 'Egg, boiled', 75, 6], ['q-chai', 'Chai (milk + sugar)', 100, 3],
    ['q-tea', 'Tea (no sugar)', 15, 0], ['q-biscuit', 'Biscuit', 45, 1], ['q-bread', 'Bread (1 slice)', 75, 3],
    ['q-chai-biscuits', 'Chai + 2 biscuits', 190, 5],
  ];

  // 7-day plan, Monday first. Each meal: [label, [[dish, servings], ...]]
  const B = 'Breakfast', L = 'Lunch', S = 'Snack', D = 'Dinner';
  const PLAN = [
    [[B, [['omelette', 1], ['bread', 2]]], [L, [['roti', 2], ['chickencurry', 1], ['salad', 1]]], [S, [['chai', 1], ['roastchana', 1]]], [D, [['paneertikka', 1], ['sabzi', 1], ['roti', 1]]]],
    [[B, [['moongchilla', 1], ['curd', 1]]], [L, [['rice', 1], ['dal', 1], ['sabzi', 1], ['raita', 1]]], [S, [['tea', 1], ['sprouts', 1]]], [D, [['tikka', 1], ['salad', 1], ['roti', 1]]]],
    [[B, [['poha', 1], ['boiled2', 1]]], [L, [['roti', 2], ['rajma', 1], ['salad', 1], ['curd', 1]]], [S, [['chai', 1], ['fruit', 1]]], [D, [['eggbhurji', 1], ['dal', 1], ['roti', 1]]]],
    [[B, [['besanchilla', 1]]], [L, [['pulao', 1], ['raita', 1]]], [S, [['chai', 1], ['roastchana', 1]]], [D, [['palakpaneer', 1], ['roti', 1], ['salad', 1]]]],
    [[B, [['upma', 1], ['boiled2', 1]]], [L, [['roti', 2], ['chana', 1], ['salad', 1], ['curd', 1]]], [S, [['tea', 1], ['sprouts', 1]]], [D, [['chickencurry', 1], ['roti', 1], ['sabzi', 1]]]],
    [[B, [['idli', 1], ['boiled2', 1]]], [L, [['rice', 1], ['chickencurry', 1], ['salad', 1]]], [S, [['chai', 1], ['fruit', 1]]], [D, [['paneerbhurji', 1], ['roti', 1], ['salad', 1]]]],
    [[B, [['omelette', 1], ['roti', 1]]], [L, [['roti', 2], ['dalpalak', 1], ['sabzi', 1], ['curd', 1]]], [S, [['chai', 1], ['roastchana', 1]]], [D, [['khichdi', 1], ['raita', 1], ['boiled2', 1]]]],
  ];

  const PANTRY_NOTE = 'Also check you have: salt, turmeric, red chilli powder, cumin, garam masala, tandoori/tikka masala, ginger-garlic paste, green chillies and fresh coriander.';

  return { SECTIONS, ING, DISH, QUICK, PLAN, PANTRY_NOTE };
})();
