import { Router } from 'express';
import Workout from '../models/Workout.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ workouts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const workout = await Workout.create({
      user: req.userId,
      name: req.body.name || 'Workout',
      exercises: req.body.exercises || [],
      startTime: new Date(),
      status: 'active',
    });
    res.status(201).json({ workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/active', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({ user: req.userId, status: 'active' }).populate('exercises.exercise');
    res.json({ workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.userId });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    if (req.body.exercises) workout.exercises = req.body.exercises;
    if (req.body.name) workout.name = req.body.name;

    await workout.save();
    res.json({ workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/complete', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.userId }).populate('exercises.exercise');
    if (!workout) return res.status(404).json({ message: 'Workout not found' });

    workout.endTime = new Date();
    workout.duration = req.body.duration != null ? req.body.duration : Math.floor((workout.endTime - workout.startTime) / 1000);
    workout.status = 'completed';

    let totalVolume = 0;
    for (const entry of workout.exercises) {
      for (const set of entry.sets) {
        totalVolume += set.reps;
      }
    }
    workout.totalVolume = totalVolume;

    await workout.save();
    res.json({ workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
