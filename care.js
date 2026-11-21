/* PulseFit self-care routines (skin, teeth, hair, beard) and weekend home care (laundry, cleaning), from the owner's own "Shift Worker Master Routine Guide".
   Each day shows the routines for that day's shift: morning shift, late shift, or a day off (with the weekend extras).
   Products are the owner's own (dm / Rossmann); steps keep his wording, trimmed to fit a phone. */
window.PF_CARE = (function () {
  const R = {
    'm-am': {
      at: '03:15', title: 'Wake-up prep', sub: 'Cold-shock wake-up, teeth and a matte shield for the shift',
      steps: [
        ['Floss', 'Dontodent Zahnseidesticks (ungewachst) between every tooth; use the pick end along the back molars.'],
        ['Brush & rinse', '2 min with Elmex Sensitive on the Dontodent brush heads. Scrape your tongue 3× and swish Dontodent Mundspülung Antibakteriell for 30 s.'],
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
      at: '10:15', title: 'Pre-shift prep', sub: 'Shower, teeth, face shield and beard',
      steps: [
        ['Shower', 'Balea med pH 5.5 Duschgel, all over.'],
        ['Teeth', 'Floss with the Dontodent sticks, brush 2 min with Elmex Sensitive, scrape your tongue, rinse with the antibacterial mouthwash.'],
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
    // Hair: its own routine, done right after the shower.
    'm-hair': {
      at: '16:45', title: 'Hair & scalp', sub: 'After the shower: condition, detangle, birch scalp tonic',
      steps: [
        ['Condition', 'Balea Professional Conditioner Kopfhaut Sensitive on the lengths. Leave 2 min, rinse.'],
        ['Detangle', 'ebelin Entwirrkünstler, gently from the ends up.'],
        ['Scalp tonic', 'Towel-dry, then massage Balea Haarwasser Birke into the roots to clear and soothe the scalp.'],
      ],
    },
    'e-hair': {
      at: '10:15', title: 'Hair & scalp', sub: 'After the shower: caffeine root boost',
      steps: [
        ['Towel-dry', 'Pat, don\'t rub: wet hair breaks easily.'],
        ['Scalp boost', 'Massage Balea MEN Haar-Tonic Power Effect Coffein Boost into the crown and temples for a minute.'],
        ['Detangle', 'ebelin Entwirrkünstler through the lengths.'],
      ],
      note: 'Keep the caffeine tonic for the morning. At 00:30 skip all scalp products so you can fall asleep.',
    },
    'off-hair': {
      at: 'Morning', title: 'Hair', sub: 'Day off: detangle and a light scalp tonic',
      steps: [
        ['Detangle', 'ebelin Entwirrkünstler through dry or damp hair.'],
        ['Scalp', 'A little Balea Haarwasser Birke massaged into the roots.'],
      ],
    },
    // Home: the weekend laundry and cleaning pages of the guide.
    'laundry': {
      kind: 'Home', at: 'Morning', title: 'Laundry (Miele)', sub: 'Saturday: work shirts, towels and sheets',
      steps: [
        ['Pre-treat', 'Turn work shirts inside out and spray the underarms with Dr. Beckmann Deo & Schweiss Fleckenspray. Leave 10–30 min.'],
        ['Detergent', 'Slot II (main wash): Denkmit Color- or Vollwaschmittel. For whites or sweat add 1–2 tbsp Denkmit Fleckensalz Soda-Power. Softener slot: 1–2 caps Denkmit Hygiene-Spüler.'],
        ['Drum', 'One Denkmit Farb- & Schmutzfangtuch in the drum with the clothes.'],
        ['Program', 'Work shirts and colours: Buntwäsche 40 °C (or 30 °C). Towels, sheets and white undershirts: Koch-/Buntwäsche 60 °C. Pay in appWash and press Start.'],
      ],
      note: 'Saturday rather than Sunday: most German house rules ask for no washing machines on Sundays and holidays.',
    },
    'bathroom': {
      kind: 'Home', at: 'Afternoon', title: 'Bathroom deep clean', sub: 'Saturday: toilet, limescale and mould (gloves on)',
      steps: [
        ['Gloves', 'Profissimo Einmalhandschuhe on, window open.'],
        ['Toilet', 'Drop a Denkmit WC-Tab in the bowl and let it fizz 30–60 min. Then WC-Gel under the rim, scrub, flush.'],
        ['Taps & glass', 'Denkmit Kalkreiniger Anti Kalk; wait 3 min, wipe damp, rinse.'],
        ['Grout & mould', 'Denkmit Schimmelentferner mit Aktiv-Chlor on the spots; wait 15 min, wipe, air the room.'],
      ],
      note: 'Never mix the chlorine mould spray with the acidic limescale or toilet cleaners: it releases toxic gas. Do the mould step on its own, at the end, with the window open. Mixa Ceramide hand cream afterwards.',
    },
    'kitchen': {
      kind: 'Home', at: 'Afternoon', title: 'Kitchen & surfaces', sub: 'Sunday: degrease, disinfect, lint-roll',
      steps: [
        ['Stovetop', 'Denkmit Fettlöser Power-Formel; leave 2 min, wipe clean.'],
        ['Touch points', 'Phone, desk, light switches and handles with Denkmit Desinfektionstücher.'],
        ['Fabrics', 'Profissimo Fusselroller over the sofa, coats and bed sheets.'],
      ],
    },
    'off-am': {
      at: 'Morning', title: 'Teeth & face', sub: 'Your daily basics on a day off',
      steps: [
        ['Teeth', 'Floss with the Dontodent sticks, brush 2 min with Elmex Sensitive, scrape your tongue, rinse with the antibacterial mouthwash.'],
        ['Face', 'Balea MEN Sensitive Waschgel, Gesichtswasser hautrein, 3 drops Niacinamide serum, Balea Aqua gel.'],
        ['Beard', 'Comb with the ebelin Bartkamm and 3 drops Balea MEN Bartöl.'],
      ],
    },
    'sun-am': {
      at: 'Morning', title: 'Recovery morning', sub: 'Gentle after Saturday\'s BHA peel',
      steps: [
        ['Teeth', 'Floss, brush 2 min with Elmex Sensitive, scrape your tongue, rinse.'],
        ['Face', 'Splash with cool water, sweep Gesichtswasser hautrein, then Glycerin serum + Aqua gel. No harsh cleanser today.'],
      ],
    },
    'off-pm': {
      at: 'Evening', title: 'Evening skin care', sub: 'Cleanse and moisture before bed',
      steps: [
        ['Teeth', 'Floss and brush 2 min with Elmex Sensitive.'],
        ['Face wash', 'Balea MEN Sensitive Waschgel.'],
        ['Moisture', '3–4 drops Glycerin serum on damp skin, sealed with Balea Gesichtscreme Gel Aqua.'],
        ['Spots & hands', 'Anti-Pickel patches on any spots; Mixa Ceramide hand cream.'],
      ],
    },
    'sat-bha': {
      at: 'Evening', title: 'Pore clearing (BHA)', sub: 'Saturday: salicylic acid peel and deep hydration',
      steps: [
        ['Cleanse', 'Balea MEN Sensitive Waschgel with the ebelin silicone pad; pat completely dry.'],
        ['BHA', 'Balea Peeling Toner Beauty Expert (2% BHA) on a cotton pad over forehead, nose and chin. Don\'t rinse.'],
        ['Wait', '5 minutes for the acid to absorb.'],
        ['Serums', '3 drops Niacinamide, then 3 drops Glycerin serum. Seal with Aqua gel; patches on any spots.'],
        ['Teeth', 'Floss and brush 2 min with Elmex Sensitive.'],
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
        ['Trim', 'Snip stray hairs along the moustache and cheek line with the scissors.'],
        ['Oil', 'Warm 4 drops Balea MEN Bartöl in your palms and massage deep into beard and skin.'],
      ],
    },
  };
  /** The routines for one day, in the order you do them. shift: 'morning' | 'evening' | null; dow: 0 = Sunday. */
  function forDay(shift, dow) {
    if (shift === 'morning') return ['m-am', 'm-pm', 'm-hair'];
    if (shift === 'evening') return ['e-am', 'e-hair', 'e-pm'];
    if (dow === 6) return ['off-am', 'off-hair', 'laundry', 'bathroom', 'sat-bha'];
    if (dow === 0) return ['sun-am', 'sun-hair', 'kitchen', 'sun-beard', 'off-pm'];
    return ['off-am', 'off-hair', 'off-pm'];
  }
  /** Skin (face, teeth, body), Hair or Home: the small label on each routine. */
  const kindOf = (id) => R[id].kind || (/hair/.test(id) ? 'Hair' : /beard/.test(id) ? 'Beard' : 'Skin');
  return { R, forDay, kindOf };
})();
