import { useEffect, useState } from 'react';
import { Typography, Grid, Paper, Box, CircularProgress, Button, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ListAltIcon from '@mui/icons-material/ListAlt';
import api from '../api/axios';
import MovieCard from '../components/common/MovieCard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/watchlist/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteHero = async (id) => {
    try {
      await api.put(`/watchlist/${id}`, { status: 'completed' });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  const completionRate = data?.stats?.total > 0 
    ? Math.round((data.stats.completed / data.stats.total) * 100) 
    : 0;

  const getBackdropUrl = (path) => path ? `https://image.tmdb.org/t/p/w1280${path}` : '';

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Home Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ opacity: 0.6 }}>
          / {user?.name}
        </Typography>
      </Box>

      {/* Active Tracker Hero Widget */}
      {data?.heroItem && (
        <Box 
          sx={{ 
            position: 'relative', 
            width: '100%', 
            minHeight: { xs: 300, md: 400 }, 
            borderRadius: 3, 
            overflow: 'hidden', 
            mb: 6,
            backgroundImage: `url(${getBackdropUrl(data.heroItem.backdropPath)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 12px 40px rgba(0, 229, 255, 0.15)'
          }}
        >
          {/* Glassmorphism Gradient Overlay */}
          <Box 
            sx={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to right, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 60%, transparent 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, md: 6 }
            }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', letterSpacing: 2 }}>
              {data.heroItem.status === 'watching' ? '🔴 ACTIVE TRACKER' : '🟡 QUEUED NEXT'}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 1, mb: 2, maxWidth: '600px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {data.heroItem.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '500px', mb: 4, display: { xs: 'none', sm: 'block' } }}>
              {data.heroItem.overview}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleCompleteHero(data.heroItem._id)}
              sx={{ width: 'fit-content', px: 4, py: 1.5, fontSize: '1rem' }}
            >
              Mark as Completed
            </Button>
          </Box>
        </Box>
      )}

      {/* Analytics Row */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, height: '100%', bgcolor: 'background.paper', borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
              Collection Completion Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {completionRate}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionRate} 
              sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }} 
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{ p: 4, height: '100%', bgcolor: 'background.paper', borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
              Pending Titles
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <ListAltIcon sx={{ color: '#00e5ff', fontSize: 40 }} />
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {data?.stats ? (data.stats.total - data.stats.completed) : 0}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Titles waiting in your queue
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{ p: 4, height: '100%', bgcolor: 'background.paper', borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
              Total Saved
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mt: 2 }}>
              {data?.stats?.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Items tracked across all statuses
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Rated Grid */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Your Highest Rated</Typography>
        <Box sx={{ height: 1, flexGrow: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>

      {data?.topRated?.length > 0 ? (
        <Grid container spacing={2}>
          {data.topRated.map((item) => (
            <Grid item key={item._id} xs={6} sm={4} md={3} lg={2}>
               <MovieCard item={item} isWatchlist={true} onUpdate={fetchDashboard} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>You haven't rated any items yet. Rate items in your Watchlist to start tracking your critical taste.</Typography>
      )}
    </Box>
  );
};

export default Dashboard;
