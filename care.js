/* PulseFit self-care routines (skin, teeth, hair, beard) and weekend home care (laundry, cleaning), from the owner's own "Shift Worker Master Routine Guide".
   Each day shows the routines for that day's shift: morning shift, late shift, or a day off (with the weekend extras).
   Products are the owner's own (dm / Rossmann); steps keep his wording, trimmed to fit a phone. */
window.PF_CARE = (function () {
  const R = {
    'm-am': {
      at: '03:15', title: 'Wake-up prep', sub: 'Cold-shock wake-up and a matte shield for the shift',
      steps: [
        ['Wake-up face wash', 'L\'Oréal Men Expert Hydra Energy Aufwach-Kick Waschgel, massaged with the ebelin silicone pad in small circles.'],
        ['Tone & shield', 'Balea Gesichtswasser hautrein, then 3 drops Balea Niacinamide serum, sealed with L\'Oréal Hydra Energy Anti-Glanz gel against shine at work.'],
        ['Deodorant & pocket', 'Hidrofugal Forte roll-on on clean underarms. Put essence blotting papers in your work pocket.'],
      ],
    },
    'm-pm': {
      at: '16:45', title: 'After-shift reset', sub: 'Shower off the workday and overnight moisture',
      steps: [
        ['Shower', 'Balea med pH 5.5 Duschgel, all over, to wash off the shift\'s sweat.'],
        ['Face wash', 'Balea MEN Sensitive Waschgel, gently.'],
        ['Moisture', '3–4 drops Balea Glycerin serum on damp skin, sealed with Balea Gesichtscreme Gel Aqua.'],
        ['Spots & hands', 'Balea Anti-Pickel patches on any spots. A pea of Mixa Ceramide hand cream before sleep.'],
      ],
      note: 'No heavy night cream: glycerin serum + aqua gel hydrate without clogging pores, so you wake up grease-free at 03:00.',
    },
    'e-am': {
      at: '10:15', title: 'Pre-shift prep', sub: 'Shower, face shield and beard',
      steps: [
        ['Shower', 'Balea med pH 5.5 Duschgel, all over.'],
        ['Face shield', 'L\'Oréal Aufwach-Kick wash, Gesichtswasser hautrein, 3 drops Niacinamide serum, L\'Oréal Anti-Glanz gel.'],
        ['Beard', 'Comb with the ebelin Bartkamm; warm 3 drops Balea MEN Bartöl in your palms and massage down to the skin.'],
        ['Deodorant & pocket', 'Hidrofugal Forte roll-on. Blotting papers in your uniform pocket.'],
      ],
    },
    'e-pm': {
      at: '00:30', title: 'Late-night return', sub: 'Low-stimulus cleanse and barrier recovery, then straight to sleep',
      steps: [
        ['Gentle wash', 'Balea MEN Sensitive Waschgel with warm water. No hot shower now: it delays sleep.'],
        ['Moisture', '3 drops Balea Glycerin serum, sealed with a thin film of Balea Aqua gel-creme.'],
        ['Spots', 'Anti-Pickel patches on any inflamed spots.'],
        ['Hands', 'Mixa Ceramide hand cream, then lights out.'],
      ],
      note: 'Low light, nothing stimulating: no menthol Aufwach-Kick wash or scalp tonic at midnight; keep those for 10:15.',
    },
    // Teeth: their own routines (Care → Teeth), morning and bedtime, timed to the shift.
    'm-teeth': {
      kind: 'Teeth', at: '03:15', title: 'Teeth (early shift)', sub: 'Floss, brush, tongue and mouthwash before work',
      steps: [
        ['Floss', 'Dontodent Zahnseidesticks (ungewachst) between every tooth; use the pick end along the back molars.'],
        ['Brush', '2 min with Elmex Sensitive on the Dontodent brush heads: small circles, 45° to the gum line, every surface.'],
        ['Tongue', 'Dontodent Zungenreiniger 3× from back to front: most morning breath sits there.'],
        ['Rinse', 'Dontodent Mundspülung Antibakteriell for 30 s. Then don\'t eat or drink for 30 min if you can.'],
      ],
    },
    'e-teeth': {
      kind: 'Teeth', at: '10:15', title: 'Teeth (late shift)', sub: 'Floss, brush, tongue and mouthwash before work',
      steps: [
        ['Floss', 'Dontodent Zahnseidesticks between every tooth.'],
        ['Brush', '2 min with Elmex Sensitive. Twice a week use Perlweiss Schönheits Zahnweiß instead.'],
        ['Tongue', 'Dontodent Zungenreiniger 3× from back to front.'],
        ['Rinse', '30 s Dontodent Mundspülung.'],
      ],
    },
    'teeth-am': {
      kind: 'Teeth', at: 'Morning', title: 'Teeth (morning)', sub: 'Floss, brush, tongue and mouthwash',
      steps: [
        ['Floss', 'Dontodent Zahnseidesticks between every tooth.'],
        ['Brush', '2 min with Elmex Sensitive. Twice a week (e.g. Tuesday and Friday) use Perlweiss Schönheits Zahnweiß instead; keep Elmex for the other days.'],
        ['Tongue', 'Dontodent Zungenreiniger 3× from back to front.'],
        ['Rinse', '30 s Dontodent Mundspülung.'],
      ],
    },
    'teeth-night': {
      kind: 'Teeth', at: 'Bedtime', title: 'Teeth (bedtime)', sub: 'The most important brush of the day',
      steps: [
        ['Floss', 'Dontodent Zahnseidesticks between every tooth: food left overnight is what causes decay.'],
        ['Brush', '2 min with Elmex Sensitive, gently along the gum line.'],
        ['Spit, don\'t rinse', 'Leave the fluoride on your teeth; nothing to eat or drink afterwards except water.'],
      ],
      note: 'Sensitive teeth after whitening? Use only Elmex Sensitive for a few days and dab a little on the sensitive spot before bed.',
    },
    // Hair: its own routine, done right after the shower.
    'm-hair': {
      at: '16:45', title: 'Hair & scalp', sub: 'After the shower: condition, detangle, birch scalp tonic',
      steps: [
        ['Condition', 'Balea Professional Conditioner Kopfhaut Sensitive on the lengths. Leave 2 min, rinse.'],
        ['Detangle', 'ebelin Entwirrkünstler, gently from the ends up.'],
        ['Scalp tonic', 'Towel-dry, then massage Balea Haarwasser Birke into the roots to clear and soothe the scalp.'],
        ['Blow-dry', 'Mist Balea Hitzeschutzspray over the lengths first, then 2–3 sprays Balea Föhn-Spray Föhnen & Stärken at the roots. Dry on medium heat with a round brush from your new brush set, nozzle pointing down the hair.'],
      ],
    },
    'e-hair': {
      at: '10:15', title: 'Hair & scalp', sub: 'After the shower: caffeine root boost',
      steps: [
        ['Towel-dry', 'Pat, don\'t rub: wet hair breaks easily.'],
        ['Scalp boost', 'Massage Balea MEN Haar-Tonic Power Effect Coffein Boost into the crown and temples for a minute.'],
        ['Detangle', 'ebelin Entwirrkünstler through the lengths.'],
        ['Blow-dry', 'Balea Hitzeschutzspray on the lengths, Föhn-Spray at the roots, then dry on medium heat with a round brush for lift that lasts the shift.'],
      ],
      note: 'Keep the caffeine tonic for the morning. At 00:30 skip all scalp products so you can fall asleep.',
    },
    'off-hair': {
      at: 'Morning', title: 'Hair', sub: 'Day off: detangle and a light scalp tonic',
      steps: [
        ['Detangle', 'ebelin Entwirrkünstler through dry or damp hair.'],
        ['Scalp', 'A little Balea Haarwasser Birke massaged into the roots.'],
        ['Style', 'If you blow-dry: Hitzeschutzspray first, always. On days you air-dry, skip the heat completely; it\'s the best thing for your hair.'],
      ],
    },
    // Home: the weekend laundry and cleaning pages of the guide.
    'laundry': {
      kind: 'Home', at: 'Morning', title: 'Laundry (Miele)', sub: 'Saturday: work shirts, towels and sheets',
      steps: [
        ['Pre-treat', 'Turn work shirts inside out. Spray stains and underarms with Denkmit Fleckenentferner Spray (or Dr. Beckmann Deo & Schweiss); leave 10–30 min.'],
        ['Yellow underarms (whites only)', 'Once a month: soak white shirts 30 min in a bowl of warm water with a cup of Centra24 Wasserstoffperoxid 3% and 2 tbsp Heitmann Reine Soda, then wash. Never on colours, and never with chlorine products.'],
        ['Detergent', 'Slot II: Denkmit Colorwaschmittel flüssig for work shirts and colours; Denkmit Feinwaschmittel Color&Care for knits and delicates (30 °C, wool/fine program). For whites or sweaty sports kit add 2 tbsp Heitmann Soda. Softener slot: 1–2 caps Denkmit Hygiene-Spüler (the fragrance-free one for towels).'],
        ['Drum', 'One Denkmit Farb- & Schmutzfangtuch in the drum with the clothes.'],
        ['Program', 'Work shirts and colours: Buntwäsche 40 °C (or 30 °C). Towels, sheets and white undershirts: Koch-/Buntwäsche 60 °C. Pay in appWash and press Start.'],
        ['After drying', 'Hang shirts straight away and mist Denkmit Textilerfrischer Faltenglatt 3in1; smooth with your hand: no ironing needed. Pilled jumpers: a quick pass with the lint shaver.'],
      ],
      note: 'Saturday rather than Sunday: most German house rules ask for no washing machines on Sundays and holidays.',
    },
    'bathroom': {
      kind: 'Home', at: 'Afternoon', title: 'Bathroom deep clean', sub: 'Saturday: toilet, limescale and mould (gloves on)',
      steps: [
        ['Gloves', 'Profissimo Einmalhandschuhe on, window open.'],
        ['Toilet', 'Drop a Denkmit WC-Tab in the bowl and let it fizz 30–60 min. Then WC-Gel under the rim, scrub, flush.'],
        ['Taps & glass', 'Denkmit Kalkreiniger Anti Kalk; wait 3 min, wipe damp, rinse.'],
        ['Tiles & shower', 'Bosch UniversalBrush with the scrub pad over tiles, shower tray and grout lines, a little Allzweckreiniger Soda Power on the pad. Profissimo Schmutzradierer for marks on walls and doors.'],
        ['Grout & mould', 'Denkmit Schimmelentferner mit Aktiv-Chlor on the spots; wait 15 min, wipe, air the room.'],
      ],
      note: 'Never mix the chlorine mould spray with the acidic limescale or toilet cleaners, or with hydrogen peroxide: it releases toxic gas. Do the mould step on its own, at the end, with the window open. Mixa Ceramide hand cream afterwards.',
    },
    'kitchen': {
      kind: 'Home', at: 'Afternoon', title: 'Kitchen & surfaces', sub: 'Sunday: degrease, disinfect, lint-roll',
      steps: [
        ['Stovetop & air fryer', 'Denkmit Fettlöser Power-Formel on the hob; leave 2 min, wipe clean. Air-fryer basket: soak in hot water with a spoon of Heitmann Soda, then rinse.'],
        ['Counters', 'Denkmit Allzweckreiniger Soda Power on counters and the sink; dry the dish rack and wipe under it.'],
        ['Touch points', 'Phone, desk, light switches and handles with Denkmit Desinfektionstücher.'],
        ['Bin', 'Empty, wipe the lid; the Denkmit Mülleimer-Deo pad stays inside the lid.'],
        ['Fabrics', 'Profissimo Fusselroller over the sofa, coats and bed sheets.'],
      ],
      note: 'Summer: a fruit-fly trap next to the fruit bowl, and ARDAP only around window frames and skirting, never on food surfaces.',
    },
    'floors': {
      kind: 'Home', at: 'Late morning', title: 'Floors', sub: 'Saturday: vacuum, then wet-clean',
      steps: [
        ['Vacuum', 'Cordless vacuum through every room, the crevice tool along skirting boards and under the bed.'],
        ['Wet-clean', 'Wet-dry floor cleaner over hard floors with a capful of roborock floor cleaning solution in the clean-water tank. Kitchen and bathroom last.'],
        ['Empty & dry', 'Empty the dirty-water tank, run the self-clean, and leave the roller to dry so it doesn\'t smell.'],
      ],
      note: 'Saturday, not Sunday: Sundays and holidays are quiet days in Germany, so no vacuuming then. Most house rules also ask for quiet 13:00–15:00 and after 20:00 (22:00 at the latest), so vacuum between 10:00 and 13:00.',
    },
    'whiten': {
      kind: 'Teeth', at: 'Midday', title: 'Teeth whitening', sub: 'Sunday: Perlweiss strips or gel, once a week',
      steps: [
        ['Brush first', 'Brush and floss, then wait 30 minutes (fresh-brushed enamel is more sensitive).'],
        ['Whiten', 'One Perlweiss Whitening Strip Intensiv Kur on upper and lower teeth for the time on the pack; or, on alternate weeks, the Perlweiss Bleaching System Dental 4.0 gel as directed. Not both on the same day.'],
        ['After', 'Rinse with water; no coffee, tea, curry or cola for 1 hour. Elmex Sensitive in the evening.'],
      ],
      note: 'Stop for a week if your teeth or gums get sensitive. Whitening doesn\'t change fillings or crowns.',
    },
    'monthly': {
      kind: 'Home', at: 'Afternoon', title: 'Monthly reset', sub: 'First Sunday: fridge, mattress, toilet, vacuums',
      steps: [
        ['Fridge', 'Clear out old food, wipe the shelves with Allzweckreiniger Soda Power, put in a new Denkmit Kühlschrank-Frische.'],
        ['Bed', 'Wash the mattress protector at 60 °C; air the mattress for an hour; air the neck pillow by the window.'],
        ['Toilet', 'New Denkmit WC-Blauspüler in the cistern.'],
        ['Vacuums', 'Rinse the vacuum filters and let them dry 24 h (quiet, so fine on a Sunday); robot vacuum: new bag, filter and mop pads from the 18-piece kit when they look grey. Don\'t run any vacuum today.'],
        ['Bin', 'New Mülleimer-Deo pad when the scent has gone.'],
      ],
    },
    'off-am': {
      at: 'Morning', title: 'Face & beard', sub: 'Your daily basics on a day off',
      steps: [
        ['Face', 'Balea MEN Sensitive Waschgel, Gesichtswasser hautrein on an ebelin Wattepad, 3 drops Niacinamide serum, Balea Aqua gel.'],
        ['Beard', 'Comb with the ebelin Bartkamm and 3 drops Balea MEN Bartöl.'],
      ],
    },
    'sun-am': {
      at: 'Morning', title: 'Recovery morning', sub: 'Gentle after Saturday\'s BHA peel',
      steps: [
        ['Face', 'Splash with cool water, sweep Gesichtswasser hautrein, then Glycerin serum + Aqua gel. No harsh cleanser today.'],
      ],
    },
    'off-pm': {
      at: 'Evening', title: 'Evening skin care', sub: 'Cleanse and moisture before bed',
      steps: [
        ['Face wash', 'Balea MEN Sensitive Waschgel.'],
        ['Moisture', '3–4 drops Glycerin serum on damp skin, sealed with Balea Gesichtscreme Gel Aqua.'],
        ['Spots & hands', 'Anti-Pickel patches on any spots; Mixa Ceramide hand cream.'],
        ['Underarms', '2–3 evenings a week: Chemist at Play UnderArm Roll-on, so your Hidrofugal works better on shift days.'],
      ],
    },
    'sat-bha': {
      at: 'Evening', title: 'Pore clearing (BHA)', sub: 'Saturday: salicylic acid peel and deep hydration',
      steps: [
        ['Cleanse', 'Balea MEN Sensitive Waschgel with the ebelin silicone pad; pat completely dry.'],
        ['BHA', 'Balea Peeling Toner Beauty Expert (2% BHA) on an ebelin Wattepad over forehead, nose and chin. Don\'t rinse.'],
        ['Underarms', 'Chemist at Play UnderArm Roll-on on clean, dry underarms (it exfoliates and fights odour overnight). Not on freshly shaved skin.'],
        ['Wait', '5 minutes for the acid to absorb.'],
        ['Serums', '3 drops Niacinamide, then 3 drops Glycerin serum. Seal with Aqua gel; patches on any spots.'],
      ],
    },
    'sun-hair': {
      at: 'Midday', title: 'Hair spa', sub: 'Sunday: hyaluron mask and scalp serum',
      steps: [
        ['Mask', 'After washing, work Balea Aqua Hyaluron Feuchtigkeitsmaske through the mid-lengths and ends; 4–5 min, rinse.'],
        ['Scalp serum', 'Towel-dry; trace Balea Kopfhaut Sensitive Pflegeserum (5% Panthenol) along the scalp with the nozzle, massage 1 min, don\'t rinse.'],
        ['Detangle', 'ebelin Entwirrkünstler through the hair.'],
      ],
    },
    'sun-beard': {
      at: 'Afternoon', title: 'Beard detailing', sub: 'Sunday: trim and oil',
      steps: [
        ['Comb', 'Comb the dry beard with the wooden comb from the ebelin Bartschere & Kamm set.'],
        ['Trim', 'Philips Multigroom 9000 with the beard comb at your usual length; then the precision trimmer for the cheek and neck line (neckline two fingers above the Adam\'s apple). Scissors for single stray hairs.'],
        ['Body', 'Once a week if you like: the Multigroom body attachment for chest and underarms (shorter underarm hair = less sweat odour).'],
        ['Oil', 'Warm 4 drops Balea MEN Bartöl in your palms and massage deep into beard and skin.'],
      ],
    },
  };
  /** The routines for one day, in the order you do them. shift: 'morning' | 'evening' | null; dow: 0 = Sunday; dom: day of the month. */
  function forDay(shift, dow, dom) {
    if (shift === 'morning') return ['m-am', 'm-teeth', 'm-pm', 'm-hair', 'teeth-night'];
    if (shift === 'evening') return ['e-am', 'e-teeth', 'e-hair', 'e-pm', 'teeth-night'];
    if (dow === 6) return ['off-am', 'teeth-am', 'off-hair', 'laundry', 'floors', 'bathroom', 'sat-bha', 'teeth-night'];
    if (dow === 0) return ['sun-am', 'teeth-am', 'whiten', 'sun-hair', 'kitchen', ...(dom && dom <= 7 ? ['monthly'] : []), 'sun-beard', 'off-pm', 'teeth-night'];
    return ['off-am', 'teeth-am', 'off-hair', 'off-pm', 'teeth-night'];
  }
  /** Skin (face, teeth, body), Hair or Home: the small label on each routine. */
  const kindOf = (id) => R[id].kind || (/hair/.test(id) ? 'Hair' : /beard/.test(id) ? 'Beard' : 'Skin');
  return { R, forDay, kindOf };
})();
