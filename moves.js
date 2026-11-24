'use strict';
/* Mizan floor and home moves: crunches, the leg bicycle, planks and other exercises that need no equipment.
   Each is a short ladder of three steps, easiest first, in the same shape as data.js. Low impact: no jumping.
   `part` is the body part the exercise mainly trains; app.js uses it to build a routine around a focus.
   Loaded after dumbbells.js, before app.js. */
(function () {
  const D = window.PF_DATA;
  if (!D || !D.categories) return;
  const reps = (a, b, c) => [{ sets: 2, target: a }, { sets: 3, target: b }, { sets: 3, target: c }];
  const P = (id, name, o) => ({ id, name, type: 'reps', perSide: false, secondary: [], ...o });
  const MOVES = [
    {
      id: 'crunches', name: 'Crunches', part: 'core',
      blurb: 'Curling your shoulders off the floor to work the front of your stomach, from short crunches to reverse crunches.',
      progressions: [
        P('basic-crunches', 'Crunches', {
          overview: 'The classic stomach exercise: a short curl of the upper back off the floor. The lower back stays down, so it is easy on the spine.',
          primary: ['Abs'], levels: reps(10, 15, 25),
          steps: ['Lie on your back, knees bent, feet flat, hands across your chest or beside your ears.', 'Tighten your stomach and curl your head and shoulders off the floor.', 'Stop when your shoulder blades have left the floor; your lower back stays down.', 'Lower slowly until your shoulders touch.'],
          harder: 'Pause two seconds at the top, then move on to long-arm crunches.', easier: 'Slide your hands along your thighs towards your knees and lift only a little.',
          cues: ['Breathe out as you curl up.', 'Don\'t pull on your neck: keep a fist of space under your chin.', 'Slow on the way down.'],
        }),
        P('long-arm-crunches', 'Long-Arm Crunches', {
          overview: 'A crunch with your arms stretched out behind your head. The longer lever makes the same small movement much harder.',
          primary: ['Abs'], secondary: ['Shoulders'], levels: reps(8, 12, 20),
          steps: ['Lie on your back with knees bent and feet flat.', 'Stretch your arms straight behind your head, upper arms by your ears, hands together.', 'Curl your shoulders off the floor, keeping your arms in line with your ears.', 'Lower with control.'],
          harder: 'Hold a light dumbbell or a water bottle in your hands.', easier: 'Bring your hands back beside your ears.',
          cues: ['Arms move with your body, not ahead of it.', 'Lower back stays on the floor.', 'No swinging.'],
        }),
        P('reverse-crunches', 'Reverse Crunches', {
          overview: 'Instead of the shoulders, the hips curl off the floor. This targets the lower part of the stomach.',
          primary: ['Lower Abs'], secondary: ['Hip Flexors'], levels: reps(8, 12, 20),
          steps: ['Lie on your back, arms by your sides, palms down.', 'Lift your legs with knees bent to 90 degrees, shins level with the floor.', 'Curl your hips off the floor and bring your knees towards your chest.', 'Lower your hips slowly until they touch, keeping your knees bent.'],
          harder: 'Straighten your legs towards the ceiling and lift your hips straight up.', easier: 'Make the lift smaller and press your hands into the floor.',
          cues: ['Curl the hips, don\'t swing the legs.', 'Breathe out as the hips lift.', 'Head and shoulders stay relaxed.'],
        }),
      ],
    },
    {
      id: 'bicycle', name: 'Leg Bicycle', part: 'core',
      blurb: 'Cycling your legs in the air while lying on your back: stomach, sides and hips, building up to bicycle crunches.',
      progressions: [
        P('dead-bugs', 'Dead Bugs', {
          perSide: true,
          overview: 'On your back, opposite arm and leg reach away while your stomach keeps your lower back on the floor. It teaches the control the bicycle needs.',
          primary: ['Abs'], secondary: ['Hip Flexors'], levels: reps(6, 10, 14),
          steps: ['Lie on your back, arms straight up, knees bent to 90 degrees above your hips.', 'Press your lower back gently into the floor.', 'Lower your right arm behind your head and straighten your left leg, both hovering just above the floor.', 'Return and repeat with the other arm and leg. Count reps per side.'],
          harder: 'Pause two seconds with the arm and leg stretched out.', easier: 'Move only the legs and keep your arms pointing up.',
          cues: ['If your lower back lifts, don\'t reach so far.', 'Move slowly.', 'Breathe out as you reach.'],
        }),
        P('leg-bicycle', 'Leg Bicycle', {
          type: 'hold',
          overview: 'Lying on your back and pedalling in the air as if riding a bike. Head and shoulders stay down, so the stomach and hips do steady work.',
          primary: ['Lower Abs'], secondary: ['Hip Flexors', 'Thighs'], levels: reps(20, 30, 45),
          steps: ['Lie on your back with your hands under your hips, palms down.', 'Lift both legs and bend your knees.', 'Pedal: push one leg out long while the other knee comes towards your chest, in smooth circles.', 'Keep pedalling for the target time.'],
          harder: 'Pedal with your legs lower, closer to the floor.', easier: 'Pedal with your legs higher, almost above your hips.',
          cues: ['Lower back stays on your hands.', 'Smooth circles, not kicks.', 'Keep breathing.'],
        }),
        P('bicycle-crunches', 'Bicycle Crunches', {
          perSide: true,
          overview: 'The leg bicycle with a twist: each elbow turns towards the opposite knee. One of the best exercises for the stomach and sides together.',
          primary: ['Abs', 'Obliques'], secondary: ['Hip Flexors'], levels: reps(8, 12, 20),
          steps: ['Lie on your back, hands beside your ears, shoulders lifted, knees bent above your hips.', 'Straighten your left leg and turn your left shoulder towards your right knee.', 'Switch: right leg long, right shoulder towards your left knee.', 'Keep going slowly. Count reps per side.'],
          harder: 'Pause one second at each twist and keep the straight leg a hand\'s width off the floor.', easier: 'Rest your head down between reps, or go back to the leg bicycle.',
          cues: ['Turn your shoulder, not just your elbow.', 'Slow beats fast here.', 'Don\'t pull on your neck.'],
        }),
      ],
    },
    {
      id: 'planks', name: 'Planks', part: 'core',
      blurb: 'Holding your body in one straight line on your forearms: the whole midsection works without any movement.',
      progressions: [
        P('knee-planks', 'Knee Planks', {
          type: 'hold',
          overview: 'A plank from the knees. It builds the stomach and shoulder strength for the full plank with less load on the lower back.',
          primary: ['Abs'], secondary: ['Shoulders'], levels: reps(20, 30, 45),
          steps: ['Kneel and place your forearms on the floor, elbows under your shoulders.', 'Walk your knees back until your body is straight from head to knees.', 'Tighten your stomach and squeeze your glutes.', 'Hold for the target time, breathing normally.'],
          harder: 'Lift one knee for a few seconds at a time.', easier: 'Hold with your hands on a bench instead of the floor.',
          cues: ['Hips in line, not up and not sagging.', 'Push the floor away with your forearms.', 'Look at the floor.'],
        }),
        P('forearm-planks', 'Forearm Planks', {
          type: 'hold',
          overview: 'The full plank: forearms and toes on the floor, body straight. A simple test of midsection strength.',
          primary: ['Abs'], secondary: ['Shoulders', 'Glutes'], levels: reps(20, 40, 60),
          steps: ['Place your forearms on the floor, elbows under your shoulders.', 'Step both feet back, toes tucked, so you are straight from head to heels.', 'Tighten your stomach, squeeze your glutes and thighs.', 'Hold for the target time.'],
          harder: 'Move your elbows a little further forward, or go on to shoulder taps.', easier: 'Drop to your knees when your hips start to sag and finish the time there.',
          cues: ['Stop the set when your lower back sags.', 'Breathe; don\'t hold your breath.', 'Heels push back.'],
        }),
        P('plank-shoulder-taps', 'Plank Shoulder Taps', {
          perSide: true,
          overview: 'A plank on straight arms where each hand in turn taps the opposite shoulder. Your stomach has to stop the hips from rocking.',
          primary: ['Abs', 'Obliques'], secondary: ['Shoulders'], levels: reps(6, 10, 15),
          steps: ['Start at the top of a pushup, hands under shoulders, feet wider than your hips.', 'Lift your right hand and tap your left shoulder.', 'Put it down and tap your right shoulder with your left hand.', 'Keep your hips still. Count reps per side.'],
          harder: 'Bring your feet closer together.', easier: 'Do it from your knees, or with your hands on a bench.',
          cues: ['Hips stay level, as if balancing a glass.', 'Slow taps.', 'Wider feet make it easier.'],
        }),
      ],
    },
    {
      id: 'flutter-kicks', name: 'Flutter Kicks', part: 'core',
      blurb: 'Small, quick kicks with straight legs just above the floor: lower stomach and hips.',
      progressions: [
        P('heel-taps', 'Lying Heel Taps', {
          perSide: true,
          overview: 'On your back with knees bent in the air, one heel at a time lowers to tap the floor. A gentle start for the lower stomach.',
          primary: ['Lower Abs'], secondary: ['Hip Flexors'], levels: reps(8, 12, 16),
          steps: ['Lie on your back, knees bent to 90 degrees above your hips, arms by your sides.', 'Keeping the knee bent, lower your right heel to tap the floor.', 'Bring it back and lower the left heel.', 'Count reps per side.'],
          harder: 'Tap further away from your hips.', easier: 'Tap closer to your hips.',
          cues: ['Lower back stays down.', 'Slow and quiet taps.', 'Breathe out as the heel lowers.'],
        }),
        P('flutter-kick', 'Flutter Kicks', {
          type: 'hold',
          overview: 'Both legs straight and a little off the floor, kicking up and down in small, quick movements, like swimming on your back.',
          primary: ['Lower Abs'], secondary: ['Hip Flexors', 'Thighs'], levels: reps(15, 25, 40),
          steps: ['Lie on your back with your hands under your hips.', 'Lift both straight legs about a foot off the floor.', 'Kick up and down in small, quick movements, one leg rising as the other falls.', 'Keep going for the target time.'],
          harder: 'Lift your head and shoulders slightly and keep your legs lower.', easier: 'Kick with your legs higher, or bend your knees a little.',
          cues: ['Small kicks from the hip.', 'Lower back pressed down.', 'Don\'t hold your breath.'],
        }),
        P('scissor-kicks', 'Scissor Kicks', {
          type: 'hold',
          overview: 'Like flutter kicks, but the legs cross over each other sideways. The inner thighs join in.',
          primary: ['Lower Abs'], secondary: ['Inner Thighs', 'Hip Flexors'], levels: reps(15, 25, 40),
          steps: ['Lie on your back with your hands under your hips, legs straight and just off the floor.', 'Open your legs a little, then cross the right over the left.', 'Open again and cross the left over the right.', 'Keep crossing for the target time.'],
          harder: 'Keep your legs lower and lift your shoulders off the floor.', easier: 'Raise your legs higher.',
          cues: ['Legs stay straight.', 'Steady rhythm.', 'Stop if your lower back arches.'],
        }),
      ],
    },
    {
      id: 'russian-twists', name: 'Russian Twists', part: 'core',
      blurb: 'Sitting back and turning your shoulders from side to side to train the muscles along your waist.',
      progressions: [
        P('seated-twists', 'Seated Twists', {
          perSide: true,
          overview: 'Sitting tall with feet on the floor, you lean back a little and turn your shoulders side to side. Feet down keeps it gentle on the back.',
          primary: ['Obliques'], secondary: ['Abs'], levels: reps(8, 12, 16),
          steps: ['Sit with knees bent, heels on the floor, hands together in front of your chest.', 'Lean back until you feel your stomach tighten, back straight.', 'Turn your shoulders to the right, then to the left.', 'Count reps per side.'],
          harder: 'Lean back a little further.', easier: 'Sit more upright.',
          cues: ['Turn the ribcage, not just the arms.', 'Chest up, no slouching.', 'Slow turns.'],
        }),
        P('russian-twist', 'Russian Twists', {
          perSide: true,
          overview: 'The same twist with your feet off the floor, so your stomach also has to balance you.',
          primary: ['Obliques'], secondary: ['Abs', 'Hip Flexors'], levels: reps(8, 12, 20),
          steps: ['Sit with knees bent and lean back, back straight.', 'Lift your feet a few centimetres off the floor and balance.', 'Turn your shoulders to the right and touch your hands beside your hip, then to the left.', 'Count reps per side.'],
          harder: 'Hold a dumbbell or a water bottle with both hands.', easier: 'Tap your heels down between twists.',
          cues: ['Eyes follow your hands.', 'Keep your back long.', 'Feet still.'],
        }),
        P('weighted-twists', 'Weighted Russian Twists', {
          perSide: true,
          overview: 'Russian twists holding one dumbbell with both hands. Start light: 5 kg is plenty.',
          primary: ['Obliques'], secondary: ['Abs', 'Shoulders'], levels: reps(8, 12, 20),
          steps: ['Sit with knees bent holding one dumbbell by its ends, close to your chest.', 'Lean back with a straight back and lift your feet.', 'Turn to the right and lower the dumbbell beside your hip, then to the left.', 'Count reps per side.'],
          harder: 'Use the next dumbbell up, or hold it further from your chest.', easier: 'Put your heels down.',
          cues: ['Control the weight; don\'t swing it.', 'Stop if your lower back aches.', 'Breathe out on each turn.'],
        }),
      ],
    },
    {
      id: 'mountain-climbers', name: 'Mountain Climbers', part: 'core',
      blurb: 'Driving your knees towards your chest from a pushup position: stomach, shoulders and a raised heart rate, without jumping.',
      progressions: [
        P('incline-climbers', 'Incline Mountain Climbers', {
          perSide: true,
          overview: 'Mountain climbers with your hands on the bench. Stepping one knee in at a time keeps it low impact.',
          primary: ['Abs'], secondary: ['Shoulders', 'Hip Flexors'], levels: reps(8, 12, 20),
          steps: ['Place your hands on the bench, arms straight, and step back until your body is straight.', 'Step your right knee towards your chest.', 'Step it back and bring the left knee in.', 'Keep a steady pace. Count reps per side.'],
          harder: 'Speed up without bouncing your hips.', easier: 'Use a higher surface, such as a table.',
          cues: ['Shoulders over hands.', 'Hips stay low.', 'Step; don\'t jump.'],
        }),
        P('slow-climbers', 'Mountain Climbers', {
          perSide: true,
          overview: 'From the top of a pushup on the floor, the knees come in one after the other.',
          primary: ['Abs'], secondary: ['Shoulders', 'Hip Flexors', 'Thighs'], levels: reps(8, 14, 20),
          steps: ['Start at the top of a pushup, hands under your shoulders.', 'Bring your right knee towards your chest, toes lightly touching the floor.', 'Send it back and bring the left knee in.', 'Count reps per side.'],
          harder: 'Go faster, switching feet lightly.', easier: 'Go back to the bench.',
          cues: ['Flat back.', 'Stomach tight.', 'Quiet feet.'],
        }),
        P('cross-climbers', 'Cross-Body Mountain Climbers', {
          perSide: true,
          overview: 'Each knee travels towards the opposite elbow, adding a twist for the sides of your waist.',
          primary: ['Abs', 'Obliques'], secondary: ['Shoulders', 'Hip Flexors'], levels: reps(8, 12, 18),
          steps: ['Start at the top of a pushup.', 'Bring your right knee under your body towards your left elbow.', 'Return and bring the left knee towards your right elbow.', 'Count reps per side.'],
          harder: 'Pause one second with the knee at the elbow.', easier: 'Do them with your hands on the bench.',
          cues: ['Hips turn a little, shoulders stay square.', 'Controlled, not rushed.', 'Push the floor away.'],
        }),
      ],
    },
    {
      id: 'wall-sits', name: 'Wall Sits', part: 'legs',
      blurb: 'Sitting against a wall with nothing under you: thighs and glutes hold your weight without moving the knees.',
      progressions: [
        P('high-wall-sits', 'High Wall Sits', {
          type: 'hold',
          overview: 'A wall sit with only a small knee bend. It strengthens the thighs with little stress on the knees.',
          primary: ['Thighs'], secondary: ['Glutes'], levels: reps(20, 30, 45),
          steps: ['Stand with your back against a wall, feet hip-width and about two foot-lengths from it.', 'Slide down until your knees are bent about a third of the way.', 'Press your whole back into the wall.', 'Hold for the target time, then push up through your heels.'],
          harder: 'Slide a little lower each week.', easier: 'Bend your knees less.',
          cues: ['Weight in your heels.', 'Knees over ankles, not past your toes.', 'Keep breathing.'],
        }),
        P('wall-sit', 'Wall Sits', {
          type: 'hold',
          overview: 'Thighs level with the floor, as if sitting on an invisible chair.',
          primary: ['Thighs'], secondary: ['Glutes', 'Calves'], levels: reps(20, 40, 60),
          steps: ['Stand with your back against a wall and walk your feet forward.', 'Slide down until your thighs are level with the floor and knees are at 90 degrees.', 'Keep your back flat on the wall, hands off your thighs.', 'Hold for the target time.'],
          harder: 'Hold a dumbbell on your thighs.', easier: 'Sit a little higher.',
          cues: ['Knees point the same way as your toes.', 'Don\'t push on your legs with your hands.', 'Stand up before your form goes.'],
        }),
        P('weighted-wall-sits', 'Weighted Wall Sits', {
          type: 'hold',
          overview: 'A full wall sit with a dumbbell resting across your thighs.',
          primary: ['Thighs'], secondary: ['Glutes', 'Calves'], levels: reps(20, 40, 60),
          steps: ['Set up a wall sit with thighs level with the floor.', 'Rest one dumbbell across your thighs and hold it in place.', 'Keep your back flat on the wall.', 'Hold for the target time, then put the dumbbell down before standing.'],
          harder: 'Use a heavier dumbbell.', easier: 'Use a lighter dumbbell or none.',
          cues: ['Heels down.', 'Even weight on both legs.', 'Stop if your knees hurt.'],
        }),
      ],
    },
    {
      id: 'calf-raises', name: 'Calf Raises', part: 'legs',
      blurb: 'Rising onto your toes to strengthen calves and ankles, which carry you through every step of your walks.',
      progressions: [
        P('floor-calf-raises', 'Calf Raises', {
          overview: 'Standing on the floor and rising onto the balls of both feet.',
          primary: ['Calves'], levels: reps(12, 18, 25),
          steps: ['Stand tall with feet hip-width, one hand on a wall for balance.', 'Rise onto the balls of your feet as high as you can.', 'Pause one second at the top.', 'Lower your heels slowly.'],
          harder: 'Move on to a step so your heels can drop lower.', easier: 'Hold on with both hands and make the lift smaller.',
          cues: ['Straight up, not forward.', 'Three seconds down.', 'Weight over the big toes.'],
        }),
        P('step-calf-raises', 'Step Calf Raises', {
          overview: 'On the edge of a step, the heels drop below the toes for a full stretch before each rise.',
          primary: ['Calves'], levels: reps(10, 15, 20),
          steps: ['Stand with the balls of your feet on a step, heels hanging off, holding a rail or wall.', 'Lower your heels below the step until you feel a stretch.', 'Rise as high as you can and pause.', 'Lower slowly.'],
          harder: 'Hold a dumbbell in one hand.', easier: 'Go back to the floor.',
          cues: ['Full stretch, full rise.', 'No bouncing at the bottom.', 'Knees straight but not locked.'],
        }),
        P('one-leg-calf-raises', 'One-Leg Calf Raises', {
          perSide: true,
          overview: 'All your weight on one calf at a time.',
          primary: ['Calves'], levels: reps(8, 12, 15),
          steps: ['Stand on your right foot on a step or the floor, left foot tucked behind your ankle, one hand on a wall.', 'Rise onto the ball of your foot as high as you can.', 'Lower slowly.', 'Do all reps, then switch. Count reps per side.'],
          harder: 'Hold a dumbbell on the working side.', easier: 'Rise on two feet and lower on one.',
          cues: ['Hips level.', 'Use the wall for balance, not to pull yourself up.', 'Slow on the way down.'],
        }),
      ],
    },
    {
      id: 'glute-kicks', name: 'Glute Kickbacks', part: 'legs',
      blurb: 'On hands and knees, lifting one leg at a time to work the glutes and the outside of the hips.',
      progressions: [
        P('donkey-kicks', 'Donkey Kicks', {
          perSide: true,
          overview: 'On all fours, one bent leg lifts until the sole of the foot faces the ceiling.',
          primary: ['Glutes'], secondary: ['Hamstrings'], levels: reps(10, 15, 20),
          steps: ['Kneel on all fours, hands under shoulders, knees under hips.', 'Keeping the knee bent, lift your right leg until your thigh is level with your back.', 'Squeeze your glute for a second.', 'Lower without resting the knee. Do all reps, then switch. Count reps per side.'],
          harder: 'Pause three seconds at the top.', easier: 'Lift the leg lower.',
          cues: ['Don\'t arch your lower back.', 'Hips stay square to the floor.', 'Stomach braced.'],
        }),
        P('fire-hydrants', 'Fire Hydrants', {
          perSide: true,
          overview: 'On all fours, the bent leg lifts out to the side. It trains the muscles on the outside of the hip that keep your knees steady.',
          primary: ['Glutes'], secondary: ['Outer Hips'], levels: reps(8, 12, 18),
          steps: ['Kneel on all fours.', 'Keeping the knee bent, lift your right leg out to the side as high as you can without tilting.', 'Pause, then lower slowly.', 'Do all reps, then switch. Count reps per side.'],
          harder: 'At the top, straighten the leg out to the side and bend it again.', easier: 'Lift only a little.',
          cues: ['Weight even on both hands.', 'Don\'t lean away from the lifting leg.', 'Slow down.'],
        }),
        P('straight-kickbacks', 'Straight-Leg Kickbacks', {
          perSide: true,
          overview: 'The leg stays straight and lifts behind you. The longer leg makes the glutes and hamstrings work harder.',
          primary: ['Glutes'], secondary: ['Hamstrings', 'Lower Back'], levels: reps(8, 12, 18),
          steps: ['Kneel on all fours and stretch your right leg straight back, toes on the floor.', 'Lift the straight leg until it is level with your back.', 'Squeeze, then lower until your toes almost touch.', 'Do all reps, then switch. Count reps per side.'],
          harder: 'Reach the opposite arm forward at the same time.', easier: 'Go back to donkey kicks.',
          cues: ['Lift from the glute, not the lower back.', 'Leg no higher than your hips.', 'Neck long.'],
        }),
      ],
    },
    {
      id: 'supermans', name: 'Supermans', part: 'back',
      blurb: 'Lifting arms and legs while lying face down or kneeling: the muscles along your spine, with no equipment.',
      progressions: [
        P('bird-dogs', 'Bird Dogs', {
          perSide: true,
          overview: 'On all fours, the opposite arm and leg reach out. A safe way to strengthen the lower back and learn to keep the hips still.',
          primary: ['Lower Back'], secondary: ['Glutes', 'Abs'], levels: reps(6, 10, 14),
          steps: ['Kneel on all fours, hands under shoulders, knees under hips.', 'Reach your right arm forward and your left leg back until both are level with your back.', 'Hold two seconds.', 'Return and switch. Count reps per side.'],
          harder: 'Touch elbow to knee under your body between reps.', easier: 'Move only the legs.',
          cues: ['Hips level.', 'Reach long, not high.', 'Stomach lightly braced.'],
        }),
        P('superman-holds', 'Supermans', {
          overview: 'Lying face down, arms and legs lift a little off the floor together.',
          primary: ['Lower Back'], secondary: ['Glutes', 'Upper Back'], levels: reps(8, 12, 16),
          steps: ['Lie face down, arms stretched in front, legs straight.', 'Lift your arms, chest and legs a few centimetres off the floor.', 'Hold two seconds, looking at the floor.', 'Lower slowly.'],
          harder: 'Hold each rep for five seconds.', easier: 'Lift only your arms and chest, or only your legs.',
          cues: ['Small lift: length matters more than height.', 'Squeeze your glutes.', 'Stop if your lower back pinches.'],
        }),
        P('swimmers', 'Swimmers', {
          type: 'hold',
          overview: 'From the superman position, opposite arm and leg flutter up and down as if swimming.',
          primary: ['Lower Back'], secondary: ['Glutes', 'Upper Back', 'Shoulders'], levels: reps(15, 25, 40),
          steps: ['Lie face down with arms in front and lift your arms, chest and legs slightly.', 'Raise your right arm and left leg a little higher, then switch.', 'Keep alternating in a steady rhythm.', 'Continue for the target time.'],
          harder: 'Slow down and lift a little higher on each beat.', easier: 'Rest your forehead on the floor and move only your legs.',
          cues: ['Eyes on the floor.', 'Long arms and legs.', 'Keep breathing.'],
        }),
      ],
    },
    {
      id: 'pike-pushups', name: 'Pike Pushups', part: 'shoulders',
      blurb: 'Pushups with your hips high in an upside-down V, so the shoulders take the load instead of the chest.',
      progressions: [
        P('pike-holds', 'Pike Holds', {
          type: 'hold',
          overview: 'Holding the upside-down V on straight arms. It builds shoulder strength and gets you used to the position.',
          primary: ['Shoulders'], secondary: ['Upper Back', 'Abs'], levels: reps(15, 25, 40),
          steps: ['Start on hands and feet and walk your feet in until your hips are high.', 'Straighten your arms and legs as far as is comfortable.', 'Push the floor away and let your head hang between your arms.', 'Hold for the target time.'],
          harder: 'Walk your feet closer to your hands.', easier: 'Bend your knees, or put your hands on the bench.',
          cues: ['Hips high.', 'Shoulders pushed up towards your ears.', 'Weight in your hands.'],
        }),
        P('incline-pike-pushups', 'Bench Pike Pushups', {
          overview: 'A pike pushup with your hands on the bench, so less of your weight is on your arms.',
          primary: ['Shoulders'], secondary: ['Triceps', 'Upper Chest'], levels: reps(6, 10, 15),
          steps: ['Place your hands on the edge of the bench and walk your feet back, hips high.', 'Bend your elbows and lower the top of your head towards the bench.', 'Stop just above it.', 'Press back up until your arms are straight.'],
          harder: 'Move to the floor.', easier: 'Use a higher surface.',
          cues: ['Elbows point back, not out.', 'Head travels forward of your hands.', 'Hips stay high.'],
        }),
        P('floor-pike-pushups', 'Pike Pushups', {
          overview: 'Hands on the floor, hips high, lowering your head between your hands: the bodyweight version of a shoulder press.',
          primary: ['Shoulders'], secondary: ['Triceps', 'Upper Chest'], levels: reps(5, 8, 12),
          steps: ['Start in the pike hold, hands a little wider than your shoulders.', 'Bend your elbows and lower the top of your head towards the floor, slightly in front of your hands.', 'Stop just above the floor.', 'Press back up to straight arms.'],
          harder: 'Put your feet on the bench.', easier: 'Lower only halfway, or go back to the bench.',
          cues: ['Head and hands make a triangle on the floor.', 'Slow on the way down.', 'Stop if your shoulders pinch.'],
        }),
      ],
    },
  ];
  for (const m of MOVES) {
    for (const p of m.progressions) if (p.type === 'hold' && p.perSide == null) p.perSide = false;
    D.categories.push({ id: m.id, name: m.name, premium: false, blurb: m.blurb, part: m.part, progressions: m.progressions });
  }
})();
