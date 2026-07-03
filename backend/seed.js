import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from './models/Exercise.js';

dotenv.config();

const exercises = [
  { name: 'Standard Push Up', category: 'bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Classic push up targeting chest, shoulders, and triceps. Keep body in a straight line.' },
  { name: 'Diamond Push Up', category: 'bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Close-grip push up emphasizing triceps and inner chest.' },
  { name: 'Decline Push Up', category: 'bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Feet elevated push up targeting upper chest and shoulders.' },
  { name: 'Archer Push Up', category: 'bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'advanced', description: 'Unilateral push up variation for unilateral chest and arm strength.' },
  { name: 'Pull Up', category: 'bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Compound pulling movement targeting lats, biceps, and upper back.' },
  { name: 'Chin Up', category: 'bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Underhand grip pull up emphasizing biceps and lower lats.' },
  { name: 'Wide Pull Up', category: 'bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Wide grip pull up for outer lat width and V-taper development.' },
  { name: 'Australian Row', category: 'bodyweight', muscleGroup: 'Back', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Horizontal pulling movement using a low bar. Great for building back strength.' },
  { name: 'Bodyweight Squat', category: 'bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Foundation leg exercise. Keep chest up, knees tracking over toes.' },
  { name: 'Bulgarian Split Squat', category: 'bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Rear foot elevated split squat for unilateral leg development.' },
  { name: 'Walking Lunge', category: 'bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Dynamic lunge pattern targeting quads, glutes, and balance.' },
  { name: 'Pistol Squat', category: 'bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'advanced', description: 'Single leg squat requiring mobility, balance, and leg strength.' },
  { name: 'Glute Bridge', category: 'bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Hip thrust movement targeting glutes and core stability.' },
  { name: 'Calf Raise', category: 'bodyweight', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Standing bodyweight calf raise for lower leg development.' },
  { name: 'Parallel Bar Dip', category: 'bodyweight', muscleGroup: 'Chest', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Bodyweight dip targeting lower chest, triceps, and shoulders.' },
  { name: 'Tricep Dip', category: 'bodyweight', muscleGroup: 'Arms', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Chair or bench dip isolating the triceps muscles.' },
  { name: 'Plank', category: 'bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Isometric core exercise. Hold a straight line from head to heels.' },
  { name: 'Side Plank', category: 'bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Lateral core stability exercise targeting obliques.' },
  { name: 'Leg Raise', category: 'bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Lying leg raise targeting lower abs and hip flexors.' },
  { name: 'Hanging Knee Raise', category: 'bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Hanging core exercise for lower ab development.' },
  { name: 'Russian Twist', category: 'bodyweight', muscleGroup: 'Core', equipment: 'Bodyweight', difficulty: 'beginner', description: 'Rotational core exercise targeting obliques.' },
  { name: 'Mountain Climber', category: 'cardio', muscleGroup: 'Full Body', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Dynamic full body cardio exercise in plank position.' },
  { name: 'Burpee', category: 'cardio', muscleGroup: 'Full Body', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Full body explosive movement combining squat, push up, and jump.' },
  { name: 'Jump Squat', category: 'cardio', muscleGroup: 'Legs', equipment: 'Bodyweight', difficulty: 'intermediate', description: 'Plyometric squat for explosive power and cardio conditioning.' },
  { name: 'Handstand Hold', category: 'bodyweight', muscleGroup: 'Shoulders', equipment: 'Bodyweight', difficulty: 'advanced', description: 'Inverted hold building shoulder strength, balance, and body control.' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Exercise.deleteMany({});
    await Exercise.insertMany(exercises);
    console.log(`Seeded ${exercises.length} exercises`);

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
