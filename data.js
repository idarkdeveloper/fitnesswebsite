'use strict';
window.PF_DATA = {
  categories: [
    {
      id: 'pushups',
      name: 'Pushups',
      premium: false,
      blurb: 'Pressing from the floor or a raised surface to build a strong chest, shoulders and arms, ending in the one-arm pushup.',
      progressions: [
        {
          id: 'wall-pushups',
          name: 'Wall Pushups',
          type: 'reps',
          perSide: false,
          overview: 'A pushup done standing and leaning into a wall. It teaches the pressing pattern with very little load and gently conditions the wrists, elbows and shoulders.',
          primary: ['Chest'],
          secondary: ['Triceps', 'Shoulders'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 25 },
            { sets: 3, target: 50 }
          ],
          steps: [
            'Stand an arm\'s length from a wall with feet hip-width apart.',
            'Place your palms on the wall at shoulder height and shoulder width.',
            'Brace your stomach so your body forms one straight line.',
            'Bend your elbows and lower your chest until your nose nearly touches the wall.',
            'Press back out until your arms are straight.'
          ],
          harder: 'Step your feet farther from the wall to put more weight on your hands. Slow the lowering phase to three seconds.',
          easier: 'Stand closer to the wall and shorten the range of motion.',
          cues: [
            'Keep your body rigid like a plank.',
            'Elbows point back at about 45 degrees, not straight out.',
            'Breathe in on the way down, out on the way up.'
          ]
        },
        {
          id: 'incline-pushups',
          name: 'Incline Pushups',
          type: 'reps',
          perSide: false,
          overview: 'Pushups with your hands on a bench, table or sturdy step. The angle shifts more bodyweight onto your arms while still being lighter than a floor pushup.',
          primary: ['Chest'],
          secondary: ['Triceps', 'Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Place your hands on a stable surface around hip height, slightly wider than your shoulders.',
            'Walk your feet back until your body is straight from head to heels.',
            'Tighten your glutes and stomach.',
            'Lower your chest to the edge of the surface with control.',
            'Push away until your elbows are straight.'
          ],
          harder: 'Use a lower surface such as a stair or a low box. Pause for one second at the bottom.',
          easier: 'Use a higher surface like a kitchen counter.',
          cues: [
            'Do not let your hips sag.',
            'Lead with your chest, not your chin.',
            'Squeeze the surface as if trying to pull your hands together.'
          ]
        },
        {
          id: 'knee-pushups',
          name: 'Kneeling Pushups',
          type: 'reps',
          perSide: false,
          overview: 'A floor pushup with your knees as the pivot point. It builds pressing strength through the full range of motion before taking on your whole bodyweight.',
          primary: ['Chest'],
          secondary: ['Triceps', 'Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Kneel on a mat and place your hands on the floor slightly wider than your shoulders.',
            'Shift forward so your body is straight from head to knees.',
            'Brace your core and keep your hips in line.',
            'Lower until your chest is a fist\'s height from the floor.',
            'Press back up to straight arms.'
          ],
          harder: 'Move your knees farther back so more weight falls on your hands. Add a slow three-second descent.',
          easier: 'Reduce the depth or return to incline pushups.',
          cues: [
            'Hips stay in line with shoulders and knees.',
            'Hands sit under or just outside the shoulders.',
            'Pad the knees if the floor is hard.'
          ]
        },
        {
          id: 'full-pushups',
          name: 'Full Pushups',
          type: 'reps',
          perSide: false,
          overview: 'The standard pushup on hands and toes. It is the foundation of upper-body pressing and trains the chest, arms and core together.',
          primary: ['Chest', 'Triceps'],
          secondary: ['Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Set your hands on the floor slightly wider than your shoulders.',
            'Extend your legs back and rest on the balls of your feet.',
            'Squeeze your glutes and brace your stomach to make a straight line.',
            'Lower until your chest nearly touches the floor.',
            'Press up until your arms are fully straight.'
          ],
          harder: 'Raise your feet on a step or slow the tempo to three seconds down and one second up.',
          easier: 'Put your hands on a low step or do kneeling pushups for the final reps.',
          cues: [
            'Body moves as one solid piece.',
            'Elbows angle back, not flared to the sides.',
            'Push the floor away at the top to spread the shoulder blades.',
            'Keep your neck neutral and eyes slightly ahead.'
          ]
        },
        {
          id: 'close-pushups',
          name: 'Close Pushups',
          type: 'reps',
          perSide: false,
          overview: 'A pushup with the hands close together under the chest. The narrow position shifts more work onto the triceps and prepares you for single-arm pressing.',
          primary: ['Triceps', 'Chest'],
          secondary: ['Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 12 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Get into a pushup position with your hands touching or a few inches apart under your chest.',
            'Straighten your body and brace your core.',
            'Lower slowly, keeping your elbows close to your ribs.',
            'Touch your chest lightly to the backs of your hands.',
            'Press back to the top.'
          ],
          harder: 'Elevate your feet or pause at the bottom for two seconds.',
          easier: 'Widen your hands slightly or do them on an incline.',
          cues: [
            'Elbows brush your sides on the way down.',
            'Spread your fingers to protect your wrists.',
            'Avoid letting the shoulders roll forward.'
          ]
        },
        {
          id: 'uneven-pushups',
          name: 'Uneven Pushups',
          type: 'reps',
          perSide: true,
          overview: 'A pushup with one hand on the floor and the other resting on a raised object like a ball or block. The low hand carries most of the load, bridging the gap to one-arm work.',
          primary: ['Chest', 'Triceps'],
          secondary: ['Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Place one hand on the floor and the other on a sturdy object about 10-15 cm high.',
            'Extend your legs and set your body in a straight line.',
            'Lower your chest toward the floor-side hand.',
            'Press up using mainly the floor arm.',
            'Finish all reps, then switch sides.'
          ],
          harder: 'Use a less stable object like a basketball, or a taller block, so the top hand helps less.',
          easier: 'Use a lower object or widen your feet for balance.',
          cues: [
            'Keep hips square to the floor.',
            'The raised hand only balances, it does not push hard.',
            'Move slowly so you do not twist.'
          ]
        },
        {
          id: 'half-one-arm-pushups',
          name: 'Half One-Arm Pushups',
          type: 'reps',
          perSide: true,
          overview: 'A one-arm pushup through the top half of the range. It builds the anti-rotation core strength and single-arm pressing power needed for full one-arm work.',
          primary: ['Chest', 'Triceps'],
          secondary: ['Shoulders', 'Core', 'Obliques'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Get into a pushup position with your feet wider than shoulder width.',
            'Place one hand under your chest and the other behind your back.',
            'Brace hard to stop your hips rotating.',
            'Lower until your elbow reaches about 90 degrees.',
            'Press back up and repeat, then switch arms.'
          ],
          harder: 'Bring your feet a little closer together or go slightly deeper each week.',
          easier: 'Put a block or folded towel under your chest to limit depth, or do it on an incline.',
          cues: [
            'Feet wide for a stable base.',
            'Shoulders stay level with the floor.',
            'Working hand sits under the middle of the chest.'
          ]
        },
        {
          id: 'lever-pushups',
          name: 'Lever Pushups',
          type: 'reps',
          perSide: true,
          overview: 'A pushup where one arm presses on the floor while the other stays straight out to the side on a ball or block. The straight arm helps less as you get stronger, making this a close assisted one-arm pushup.',
          primary: ['Chest', 'Triceps'],
          secondary: ['Shoulders', 'Core', 'Obliques'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 8 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Set up in a wide-footed pushup position.',
            'Put your working hand under your chest.',
            'Extend the other arm straight to the side with the hand on a ball or block.',
            'Lower your chest toward the working hand, keeping the side arm straight.',
            'Press up with the working arm and switch sides after the set.'
          ],
          harder: 'Roll the ball farther away so the straight arm gives less support.',
          easier: 'Bring the support closer or bend the support arm slightly.',
          cues: [
            'Side arm stays locked straight.',
            'Hips level, no twisting.',
            'Control the lowering to avoid dropping onto the working shoulder.'
          ]
        },
        {
          id: 'assisted-one-arm-pushups',
          name: 'Incline One-Arm Pushups',
          type: 'reps',
          perSide: true,
          overview: 'A full-range one-arm pushup with the hand on a raised surface. The incline reduces the load so you can practice the complete movement with good form.',
          primary: ['Chest', 'Triceps'],
          secondary: ['Shoulders', 'Core', 'Obliques'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 6 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Place one hand on a bench or sturdy box.',
            'Walk your feet back and spread them wide.',
            'Put your free hand behind your back.',
            'Lower your chest to the edge of the surface.',
            'Press up without letting your hips rotate, then switch arms.'
          ],
          harder: 'Use a lower surface each week until you reach the floor.',
          easier: 'Use a higher surface such as a counter.',
          cues: [
            'Body forms one straight line.',
            'Push through the whole palm.',
            'Exhale as you press up.'
          ]
        },
        {
          id: 'one-arm-pushups',
          name: 'One-Arm Pushups',
          type: 'reps',
          perSide: true,
          overview: 'A full pushup on the floor using a single arm. It requires serious pressing strength, shoulder stability and full-body tension.',
          primary: ['Chest', 'Triceps'],
          secondary: ['Shoulders', 'Core', 'Obliques'],
          levels: [
            { sets: 1, target: 1 },
            { sets: 2, target: 5 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Start in a pushup position with feet wider than shoulders.',
            'Place one hand under the center of your chest and the other behind your back.',
            'Squeeze your glutes, brace your core and grip the floor.',
            'Lower until your chest is a few centimeters from the floor.',
            'Drive back up to a straight arm and switch sides after the set.'
          ],
          harder: 'Bring your feet closer together or add a pause at the bottom.',
          easier: 'Widen your stance or go back to incline one-arm pushups.',
          cues: [
            'Keep the shoulders square to the floor.',
            'Tension from toes to fingertips.',
            'Slow down rather than lose form.'
          ]
        }
      ]
    },
    {
      id: 'pullups',
      name: 'Pullups',
      premium: false,
      blurb: 'Pulling your body toward a bar or anchor to develop the back, biceps and grip, ending in the one-arm pullup.',
      progressions: [
        {
          id: 'vertical-pulls',
          name: 'Vertical Pulls',
          type: 'reps',
          perSide: false,
          overview: 'Standing and pulling yourself toward a door frame or pole while leaning back slightly. It introduces the pulling motion with minimal load on the joints.',
          primary: ['Lats', 'Upper Back'],
          secondary: ['Biceps', 'Forearms'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Stand facing a sturdy door frame or pole.',
            'Grip it with both hands at chest height.',
            'Lean back until your arms are straight, keeping your feet close to the base.',
            'Pull your chest toward your hands by squeezing your shoulder blades.',
            'Lower back with control.'
          ],
          harder: 'Walk your feet closer to the base so you lean back further.',
          easier: 'Stand more upright to reduce the lean.',
          cues: [
            'Pull your elbows down and back.',
            'Keep your body straight.',
            'Make sure the anchor is solid before you lean.'
          ]
        },
        {
          id: 'horizontal-rows',
          name: 'Horizontal Rows',
          type: 'reps',
          perSide: false,
          overview: 'Hanging under a low bar or sturdy table edge and rowing your chest up to it. It builds the upper back and arms in a supported position.',
          primary: ['Upper Back', 'Lats'],
          secondary: ['Biceps', 'Forearms', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Lie under a bar set around waist height and grip it shoulder-width apart.',
            'Straighten your body with heels on the floor.',
            'Pull your chest to the bar while keeping hips up.',
            'Pause briefly at the top.',
            'Lower until your arms are straight.'
          ],
          harder: 'Lower the bar or raise your feet on a step.',
          easier: 'Bend your knees and plant your feet, or raise the bar.',
          cues: [
            'Squeeze shoulder blades together at the top.',
            'Do not let hips drop.',
            'Keep your chin neutral.'
          ]
        },
        {
          id: 'jackknife-pullups',
          name: 'Jackknife Pullups',
          type: 'reps',
          perSide: false,
          overview: 'A pullup on a high bar with your feet resting on a box in front of you. Your legs help as needed so you can practice the full vertical pull.',
          primary: ['Lats'],
          secondary: ['Biceps', 'Upper Back', 'Forearms'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Place a box or chair in front of a pullup bar.',
            'Grip the bar and rest your heels on the box so your hips bend about 90 degrees.',
            'Pull your chin over the bar, using your legs only as much as needed.',
            'Lower slowly until your arms are straight.',
            'Repeat without bouncing.'
          ],
          harder: 'Push less with your legs or move the box farther away.',
          easier: 'Bend your knees and push more with your feet.',
          cues: [
            'Arms do the work, legs assist.',
            'Lead with your chest.',
            'Control the lowering phase.'
          ]
        },
        {
          id: 'half-pullups',
          name: 'Half Pullups',
          type: 'reps',
          perSide: false,
          overview: 'A pullup through the top half of the range, from bent arms to chin over the bar. It builds strength where pulling is easiest so you can later master the bottom.',
          primary: ['Lats', 'Biceps'],
          secondary: ['Upper Back', 'Forearms'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Hang from the bar with an overhand, shoulder-width grip.',
            'Pull up until your elbows are bent at about 90 degrees to start.',
            'Pull your chin over the bar.',
            'Lower back to 90 degrees, not to a dead hang.',
            'Repeat for the set.'
          ],
          harder: 'Start each rep slightly lower until you reach a full hang.',
          easier: 'Use a step to jump into the top position and focus on slow negatives.',
          cues: [
            'Shoulders down, away from ears.',
            'Avoid kicking or swinging.',
            'Squeeze the bar hard.'
          ]
        },
        {
          id: 'full-pullups',
          name: 'Full Pullups',
          type: 'reps',
          perSide: false,
          overview: 'The classic pullup from a dead hang to chin over the bar. It is one of the best exercises for back width and arm strength.',
          primary: ['Lats', 'Biceps'],
          secondary: ['Upper Back', 'Forearms', 'Core'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 8 },
            { sets: 3, target: 12 }
          ],
          steps: [
            'Hang with straight arms and an overhand grip slightly wider than your shoulders.',
            'Set your shoulders by pulling them slightly down.',
            'Pull until your chin clears the bar.',
            'Lower under control to straight arms.',
            'Reset and repeat.'
          ],
          harder: 'Add a pause at the top or slow the descent to four seconds.',
          easier: 'Do half pullups or jackknife pullups to finish the set.',
          cues: [
            'Drive elbows toward your hips.',
            'Keep legs still and slightly in front.',
            'Full lockout at the bottom of each rep.'
          ]
        },
        {
          id: 'close-pullups',
          name: 'Close Pullups',
          type: 'reps',
          perSide: false,
          overview: 'A pullup with your hands touching or close together. The narrow grip puts more load on the biceps and prepares each arm for uneven work.',
          primary: ['Lats', 'Biceps'],
          secondary: ['Upper Back', 'Forearms'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 8 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Grip the bar with hands touching or a few centimeters apart.',
            'Hang with straight arms and a braced core.',
            'Pull your chest toward your hands.',
            'Get your chin over the bar.',
            'Lower slowly to a full hang.'
          ],
          harder: 'Pause with your chin over the bar for two seconds.',
          easier: 'Widen the grip slightly or limit the range to the top half.',
          cues: [
            'Keep wrists straight.',
            'Elbows travel forward and down.',
            'No swinging.'
          ]
        },
        {
          id: 'uneven-pullups',
          name: 'Uneven Pullups',
          type: 'reps',
          perSide: true,
          overview: 'One hand grips the bar while the other holds a towel or the wrist lower down. The top arm does most of the pulling, building one-arm strength.',
          primary: ['Lats', 'Biceps'],
          secondary: ['Upper Back', 'Forearms', 'Core'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 6 },
            { sets: 3, target: 9 }
          ],
          steps: [
            'Grip the bar with one hand.',
            'Hold a towel looped over the bar with the other hand, about 20-30 cm lower.',
            'Pull up, letting the bar arm do most of the work.',
            'Bring your chin to the bar hand.',
            'Lower slowly and switch sides after the set.'
          ],
          harder: 'Hold the towel lower so that hand helps less.',
          easier: 'Hold the towel higher or grip the bar with both hands close together.',
          cues: [
            'Pull with the top arm, steady with the bottom.',
            'Resist rotating toward the free side.',
            'Keep the core tight.'
          ]
        },
        {
          id: 'half-one-arm-pullups',
          name: 'Half One-Arm Pullups',
          type: 'reps',
          perSide: true,
          overview: 'A one-arm pullup through the top half of the range. It develops the strength and control to finish a full one-arm pull.',
          primary: ['Lats', 'Biceps'],
          secondary: ['Upper Back', 'Forearms', 'Core'],
          levels: [
            { sets: 1, target: 2 },
            { sets: 2, target: 4 },
            { sets: 3, target: 8 }
          ],
          steps: [
            'Grip the bar with one hand, using a step to get into position.',
            'Start with your elbow bent around 90 degrees.',
            'Pull your chin above the bar.',
            'Lower back to 90 degrees under control.',
            'Finish the set and switch arms.'
          ],
          harder: 'Start each rep from a slightly lower position.',
          easier: 'Do slow one-arm negatives from the top instead.',
          cues: [
            'Free hand stays off the working arm.',
            'Keep the shoulder engaged, never fully relaxed.',
            'Stop the set if the elbow or shoulder feels sharp pain.'
          ]
        },
        {
          id: 'one-arm-pullups',
          name: 'One-Arm Pullups',
          type: 'reps',
          perSide: true,
          overview: 'A full pullup from a dead hang using only one arm. It is an elite feat of pulling strength and body control.',
          primary: ['Lats', 'Biceps'],
          secondary: ['Upper Back', 'Forearms', 'Core'],
          levels: [
            { sets: 1, target: 1 },
            { sets: 2, target: 3 },
            { sets: 3, target: 6 }
          ],
          steps: [
            'Hang from the bar with one hand and an active shoulder.',
            'Brace your core and squeeze your glutes to stop swinging.',
            'Pull hard, turning slightly toward the working arm.',
            'Bring your chin over the bar.',
            'Lower slowly to a full hang and switch arms after the set.'
          ],
          harder: 'Add a pause at the top or slow the lowering to five seconds.',
          easier: 'Return to uneven or half one-arm pullups.',
          cues: [
            'Engage the shoulder before you pull.',
            'Stay compact and tight.',
            'Quality over quantity.'
          ]
        }
      ]
    },
    {
      id: 'squats',
      name: 'Squats',
      premium: false,
      blurb: 'Bending and straightening the legs under bodyweight to build strong, mobile hips and knees, ending in the pistol squat.',
      progressions: [
        {
          id: 'jackknife-squats',
          name: 'Jackknife Squats',
          type: 'reps',
          perSide: false,
          overview: 'A squat with your hands resting on a chair or bench in front of you for support. The arms take some load so you can learn the full squat pattern safely.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Shoulders'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Stand in front of a sturdy chair or bench about knee height.',
            'Bend forward and place your hands on it.',
            'Bend your knees and hips to lower your body.',
            'Go as low as comfortable, using your arms for support.',
            'Push through your heels and arms to stand back up.'
          ],
          harder: 'Push less with your arms and more with your legs.',
          easier: 'Use a higher support or reduce the depth.',
          cues: [
            'Knees track over your toes.',
            'Keep heels on the floor.',
            'Move slowly and smoothly.'
          ]
        },
        {
          id: 'supported-squats',
          name: 'Supported Squats',
          type: 'reps',
          perSide: false,
          overview: 'A deep squat while holding onto a door frame, pole or railing. The support helps balance so you can practice reaching full depth.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Calves'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Stand facing a sturdy support and hold it lightly at chest height.',
            'Set feet shoulder-width apart with toes slightly out.',
            'Sit your hips back and down, sliding your hands down if needed.',
            'Lower until your hamstrings touch your calves.',
            'Stand up, using your hands only as much as necessary.'
          ],
          harder: 'Use just your fingertips on the support.',
          easier: 'Limit the depth or pull more with your arms.',
          cues: [
            'Chest stays up.',
            'Weight in the middle of the foot.',
            'Do not let your knees cave inward.'
          ]
        },
        {
          id: 'half-squats',
          name: 'Half Squats',
          type: 'reps',
          perSide: false,
          overview: 'A free-standing squat to about thigh-parallel depth. It builds leg strength in the upper range and balance without support.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 25 },
            { sets: 3, target: 50 }
          ],
          steps: [
            'Stand with feet shoulder-width apart and arms out in front for balance.',
            'Push your hips back and bend your knees.',
            'Stop when your thighs are near parallel to the floor.',
            'Drive through your feet to stand tall.',
            'Squeeze your glutes at the top.'
          ],
          harder: 'Go slightly deeper or add a two-second pause at the bottom.',
          easier: 'Squat to a chair and tap it lightly before standing.',
          cues: [
            'Keep your back neutral.',
            'Knees follow the line of your toes.',
            'Spread the floor with your feet.'
          ]
        },
        {
          id: 'full-squats',
          name: 'Full Squats',
          type: 'reps',
          perSide: false,
          overview: 'A deep bodyweight squat where your hips drop below your knees. It develops strength and mobility through the full range of the hips, knees and ankles.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Calves', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Stand with feet shoulder-width apart, toes turned out slightly.',
            'Reach your arms forward for balance.',
            'Sit down between your heels as low as you can control.',
            'Keep your chest up and heels down at the bottom.',
            'Stand up by driving through the whole foot.'
          ],
          harder: 'Slow the descent to four seconds or hold the bottom for two seconds.',
          easier: 'Return to supported squats or limit depth.',
          cues: [
            'Heels stay planted.',
            'Knees push outward over toes.',
            'Brace the stomach before each rep.'
          ]
        },
        {
          id: 'close-squats',
          name: 'Close Squats',
          type: 'reps',
          perSide: false,
          overview: 'A full squat with your feet together. The narrow stance demands more balance, ankle mobility and quad strength.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Calves', 'Core', 'Adductors'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Stand with feet touching or just a few centimeters apart.',
            'Extend your arms forward.',
            'Bend your knees and lower as deep as you can while staying balanced.',
            'Keep your heels on the floor.',
            'Press up to standing.'
          ],
          harder: 'Add a pause at the bottom.',
          easier: 'Place a small wedge under your heels or hold a support.',
          cues: [
            'Knees stay together and track forward.',
            'Lean your torso slightly forward for balance.',
            'Move with control.'
          ]
        },
        {
          id: 'uneven-squats',
          name: 'Uneven Squats',
          type: 'reps',
          perSide: true,
          overview: 'A squat with one foot on the floor and the other resting on a ball or low object. The floor leg carries most of the load in preparation for single-leg squats.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Adductors', 'Core'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Stand with one foot flat on the floor.',
            'Place the other foot on a ball or block slightly to the side.',
            'Squat down, putting most of your weight on the floor leg.',
            'Lower until the floor-side thigh is below parallel.',
            'Stand back up and switch sides after the set.'
          ],
          harder: 'Use a rolling ball so the assisting leg cannot push much.',
          easier: 'Use a stable block and press with both legs more evenly.',
          cues: [
            'Floor knee tracks over the toes.',
            'Hips stay level.',
            'Let the raised leg only steady you.'
          ]
        },
        {
          id: 'half-one-leg-squats',
          name: 'Half One-Leg Squats',
          type: 'reps',
          perSide: true,
          overview: 'A single-leg squat to roughly thigh-parallel with the free leg held forward. It builds single-leg strength and balance through the upper range.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Core', 'Hip Flexors'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Stand on one leg with the other leg raised slightly in front.',
            'Extend your arms forward for balance.',
            'Bend the standing knee and sit your hips back.',
            'Stop when the thigh is about parallel to the floor.',
            'Drive back up and switch legs after the set.'
          ],
          harder: 'Go a little deeper each week.',
          easier: 'Squat onto a high box or hold a support lightly.',
          cues: [
            'Knee stays in line with the second toe.',
            'Keep the whole foot rooted.',
            'Lift the free leg from the hip.'
          ]
        },
        {
          id: 'assisted-one-leg-squats',
          name: 'Assisted One-Leg Squats',
          type: 'reps',
          perSide: true,
          overview: 'A full-depth single-leg squat while holding a support for balance and help. It lets you practice the bottom of the pistol safely.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Hip Flexors', 'Core'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 8 },
            { sets: 3, target: 12 }
          ],
          steps: [
            'Stand on one leg next to a pole or door frame and hold it.',
            'Extend the free leg straight in front.',
            'Lower all the way down, keeping the heel flat.',
            'Use your hand to help only where you are weakest.',
            'Stand up and switch legs after the set.'
          ],
          harder: 'Hold the support with just two fingers.',
          easier: 'Pull more with your arm or squat onto a low box.',
          cues: [
            'Free leg stays off the floor.',
            'Control the bottom; do not drop.',
            'Torso leans forward to counterbalance.'
          ]
        },
        {
          id: 'pistol-squats',
          name: 'Pistol Squats',
          type: 'reps',
          perSide: true,
          overview: 'A full single-leg squat with the other leg held straight out in front. It demands strength, balance and mobility in equal measure.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Hip Flexors', 'Core', 'Calves'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 6 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Stand on one leg with the other leg straight in front.',
            'Reach your arms forward.',
            'Lower slowly until your hamstring rests on your calf.',
            'Keep your heel down and the free leg off the floor.',
            'Drive up to standing and switch legs after the set.'
          ],
          harder: 'Pause at the bottom for three seconds or hold a light weight in front.',
          easier: 'Hold a small weight forward as a counterbalance, or return to assisted one-leg squats.',
          cues: [
            'Stay tall through the chest.',
            'Knee follows the toes.',
            'Smooth, no bouncing out of the bottom.'
          ]
        }
      ]
    },
    {
      id: 'leg-raises',
      name: 'Leg Raises',
      premium: false,
      blurb: 'Lifting the legs toward the torso to build a strong core and hip flexors, ending in hanging straight-leg raises.',
      progressions: [
        {
          id: 'knee-tucks',
          name: 'Seated Knee Tucks',
          type: 'reps',
          perSide: false,
          overview: 'Sitting on the edge of a chair or bench and drawing your knees toward your chest. It gently wakes up the lower abs and hip flexors.',
          primary: ['Core'],
          secondary: ['Hip Flexors'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 25 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Sit on the edge of a bench and grip the sides behind your hips.',
            'Lean back slightly and lift your feet off the floor.',
            'Extend your legs forward.',
            'Pull your knees toward your chest.',
            'Extend again without touching your feet down.'
          ],
          harder: 'Lean back further and extend your legs straighter.',
          easier: 'Tap your feet on the floor between reps.',
          cues: [
            'Keep your back long, not slumped.',
            'Exhale as you tuck.',
            'Move slowly.'
          ]
        },
        {
          id: 'flat-knee-raises',
          name: 'Flat Knee Raises',
          type: 'reps',
          perSide: false,
          overview: 'Lying on your back and lifting bent knees toward your chest. It trains the abs to control the pelvis.',
          primary: ['Core'],
          secondary: ['Hip Flexors'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 25 },
            { sets: 3, target: 35 }
          ],
          steps: [
            'Lie on your back with hands flat beside your hips.',
            'Bend your knees with feet just off the floor.',
            'Draw your knees toward your chest.',
            'Lift your hips slightly off the floor at the top.',
            'Lower your feet back to just above the floor.'
          ],
          harder: 'Pause with your hips raised for one second.',
          easier: 'Rest your feet on the floor between reps.',
          cues: [
            'Press your lower back into the floor.',
            'Do not swing.',
            'Breathe out on the lift.'
          ]
        },
        {
          id: 'bent-leg-raises',
          name: 'Flat Bent Leg Raises',
          type: 'reps',
          perSide: false,
          overview: 'Lying flat and raising legs that are only slightly bent. The longer lever makes the abs work harder than knee raises.',
          primary: ['Core'],
          secondary: ['Hip Flexors'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Lie on your back with arms by your sides.',
            'Bend your knees about 45 degrees.',
            'Raise your legs until your thighs are vertical.',
            'Lower slowly until your heels hover above the floor.',
            'Repeat without resting the feet.'
          ],
          harder: 'Straighten your legs a little more.',
          easier: 'Bend the knees more.',
          cues: [
            'Lower back stays flat.',
            'Keep the knee angle constant.',
            'Control the lowering.'
          ]
        },
        {
          id: 'frog-raises',
          name: 'Flat Frog Raises',
          type: 'reps',
          perSide: false,
          overview: 'Bent knees on the way up and straight legs on the way down. The straight-leg lowering builds eccentric strength for full leg raises.',
          primary: ['Core'],
          secondary: ['Hip Flexors'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Lie on your back with hands under or beside your hips.',
            'Tuck your knees toward your chest.',
            'Straighten your legs to point at the ceiling.',
            'Lower your straight legs slowly toward the floor.',
            'Stop just above the floor and tuck again.'
          ],
          harder: 'Lower over four seconds.',
          easier: 'Keep a slight bend in the knees on the way down.',
          cues: [
            'Back stays glued to the floor.',
            'Point your toes.',
            'Slow down where it gets hardest.'
          ]
        },
        {
          id: 'straight-flat-leg-raises',
          name: 'Flat Straight Leg Raises',
          type: 'reps',
          perSide: false,
          overview: 'Lying on your back and raising fully straight legs to vertical. It builds strong abs and hip flexors through a long lever.',
          primary: ['Core', 'Hip Flexors'],
          secondary: ['Obliques'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Lie on your back with legs straight and together.',
            'Place your hands beside your hips.',
            'Raise your legs until they point at the ceiling.',
            'Lower them slowly until your heels hover just off the floor.',
            'Repeat without resting.'
          ],
          harder: 'Lift your hips off the floor at the top of each rep.',
          easier: 'Bend the knees slightly or limit the lowering range.',
          cues: [
            'Knees locked.',
            'Lower back pressed down.',
            'Exhale on the way up.'
          ]
        },
        {
          id: 'hanging-knee-raises',
          name: 'Hanging Knee Raises',
          type: 'reps',
          perSide: false,
          overview: 'Hanging from a bar and lifting your knees to your chest. It adds grip and shoulder work to core training.',
          primary: ['Core', 'Hip Flexors'],
          secondary: ['Forearms', 'Lats'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Hang from a bar with an overhand grip.',
            'Engage your shoulders to avoid a slack hang.',
            'Lift your knees toward your chest.',
            'Curl your pelvis up slightly at the top.',
            'Lower slowly without swinging.'
          ],
          harder: 'Raise your knees higher, toward your elbows.',
          easier: 'Do fewer reps or keep the range smaller.',
          cues: [
            'Stop the swing before each rep.',
            'Roll the pelvis up, not just the knees.',
            'Keep shoulders active.'
          ]
        },
        {
          id: 'hanging-bent-leg-raises',
          name: 'Hanging Bent Leg Raises',
          type: 'reps',
          perSide: false,
          overview: 'Hanging from a bar and raising slightly bent legs to hip height or higher. The longer lever increases the demand on the core.',
          primary: ['Core', 'Hip Flexors'],
          secondary: ['Forearms', 'Lats', 'Obliques'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 12 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Hang from a bar with straight arms.',
            'Bend your knees about 45 degrees.',
            'Lift your legs until your thighs are above hip height.',
            'Hold briefly at the top.',
            'Lower under control.'
          ],
          harder: 'Straighten your legs more each week.',
          easier: 'Bend your knees further.',
          cues: [
            'No momentum.',
            'Keep knee angle fixed.',
            'Grip firmly.'
          ]
        },
        {
          id: 'hanging-straight-leg-raises',
          name: 'Hanging Straight Leg Raises',
          type: 'reps',
          perSide: false,
          overview: 'Hanging from a bar and raising locked legs up to hip height or higher. It is a demanding test of core strength and control.',
          primary: ['Core', 'Hip Flexors'],
          secondary: ['Forearms', 'Lats', 'Obliques'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Hang from a bar with legs straight and together.',
            'Brace your core and still your body.',
            'Raise your straight legs until your feet reach at least hip height.',
            'Pause briefly.',
            'Lower slowly to a dead stop.'
          ],
          harder: 'Raise your toes all the way to the bar.',
          easier: 'Go back to bent-leg raises for later reps.',
          cues: [
            'Knees locked throughout.',
            'Control both directions.',
            'Point the toes.'
          ]
        }
      ]
    },
    {
      id: 'bridges',
      name: 'Bridges',
      premium: false,
      blurb: 'Arching the body backward to build a strong, mobile spine and hips, ending in standing up out of a bridge without a wall.',
      progressions: [
        {
          id: 'glute-bridges',
          name: 'Glute Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Lying on your back with knees bent and lifting your hips. It wakes up the glutes and starts conditioning the lower back.',
          primary: ['Glutes'],
          secondary: ['Hamstrings', 'Lower Back'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 25 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Lie on your back with knees bent and feet flat, hip-width apart.',
            'Rest your arms by your sides.',
            'Drive through your heels to lift your hips.',
            'Stop when your body is straight from knees to shoulders.',
            'Lower slowly.'
          ],
          harder: 'Pause at the top or do them on one leg.',
          easier: 'Reduce the height of the lift.',
          cues: [
            'Squeeze the glutes at the top.',
            'Avoid overarching the lower back.',
            'Push through the heels.'
          ]
        },
        {
          id: 'straight-bridges',
          name: 'Straight Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Sitting with straight legs and pushing your hips up into a reverse plank. It strengthens the back chain and opens the shoulders.',
          primary: ['Glutes', 'Hamstrings'],
          secondary: ['Lower Back', 'Shoulders', 'Triceps'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 35 }
          ],
          steps: [
            'Sit with legs straight and hands on the floor beside your hips, fingers pointing toward your feet.',
            'Press through your hands and heels.',
            'Lift your hips until your body is straight.',
            'Let your head tilt back gently.',
            'Lower back to sitting.'
          ],
          harder: 'Hold the top for three seconds.',
          easier: 'Bend your knees slightly.',
          cues: [
            'Push your chest toward the sky.',
            'Lock your elbows.',
            'Keep feet flat as you rise.'
          ]
        },
        {
          id: 'angled-bridges',
          name: 'Angled Bridges',
          type: 'reps',
          perSide: false,
          overview: 'A bridge with your hands placed on a raised surface like a bed or bench. The incline lets you practice the arch with less flexibility and strength.',
          primary: ['Lower Back', 'Glutes'],
          secondary: ['Shoulders', 'Hamstrings', 'Triceps'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Sit on the floor with your back to a sturdy bench or couch.',
            'Reach back and place your hands on its edge.',
            'Plant your feet with knees bent.',
            'Push up through hands and feet to arch your hips upward.',
            'Lower slowly to the floor.'
          ],
          harder: 'Use a lower surface.',
          easier: 'Use a higher surface.',
          cues: [
            'Push hips high.',
            'Straighten your arms fully.',
            'Move gently; never force the arch.'
          ]
        },
        {
          id: 'wall-bridges',
          name: 'Wall Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Standing a step from a wall and arching back until your hands reach it. The wall holds most of your weight while your spine and shoulders learn to open overhead.',
          primary: ['Lower Back', 'Shoulders'],
          secondary: ['Glutes', 'Hip Flexors', 'Upper Back'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 12 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Stand with your back to a wall, about one step away, feet hip-width apart.',
            'Raise your arms overhead and squeeze your glutes.',
            'Arch back slowly and place your palms flat on the wall, fingers pointing down.',
            'Press into the wall to lift your chest, then push back up to standing.',
            'Return to standing with control.'
          ],
          harder: 'Stand a little farther from the wall.',
          easier: 'Stand closer to the wall.',
          cues: [
            'Push your hips forward as you arch.',
            'Look back at the wall before you reach it.',
            'Keep the movement slow; never drop into it.'
          ]
        },
        {
          id: 'incline-bridges',
          name: 'Incline Bridges',
          type: 'reps',
          perSide: false,
          overview: 'A deeper backbend with your hands on a low step, about shin height: lower than the bench used for angled bridges. It takes some load off the shoulders while you practise a nearly full arch.',
          primary: ['Lower Back', 'Glutes', 'Shoulders'],
          secondary: ['Triceps', 'Hamstrings', 'Upper Back'],
          levels: [
            { sets: 1, target: 6 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Lie on your back with your head near a sturdy low step, about shin height, knees bent and feet flat.',
            'Reach back and place your hands on the edge of the step, fingers pointing toward your shoulders.',
            'Press through hands and feet to lift your hips and chest into an arch.',
            'Straighten your arms as far as is comfortable.',
            'Lower slowly onto your back.'
          ],
          harder: 'Use an even lower step, or a thick book.',
          easier: 'Go back to a bench-height surface (angled bridges).',
          cues: [
            'Push your chest toward the wall behind you.',
            'Keep your feet flat and knees pointing forward.',
            'Breathe out as you press up.'
          ]
        },
        {
          id: 'head-bridges',
          name: 'Head Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Lying on your back and pushing up so the crown of your head rests lightly on the floor in an arch. It builds the pushing strength needed for full bridges.',
          primary: ['Lower Back', 'Glutes'],
          secondary: ['Shoulders', 'Triceps', 'Quads'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Lie on your back with knees bent and feet flat.',
            'Place your hands by your ears, fingers pointing toward your shoulders.',
            'Press your hips up and roll onto the top of your head.',
            'Hold the arch with most weight on hands and feet.',
            'Lower slowly onto your back.'
          ],
          harder: 'Pause in the top position.',
          easier: 'Lift only your hips and keep your head on the floor.',
          cues: [
            'Keep weight off the neck; it only touches lightly.',
            'Elbows point upward.',
            'Stop if you feel any neck discomfort.'
          ]
        },
        {
          id: 'half-bridges',
          name: 'Half Bridges',
          type: 'reps',
          perSide: false,
          overview: 'A bridge pushed halfway up from the floor using a support under your back. It strengthens the arch before attempting the full range.',
          primary: ['Lower Back', 'Glutes'],
          secondary: ['Shoulders', 'Triceps', 'Hamstrings'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 15 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Lie with a firm cushion or foam roller under your mid-back.',
            'Plant your feet and place your hands beside your head.',
            'Push through hands and feet to lift off the support.',
            'Rise to roughly half the full bridge height.',
            'Lower back onto the support.'
          ],
          harder: 'Remove the support or push higher.',
          easier: 'Use a taller support.',
          cues: [
            'Press evenly through both hands.',
            'Knees point forward.',
            'Breathe steadily.'
          ]
        },
        {
          id: 'full-bridges',
          name: 'Full Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Pushing from your back into a full arch on hands and feet. It builds spinal strength, shoulder mobility and hip extension together.',
          primary: ['Lower Back', 'Glutes'],
          secondary: ['Shoulders', 'Triceps', 'Hamstrings', 'Quads'],
          levels: [
            { sets: 1, target: 6 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Lie on your back with knees bent and feet close to your hips.',
            'Place your hands by your ears, fingers toward your feet.',
            'Push hips up and press your arms straight.',
            'Shift your shoulders over your hands to open the arch.',
            'Lower slowly, bending the arms first.'
          ],
          harder: 'Bring your hands and feet closer together.',
          easier: 'Return to half bridges.',
          cues: [
            'Arms fully straight at the top.',
            'Look at the floor between your hands.',
            'Lower with control, not a collapse.'
          ]
        },
        {
          id: 'wheel-bridges',
          name: 'Wheel Bridges',
          type: 'hold',
          perSide: false,
          overview: 'A deeper full bridge held with straight arms and legs, shoulders pushed over the hands. It builds end-range strength and open shoulders.',
          primary: ['Lower Back', 'Shoulders'],
          secondary: ['Glutes', 'Triceps', 'Quads', 'Upper Back'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Press up into a full bridge.',
            'Straighten your arms completely.',
            'Shift your shoulders toward and over your hands.',
            'Push your knees toward straight while keeping your feet flat.',
            'Hold, then lower slowly onto your back.'
          ],
          harder: 'Walk your hands and feet closer together.',
          easier: 'Hold a regular full bridge instead.',
          cues: [
            'Lock your elbows.',
            'Shoulders over the wrists.',
            'Keep breathing; do not hold your breath.'
          ]
        },
        {
          id: 'tap-bridges',
          name: 'Tap Bridges',
          type: 'reps',
          perSide: false,
          overview: 'From a full bridge, lowering under control until the top of your head taps the floor, then pressing back up. It teaches control on the way down, needed for wall walking.',
          primary: ['Lower Back', 'Shoulders', 'Triceps'],
          secondary: ['Glutes', 'Quads', 'Upper Back'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Press up into a full bridge with straight arms.',
            'Bend your elbows slowly and lower toward the floor.',
            'Lightly tap the top of your head on the floor without resting weight on it.',
            'Press straight back up to the top.',
            'Repeat, then lower onto your back.'
          ],
          harder: 'Pause for two seconds just above the floor.',
          easier: 'Lower only halfway.',
          cues: [
            'The head only touches lightly.',
            'Lower slowly, press up strongly.',
            'Keep elbows pointing up, not out.'
          ]
        },
        {
          id: 'wall-walking-bridges',
          name: 'Wall Walking Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Standing with your back to a wall, walking your hands down it into a bridge and back up. It builds strength and confidence for standing backbends.',
          primary: ['Lower Back', 'Glutes'],
          secondary: ['Shoulders', 'Triceps', 'Quads', 'Hip Flexors'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 6 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Stand about an arm\'s length from a wall, facing away.',
            'Reach overhead and back until your hands touch the wall.',
            'Walk your hands down the wall step by step.',
            'Place your hands on the floor in a full bridge.',
            'Walk your hands back up the wall to standing.'
          ],
          harder: 'Stand farther from the wall.',
          easier: 'Walk only partway down and back up.',
          cues: [
            'Push hips forward as you arch.',
            'Keep your feet planted.',
            'Move slowly and stay in control.'
          ]
        },
        {
          id: 'stand-to-stand-bridges',
          name: 'Stand to Stand Bridges',
          type: 'reps',
          perSide: false,
          overview: 'Dropping back from standing into a bridge and coming back up to standing, without a wall. The final bridge skill: strength, flexibility and control together.',
          primary: ['Lower Back', 'Glutes', 'Quads'],
          secondary: ['Shoulders', 'Hip Flexors', 'Core', 'Upper Back'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 5 },
            { sets: 3, target: 8 }
          ],
          steps: [
            'Stand with feet a little wider than hip-width, arms overhead.',
            'Push your hips forward and arch back slowly, looking for the floor.',
            'Land softly on your hands in a bridge.',
            'Rock your weight toward your feet and push off your hands.',
            'Drive your hips forward to come back up to standing.'
          ],
          harder: 'Keep your arms crossed until the last moment before landing.',
          easier: 'Go down a wall and stand up without it, or have a spotter.',
          cues: [
            'Hips forward first, then arch.',
            'Land on the hands softly with bent elbows.',
            'Practise over a soft surface at first.'
          ]
        }
      ]
    },
    {
      id: 'twists',
      name: 'Twists',
      premium: false,
      blurb: 'Rotational holds that improve spinal mobility and build strength through the trunk and shoulders.',
      progressions: [
        {
          id: 'straight-leg-twists',
          name: 'Straight-Leg Twists',
          type: 'hold',
          perSide: true,
          overview: 'A seated twist with one leg straight and the other crossed over it. It gently mobilizes the spine and stretches the hips.',
          primary: ['Obliques'],
          secondary: ['Lower Back', 'Glutes', 'Shoulders'],
          levels: [
            { sets: 1, target: 15 },
            { sets: 2, target: 30 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Sit tall with both legs straight in front of you.',
            'Cross one foot over the opposite knee and plant it.',
            'Place your hand behind you for support.',
            'Hook the opposite elbow outside the raised knee.',
            'Twist gently toward the raised knee and hold, then switch sides.'
          ],
          harder: 'Reach your arm around the knee to grab the straight leg.',
          easier: 'Hug the knee instead of hooking the elbow.',
          cues: [
            'Grow tall before you twist.',
            'Breathe slowly.',
            'Never force the rotation.'
          ]
        },
        {
          id: 'bent-leg-twists',
          name: 'Bent-Leg Twists',
          type: 'hold',
          perSide: true,
          overview: 'A deeper seated twist with both legs bent and crossed. It increases rotation through the spine and opens the hips and shoulders.',
          primary: ['Obliques'],
          secondary: ['Lower Back', 'Glutes', 'Shoulders'],
          levels: [
            { sets: 1, target: 15 },
            { sets: 2, target: 30 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Sit and fold one leg so the heel rests beside the opposite hip.',
            'Cross the other foot over the bent knee and plant it.',
            'Place one hand behind you.',
            'Hook the other elbow outside the upright knee.',
            'Twist and hold, then switch sides.'
          ],
          harder: 'Wrap your arm around the knee and clasp your hands behind your back.',
          easier: 'Sit on a folded blanket to raise your hips.',
          cues: [
            'Keep both sit bones on the floor.',
            'Rotate from the middle back.',
            'Relax your shoulders.'
          ]
        },
        {
          id: 'full-twists',
          name: 'Full Twists',
          type: 'hold',
          perSide: true,
          overview: 'From a bridge-like position, rotating onto one hand to open the body toward the side. It combines spinal rotation, shoulder strength and hip mobility.',
          primary: ['Obliques', 'Shoulders'],
          secondary: ['Lower Back', 'Glutes', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Kneel and sit back onto your heels.',
            'Place one hand on the floor behind you.',
            'Push your hips up and forward off your heels.',
            'Reach your free arm overhead and rotate your chest toward the ceiling.',
            'Hold, return slowly and switch sides.'
          ],
          harder: 'Start from a seated position with legs straight and rise higher.',
          easier: 'Keep your hips lower and hold for less time.',
          cues: [
            'Supporting arm stays straight.',
            'Drive hips toward the ceiling.',
            'Look up past your reaching hand.'
          ]
        }
      ]
    },
    {
      id: 'grip',
      name: 'Grip',
      premium: false,
      blurb: 'Hanging holds that build crushing grip, strong forearms and resilient shoulders.',
      progressions: [
        {
          id: 'lean-hangs',
          name: 'Lean Hangs',
          type: 'hold',
          perSide: false,
          overview: 'Holding a low bar or sturdy edge while leaning back with feet on the floor. It introduces hanging with most of your weight still supported.',
          primary: ['Forearms'],
          secondary: ['Upper Back', 'Biceps'],
          levels: [
            { sets: 1, target: 15 },
            { sets: 2, target: 30 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Grip a waist-high bar with both hands.',
            'Walk your feet forward and lean back until your arms are straight.',
            'Keep your body straight and heels on the floor.',
            'Hold the position.',
            'Stand up to release.'
          ],
          harder: 'Walk your feet farther forward to lean back more.',
          easier: 'Stand more upright.',
          cues: [
            'Squeeze the bar hard.',
            'Keep shoulders set back.',
            'Breathe normally.'
          ]
        },
        {
          id: 'assisted-bar-hangs',
          name: 'Assisted Bar Hangs',
          type: 'hold',
          perSide: false,
          overview: 'Hanging from an overhead bar with your feet lightly touching a box or the floor. It conditions the hands and shoulders for full hangs.',
          primary: ['Forearms'],
          secondary: ['Lats', 'Shoulders'],
          levels: [
            { sets: 1, target: 15 },
            { sets: 2, target: 30 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Stand on a box under a pullup bar.',
            'Grip the bar shoulder-width apart.',
            'Bend your knees to let your arms take most of your weight.',
            'Keep toes lightly on the box for support.',
            'Hold, then stand up to release.'
          ],
          harder: 'Put less weight through your feet.',
          easier: 'Put more weight through your feet.',
          cues: [
            'Full hand wrapped around the bar.',
            'Shoulders slightly engaged.',
            'Relax your neck.'
          ]
        },
        {
          id: 'bar-hangs',
          name: 'Bar Hangs',
          type: 'hold',
          perSide: false,
          overview: 'Hanging freely from a bar with straight arms. It builds grip endurance and decompresses the spine.',
          primary: ['Forearms'],
          secondary: ['Lats', 'Shoulders', 'Upper Back'],
          levels: [
            { sets: 1, target: 20 },
            { sets: 2, target: 40 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Grip the bar overhand, about shoulder width.',
            'Lift your feet off the floor.',
            'Draw your shoulders slightly down from your ears.',
            'Keep your body still.',
            'Hold for the target time and step down.'
          ],
          harder: 'Use a thicker bar or wrap a towel around it.',
          easier: 'Use the assisted version with feet on a box.',
          cues: [
            'Crush the bar.',
            'Avoid swinging.',
            'Drop down safely; do not fall.'
          ]
        },
        {
          id: 'assisted-towel-hangs',
          name: 'Assisted Towel Hangs',
          type: 'hold',
          perSide: true,
          overview: 'Hanging with one hand on the bar and the other on a towel looped over it. One hand gets the harder towel grip while the bar hand helps.',
          primary: ['Forearms'],
          secondary: ['Biceps', 'Lats', 'Upper Back'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Loop a strong towel over a pullup bar.',
            'Grip the towel with one hand and the bar with the other.',
            'Lift your feet off the floor.',
            'Keep both arms straight and shoulders engaged.',
            'Hold, step down and switch hands.'
          ],
          harder: 'Hold the bar with only three fingers.',
          easier: 'Keep your toes lightly on a box.',
          cues: [
            'Check the towel for wear first.',
            'Squeeze the towel with the whole hand.',
            'Stay still; do not swing.'
          ]
        },
        {
          id: 'towel-hangs',
          name: 'Towel Hangs',
          type: 'hold',
          perSide: false,
          overview: 'Hanging from two towels looped over a bar. The thick, vertical grip demands much more from the hands and forearms.',
          primary: ['Forearms'],
          secondary: ['Biceps', 'Lats', 'Upper Back'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Loop two strong towels over a pullup bar, shoulder-width apart.',
            'Grip one towel in each hand.',
            'Lift your feet off the floor.',
            'Keep your arms straight and shoulders engaged.',
            'Hold, then lower your feet to release.'
          ],
          harder: 'Hang from a single towel with both hands.',
          easier: 'Hold the bar with one hand and a towel with the other.',
          cues: [
            'Check the towels for wear first.',
            'Squeeze with the whole hand.',
            'Stay still.'
          ]
        },
        {
          id: 'rope-style-hangs',
          name: 'Rope Style Hangs',
          type: 'hold',
          perSide: false,
          overview: 'Hanging from a single towel or rope with both hands stacked one above the other, like climbing a rope. Both hands share one thick vertical grip.',
          primary: ['Forearms'],
          secondary: ['Biceps', 'Lats', 'Shoulders'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Loop one strong towel over the bar, or use a climbing rope.',
            'Grip it with both hands, one above the other.',
            'Lift your feet off the floor.',
            'Keep your arms slightly bent and shoulders engaged.',
            'Hold, then lower your feet to release.'
          ],
          harder: 'Hold for longer or wear a light backpack.',
          easier: 'Hold the towel with one hand and the bar with the other.',
          cues: [
            'Thumbs wrap around the towel.',
            'Swap which hand is on top each set.',
            'Stay compact and still.'
          ]
        },
        {
          id: 'assisted-one-arm-hangs',
          name: 'Assisted One-Arm Hangs',
          type: 'hold',
          perSide: true,
          overview: 'Hanging mostly from one hand while the other hand or fingertips help. It eases the shoulder and grip into single-arm loading.',
          primary: ['Forearms'],
          secondary: ['Lats', 'Shoulders', 'Biceps'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Grip the bar firmly with one hand.',
            'Hold the bar or a towel with only two fingers of the other hand.',
            'Lift your feet and hang.',
            'Keep the working shoulder engaged.',
            'Hold, step down and switch hands.'
          ],
          harder: 'Use just one finger for assistance.',
          easier: 'Keep your feet lightly on a box.',
          cues: [
            'Never hang slack on one arm.',
            'Stay compact.',
            'Release before the grip fails completely.'
          ]
        },
        {
          id: 'one-arm-hangs',
          name: 'One-Arm Hangs',
          type: 'hold',
          perSide: true,
          overview: 'Hanging from a bar with a single hand. It develops serious grip strength and shoulder stability.',
          primary: ['Forearms'],
          secondary: ['Lats', 'Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Step up to the bar and grip it with one hand.',
            'Engage your shoulder by pulling it slightly down.',
            'Lift your feet and hang still.',
            'Use your core to limit spinning.',
            'Hold, step down and switch hands.'
          ],
          harder: 'Hang from a towel with one hand.',
          easier: 'Return to assisted one-arm hangs.',
          cues: [
            'Shoulder stays active.',
            'Brace the trunk.',
            'Land softly when you let go.'
          ]
        },
        {
          id: 'one-arm-towel-hangs',
          name: 'One-Arm Towel Hangs',
          type: 'hold',
          perSide: true,
          overview: 'Hanging from a single towel with one hand. The hardest grip hold here: the whole body hangs from one thick, vertical grip.',
          primary: ['Forearms'],
          secondary: ['Lats', 'Shoulders', 'Biceps', 'Core'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Loop a strong towel over a pullup bar.',
            'Grip the towel high with one hand.',
            'Lift your feet and hang, keeping the shoulder engaged.',
            'Keep your free hand close in case you need it.',
            'Hold, step down and switch hands.'
          ],
          harder: 'Hold lower on the towel so it can swing.',
          easier: 'Touch the towel lightly with two fingers of the other hand.',
          cues: [
            'Never hang with a slack shoulder.',
            'Release before the grip fails completely.',
            'Use a towel you trust.'
          ]
        }
      ]
    },
    {
      id: 'lunges',
      name: 'Lunges',
      premium: true,
      blurb: 'Split-stance leg work that builds single-leg strength, balance and hip stability.',
      progressions: [
        {
          id: 'split-squats',
          name: 'Split Squats',
          type: 'reps',
          perSide: true,
          overview: 'A stationary lunge with one foot forward and one back. It builds leg strength and balance without stepping.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Adductors'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Stand with one foot a long step in front of the other.',
            'Rise onto the ball of the back foot.',
            'Lower straight down until the back knee nearly touches the floor.',
            'Push through the front heel to rise.',
            'Finish the set and switch legs.'
          ],
          harder: 'Slow the descent or add a pause at the bottom.',
          easier: 'Hold a wall for balance and shorten the depth.',
          cues: [
            'Torso stays upright.',
            'Front knee tracks over the toes.',
            'Move straight up and down.'
          ]
        },
        {
          id: 'reverse-lunges',
          name: 'Reverse Lunges',
          type: 'reps',
          perSide: true,
          overview: 'Stepping backward into a lunge and returning to standing. It is easier on the knees than forward lunges and trains balance in motion.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Stand tall with feet hip-width apart.',
            'Step one foot back a long stride.',
            'Lower until both knees bend about 90 degrees.',
            'Drive through the front foot to return to standing.',
            'Complete the set and switch legs.'
          ],
          harder: 'Step back onto a low step from a raised platform for more depth.',
          easier: 'Shorten the step and lower less.',
          cues: [
            'Weight stays on the front heel.',
            'Keep hips square.',
            'Control the touch-down.'
          ]
        },
        {
          id: 'walking-lunges',
          name: 'Walking Lunges',
          type: 'reps',
          perSide: true,
          overview: 'Lunging forward with alternating legs as you travel. It adds coordination and endurance to single-leg strength.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Calves', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Stand at one end of a clear space.',
            'Step forward into a lunge.',
            'Lower until the back knee nearly touches the floor.',
            'Push off the back foot and step through into the next lunge.',
            'Count reps for each leg.'
          ],
          harder: 'Pause in each lunge for two seconds.',
          easier: 'Bring your feet together between each lunge.',
          cues: [
            'Long, even steps.',
            'Chest tall.',
            'Land softly.'
          ]
        },
        {
          id: 'bulgarian-split-squats',
          name: 'Bulgarian Split Squats',
          type: 'reps',
          perSide: true,
          overview: 'A split squat with the rear foot raised on a bench. It shifts most of the load onto the front leg for a powerful single-leg challenge.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Hip Flexors', 'Adductors'],
          levels: [
            { sets: 1, target: 8 },
            { sets: 2, target: 12 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Stand a long stride in front of a bench, facing away.',
            'Rest the top of one foot on the bench behind you.',
            'Lower your back knee toward the floor.',
            'Stop when the front thigh is about parallel.',
            'Drive up through the front foot and switch legs after the set.'
          ],
          harder: 'Slow the tempo or raise the rear foot higher.',
          easier: 'Use a lower step for the rear foot.',
          cues: [
            'Most weight on the front leg.',
            'Front knee in line with toes.',
            'Keep the torso steady.'
          ]
        },
        {
          id: 'jumping-lunges',
          name: 'Jumping Lunges',
          type: 'reps',
          perSide: true,
          overview: 'Exploding up from a lunge and switching legs in the air. It builds power, coordination and conditioning.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Calves', 'Core'],
          levels: [
            { sets: 1, target: 6 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Start in a lunge with one foot forward.',
            'Jump straight up explosively.',
            'Switch legs in the air.',
            'Land softly in a lunge with the other leg forward.',
            'Count reps per leg.'
          ],
          harder: 'Jump higher and minimize time on the ground.',
          easier: 'Do a small hop or step through instead of jumping.',
          cues: [
            'Land quietly on the front foot.',
            'Bend knees to absorb the landing.',
            'Stop when form breaks down.'
          ]
        },
        {
          id: 'shrimp-squats',
          name: 'Shrimp Squats',
          type: 'reps',
          perSide: true,
          overview: 'A single-leg squat holding your rear foot behind you and lowering the back knee to the floor. It demands great quad strength and balance.',
          primary: ['Quads', 'Glutes'],
          secondary: ['Hamstrings', 'Core', 'Calves'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 6 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Stand on one leg and bend the other knee behind you.',
            'Hold the raised foot with the same-side hand.',
            'Reach your free arm forward for balance.',
            'Lower until your back knee gently touches the floor.',
            'Drive up through the standing leg and switch after the set.'
          ],
          harder: 'Hold the rear foot with both hands behind you.',
          easier: 'Place a pad under the knee to shorten the range, or let go of the foot.',
          cues: [
            'Lean forward slightly to balance.',
            'Touch the knee lightly; do not crash.',
            'Standing heel stays down.'
          ]
        }
      ]
    },
    {
      id: 'dips',
      name: 'Dips',
      premium: true,
      blurb: 'Lowering and pressing your body between supports to build strong triceps, chest and shoulders.',
      progressions: [
        {
          id: 'bench-dips',
          name: 'Bench Dips',
          type: 'reps',
          perSide: false,
          overview: 'Dipping with your hands on a bench behind you and feet on the floor. It introduces the dip pattern with partial bodyweight.',
          primary: ['Triceps'],
          secondary: ['Chest', 'Shoulders'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 15 },
            { sets: 3, target: 25 }
          ],
          steps: [
            'Sit on the edge of a bench and grip it beside your hips.',
            'Slide your hips off with knees bent and feet flat.',
            'Bend your elbows to lower your hips.',
            'Stop when your upper arms are about parallel to the floor.',
            'Press back up to straight arms.'
          ],
          harder: 'Straighten your legs or raise your feet on another bench.',
          easier: 'Bring your feet closer and limit the depth.',
          cues: [
            'Keep your back close to the bench.',
            'Elbows point straight back.',
            'Do not go deeper than is comfortable for your shoulders.'
          ]
        },
        {
          id: 'support-holds',
          name: 'Support Holds',
          type: 'hold',
          perSide: false,
          overview: 'Holding yourself up on straight arms between parallel bars. It builds the shoulder stability needed for full dips.',
          primary: ['Triceps', 'Shoulders'],
          secondary: ['Chest', 'Core'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 30 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Stand between parallel bars or two sturdy chairs.',
            'Grip the bars and press yourself up to straight arms.',
            'Push your shoulders down away from your ears.',
            'Lift your feet and hold still.',
            'Step down to release.'
          ],
          harder: 'Lean forward slightly or hold with legs extended in front.',
          easier: 'Keep your toes lightly on the floor.',
          cues: [
            'Arms locked.',
            'Shoulders down.',
            'Body steady.'
          ]
        },
        {
          id: 'negative-dips',
          name: 'Negative Dips',
          type: 'reps',
          perSide: false,
          overview: 'Starting at the top of a dip and lowering slowly. The controlled descent builds strength for full dips.',
          primary: ['Triceps', 'Chest'],
          secondary: ['Shoulders'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 8 },
            { sets: 3, target: 12 }
          ],
          steps: [
            'Jump or step into a straight-arm support on parallel bars.',
            'Lean forward slightly.',
            'Lower over four to five seconds.',
            'Stop when your upper arms are parallel to the floor.',
            'Step down and reset for the next rep.'
          ],
          harder: 'Make the lowering slower.',
          easier: 'Lower only halfway.',
          cues: [
            'Smooth, even speed.',
            'Elbows travel back.',
            'Keep the chest open.'
          ]
        },
        {
          id: 'parallel-bar-dips',
          name: 'Parallel Bar Dips',
          type: 'reps',
          perSide: false,
          overview: 'Full dips on parallel bars from straight arms to a deep bend and back. They are a staple for upper-body pressing strength.',
          primary: ['Triceps', 'Chest'],
          secondary: ['Shoulders', 'Core'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Support yourself on parallel bars with straight arms.',
            'Lean slightly forward and bend your knees if needed.',
            'Lower until your upper arms are parallel to the floor.',
            'Press back up to straight arms.',
            'Repeat with steady control.'
          ],
          harder: 'Pause at the bottom or slow the descent.',
          easier: 'Use a resistance band under the knees or do negative dips.',
          cues: [
            'Shoulders stay down, not shrugged.',
            'Do not drop into the bottom.',
            'Lock out at the top.'
          ]
        },
        {
          id: 'ring-dips',
          name: 'Ring Dips',
          type: 'reps',
          perSide: false,
          overview: 'Dips on gymnastic rings, which move freely. The instability makes the chest, shoulders and arms work much harder to stay controlled.',
          primary: ['Triceps', 'Chest'],
          secondary: ['Shoulders', 'Core', 'Biceps'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 6 },
            { sets: 3, target: 10 }
          ],
          steps: [
            'Set rings about hip height and jump into a support.',
            'Turn the rings slightly outward at the top.',
            'Keep the rings close to your body as you lower.',
            'Descend until your shoulders dip below your elbows.',
            'Press back up and stabilize at the top.'
          ],
          harder: 'Hold the turned-out position for two seconds at the top.',
          easier: 'Keep your feet on a box behind you for help.',
          cues: [
            'Rings stay close to your sides.',
            'Control the wobble before each rep.',
            'Stop if your shoulders feel unstable.'
          ]
        }
      ]
    },
    {
      id: 'elbow-levers',
      name: 'Elbow Levers',
      premium: true,
      blurb: 'Balancing your body horizontally on your bent arms to build wrist, shoulder and core control.',
      progressions: [
        {
          id: 'frog-stands',
          name: 'Frog Stands',
          type: 'hold',
          perSide: false,
          overview: 'Balancing in a squat with your knees resting on the backs of your arms and feet off the floor. It teaches weight transfer onto the hands.',
          primary: ['Shoulders', 'Core'],
          secondary: ['Forearms', 'Triceps'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 40 }
          ],
          steps: [
            'Squat down and place your hands flat on the floor shoulder-width apart.',
            'Bend your elbows and rest your knees on the backs of your upper arms.',
            'Lean forward slowly.',
            'Lift your feet off the floor.',
            'Hold, then lower your feet.'
          ],
          harder: 'Straighten your arms slightly and lift higher.',
          easier: 'Keep one foot lightly on the floor.',
          cues: [
            'Look slightly ahead, not down.',
            'Spread your fingers.',
            'Put a cushion in front of you for safety.'
          ]
        },
        {
          id: 'elbow-lever-tucks',
          name: 'Tucked Elbow Levers',
          type: 'hold',
          perSide: false,
          overview: 'Resting your hips on your elbows with knees tucked and feet off the floor. It introduces the lever balance in a compact shape.',
          primary: ['Core', 'Shoulders'],
          secondary: ['Forearms', 'Triceps'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 15 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Kneel and place your hands on the floor with fingers pointing back or to the side.',
            'Bend your elbows and press them into your lower stomach near your hips.',
            'Lean forward to balance on your hands.',
            'Lift your feet with knees tucked.',
            'Hold and then lower your feet.'
          ],
          harder: 'Extend your legs back a little.',
          easier: 'Keep toes lightly touching the floor.',
          cues: [
            'Elbows stay close together.',
            'Lean, do not jump.',
            'Warm up your wrists first.'
          ]
        },
        {
          id: 'one-leg-elbow-levers',
          name: 'One-Leg Elbow Levers',
          type: 'hold',
          perSide: true,
          overview: 'An elbow lever with one leg straight back and the other bent. It lengthens the lever gradually toward the full position.',
          primary: ['Core', 'Shoulders'],
          secondary: ['Forearms', 'Lower Back', 'Glutes'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 15 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Set up as for a tucked elbow lever.',
            'Lean forward until your feet lift.',
            'Straighten one leg back while keeping the other tucked.',
            'Hold your body level.',
            'Lower down and switch legs after the set.'
          ],
          harder: 'Straighten the tucked leg partway.',
          easier: 'Go back to tucked levers.',
          cues: [
            'Squeeze the extended leg\'s glute.',
            'Keep hips level.',
            'Small lean adjustments.'
          ]
        },
        {
          id: 'full-elbow-levers',
          name: 'Full Elbow Levers',
          type: 'hold',
          perSide: false,
          overview: 'Holding your whole body straight and parallel to the floor on bent arms. It is a classic balance skill requiring full-body tension.',
          primary: ['Core', 'Shoulders'],
          secondary: ['Forearms', 'Lower Back', 'Glutes'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 15 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Place your hands on the floor close together, fingers to the side.',
            'Plant your elbows into your hips.',
            'Extend your legs behind you with toes on the floor.',
            'Lean forward until your feet lift.',
            'Hold with legs straight and together.'
          ],
          harder: 'Spread your hands slightly wider.',
          easier: 'Spread your legs apart.',
          cues: [
            'Body straight from head to heels.',
            'Squeeze glutes and legs.',
            'Breathe steadily.'
          ]
        },
        {
          id: 'one-arm-elbow-levers',
          name: 'One-Arm Elbow Levers',
          type: 'hold',
          perSide: true,
          overview: 'Balancing horizontally on a single bent arm. It requires refined balance and strong obliques.',
          primary: ['Core', 'Obliques'],
          secondary: ['Forearms', 'Shoulders', 'Triceps'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Set up a full elbow lever with both hands.',
            'Shift your weight gradually onto one hand.',
            'Slowly lift the other hand off the floor.',
            'Hold your body level.',
            'Return the hand and switch sides after the set.'
          ],
          harder: 'Extend the free arm forward.',
          easier: 'Keep a fingertip of the free hand on the floor.',
          cues: [
            'Elbow sits firmly in the hip.',
            'Stay long and straight.',
            'Make tiny adjustments.'
          ]
        },
        {
          id: 'straight-arm-planche-leans',
          name: 'Planche Leans',
          type: 'hold',
          perSide: false,
          overview: 'From a pushup position with straight arms, leaning your shoulders well past your hands. It builds the straight-arm strength that follows elbow levers.',
          primary: ['Shoulders'],
          secondary: ['Chest', 'Forearms', 'Core', 'Triceps'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Start in a straight-arm pushup position with fingers turned out.',
            'Round your upper back slightly and push the floor away.',
            'Lean forward so your shoulders move past your hands.',
            'Keep elbows locked and body straight.',
            'Hold, then return to the start.'
          ],
          harder: 'Lean further forward.',
          easier: 'Lean less or start from your knees.',
          cues: [
            'Elbows stay locked.',
            'Protract the shoulder blades.',
            'Build wrist tolerance gradually.'
          ]
        }
      ]
    },
    {
      id: 'clutch-flag',
      name: 'Clutch Flag',
      premium: true,
      blurb: 'Holding your body out sideways from a pole using a clutch grip to build powerful obliques and lats.',
      progressions: [
        {
          id: 'side-planks',
          name: 'Side Planks',
          type: 'hold',
          perSide: true,
          overview: 'Supporting your body sideways on one forearm and the edge of your feet. It builds the lateral core strength the flag depends on.',
          primary: ['Obliques'],
          secondary: ['Core', 'Shoulders', 'Glutes'],
          levels: [
            { sets: 1, target: 20 },
            { sets: 2, target: 40 },
            { sets: 3, target: 60 }
          ],
          steps: [
            'Lie on your side with your elbow under your shoulder.',
            'Stack your feet.',
            'Lift your hips so your body forms a straight line.',
            'Hold the position.',
            'Lower and switch sides.'
          ],
          harder: 'Raise the top leg or reach the top arm overhead.',
          easier: 'Bend your knees and support on them.',
          cues: [
            'Hips stay high.',
            'Push the floor away with the forearm.',
            'Head in line with the spine.'
          ]
        },
        {
          id: 'clutch-holds',
          name: 'Clutch Holds',
          type: 'hold',
          perSide: true,
          overview: 'Gripping a vertical pole with a clutch grip while your feet stay on the floor. It teaches the arm position and loading of the flag.',
          primary: ['Obliques', 'Lats'],
          secondary: ['Forearms', 'Biceps'],
          levels: [
            { sets: 1, target: 10 },
            { sets: 2, target: 20 },
            { sets: 3, target: 30 }
          ],
          steps: [
            'Stand beside a sturdy vertical pole.',
            'Wrap your lower arm around the pole so the pole sits in the crook of your elbow.',
            'Grip the pole above your head with the top hand.',
            'Press your side into the pole and lean away slightly.',
            'Hold, then switch sides.'
          ],
          harder: 'Lean away further so more weight goes into the clutch.',
          easier: 'Stand more upright.',
          cues: [
            'Pole sits firmly in the armpit and elbow.',
            'Pull with the top hand.',
            'Pad the pole if it hurts the arm.'
          ]
        },
        {
          id: 'tucked-clutch-flags',
          name: 'Tucked Clutch Flags',
          type: 'hold',
          perSide: true,
          overview: 'Lifting your feet off the floor in the clutch grip with knees tucked. It is the first time your whole body is held by the pole.',
          primary: ['Obliques', 'Lats'],
          secondary: ['Forearms', 'Core', 'Biceps'],
          levels: [
            { sets: 1, target: 5 },
            { sets: 2, target: 10 },
            { sets: 3, target: 20 }
          ],
          steps: [
            'Set up in the clutch hold.',
            'Lean your body into the pole.',
            'Lift your feet and tuck your knees to your chest.',
            'Hold your body off the ground.',
            'Lower your feet and switch sides.'
          ],
          harder: 'Raise your hips higher toward horizontal.',
          easier: 'Lift just one foot at a time.',
          cues: [
            'Stay tight through the side.',
            'Knees stay tucked.',
            'Lower down with control.'
          ]
        },
        {
          id: 'straddle-clutch-flags',
          name: 'Straddle Clutch Flags',
          type: 'hold',
          perSide: true,
          overview: 'A clutch flag with legs spread wide. The straddle shortens the lever compared with the full flag.',
          primary: ['Obliques', 'Lats'],
          secondary: ['Forearms', 'Core', 'Shoulders'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 8 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Get into a tucked clutch flag.',
            'Extend your legs out to the sides in a wide straddle.',
            'Raise your body toward horizontal.',
            'Hold the position steady.',
            'Tuck, lower and switch sides.'
          ],
          harder: 'Bring your legs closer together.',
          easier: 'Extend only one leg at a time.',
          cues: [
            'Legs straight and toes pointed.',
            'Hips stay high.',
            'Keep pulling with the top arm.'
          ]
        },
        {
          id: 'full-clutch-flags',
          name: 'Full Clutch Flags',
          type: 'hold',
          perSide: true,
          overview: 'Holding your body straight and horizontal from a pole using a clutch grip. It is an impressive display of lateral core and lat strength.',
          primary: ['Obliques', 'Lats'],
          secondary: ['Forearms', 'Core', 'Shoulders'],
          levels: [
            { sets: 1, target: 3 },
            { sets: 2, target: 8 },
            { sets: 3, target: 15 }
          ],
          steps: [
            'Set up in the clutch grip on a sturdy pole.',
            'Lift into a tucked position.',
            'Extend both legs together until your body is straight.',
            'Hold your body horizontal.',
            'Tuck and lower, then switch sides.'
          ],
          harder: 'Hold the flag longer or raise it slightly above horizontal.',
          easier: 'Go back to the straddle version.',
          cues: [
            'Body straight like a board.',
            'Squeeze legs together.',
            'Stop if the clutch arm feels pinched.'
          ]
        }
      ]
    }
  ]
};
