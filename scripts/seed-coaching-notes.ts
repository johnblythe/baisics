/**
 * Seed coaching notes for common exercises
 * Run with: npx tsx scripts/seed-coaching-notes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COACHING_DATA: Record<string, string> = {
  // Compound Lower Body
  'Barbell Back Squat': `FORM: Chest up, knees track toes, depth to parallel or below. Brace core before descent. Drive through full foot.
MISTAKES: Knees caving inward, excessive forward lean, shallow depth, bouncing at bottom, losing core tension.
EASIER: Goblet squat, box squat, leg press.
HARDER: Pause squat, tempo squat (3-1-3), front squat.`,

  'Barbell Deadlift': `FORM: Bar over mid-foot, grip just outside legs. Push floor away, keep bar close. Lock hips and knees together at top.
MISTAKES: Rounding lower back, bar drifting forward, jerking the weight, hyperextending at top.
EASIER: Trap bar deadlift, Romanian deadlift, rack pulls.
HARDER: Deficit deadlift, pause deadlift, snatch-grip deadlift.`,

  'Romanian Deadlift': `FORM: Soft knee bend, hinge at hips pushing butt back. Feel hamstring stretch. Keep bar close to legs.
MISTAKES: Bending knees too much (turns into squat), rounding back, going too deep, not feeling hamstrings.
EASIER: Single-leg RDL with support, dumbbell RDL.
HARDER: Single-leg RDL, deficit RDL, slow eccentric (4 sec down).`,

  'Barbell Lunge': `FORM: Step far enough for 90° at both knees. Front knee tracks toes, back knee kisses ground. Torso upright.
MISTAKES: Front knee caving, short steps, leaning forward, pushing off back foot.
EASIER: Stationary lunge, split squat, assisted lunge.
HARDER: Walking lunge, reverse lunge, deficit lunge.`,

  'Leg Press': `FORM: Feet shoulder-width, toes slightly out. Lower until thighs near chest without butt lifting. Push through heels.
MISTAKES: Butt lifting off pad (lower back rounding), locking knees hard, partial reps, bouncing.
EASIER: Reduce weight, higher foot position.
HARDER: Single-leg press, pause at bottom, slower tempo.`,

  // Compound Upper Body - Push
  'Barbell Bench Press': `FORM: Retract shoulder blades, arch upper back, feet flat. Bar touches mid-chest. Drive through feet.
MISTAKES: Flaring elbows 90°, bouncing bar, losing shoulder retraction, uneven pressing.
EASIER: Dumbbell bench, machine chest press, push-ups.
HARDER: Pause bench, close-grip bench, incline bench.`,

  'Overhead Press': `FORM: Grip just outside shoulders, elbows slightly forward. Press straight up, head through at top. Squeeze glutes.
MISTAKES: Excessive back arch, pressing in front of face, not locking out, loose core.
EASIER: Seated dumbbell press, machine shoulder press.
HARDER: Push press, strict press with pause, Z-press.`,

  'Dip': `FORM: Lean slightly forward for chest emphasis. Lower until shoulders below elbows. Keep core tight.
MISTAKES: Going too deep (shoulder strain), flaring elbows, swinging, not going deep enough.
EASIER: Bench dips, assisted dip machine.
HARDER: Weighted dip, ring dips, slow eccentric.`,

  // Compound Upper Body - Pull
  'Barbell Row': `FORM: Hinge to ~45°, bar hangs at arms length. Pull to lower chest/upper abs. Squeeze shoulder blades.
MISTAKES: Using momentum, not pulling high enough, rounded back, too upright.
EASIER: Cable row, dumbbell row with support, machine row.
HARDER: Pendlay row (from floor each rep), pause at top.`,

  'Pull-up': `FORM: Dead hang start, pull until chin over bar. Lead with chest, squeeze lats at top.
MISTAKES: Kipping/swinging, partial reps, not going to dead hang, over-using biceps.
EASIER: Assisted pull-ups, lat pulldown, negative pull-ups.
HARDER: Weighted pull-ups, chest-to-bar, L-sit pull-ups.`,

  'Lat Pulldown': `FORM: Slight lean back, pull bar to upper chest. Focus on driving elbows down and back.
MISTAKES: Leaning too far back, pulling to stomach, using momentum, incomplete extension.
EASIER: Assisted machine, resistance band pulldowns.
HARDER: Single-arm pulldown, pause at bottom, slow eccentric.`,

  // Isolation
  'Barbell Curl': `FORM: Elbows pinned to sides, control the weight up and down. Full extension at bottom.
MISTAKES: Swinging weight, elbows drifting forward, incomplete range, ego lifting.
EASIER: Cable curl, incline dumbbell curl.
HARDER: Strict curl against wall, slow eccentric, 21s.`,

  'Tricep Pushdown': `FORM: Elbows pinned at sides, push down until full lockout. Control back up.
MISTAKES: Elbows flaring or moving, leaning too far over, partial reps.
EASIER: Lighter weight, single-arm.
HARDER: Overhead extension, pause at contraction, drop sets.`,

  'Plank': `FORM: Straight line from head to heels. Squeeze glutes, brace abs like expecting a punch.
MISTAKES: Hips sagging, butt too high, holding breath, looking up.
EASIER: Knee plank, incline plank on bench.
HARDER: Long-lever plank, plank with shoulder taps, weighted plank.`,

  'Cable Fly': `FORM: Slight elbow bend (fixed), squeeze chest to bring handles together. Control the stretch.
MISTAKES: Bending elbows too much (turns into press), going too heavy, not controlling eccentric.
EASIER: Pec deck machine, lighter weight with pause.
HARDER: Low-to-high cable fly, pause at contraction.`,
};

async function main() {
  console.log('Seeding coaching notes for exercises...\n');

  for (const [exerciseName, coachingNotes] of Object.entries(COACHING_DATA)) {
    try {
      // Try exact match first
      let exercise = await prisma.exerciseLibrary.findUnique({
        where: { name: exerciseName },
      });

      // If not found, try case-insensitive search
      if (!exercise) {
        exercise = await prisma.exerciseLibrary.findFirst({
          where: { name: { contains: exerciseName, mode: 'insensitive' } },
        });
      }

      if (exercise) {
        await prisma.exerciseLibrary.update({
          where: { id: exercise.id },
          data: { coachingNotes },
        });
        console.log(`✓ Updated: ${exercise.name}`);
      } else {
        console.log(`✗ Not found: ${exerciseName}`);
      }
    } catch (error) {
      console.error(`Error updating ${exerciseName}:`, error);
    }
  }

  console.log('\nDone!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
