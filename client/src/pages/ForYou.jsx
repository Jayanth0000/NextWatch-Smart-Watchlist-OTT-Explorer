import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MovieCard from '../components/common/MovieCard';
import api from '../api/axios';

const ForYou = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/explore/smart-recommendations');
      setRecommendations(res.data.results);
      setIsFallback(res.data.fallback);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const renderLimit = Math.floor(recommendations.length / 6) * 6;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          For You
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Intelligently curated media based on your highest-rated Vault items.
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {isFallback && (
            <Typography variant="subtitle1" color="warning.main" sx={{ bgcolor: 'rgba(237, 108, 2, 0.1)', p: 2, borderRadius: 2 }}>
              We need more data to build your algorithm! For now, here are trending titles. Rate more media in your Vault to train the engine.
            </Typography>
          )}

          {recommendations.length > 0 ? (
            <Grid container spacing={2}>
              {recommendations.slice(0, renderLimit).map((item, index) => (
                <Grid item key={`${item.id}-${index}`} xs={6} sm={4} md={3} lg={2}>
                  <MovieCard item={item} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="text.secondary">No recommendations could be generated.</Typography>
          )}

          {renderLimit > 0 && !isFallback && (
            <Button 
              variant="outlined" 
              onClick={fetchRecommendations} 
              startIcon={<AutorenewIcon />}
              sx={{ 
                alignSelf: 'center', 
                mx: 'auto', 
                my: 2, 
                px: 6, 
                py: 1.5, 
                borderRadius: 4,
                borderColor: 'rgba(0, 229, 255, 0.3)',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(0, 229, 255, 0.05)',
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)'
                }
              }}
            >
              Refresh Algorithm
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ForYou;
