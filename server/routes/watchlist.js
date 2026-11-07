import express from 'express';
import axios from 'axios';
import WatchItem from '../models/WatchItem.js';
import auth from '../middleware/auth.js';

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3'
});

const router = express.Router();

// Get all watch items for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const items = await WatchItem.find({ user: req.user }).sort({ addedAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const items = await WatchItem.find({ user: req.user }).sort({ addedAt: -1 });
    
    const stats = {
      total: items.length,
      completed: items.filter(i => i.status === 'completed').length,
      watching: items.filter(i => i.status === 'watching').length,
    };

    // Calculate Personal Average
    const ratedItems = items.filter(i => i.rating > 0);
    const averageRating = ratedItems.length > 0 
      ? (ratedItems.reduce((sum, i) => sum + i.rating, 0) / ratedItems.length).toFixed(1)
      : 0;
    
    // Top rated items by user
    const topRated = [...items].filter(i => i.rating > 0).sort((a,b) => b.rating - a.rating).slice(0, 6);

    // Active Tracker Hero Item (Most recent watching, or recently added plan_to_watch)
    let heroItem = items.find(i => i.status === 'watching') || items.find(i => i.status === 'plan_to_watch');
    
    if (heroItem) {
      try {
        const detailRes = await tmdbApi.get(`/${heroItem.type}/${heroItem.tmdbId}`, { params: { api_key: process.env.TMDB_API_KEY } });
        // Attach the high-res cinematic backdrop
        heroItem = { ...heroItem.toObject(), backdropPath: detailRes.data.backdrop_path, overview: detailRes.data.overview };
      } catch (e) {
        console.error('Quiet fail on hero backdrop');
      }
    }

    res.json({ stats, topRated, averageRating, heroItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new item
router.post('/', auth, async (req, res) => {
  try {
    const { tmdbId, title, posterPath, type, status, rating, review } = req.body;

    const existingItem = await WatchItem.findOne({ user: req.user, tmdbId });
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in watchlist' });
    }

    // Smart Watchlist: Automatically fetch exact runtime from TMDB to calculate life-hours
    let exactRuntime = 0;
    try {
      const detailRes = await tmdbApi.get(`/${type}/${tmdbId}`, { params: { api_key: process.env.TMDB_API_KEY } });
      exactRuntime = type === 'movie' ? (detailRes.data.runtime || 0) : ((detailRes.data.episode_run_time?.[0] || 45) * (detailRes.data.number_of_episodes || 1));
    } catch (e) {
      console.error('Quiet fail on extracting runtime', e.message);
    }

    const newItem = new WatchItem({
      user: req.user,
      tmdbId,
      title,
      posterPath,
      type,
      status: status || 'plan_to_watch',
      rating,
      review,
      runtime: exactRuntime
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item (e.g. change status, rating)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, rating, review } = req.body;
    
    const item = await WatchItem.findOne({ _id: req.params.id, user: req.user });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (status) item.status = status;
    if (rating !== undefined) item.rating = rating;
    if (review !== undefined) item.review = review;

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await WatchItem.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item removed from watchlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
