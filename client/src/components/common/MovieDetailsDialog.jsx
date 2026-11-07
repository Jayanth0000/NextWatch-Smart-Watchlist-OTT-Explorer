import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, CircularProgress, Chip, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import api from '../../api/axios';

const MovieDetailsDialog = ({ open, onClose, tmdbId, type, basicTitle }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !tmdbId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await api.get(`/explore/details/${type}/${tmdbId}`);
        setDetails(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [open, tmdbId, type]);

  const inProviders = details?.['watch/providers']?.results?.['IN']?.flatrate || [];
  const imdbId = details?.external_ids?.imdb_id;
  
  const backdropUrl = details?.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` 
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        {backdropUrl && (
          <Box
            sx={{
              height: 200,
              backgroundImage: `url(${backdropUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box sx={{ width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }} />
          </Box>
        )}
        <Typography variant="h5" sx={{ position: backdropUrl ? 'absolute' : 'relative', bottom: 16, left: 24, right: 48, color: backdropUrl ? 'white' : 'text.primary', fontWeight: 'bold' }}>
          {details?.title || details?.name || basicTitle}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: backdropUrl ? 'white' : 'grey.500', bgcolor: backdropUrl ? 'rgba(0,0,0,0.5)' : 'transparent', '&:hover': { bgcolor: backdropUrl ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.1)' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: backdropUrl ? 0 : 2 }}>
        {loading ? (
          <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
        ) : error ? (
          <Typography color="error">Failed to load details.</Typography>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Chip icon={<StarIcon sx={{ color: '#fbbf24 !important' }} />} label={`${details.vote_average?.toFixed(1) || 'N/A'}/10`} sx={{ fontWeight: 'bold' }} />
              <Typography variant="body2" color="text.secondary">
                {details.release_date || details.first_air_date} • {details.runtime ? `${details.runtime} mins` : `${details.number_of_seasons} Seasons`}
              </Typography>
            </Box>

            <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
              {details.overview || 'No description available for this title.'}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Genres</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {details.genres?.map(g => (
                  <Chip key={g.id} label={g.name} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>

            {inProviders.length > 0 && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Available to Stream (India)</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  {inProviders.filter((v,i,a)=>a.findIndex(t=>(t.provider_id === v.provider_id))===i).map(provider => (
                    <Box key={provider.provider_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <img src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`} alt={provider.provider_name} width="32" style={{ borderRadius: '8px' }} />
                      <Typography variant="caption">{provider.provider_name}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {imdbId && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => window.open(`https://www.imdb.com/title/${imdbId}/`, '_blank')}
              >
                View on Official IMDB
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MovieDetailsDialog;
