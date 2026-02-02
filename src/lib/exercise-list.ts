// Comprehensive list of common exercises for autocomplete
export const EXERCISE_LIST = [
  // Chest
  'Bench Press',
  'Incline Bench Press',
  'Decline Bench Press',
  'Dumbbell Bench Press',
  'Incline Dumbbell Press',
  'Push-Up',
  'Diamond Push-Up',
  'Wide Push-Up',
  'Dip',
  'Cable Fly',
  'Dumbbell Fly',
  'Machine Chest Press',
  'Pec Deck',

  // Back
  'Deadlift',
  'Barbell Row',
  'Bent Over Row',
  'Dumbbell Row',
  'Pull-Up',
  'Chin-Up',
  'Lat Pulldown',
  'Seated Row',
  'Cable Row',
  'T-Bar Row',
  'Face Pull',
  'Inverted Row',
  'Superman',
  'Back Extension',

  // Shoulders
  'Overhead Press',
  'Military Press',
  'Dumbbell Shoulder Press',
  'Arnold Press',
  'Lateral Raise',
  'Front Raise',
  'Rear Delt Fly',
  'Cable Lateral Raise',
  'Upright Row',
  'Pike Push-Up',
  'Handstand Push-Up',

  // Legs
  'Squat',
  'Back Squat',
  'Front Squat',
  'Goblet Squat',
  'Leg Press',
  'Lunge',
  'Walking Lunge',
  'Bulgarian Split Squat',
  'Romanian Deadlift',
  'Stiff Leg Deadlift',
  'Leg Extension',
  'Leg Curl',
  'Hip Thrust',
  'Glute Bridge',
  'Calf Raise',
  'Step-Up',
  'Box Jump',

  // Arms - Biceps
  'Barbell Curl',
  'Dumbbell Curl',
  'Hammer Curl',
  'Preacher Curl',
  'Incline Curl',
  'Cable Curl',
  'Concentration Curl',

  // Arms - Triceps
  'Tricep Pushdown',
  'Tricep Extension',
  'Overhead Tricep Extension',
  'Skull Crusher',
  'Close Grip Bench Press',
  'Diamond Push-Up',
  'Bench Dip',
  'Tricep Kickback',

  // Core
  'Plank',
  'Side Plank',
  'Dead Bug',
  'Leg Raise',
  'Hanging Leg Raise',
  'Russian Twist',
  'Ab Wheel Rollout',
  'Cable Crunch',
  'Crunch',
  'Bicycle Crunch',
  'Mountain Climber',
  'Hollow Hold',

  // Full Body / Olympic
  'Clean',
  'Power Clean',
  'Snatch',
  'Clean and Jerk',
  'Thruster',
  'Kettlebell Swing',
  'Turkish Get-Up',
  'Burpee',

  // Functional
  'Farmer Carry',
  'Farmer Walk',
  'Sled Push',
  'Sled Pull',
  'Battle Ropes',
  'Box Jump',
  'Med Ball Slam',
  'Wall Ball',

  // Cardio / Conditioning
  'Running',
  'Sprints',
  'Rowing Machine',
  'Assault Bike',
  'Jump Rope',
  'Stair Climber',
  'Elliptical',
  'Cycling',
  'Swimming'
] as const;

export type ExerciseName = typeof EXERCISE_LIST[number];

// Searchable exercise list with lowercase for matching
export function searchExercises(query: string, limit = 8): string[] {
  if (!query || query.length < 2) return [];

  const lower = query.toLowerCase();
  return EXERCISE_LIST
    .filter(ex => ex.toLowerCase().includes(lower))
    .slice(0, limit);
}
