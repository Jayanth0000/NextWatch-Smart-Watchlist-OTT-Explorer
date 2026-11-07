import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import WatchItem from '../models/WatchItem.js';

const router = express.Router();

const tmdbApi = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    // Empty key initialization, will inject from env per request
  }
});

// Middleware to inject API key and handle missing key
router.use((req, res, next) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey === 'YOUR_TMDB_API_KEY') {
    return res.status(500).json({ error: 'TMDB API key is missing. Add it to backend .env file.' });
  }
  
  req.apiKey = apiKey;
  next();
});

// Get trending items
router.get('/trending', async (req, res) => {
  try {
    const { media_type = 'all', time_window = 'day', page = 1 } = req.query;
    
    const response = await tmdbApi.get(`/trending/${media_type}/${time_window}`, {
      params: { api_key: req.apiKey, page }
    });
    
    res.json({ results: response.data.results, totalPages: response.data.total_pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search movies and tv shows
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const response = await tmdbApi.get(`/search/multi`, { params: { api_key: req.apiKey, query, page } });
    
    res.json({ results: response.data.results, totalPages: response.data.total_pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get providers (OTT Availability) for a specific item
router.get('/:type/:id/providers', async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type !== 'movie' && type !== 'tv') {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const response = await tmdbApi.get(`/${type}/${id}/watch/providers`, {
      params: { api_key: req.apiKey }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get full details (description, IMDB, providers)
router.get('/details/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    if (type !== 'movie' && type !== 'tv') {
      return res.status(400).json({ error: 'Invalid media type' });
    }

    const response = await tmdbApi.get(`/${type}/${id}`, {
      params: { 
        api_key: req.apiKey,
        append_to_response: 'watch/providers,external_ids'
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Recommendation Engine
router.get('/smart-recommendations', auth, async (req, res) => {
  try {
    // 1. Fetch user's entire watchlist
    const userItems = await WatchItem.find({ user: req.user });
    const userItemIds = new Set(userItems.map(item => item.tmdbId));
    
    // 2. Identify Favorites (Highest rated or completed recently)
    const favorites = [...userItems]
      .filter(i => i.rating >= 8 || i.status === 'completed')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3); // Take top 3 seeds

    if (favorites.length === 0) {
      // Fallback if no data: Return Global Trending
      const [page1, page2] = await Promise.all([
        tmdbApi.get(`/trending/all/week`, { params: { api_key: req.apiKey, page: 1 } }),
        tmdbApi.get(`/trending/all/week`, { params: { api_key: req.apiKey, page: 2 } })
      ]);
      const combined = [...page1.data.results, ...page2.data.results];
      const unwatchedTrending = combined.filter(item => !userItemIds.has(item.id.toString()));
      return res.json({ fallback: true, results: unwatchedTrending.slice(0, 40) });
    }

    let rawRecommendations = [];
    
    // 3. Fetch Relatives from TMDB
    for (const seed of favorites) {
      const response = await tmdbApi.get(`/${seed.type}/${seed.tmdbId}/recommendations`, {
        params: { api_key: req.apiKey }
      });
      rawRecommendations = [...rawRecommendations, ...response.data.results];
    }

    // 4. Filter, Deduplicate, and clean
    const uniqueMap = new Map();
    rawRecommendations.forEach(item => {
      // Filter out items already in the user's watchlist
      if (!userItemIds.has(item.id.toString()) && !uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    // Shuffle array for dynamic feel
    const finalRecs = Array.from(uniqueMap.values()).sort(() => 0.5 - Math.random()).slice(0, 40);

    res.json({ fallback: false, results: finalRecs, seeds: favorites.map(f => f.title) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
