import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Paper, Divider } from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import MovieCard from '../components/common/MovieCard';
import api from '../api/axios';

const Watchlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streamingAlerts, setStreamingAlerts] = useState({});

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/watchlist');
      setItems(res.data);
      checkStreamingAlerts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const checkStreamingAlerts = async (allItems) => {
    // Only check alerts for Plan to Watch to save API calls
    const planItems = allItems.filter(i => i.status === 'plan_to_watch');
    
    planItems.forEach(async (item) => {
      try {
        const res = await api.get(`/explore/details/${item.type}/${item.tmdbId}`);
        const providers = res.data?.['watch/providers']?.results;
        const inStream = providers?.['IN']?.flatrate;
        
        if (inStream) {
          setStreamingAlerts(prev => ({ ...prev, [item.tmdbId]: true }));
        }
      } catch (e) {
        console.error('Quiet fail on stream check');
      }
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const watching = items.filter(i => i.status === 'watching');
  const planToWatch = items.filter(i => i.status === 'plan_to_watch');
  const completed = items.filter(i => i.status === 'completed' || i.status === 'dropped');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>NextWatch Queue</Typography>
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />
      ) : items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No items found in your watchlist. Check out the "For You" page to add some!
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          
          {/* Priority Section: Watching */}
          {watching.length > 0 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ec4899', animation: 'pulse 2s infinite' }} />
                Currently Watching Priority
              </Typography>
              <Grid container spacing={3}>
                {watching.map((item) => (
                  <Grid item key={item._id} xs={6} sm={4} md={3} lg={2}>
                    <MovieCard item={item} isWatchlist={true} onUpdate={fetchItems} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Queue Section: Plan to Watch */}
          {planToWatch.length > 0 && (
            <Box>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>The Queue (Plan to Watch)</Typography>
              <Grid container spacing={3}>
                {planToWatch.map((item) => (
                  <Grid item key={item._id} xs={6} sm={4} md={3} lg={2} sx={{ position: 'relative' }}>
                    {streamingAlerts[item.tmdbId] && (
                      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10, bgcolor: 'success.main', color: 'white', px: 2, py: 0.5, borderRadius: 2, fontWeight: 'bold', boxShadow: 3, transform: 'rotate(5deg)' }}>
                        🚨 Streaming Now!
                      </Box>
                    )}
                    <MovieCard item={item} isWatchlist={true} onUpdate={fetchItems} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Archive Section: Completed/Dropped */}
          {completed.length > 0 && (
            <Box sx={{ opacity: 0.6, '&:hover': { opacity: 1 }, transition: '0.3s' }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: 'text.secondary' }}>Archive</Typography>
              <Grid container spacing={3}>
                {completed.map((item) => (
                  <Grid item key={item._id} xs={6} sm={4} md={3} lg={2}>
                    <MovieCard item={item} isWatchlist={true} onUpdate={fetchItems} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

        </Box>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(236, 72, 153, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
        }
      `}</style>
    </Box>
  );
};

export default Watchlist;
