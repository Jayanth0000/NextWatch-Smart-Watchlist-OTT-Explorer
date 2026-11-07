import mongoose from 'mongoose';

const watchItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tmdbId: { type: String, required: true },
  title: { type: String, required: true },
  posterPath: { type: String },
  type: { type: String, enum: ['movie', 'tv'], required: true },
  status: { type: String, enum: ['plan_to_watch', 'watching', 'completed', 'dropped'], default: 'plan_to_watch' },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  review: { type: String, default: '' },
  runtime: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now }
});

export default mongoose.model('WatchItem', watchItemSchema);
