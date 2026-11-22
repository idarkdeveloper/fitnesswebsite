/* PulseFit dumbbell exercises, for the owner's home kit: dumbbells up to 20 kg and a flat gym bench.
   Each exercise is a ladder of weights. A weight has three levels (3 × 8, 3 × 10, 3 × 12 reps), the
   "double progression" used in gyms: once you get 3 × 12 at a weight, the next weight unlocks and you
   start again at 3 × 8. Weights are per dumbbell. Loaded after data.js, before app.js. */
(function () {
  const D = window.PF_DATA;
  if (!D || !D.categories) return;
  const LEVELS = [{ sets: 3, target: 8 }, { sets: 3, target: 10 }, { sets: 3, target: 12 }];
  const kgTxt = (w) => (w === 0 ? 'Bodyweight' : `${w} kg`);
  const EX = [
    {
      id: 'db-bench', name: 'Dumbbell Bench Press', short: 'Bench Press', perSide: false,
      blurb: 'Pressing a pair of dumbbells on the flat bench: the main chest builder, with shoulders and triceps.',
      weights: [5, 7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Chest'], secondary: ['Triceps', 'Shoulders'],
      overview: 'Lying on the bench pressing two dumbbells. Each hand works on its own, which evens out a weaker side and is kinder to the shoulders than a barbell.',
      steps: [
        'Sit on the end of the bench with a dumbbell on each thigh, then lie back and bring them up beside your chest.',
        'Feet flat on the floor, shoulder blades squeezed together and down into the bench.',
        'Press both dumbbells up until your arms are straight above your chest.',
        'Lower slowly until the dumbbells are level with your chest, elbows about 45 degrees from your body.',
        'Press back up. After the last rep, bring them to your thighs and sit up.',
      ],
      cues: ['Two seconds down, one second up.', 'Keep your wrists straight over your elbows.', 'Don\'t bounce at the bottom.'],
    },
    {
      id: 'db-row', name: 'One-Arm Dumbbell Row', short: 'One-Arm Row', perSide: true,
      blurb: 'Rowing with one hand and one knee on the bench: a strong back to balance all the pressing.',
      weights: [7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Upper Back'], secondary: ['Biceps', 'Rear Shoulders'],
      overview: 'Supported on the bench with one hand and knee, you pull a dumbbell to your hip. The bench takes the strain off your lower back.',
      steps: [
        'Put your left knee and left hand on the bench, right foot on the floor, back flat like a table.',
        'Hold the dumbbell in your right hand, arm hanging straight down.',
        'Pull it towards your hip, leading with the elbow, until your upper arm is level with your back.',
        'Lower slowly to a full stretch.',
        'Do all reps, then switch sides. Count reps per side.',
      ],
      cues: ['Pull to the hip, not the chest.', 'Don\'t twist your torso to lift it.', 'Pause one second at the top.'],
    },
    {
      id: 'db-shoulder', name: 'Seated Dumbbell Press', short: 'Shoulder Press', perSide: false,
      blurb: 'Pressing overhead sitting on the bench, for strong, rounded shoulders.',
      weights: [5, 7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Shoulders'], secondary: ['Triceps', 'Upper Chest'],
      overview: 'Sitting tall on the bench and pressing two dumbbells overhead. Sitting stops you from using your legs, so the shoulders do the work.',
      steps: [
        'Sit on the bench, feet flat, back straight, dumbbells at shoulder height with palms facing forward.',
        'Brace your stomach.',
        'Press both dumbbells up until your arms are straight, without banging them together.',
        'Lower slowly back to shoulder height.',
      ],
      cues: ['Ribs down: don\'t arch your lower back.', 'Elbows slightly in front of your body.', 'Breathe out as you press.'],
    },
    {
      id: 'db-goblet', name: 'Goblet Squat', short: 'Goblet Squat', perSide: false,
      blurb: 'Squatting with one dumbbell held at your chest: legs and glutes, with an upright back.',
      weights: [7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Quads', 'Glutes'], secondary: ['Core', 'Upper Back'],
      overview: 'Holding one dumbbell upright against your chest keeps your body tall and makes it natural to squat deep.',
      steps: [
        'Hold one dumbbell vertically at your chest, both hands under the top end.',
        'Stand with feet a little wider than shoulders, toes slightly out.',
        'Sit down between your heels until your thighs are at least parallel to the floor.',
        'Drive through your whole foot to stand up.',
      ],
      cues: ['Knees follow your toes.', 'Chest up, dumbbell close to your body.', 'Three seconds down.'],
      after: 'At 20 kg for 3 × 12, slow it to 4 seconds down with a 2-second pause at the bottom, or move on to the Bulgarian split squat.',
    },
    {
      id: 'db-rdl', name: 'Dumbbell Romanian Deadlift', short: 'Romanian Deadlift', perSide: false,
      blurb: 'Hinging at the hips with two dumbbells: hamstrings, glutes and a strong lower back.',
      weights: [7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Hamstrings', 'Glutes'], secondary: ['Lower Back', 'Grip'],
      overview: 'You push your hips back and lower the dumbbells along your legs with a flat back, then stand up by squeezing your glutes.',
      steps: [
        'Stand tall with a dumbbell in each hand in front of your thighs, knees slightly bent.',
        'Push your hips back and let the dumbbells slide down your thighs, back flat.',
        'Stop when you feel a strong stretch in the back of your legs, usually just below the knees.',
        'Squeeze your glutes and push your hips forward to stand up.',
      ],
      cues: ['It\'s a hip movement, not a squat: knees stay soft but fixed.', 'Dumbbells stay close to your legs.', 'Neck in line with your back.'],
    },
    {
      id: 'db-split', name: 'Bulgarian Split Squat', short: 'Split Squat', perSide: true,
      blurb: 'One leg at a time with the back foot on the bench: the hardest leg exercise you can do at home.',
      weights: [0, 5, 7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Quads', 'Glutes'], secondary: ['Hamstrings', 'Balance'],
      overview: 'Your back foot rests on the bench and your front leg does almost all the work. Start with bodyweight; light dumbbells make it much harder.',
      steps: [
        'Stand about a big step in front of the bench and put the top of your back foot on it.',
        'Hold the dumbbells by your sides (or none at first).',
        'Lower straight down until your front thigh is parallel to the floor.',
        'Push through your front heel to stand up.',
        'Do all reps, then switch legs. Count reps per side.',
      ],
      cues: ['Most of your weight on the front foot.', 'Torso slightly forward is fine.', 'Find your balance before each rep.'],
    },
    {
      id: 'db-curl', name: 'Dumbbell Curl', short: 'Curl', perSide: false,
      blurb: 'Curls for the biceps and forearms; quick to add at the end of an upper-body day.',
      weights: [5, 7.5, 10, 12.5, 15, 17.5, 20],
      primary: ['Biceps'], secondary: ['Forearms'],
      overview: 'Standing or sitting on the bench, curl both dumbbells up without swinging.',
      steps: [
        'Stand tall with a dumbbell in each hand, palms facing forward, elbows by your sides.',
        'Curl both up until your forearms are vertical.',
        'Squeeze, then lower slowly to straight arms.',
      ],
      cues: ['Elbows stay pinned to your sides.', 'No swinging: sit on the bench if you start to rock.', 'Three seconds down.'],
    },
  ];
  for (const e of EX) {
    D.categories.push({
      id: e.id, name: e.name, premium: false, blurb: e.blurb, equipment: 'Dumbbells',
      progressions: e.weights.map((w, i) => {
        const next = e.weights[i + 1], prev = e.weights[i - 1];
        return {
          id: `${e.id}-${String(w).replace('.', '-')}`,
          name: `${e.short} · ${kgTxt(w)}`,
          type: 'reps', perSide: e.perSide, weight: w,
          overview: `${e.overview} ${w ? `This step: ${w} kg${e.id === 'db-goblet' ? '' : ' per dumbbell'}.` : 'This step: no dumbbells.'}`,
          primary: e.primary, secondary: e.secondary, levels: LEVELS,
          steps: e.steps,
          harder: next != null ? `Get 3 × 12 with good form and ${next} kg unlocks. Until then, slow the lowering to 3 seconds.` : (e.after || 'You\'ve reached the heaviest dumbbells: slow the lowering to 4 seconds and pause at the hardest point.'),
          easier: prev != null ? `Go back to ${kgTxt(prev)} for a session, or stop each set 2 reps short.` : 'Do fewer reps with perfect form and rest a little longer between sets.',
          cues: e.cues,
        };
      }),
    });
  }
})();
