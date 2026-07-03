import { Router } from 'express';
import Exercise from '../models/Exercise.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const { search, category, muscleGroup } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) query.category = category;
    if (muscleGroup) query.muscleGroup = { $regex: muscleGroup, $options: 'i' };

    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json({ exercise });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
