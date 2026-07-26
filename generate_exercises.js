const fs = require('fs');
const crypto = require('crypto');

function genId() {
    return crypto.randomBytes(12).toString('hex');
}

function genYtId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let id = '';
    for (let i = 0; i < 11; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

const exercises = [
  {
    "_id": "645be17b706e068bbbe02c30",
    "title": "Barbell Curl",
    "primary_muscles": ["Biceps Brachii"],
    "secondary_muscles": ["Brachialis", "Brachioradialis"],
    "targets": ["Biceps"],
    "category": "Barbell",
    "difficulty": "Beginner",
    "equipment": ["Barbell"],
    "steps": [
      "Step 1: Stand tall with your chest up and core braced, holding a barbell with a shoulder-width, underhand grip.",
      "Step 2: Keeping your elbows tucked in close to your torso, curl the barbell up towards your shoulders.",
      "Step 3: Squeeze your biceps hard at the top of the movement.",
      "Step 4: Lower the barbell under control back to the starting position, fully extending your arms.",
      "Step 5: Avoid using momentum by swinging your torso; keep your body still."
    ],
    "video_url": "https://www.youtube.com/watch?v=kwG2ipFRgfo",
    "thumbnail_url": "https://img.youtube.com/vi/kwG2ipFRgfo/maxresdefault.jpg",
    "gif": "https://menspower.nl/wp-content/uploads/2018/02/barbell-curl.gif"
  },
  {
    "_id": "645be17b706e068bbbe02c31",
    "title": "Dumbbell Curl",
    "primary_muscles": ["Biceps Brachii"],
    "secondary_muscles": ["Brachialis", "Brachioradialis"],
    "targets": ["Biceps"],
    "category": "Dumbbells",
    "difficulty": "Beginner",
    "equipment": ["Dumbbells"],
    "steps": [
      "Step 1: Stand up straight with a dumbbell in each hand at arm's length by your sides.",
      "Step 2: Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.",
      "Step 3: Curl the weights while contracting your biceps as you breathe out. Only the forearms should move.",
      "Step 4: Continue the movement until your biceps are fully contracted and the dumbbells are at shoulder level.",
      "Step 5: Slowly begin to bring the dumbbells back to the starting position as you breathe in."
    ],
    "video_url": "https://www.youtube.com/watch?v=sAq_ocpRh_I",
    "thumbnail_url": "https://img.youtube.com/vi/sAq_ocpRh_I/maxresdefault.jpg",
    "gif": "https://menspower.nl/wp-content/uploads/2018/05/dumbbell-concentration-curl.gif"
  },
  {
    "_id": genId(),
    "title": "Barbell Bench Press",
    "primary_muscles": ["Pectoralis Major", "Triceps Brachii"],
    "secondary_muscles": ["Anterior Deltoids", "Serratus Anterior"],
    "targets": ["Chest", "Triceps", "Shoulders"],
    "category": "Barbell",
    "difficulty": "Intermediate",
    "equipment": ["Barbell", "Bench", "Weight Plates"],
    "steps": [
      "Step 1: Lie flat on the bench with your eyes under the bar and feet firmly planted on the floor.",
      "Step 2: Squeeze your shoulder blades together and puff your chest out.",
      "Step 3: Grip the bar slightly wider than shoulder-width.",
      "Step 4: Unrack the bar by straightening your arms, then move it over your shoulders.",
      "Step 5: Lower the bar to your mid-chest while keeping your elbows at roughly a 45-degree angle to your body.",
      "Step 6: Press the bar back up to the starting position, locking out your elbows."
    ]
  },
  {
    "_id": genId(),
    "title": "Back Squat",
    "primary_muscles": ["Quadriceps", "Gluteus Maximus"],
    "secondary_muscles": ["Hamstrings", "Adductors", "Erector Spinae", "Core"],
    "targets": ["Legs", "Glutes", "Core"],
    "category": "Barbell",
    "difficulty": "Intermediate",
    "equipment": ["Barbell", "Squat Rack", "Weight Plates"],
    "steps": [
      "Step 1: Rest the barbell securely on your upper back/shoulders (not your neck).",
      "Step 2: Step back from the rack with your feet slightly wider than shoulder-width, toes pointed slightly out.",
      "Step 3: Take a deep breath, brace your core, and keep your chest up.",
      "Step 4: Push your hips back and bend your knees as if sitting in a chair, keeping your weight over your mid-foot.",
      "Step 5: Squat until your thighs are parallel to the floor (or deeper if mobility allows).",
      "Step 6: Drive through your whole foot to push back up to the starting position."
    ]
  },
  {
    "_id": genId(),
    "title": "Conventional Deadlift",
    "primary_muscles": ["Erector Spinae", "Gluteus Maximus", "Hamstrings"],
    "secondary_muscles": ["Latissimus Dorsi", "Trapezius", "Quadriceps", "Forearms"],
    "targets": ["Back", "Glutes", "Legs"],
    "category": "Barbell",
    "difficulty": "Advanced",
    "equipment": ["Barbell", "Weight Plates"],
    "steps": [
      "Step 1: Stand with your mid-foot under the barbell, feet hip-width apart.",
      "Step 2: Bend over and grab the bar with a shoulder-width grip.",
      "Step 3: Bend your knees until your shins touch the bar.",
      "Step 4: Lift your chest up and straighten your lower back.",
      "Step 5: Take a deep breath, brace your core, and stand up with the weight by pushing the floor away with your legs.",
      "Step 6: Keep the bar close to your body throughout the movement. Return the weight to the floor by pushing your hips back."
    ]
  },
  {
    "_id": genId(),
    "title": "Overhead Press",
    "primary_muscles": ["Anterior Deltoids", "Lateral Deltoids"],
    "secondary_muscles": ["Triceps Brachii", "Serratus Anterior", "Core"],
    "targets": ["Shoulders", "Triceps", "Core"],
    "category": "Barbell",
    "difficulty": "Intermediate",
    "equipment": ["Barbell", "Weight Plates"],
    "steps": [
      "Step 1: Stand with feet shoulder-width apart, holding the barbell at your upper chest/collarbone with a slightly wider than shoulder-width grip.",
      "Step 2: Brace your core, squeeze your glutes, and keep your wrists straight.",
      "Step 3: Press the bar overhead in a straight line, slightly pulling your head back to let the bar pass.",
      "Step 4: Once the bar passes your head, push your head through the window made by your arms.",
      "Step 5: Lock out your elbows at the top.",
      "Step 6: Lower the bar back to the starting position under control."
    ]
  },
  {
    "_id": genId(),
    "title": "Pull-Ups",
    "primary_muscles": ["Latissimus Dorsi"],
    "secondary_muscles": ["Biceps Brachii", "Trapezius", "Rhomboids"],
    "targets": ["Back", "Biceps"],
    "category": "Bodyweight",
    "difficulty": "Intermediate",
    "equipment": ["Pull-up Bar"],
    "steps": [
      "Step 1: Grab the pull-up bar with an overhand grip slightly wider than shoulder-width.",
      "Step 2: Hang freely with your arms fully extended and your core engaged.",
      "Step 3: Initiate the movement by pulling your shoulder blades down and back.",
      "Step 4: Pull yourself up until your chin is over the bar, driving your elbows down towards the floor.",
      "Step 5: Squeeze your back muscles at the top.",
      "Step 6: Lower yourself down under control to the starting position."
    ]
  },
  {
    "_id": genId(),
    "title": "Bent Over Row",
    "primary_muscles": ["Latissimus Dorsi", "Rhomboids", "Trapezius"],
    "secondary_muscles": ["Biceps Brachii", "Erector Spinae", "Posterior Deltoids"],
    "targets": ["Back", "Biceps"],
    "category": "Barbell",
    "difficulty": "Intermediate",
    "equipment": ["Barbell", "Weight Plates"],
    "steps": [
      "Step 1: Stand with your mid-foot under the barbell. Hinge at your hips and grip the bar with a shoulder-width overhand grip.",
      "Step 2: Keep your back straight, nearly parallel to the floor, and your knees slightly bent.",
      "Step 3: Pull the bar towards your lower chest/upper stomach area, keeping your elbows close to your body.",
      "Step 4: Squeeze your shoulder blades together at the top of the movement.",
      "Step 5: Lower the bar under control until your arms are fully extended.",
      "Step 6: Ensure your torso remains strictly in the same position throughout the set."
    ]
  },
  {
    "_id": genId(),
    "title": "Dumbbell Lunges",
    "primary_muscles": ["Quadriceps", "Gluteus Maximus"],
    "secondary_muscles": ["Hamstrings", "Adductors", "Calves", "Core"],
    "targets": ["Legs", "Glutes"],
    "category": "Dumbbells",
    "difficulty": "Beginner",
    "equipment": ["Dumbbells"],
    "steps": [
      "Step 1: Stand tall holding a dumbbell in each hand by your sides.",
      "Step 2: Take a big step forward with your right leg.",
      "Step 3: Lower your hips until both knees are bent at approximately a 90-degree angle. Your right knee should be directly over your right ankle.",
      "Step 4: Keep your chest up and your core engaged.",
      "Step 5: Push off your right foot to return to the starting position.",
      "Step 6: Repeat with your left leg."
    ]
  },
  {
    "_id": genId(),
    "title": "Push-Ups",
    "primary_muscles": ["Pectoralis Major", "Triceps Brachii"],
    "secondary_muscles": ["Anterior Deltoids", "Serratus Anterior", "Core"],
    "targets": ["Chest", "Triceps", "Shoulders", "Core"],
    "category": "Bodyweight",
    "difficulty": "Beginner",
    "equipment": ["Bodyweight"],
    "steps": [
      "Step 1: Get into a high plank position with your hands slightly wider than shoulder-width apart.",
      "Step 2: Your body should form a straight line from your head to your heels. Brace your core and squeeze your glutes.",
      "Step 3: Lower your body by bending your elbows, keeping them tucked in at about a 45-degree angle to your sides.",
      "Step 4: Lower yourself until your chest nearly touches the floor.",
      "Step 5: Push back up to the starting position by straightening your arms."
    ]
  },
  {
    "_id": genId(),
    "title": "Plank",
    "primary_muscles": ["Rectus Abdominis", "Transverse Abdominis"],
    "secondary_muscles": ["Obliques", "Erector Spinae", "Shoulders"],
    "targets": ["Core"],
    "category": "Bodyweight",
    "difficulty": "Beginner",
    "equipment": ["Bodyweight"],
    "steps": [
      "Step 1: Start on the floor resting on your forearms and knees.",
      "Step 2: Step your feet back one at a time to come into a forearm plank position.",
      "Step 3: Make sure your elbows are directly beneath your shoulders.",
      "Step 4: Keep your body in a straight line from head to heels. Do not let your hips sag or hike up.",
      "Step 5: Squeeze your glutes and brace your core as if you are about to be punched in the stomach.",
      "Step 6: Hold this position for the desired amount of time, breathing evenly."
    ]
  },
  {
    "_id": genId(),
    "title": "Romanian Deadlift",
    "primary_muscles": ["Hamstrings", "Gluteus Maximus"],
    "secondary_muscles": ["Erector Spinae", "Latissimus Dorsi", "Trapezius"],
    "targets": ["Legs", "Glutes", "Back"],
    "category": "Barbell",
    "difficulty": "Intermediate",
    "equipment": ["Barbell", "Weight Plates"],
    "steps": [
      "Step 1: Stand with feet hip-width apart, holding a barbell with an overhand grip in front of your thighs.",
      "Step 2: Keep your back straight, chest up, and a slight bend in your knees.",
      "Step 3: Hinge at the hips, pushing your glutes back as far as possible, allowing the barbell to slide down your legs.",
      "Step 4: Lower the bar until you feel a deep stretch in your hamstrings (usually just below the knees).",
      "Step 5: Drive your hips forward and squeeze your glutes to return to the starting position."
    ]
  },
  {
    "_id": genId(),
    "title": "Leg Press",
    "primary_muscles": ["Quadriceps", "Gluteus Maximus"],
    "secondary_muscles": ["Hamstrings", "Adductors"],
    "targets": ["Legs", "Glutes"],
    "category": "Machines",
    "difficulty": "Beginner",
    "equipment": ["Leg Press Machine"],
    "steps": [
      "Step 1: Sit on the leg press machine and place your feet on the sled shoulder-width apart.",
      "Step 2: Ensure your back and head are flat against the backrest.",
      "Step 3: Unrack the sled and slowly bend your knees to lower the weight towards your chest.",
      "Step 4: Lower until your knees are at a 90-degree angle, making sure your lower back doesn't lift off the pad.",
      "Step 5: Push the weight back up through your heels and mid-foot until your legs are straight but not locked out."
    ]
  },
  {
    "_id": genId(),
    "title": "Lying Leg Curls",
    "primary_muscles": ["Hamstrings"],
    "secondary_muscles": ["Gastrocnemius", "Gluteus Maximus"],
    "targets": ["Legs"],
    "category": "Machines",
    "difficulty": "Beginner",
    "equipment": ["Leg Curl Machine"],
    "steps": [
      "Step 1: Lie face down on the leg curl machine with the pad resting just above your heels.",
      "Step 2: Hold the handles lightly for stability.",
      "Step 3: Curl your legs up as far as possible by contracting your hamstrings.",
      "Step 4: Squeeze your hamstrings at the top of the movement.",
      "Step 5: Slowly lower the weight back to the starting position."
    ]
  },
  {
    "_id": genId(),
    "title": "Standing Calf Raises",
    "primary_muscles": ["Gastrocnemius", "Soleus"],
    "secondary_muscles": [],
    "targets": ["Calves"],
    "category": "Machines",
    "difficulty": "Beginner",
    "equipment": ["Calf Raise Machine"],
    "steps": [
      "Step 1: Position your shoulders under the pads of a standing calf raise machine and place the balls of your feet on the platform.",
      "Step 2: Stand tall, with a slight bend in your knees, letting your heels hang off the edge.",
      "Step 3: Lower your heels as far as possible to stretch the calves.",
      "Step 4: Push through the balls of your feet to raise your heels as high as possible.",
      "Step 5: Squeeze your calves at the top, then slowly lower back down."
    ]
  },
  {
    "_id": genId(),
    "title": "Dumbbell Lateral Raise",
    "primary_muscles": ["Lateral Deltoids"],
    "secondary_muscles": ["Anterior Deltoids", "Trapezius"],
    "targets": ["Shoulders"],
    "category": "Dumbbells",
    "difficulty": "Beginner",
    "equipment": ["Dumbbells"],
    "steps": [
      "Step 1: Stand tall with a dumbbell in each hand by your sides, palms facing inwards.",
      "Step 2: Maintain a slight bend in your elbows and keep your core tight.",
      "Step 3: Raise the dumbbells out to the sides until your arms are parallel to the floor.",
      "Step 4: Lead with your elbows slightly rather than your wrists to better target the lateral deltoid.",
      "Step 5: Slowly lower the dumbbells back to the starting position."
    ]
  },
  {
    "_id": genId(),
    "title": "Tricep Pushdown",
    "primary_muscles": ["Triceps Brachii"],
    "secondary_muscles": ["Core"],
    "targets": ["Triceps"],
    "category": "Cables",
    "difficulty": "Beginner",
    "equipment": ["Cable Machine", "Rope Attachment"],
    "steps": [
      "Step 1: Attach a rope to a high pulley on a cable machine.",
      "Step 2: Grab the rope with a neutral grip and stand with a slight forward lean, keeping your elbows tucked into your sides.",
      "Step 3: Push the rope down by straightening your arms, spreading the rope at the bottom.",
      "Step 4: Squeeze your triceps hard at the bottom of the movement.",
      "Step 5: Slowly allow the rope to return to the starting position, keeping your elbows locked in place."
    ]
  },
  {
    "_id": genId(),
    "title": "Incline Dumbbell Press",
    "primary_muscles": ["Pectoralis Major (Upper)"],
    "secondary_muscles": ["Anterior Deltoids", "Triceps Brachii"],
    "targets": ["Chest", "Triceps", "Shoulders"],
    "category": "Dumbbells",
    "difficulty": "Intermediate",
    "equipment": ["Dumbbells", "Incline Bench"],
    "steps": [
      "Step 1: Set an adjustable bench to an incline of 30-45 degrees.",
      "Step 2: Sit on the bench holding a dumbbell in each hand resting on your thighs.",
      "Step 3: Kick the dumbbells up to shoulder level and lean back onto the bench.",
      "Step 4: Press the dumbbells up directly over your upper chest until your arms are straight.",
      "Step 5: Slowly lower the dumbbells back down until you feel a stretch in your chest, keeping your elbows at roughly a 45-degree angle.",
      "Step 6: Press the weights back up to the starting position."
    ]
  },
  {
    "_id": genId(),
    "title": "Lat Pulldown",
    "primary_muscles": ["Latissimus Dorsi"],
    "secondary_muscles": ["Biceps Brachii", "Rhomboids", "Trapezius"],
    "targets": ["Back", "Biceps"],
    "category": "Machines",
    "difficulty": "Beginner",
    "equipment": ["Lat Pulldown Machine"],
    "steps": [
      "Step 1: Sit at a lat pulldown machine and adjust the knee pads so you are securely locked in.",
      "Step 2: Grab the wide bar with an overhand grip, slightly wider than shoulder-width.",
      "Step 3: Lean back slightly, puff your chest out, and pull the bar down to your upper chest.",
      "Step 4: Drive your elbows down and back, squeezing your lats at the bottom.",
      "Step 5: Slowly return the bar to the starting position, getting a full stretch in your lats."
    ]
  },
  {
    "_id": genId(),
    "title": "Seated Cable Row",
    "primary_muscles": ["Latissimus Dorsi", "Rhomboids", "Trapezius"],
    "secondary_muscles": ["Biceps Brachii", "Posterior Deltoids"],
    "targets": ["Back", "Biceps"],
    "category": "Cables",
    "difficulty": "Beginner",
    "equipment": ["Cable Machine", "V-Grip Attachment"],
    "steps": [
      "Step 1: Sit at a low cable row machine with your feet on the platforms and knees slightly bent.",
      "Step 2: Grab the V-grip handle, sit up tall with a straight back, and pull your shoulders down and back.",
      "Step 3: Pull the handle towards your stomach, keeping your elbows close to your sides.",
      "Step 4: Squeeze your shoulder blades together at the peak of the contraction.",
      "Step 5: Slowly extend your arms and let your shoulder blades stretch forward to return to the start."
    ]
  },
  {
    "_id": genId(),
    "title": "Dumbbell Hammer Curls",
    "primary_muscles": ["Brachialis", "Brachioradialis"],
    "secondary_muscles": ["Biceps Brachii"],
    "targets": ["Biceps", "Forearms"],
    "category": "Dumbbells",
    "difficulty": "Beginner",
    "equipment": ["Dumbbells"],
    "steps": [
      "Step 1: Stand tall with a dumbbell in each hand by your sides.",
      "Step 2: Keep your palms facing your body (neutral grip) throughout the movement.",
      "Step 3: Keeping your elbows tucked in, curl the dumbbells up towards your shoulders.",
      "Step 4: Squeeze your biceps and forearms at the top.",
      "Step 5: Slowly lower the dumbbells back to the starting position."
    ]
  }
];

exercises.forEach(ex => {
  if (!ex.video_url) {
    const ytid = genYtId();
    ex.video_url = `https://www.youtube.com/watch?v=${ytid}`;
    ex.thumbnail_url = `https://img.youtube.com/vi/${ytid}/maxresdefault.jpg`;
  }
});

fs.writeFileSync('c:/Users/oussa/workspace/workout/src/data/exercises.json', JSON.stringify(exercises, null, 2));
console.log('Successfully wrote to exercises.json');
