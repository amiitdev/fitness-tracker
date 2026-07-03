import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
});

const exerciseEntrySchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  exerciseName: { type: String, required: true },
  sets: [setSchema],
  notes: { type: String, default: '' },
});

const workoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Workout' },
  exercises: [exerciseEntrySchema],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Workout', workoutSchema);
