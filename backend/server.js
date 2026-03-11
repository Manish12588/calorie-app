const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ── MongoDB connection ──────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/calorieapp';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => { console.error('❌  MongoDB error:', err); process.exit(1); });

// ── Schema ──────────────────────────────────────────────────────────────────
const profileSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  age:           { type: Number, required: true },
  heightCm:      { type: Number, required: true },
  weightKg:      { type: Number, required: true },
  gender:        { type: String, enum: ['male', 'female'], required: true },
  activityLevel: { type: String, required: true },
  goal:          { type: String, enum: ['fat_loss', 'maintain', 'muscle_gain'], required: true },
  bmr:           Number,
  maintenance:   Number,
  targetCalories: Number,
  protein:       Number,
  carbs:         Number,
  fat:           Number,
  createdAt:     { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', profileSchema);

// ── Calorie Logic ────────────────────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9
};

function calculate(data) {
  const { age, heightCm, weightKg, gender, activityLevel, goal } = data;
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr += gender === 'male' ? 5 : -161;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const maintenance = Math.round(bmr * multiplier);
  let targetCalories;
  if (goal === 'fat_loss')     targetCalories = Math.round(maintenance * 0.80);
  else if (goal === 'muscle_gain') targetCalories = Math.round(maintenance * 1.10);
  else                          targetCalories = maintenance;
  const protein = Math.round((targetCalories * 0.30) / 4);
  const carbs   = Math.round((targetCalories * 0.40) / 4);
  const fat     = Math.round((targetCalories * 0.30) / 9);
  return { bmr: Math.round(bmr), maintenance, targetCalories, protein, carbs, fat };
}

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.post('/api/profiles', async (req, res) => {
  try {
    const calc = calculate(req.body);
    const profile = new Profile({ ...req.body, ...calc });
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/profiles', async (_, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 }).limit(20);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/profiles/:id', async (req, res) => {
  try {
    await Profile.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀  Backend running on port ${PORT}`));
