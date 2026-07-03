import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['strength', 'cardio', 'flexibility', 'bodyweight'], default: 'strength' },
  muscleGroup: { type: String, default: '' },
  equipment: { type: String, default: 'none' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Exercise', exerciseSchema);
