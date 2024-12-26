import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  {
    name: "Barbell Back Squat",
    category: "Compound",
    equipment: ["Barbell", "Squat Rack"],
    description: "A fundamental compound exercise that primarily targets the lower body muscles.",
    instructions: [
      "Position the barbell on your upper back, resting it on your traps or rear deltoids",
      "Stand with feet shoulder-width apart, toes slightly pointed outward",
      "Brace your core and maintain a neutral spine",
      "Lower your body by bending at the knees and hips, as if sitting back into a chair",
      "Continue until thighs are parallel to the ground or slightly below",
      "Drive through your heels to return to the starting position"
    ],
    commonMistakes: [
      "Knees caving inward",
      "Rounding the lower back",
      "Rising onto toes",
      "Not reaching proper depth",
      "Looking up instead of maintaining a neutral neck position"
    ],
    benefits: [
      "Builds overall lower body strength",
      "Improves core stability",
      "Increases bone density",
      "Enhances athletic performance",
      "Boosts functional strength"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "SQUAT",
    targetMuscles: ["QUADRICEPS", "GLUTES", "HAMSTRINGS"],
    secondaryMuscles: ["CORE", "CALVES"],
    videoUrl: "https://example.com/barbell-squat"
  },
  {
    name: "Bench Press",
    category: "Compound",
    equipment: ["Barbell", "Bench", "Power Rack"],
    description: "The king of upper body pushing exercises, targeting chest, shoulders, and triceps.",
    instructions: [
      "Lie flat on bench with feet planted firmly on the ground",
      "Grip the barbell slightly wider than shoulder width",
      "Unrack the bar and position it over your chest",
      "Lower the bar with control to mid-chest",
      "Press the bar back up to starting position while maintaining proper form"
    ],
    commonMistakes: [
      "Bouncing the bar off chest",
      "Arching back excessively",
      "Flaring elbows too wide",
      "Not maintaining proper shoulder position",
      "Uneven bar path"
    ],
    benefits: [
      "Builds upper body pushing strength",
      "Develops chest muscles",
      "Improves shoulder stability",
      "Strengthens triceps",
      "Enhances pressing power"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PUSH",
    targetMuscles: ["CHEST"],
    secondaryMuscles: ["SHOULDERS", "TRICEPS"],
    videoUrl: "https://example.com/bench-press"
  },
  {
    name: "Deadlift",
    category: "Compound",
    equipment: ["Barbell", "Weight Plates"],
    description: "A fundamental hip-hinge movement that builds total body strength.",
    instructions: [
      "Stand with feet hip-width apart, barbell over mid-foot",
      "Hinge at hips to grip the bar just outside knees",
      "Keep chest up and spine neutral",
      "Take slack out of the bar and brace core",
      "Drive through feet while keeping bar close to body",
      "Lock out hips and knees at the top"
    ],
    commonMistakes: [
      "Rounding the back",
      "Starting with hips too low",
      "Letting bar drift away from body",
      "Not engaging lats",
      "Jerking the weight off the floor"
    ],
    benefits: [
      "Develops total body strength",
      "Improves posterior chain development",
      "Increases grip strength",
      "Builds core stability",
      "Enhances power production"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "HINGE",
    targetMuscles: ["BACK", "GLUTES", "HAMSTRINGS"],
    secondaryMuscles: ["CORE", "TRAPEZIUS", "FOREARMS"],
    videoUrl: "https://example.com/deadlift"
  },
  {
    name: "Pull-up",
    category: "Compound",
    equipment: ["Pull-up Bar"],
    description: "A fundamental upper body pulling exercise that builds back, biceps, and core strength.",
    instructions: [
      "Hang from pull-up bar with hands slightly wider than shoulder-width",
      "Engage your lats by pulling shoulders down and back",
      "Pull yourself up until chin clears the bar",
      "Lower yourself with control to starting position",
      "Maintain a slight hollow body position throughout"
    ],
    commonMistakes: [
      "Using momentum/kipping",
      "Not completing full range of motion",
      "Poor shoulder engagement",
      "Excessive swinging",
      "Not engaging core"
    ],
    benefits: [
      "Builds upper body pulling strength",
      "Develops back width and thickness",
      "Improves grip strength",
      "Enhances shoulder stability",
      "Strengthens core"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PULL",
    targetMuscles: ["BACK", "LATS"],
    secondaryMuscles: ["BICEPS", "CORE", "FOREARMS"],
    videoUrl: "https://example.com/pull-up"
  },
  {
    name: "Romanian Deadlift",
    category: "Compound",
    equipment: ["Barbell", "Weight Plates"],
    description: "A hip-hinge movement that targets the posterior chain.",
    instructions: [
      "Stand with feet hip-width apart, holding barbell at hip level",
      "Keep slight bend in knees throughout movement",
      "Push hips back while maintaining flat back",
      "Lower bar along thighs until you feel hamstring stretch",
      "Drive hips forward to return to starting position"
    ],
    commonMistakes: [
      "Rounding the back",
      "Bending knees too much",
      "Not pushing hips back far enough",
      "Letting bar drift away from legs",
      "Looking up instead of maintaining neutral neck"
    ],
    benefits: [
      "Develops hamstring strength and flexibility",
      "Improves hip mobility",
      "Strengthens lower back",
      "Enhances posterior chain development",
      "Builds deadlift strength"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "HINGE",
    targetMuscles: ["HAMSTRINGS", "GLUTES"],
    secondaryMuscles: ["BACK", "CORE"],
    videoUrl: "https://example.com/romanian-deadlift"
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Compound",
    equipment: ["Dumbbells"],
    description: "An overhead pressing movement that builds shoulder strength and stability.",
    instructions: [
      "Sit or stand with dumbbells at shoulder height",
      "Keep core tight and maintain neutral spine",
      "Press dumbbells overhead until arms are fully extended",
      "Lower weights with control back to shoulders",
      "Repeat while maintaining stable shoulder position"
    ],
    commonMistakes: [
      "Arching lower back",
      "Using momentum",
      "Incomplete range of motion",
      "Flaring elbows too wide",
      "Not engaging core"
    ],
    benefits: [
      "Builds shoulder strength",
      "Improves overhead stability",
      "Develops core control",
      "Enhances pressing power",
      "Better shoulder mobility"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PUSH",
    targetMuscles: ["SHOULDERS"],
    secondaryMuscles: ["TRICEPS", "CORE"],
    videoUrl: "https://example.com/dumbbell-shoulder-press"
  },
  {
    name: "Bulgarian Split Squat",
    category: "Compound",
    equipment: ["Bench", "Dumbbells"],
    description: "A unilateral lower body exercise that builds single-leg strength and stability.",
    instructions: [
      "Place rear foot on bench behind you",
      "Stand on working leg about 2 feet in front of bench",
      "Lower body until rear knee nearly touches ground",
      "Keep front knee tracking over toes",
      "Push through front foot to return to start"
    ],
    commonMistakes: [
      "Front foot too close to bench",
      "Leaning forward excessively",
      "Knee caving inward",
      "Not going deep enough",
      "Poor balance and stability"
    ],
    benefits: [
      "Improves single-leg strength",
      "Corrects muscle imbalances",
      "Enhances balance and stability",
      "Develops hip mobility",
      "Builds functional leg strength"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "LUNGE",
    targetMuscles: ["QUADRICEPS", "GLUTES"],
    secondaryMuscles: ["HAMSTRINGS", "CALVES", "CORE"],
    videoUrl: "https://example.com/bulgarian-split-squat"
  },
  {
    name: "Barbell Row",
    category: "Compound",
    equipment: ["Barbell", "Weight Plates"],
    description: "A compound pulling movement that targets the back muscles.",
    instructions: [
      "Hinge forward at hips, keeping back straight",
      "Grip barbell slightly wider than shoulder width",
      "Pull bar to lower chest/upper abdomen",
      "Keep elbows close to body",
      "Lower with control to starting position"
    ],
    commonMistakes: [
      "Using too much body momentum",
      "Rounding the back",
      "Pulling to wrong position",
      "Not maintaining hip hinge",
      "Letting elbows flare too wide"
    ],
    benefits: [
      "Builds back thickness",
      "Improves posture",
      "Develops pulling strength",
      "Enhances core stability",
      "Strengthens grip"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PULL",
    targetMuscles: ["BACK", "LATS"],
    secondaryMuscles: ["BICEPS", "CORE", "FOREARMS"],
    videoUrl: "https://example.com/barbell-row"
  },
  {
    name: "Dumbbell Bicep Curl",
    category: "Isolation",
    equipment: ["Dumbbells"],
    description: "An isolation exercise targeting the biceps muscles.",
    instructions: [
      "Stand with dumbbells at sides, palms facing forward",
      "Keep upper arms stationary against sides",
      "Curl weights up toward shoulders",
      "Squeeze biceps at top of movement",
      "Lower with control to starting position"
    ],
    commonMistakes: [
      "Swinging body for momentum",
      "Not controlling descent",
      "Moving elbows away from sides",
      "Incomplete range of motion",
      "Using too heavy weight"
    ],
    benefits: [
      "Isolates bicep muscles",
      "Builds arm strength",
      "Improves elbow stability",
      "Enhances muscle definition",
      "Develops peak contraction"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PULL",
    targetMuscles: ["BICEPS"],
    secondaryMuscles: ["FOREARMS"],
    videoUrl: "https://example.com/dumbbell-bicep-curl"
  },
  {
    name: "Tricep Pushdown",
    category: "Isolation",
    equipment: ["Cable Machine", "Rope Attachment"],
    description: "An isolation exercise for developing tricep strength and definition.",
    instructions: [
      "Stand facing cable machine with rope at upper chest height",
      "Grab rope with palms facing each other",
      "Keep elbows tucked at sides",
      "Extend arms down fully, spreading rope ends apart",
      "Control weight back to starting position"
    ],
    commonMistakes: [
      "Moving elbows away from sides",
      "Leaning too far forward",
      "Using momentum",
      "Not fully extending arms",
      "Letting wrists bend"
    ],
    benefits: [
      "Isolates tricep muscles",
      "Improves arm definition",
      "Enhances pushing strength",
      "Develops muscle control",
      "Builds elbow stability"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PUSH",
    targetMuscles: ["TRICEPS"],
    secondaryMuscles: [],
    videoUrl: "https://example.com/tricep-pushdown"
  },
  {
    name: "Lat Pulldown",
    category: "Compound",
    equipment: ["Cable Machine", "Lat Bar"],
    description: "A vertical pulling movement that targets the latissimus dorsi muscles.",
    instructions: [
      "Sit at machine with thighs secured under pad",
      "Grab bar with wide overhand grip",
      "Pull bar down to upper chest while leaning slightly back",
      "Focus on driving elbows down and back",
      "Control weight back to starting position"
    ],
    commonMistakes: [
      "Leaning back too far",
      "Using momentum",
      "Pulling bar behind neck",
      "Not engaging lats properly",
      "Incomplete range of motion"
    ],
    benefits: [
      "Builds back width",
      "Improves vertical pulling strength",
      "Develops lat muscles",
      "Enhances shoulder stability",
      "Strengthens grip"
    ],
    difficulty: "BEGINNER",
    isCompound: true,
    movementPattern: "PULL",
    targetMuscles: ["LATS", "BACK"],
    secondaryMuscles: ["BICEPS", "FOREARMS"],
    videoUrl: "https://example.com/lat-pulldown"
  },
  {
    name: "Face Pull",
    category: "Isolation",
    equipment: ["Cable Machine", "Rope Attachment"],
    description: "An upper back exercise that targets the rear deltoids and external rotators.",
    instructions: [
      "Set cable at upper chest height with rope attachment",
      "Pull rope towards face, separating ends at ears",
      "Keep upper arms parallel to ground",
      "Squeeze shoulder blades together",
      "Return to start with control"
    ],
    commonMistakes: [
      "Using too heavy weight",
      "Poor posture",
      "Not pulling high enough",
      "Letting elbows drop",
      "Rushing the movement"
    ],
    benefits: [
      "Improves shoulder health",
      "Develops rear deltoids",
      "Enhances posture",
      "Strengthens rotator cuff",
      "Balances shoulder development"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PULL",
    targetMuscles: ["SHOULDERS", "TRAPEZIUS"],
    secondaryMuscles: ["BACK"],
    videoUrl: "https://example.com/face-pull"
  },
  {
    name: "Plank",
    category: "Isolation",
    equipment: [],
    description: "A static core exercise that builds overall stability and endurance.",
    instructions: [
      "Start in push-up position on forearms",
      "Keep body in straight line from head to heels",
      "Engage core and glutes",
      "Keep neck neutral",
      "Hold position while breathing steadily"
    ],
    commonMistakes: [
      "Sagging hips",
      "Raising hips too high",
      "Not engaging core",
      "Looking up/down",
      "Holding breath"
    ],
    benefits: [
      "Builds core stability",
      "Improves posture",
      "Enhances body control",
      "Develops isometric strength",
      "Reduces lower back pain"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PLANK",
    targetMuscles: ["CORE"],
    secondaryMuscles: ["SHOULDERS", "GLUTES"],
    videoUrl: "https://example.com/plank"
  },
  {
    name: "Dumbbell Lunges",
    category: "Compound",
    equipment: ["Dumbbells"],
    description: "A dynamic lower body exercise that builds leg strength and balance.",
    instructions: [
      "Stand with dumbbells at sides",
      "Step forward into a lunge position",
      "Lower back knee toward ground",
      "Push through front foot to return to start",
      "Alternate legs with each rep"
    ],
    commonMistakes: [
      "Front knee passing toes",
      "Torso leaning forward",
      "Back knee not lowering enough",
      "Poor balance",
      "Uneven steps"
    ],
    benefits: [
      "Improves leg strength",
      "Develops balance",
      "Enhances core stability",
      "Builds functional fitness",
      "Increases hip mobility"
    ],
    difficulty: "BEGINNER",
    isCompound: true,
    movementPattern: "LUNGE",
    targetMuscles: ["QUADRICEPS", "GLUTES"],
    secondaryMuscles: ["HAMSTRINGS", "CALVES", "CORE"],
    videoUrl: "https://example.com/dumbbell-lunges"
  },
  {
    name: "Cable Woodchop",
    category: "Compound",
    equipment: ["Cable Machine"],
    description: "A rotational exercise that targets the core and improves functional movement.",
    instructions: [
      "Set cable at high position",
      "Stand sideways to machine",
      "Pull cable down and across body",
      "Rotate through core while maintaining stable lower body",
      "Control return to starting position"
    ],
    commonMistakes: [
      "Moving through arms instead of core",
      "Rounding back",
      "Moving too quickly",
      "Not maintaining stable base",
      "Incomplete rotation"
    ],
    benefits: [
      "Develops rotational power",
      "Improves core strength",
      "Enhances functional movement",
      "Builds athletic performance",
      "Increases torso mobility"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "ROTATION",
    targetMuscles: ["CORE"],
    secondaryMuscles: ["SHOULDERS", "BACK"],
    videoUrl: "https://example.com/cable-woodchop"
  },
  {
    name: "Dips",
    category: "Compound",
    equipment: ["Dip Bars"],
    description: "An upper body pushing exercise that targets chest and triceps.",
    instructions: [
      "Support body on dip bars with straight arms",
      "Lower body by bending elbows",
      "Keep slight forward lean for chest focus",
      "Lower until upper arms are parallel to ground",
      "Push back up to starting position"
    ],
    commonMistakes: [
      "Insufficient range of motion",
      "Excessive forward lean",
      "Flaring elbows too wide",
      "Using momentum",
      "Poor shoulder position"
    ],
    benefits: [
      "Builds upper body strength",
      "Develops chest and triceps",
      "Improves pressing power",
      "Enhances shoulder stability",
      "Increases body control"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PUSH",
    targetMuscles: ["CHEST", "TRICEPS"],
    secondaryMuscles: ["SHOULDERS", "CORE"],
    videoUrl: "https://example.com/dips"
  },
  {
    name: "Leg Press",
    category: "Compound",
    equipment: ["Leg Press Machine"],
    description: "A machine-based lower body pushing exercise.",
    instructions: [
      "Sit in machine with feet shoulder-width on platform",
      "Lower weight by bending knees",
      "Keep back flat against seat",
      "Push through full foot to extend legs",
      "Don't lock out knees at top"
    ],
    commonMistakes: [
      "Locking knees at extension",
      "Lifting hips off seat",
      "Placing feet too high/low",
      "Bringing knees too close to chest",
      "Using too much weight"
    ],
    benefits: [
      "Builds leg strength",
      "Develops pushing power",
      "Targets major leg muscles",
      "Lower back friendly",
      "Good for muscle growth"
    ],
    difficulty: "BEGINNER",
    isCompound: true,
    movementPattern: "PUSH",
    targetMuscles: ["QUADRICEPS", "GLUTES"],
    secondaryMuscles: ["HAMSTRINGS", "CALVES"],
    videoUrl: "https://example.com/leg-press"
  },
  {
    name: "Incline Dumbbell Press",
    category: "Compound",
    equipment: ["Dumbbells", "Incline Bench"],
    description: "An upper chest focused pressing movement.",
    instructions: [
      "Lie on incline bench set to 30-45 degrees",
      "Hold dumbbells at shoulder level",
      "Press weights up and slightly back",
      "Lower weights with control",
      "Keep core engaged throughout"
    ],
    commonMistakes: [
      "Bench angle too steep",
      "Flaring elbows",
      "Arching back",
      "Uneven pressing",
      "Bouncing weights off chest"
    ],
    benefits: [
      "Targets upper chest",
      "Improves shoulder stability",
      "Builds pressing strength",
      "Develops muscle balance",
      "Enhances shoulder mobility"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PUSH",
    targetMuscles: ["CHEST"],
    secondaryMuscles: ["SHOULDERS", "TRICEPS"],
    videoUrl: "https://example.com/incline-dumbbell-press"
  },
  {
    name: "Lateral Raise",
    category: "Isolation",
    equipment: ["Dumbbells"],
    description: "An isolation exercise targeting the lateral deltoids.",
    instructions: [
      "Stand with dumbbells at sides",
      "Raise arms out to sides until parallel with ground",
      "Keep slight bend in elbows",
      "Lower with control",
      "Maintain upright posture throughout"
    ],
    commonMistakes: [
      "Using momentum to swing weights",
      "Raising arms too high",
      "Shrugging shoulders",
      "Bending forward",
      "Fully straight arms"
    ],
    benefits: [
      "Builds shoulder width",
      "Improves shoulder stability",
      "Enhances muscle definition",
      "Develops balanced shoulders",
      "Isolates lateral deltoids"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PUSH",
    targetMuscles: ["SHOULDERS"],
    secondaryMuscles: ["TRAPEZIUS"],
    videoUrl: "https://example.com/lateral-raise"
  },
  {
    name: "Calf Raise",
    category: "Isolation",
    equipment: ["Smith Machine", "Platform"],
    description: "An isolation exercise for developing calf muscles.",
    instructions: [
      "Stand on platform with balls of feet",
      "Lower heels below platform level",
      "Push through balls of feet to raise up",
      "Hold at top contraction",
      "Lower with control"
    ],
    commonMistakes: [
      "Insufficient range of motion",
      "Not pausing at top",
      "Using momentum",
      "Poor balance",
      "Rushing repetitions"
    ],
    benefits: [
      "Develops calf muscles",
      "Improves ankle stability",
      "Enhances lower leg power",
      "Builds jumping ability",
      "Increases ankle mobility"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PUSH",
    targetMuscles: ["CALVES"],
    secondaryMuscles: [],
    videoUrl: "https://example.com/calf-raise"
  },
  {
    name: "Hammer Curl",
    category: "Isolation",
    equipment: ["Dumbbells"],
    description: "A bicep curl variation that targets the brachialis and forearms.",
    instructions: [
      "Stand with dumbbells at sides, palms facing each other",
      "Keep upper arms stationary",
      "Curl weights toward shoulders",
      "Squeeze at top of movement",
      "Lower with control"
    ],
    commonMistakes: [
      "Swinging body",
      "Moving elbows forward",
      "Using too heavy weight",
      "Incomplete range of motion",
      "Poor wrist position"
    ],
    benefits: [
      "Develops brachialis muscle",
      "Improves forearm strength",
      "Enhances grip strength",
      "Builds balanced arm development",
      "Reduces elbow stress"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "PULL",
    targetMuscles: ["BICEPS", "FOREARMS"],
    secondaryMuscles: [],
    videoUrl: "https://example.com/hammer-curl"
  },
  {
    name: "Russian Twist",
    category: "Isolation",
    equipment: ["Weight Plate", "Medicine Ball"],
    description: "A rotational core exercise that targets the obliques.",
    instructions: [
      "Sit with knees bent, feet off ground",
      "Lean back slightly, maintaining straight back",
      "Hold weight at chest level",
      "Rotate torso side to side",
      "Keep core engaged throughout"
    ],
    commonMistakes: [
      "Rounding lower back",
      "Moving too quickly",
      "Not rotating far enough",
      "Letting feet drop",
      "Using momentum"
    ],
    benefits: [
      "Strengthens obliques",
      "Improves rotational power",
      "Develops core stability",
      "Enhances balance",
      "Builds functional strength"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "ROTATION",
    targetMuscles: ["CORE"],
    secondaryMuscles: [],
    videoUrl: "https://example.com/russian-twist"
  },
  {
    name: "Front Squat",
    category: "Compound",
    equipment: ["Barbell"],
    description: "A squat variation that emphasizes the quadriceps and core.",
    instructions: [
      "Rest barbell on front deltoids and collarbone",
      "Keep elbows high, upper arms parallel to floor",
      "Descend by breaking at knees and hips",
      "Maintain upright torso",
      "Drive through heels to stand"
    ],
    commonMistakes: [
      "Dropping elbows",
      "Forward lean",
      "Heels rising",
      "Knees caving in",
      "Incomplete depth"
    ],
    benefits: [
      "Builds quad strength",
      "Improves core stability",
      "Develops front rack mobility",
      "Enhances posture",
      "Increases leg power"
    ],
    difficulty: "ADVANCED",
    isCompound: true,
    movementPattern: "SQUAT",
    targetMuscles: ["QUADRICEPS", "CORE"],
    secondaryMuscles: ["GLUTES", "SHOULDERS"],
    videoUrl: "https://example.com/front-squat"
  },
  {
    name: "Glute Bridge",
    category: "Isolation",
    equipment: ["Barbell"],
    description: "A hip extension exercise targeting the glutes and hamstrings.",
    instructions: [
      "Lie on back with knees bent, feet flat",
      "Position barbell over hips",
      "Drive through heels to lift hips",
      "Squeeze glutes at top",
      "Lower with control"
    ],
    commonMistakes: [
      "Overarching lower back",
      "Pushing through toes",
      "Insufficient hip extension",
      "Not engaging core",
      "Rolling bar on hips"
    ],
    benefits: [
      "Strengthens glutes",
      "Improves hip extension",
      "Develops posterior chain",
      "Enhances lower back health",
      "Builds hip power"
    ],
    difficulty: "BEGINNER",
    isCompound: false,
    movementPattern: "HINGE",
    targetMuscles: ["GLUTES", "HAMSTRINGS"],
    secondaryMuscles: ["CORE"],
    videoUrl: "https://example.com/glute-bridge"
  },
  {
    name: "Chin-up",
    category: "Compound",
    equipment: ["Pull-up Bar"],
    description: "An upper body pulling exercise with supinated grip.",
    instructions: [
      "Hang from bar with palms facing you",
      "Engage lats and pull up",
      "Lead with chest to bar",
      "Keep core tight throughout",
      "Lower with control"
    ],
    commonMistakes: [
      "Using momentum",
      "Incomplete range of motion",
      "Poor shoulder engagement",
      "Swinging body",
      "Not engaging core"
    ],
    benefits: [
      "Builds bicep strength",
      "Develops back muscles",
      "Improves grip strength",
      "Enhances pulling power",
      "Increases arm size"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PULL",
    targetMuscles: ["BICEPS", "BACK"],
    secondaryMuscles: ["FOREARMS", "CORE"],
    videoUrl: "https://example.com/chin-up"
  },
  {
    name: "Overhead Press",
    category: "Compound",
    equipment: ["Barbell"],
    description: "A fundamental overhead pressing movement.",
    instructions: [
      "Hold barbell at shoulder level",
      "Brace core and maintain neutral spine",
      "Press bar overhead until arms lock out",
      "Keep bar path close to face",
      "Lower with control to shoulders"
    ],
    commonMistakes: [
      "Leaning back excessively",
      "Not engaging core",
      "Poor bar path",
      "Pressing behind neck",
      "Using leg drive"
    ],
    benefits: [
      "Builds shoulder strength",
      "Improves pressing power",
      "Develops core stability",
      "Enhances shoulder mobility",
      "Increases overhead strength"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "PUSH",
    targetMuscles: ["SHOULDERS"],
    secondaryMuscles: ["TRICEPS", "CORE"],
    videoUrl: "https://example.com/overhead-press"
  },
  {
    name: "Farmers Walk",
    category: "Compound",
    equipment: ["Dumbbells", "Kettlebells"],
    description: "A functional carry exercise that builds total body strength and stability.",
    instructions: [
      "Hold heavy weights at sides",
      "Stand tall with shoulders back",
      "Walk with controlled steps",
      "Maintain neutral spine",
      "Keep core tight throughout"
    ],
    commonMistakes: [
      "Poor posture",
      "Uneven walking",
      "Rushing steps",
      "Swinging weights",
      "Holding breath"
    ],
    benefits: [
      "Improves grip strength",
      "Builds core stability",
      "Develops trap muscles",
      "Enhances walking strength",
      "Increases work capacity"
    ],
    difficulty: "BEGINNER",
    isCompound: true,
    movementPattern: "CARRY",
    targetMuscles: ["TRAPEZIUS", "FOREARMS"],
    secondaryMuscles: ["CORE", "SHOULDERS"],
    videoUrl: "https://example.com/farmers-walk"
  },
  {
    name: "Good Morning",
    category: "Compound",
    equipment: ["Barbell"],
    description: "A hip hinge movement targeting the posterior chain.",
    instructions: [
      "Place bar on upper back",
      "Hinge at hips pushing them back",
      "Keep slight bend in knees",
      "Lower torso until parallel to ground",
      "Drive hips forward to return to start"
    ],
    commonMistakes: [
      "Rounding back",
      "Bending knees too much",
      "Not hinging at hips",
      "Looking up",
      "Using too much weight"
    ],
    benefits: [
      "Strengthens lower back",
      "Develops hamstrings",
      "Improves hip mobility",
      "Enhances deadlift strength",
      "Builds posterior chain"
    ],
    difficulty: "INTERMEDIATE",
    isCompound: true,
    movementPattern: "HINGE",
    targetMuscles: ["HAMSTRINGS", "BACK"],
    secondaryMuscles: ["GLUTES", "CORE"],
    videoUrl: "https://example.com/good-morning"
  }
];

async function main() {
  console.log('Start seeding exercise library...');
  
  for (const exercise of exercises) {
    const result = await prisma.exerciseLibrary.create({
      data: exercise,
    });
    console.log(`Created exercise: ${result.name}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 