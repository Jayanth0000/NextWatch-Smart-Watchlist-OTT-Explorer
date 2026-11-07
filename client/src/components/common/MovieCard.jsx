import { useState } from 'react';
import { Card, Typography, Button, Chip, Box, Snackbar, Alert, Select, MenuItem, Rating, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../../api/axios';
import MovieDetailsDialog from './MovieDetailsDialog';

const MovieCard = ({ item, isWatchlist = false, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // TMDB paths
  const posterBase = 'https://image.tmdb.org/t/p/w500';
  const posterUrl = item.posterPath || item.poster_path 
    ? `${posterBase}${item.posterPath || item.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const title = item.title || item.name;
  const type = isWatchlist ? item.type : (item.media_type || (item.name ? 'tv' : 'movie'));

  const handleAdd = async (selectedStatus) => {
    setLoading(true);
    try {
      await api.post('/watchlist', {
        tmdbId: item.id.toString(),
        title: title,
        posterPath: item.poster_path,
        type: type,
        status: selectedStatus || 'plan_to_watch'
      });
      setMessage('Added to Watchlist');
      setOpen(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error adding item');
      setOpen(true);
    }
    setLoading(false);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await api.delete(`/watchlist/${item._id}`);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    try {
      await api.put(`/watchlist/${item._id}`, { status: e.target.value });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingChange = async (event, newValue) => {
    event.stopPropagation();
    try {
      await api.put(`/watchlist/${item._id}`, { rating: newValue });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        bgcolor: 'transparent',
        boxShadow: 'none',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover .glass-overlay': {
          opacity: 1,
        },
        '&:hover .poster-img': {
          transform: 'scale(1.05)'
        }
      }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: '2/3', 
          overflow: 'hidden',
          borderRadius: 2,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }}
        onClick={() => setDetailsOpen(true)}
      >
        <img 
          src={posterUrl} 
          alt={title} 
          className="poster-img"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
        />
        
        {/* Glassmorphism Hover Overlay */}
        <Box 
          className="glass-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(5, 5, 5, 0.7)',
            backdropFilter: 'blur(4px)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 2,
            gap: 1.5
          }}
        >
          {isWatchlist ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }} onClick={(e) => e.stopPropagation()}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Select 
                  size="small" 
                  value={item.status} 
                  onChange={handleStatusChange} 
                  sx={{ height: 32, fontSize: '0.75rem', borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, '& .MuiSelect-icon': { color: 'white' } }}
                >
                  <MenuItem value="plan_to_watch">Plan</MenuItem>
                  <MenuItem value="watching">Watching</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="dropped">Dropped</MenuItem>
                </Select>
                <IconButton size="small" onClick={handleRemove} disabled={loading} sx={{ color: 'error.main', bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)', p: 0.5, borderRadius: 2 }}>
                 <Rating value={item.rating || 0} max={10} onChange={handleRatingChange} size="small" sx={{ '& .MuiRating-iconFilled': { color: '#00e5ff' } }} />
              </Box>
            </Box>
          ) : (
            <Box onClick={(e) => e.stopPropagation()}>
               <Select
                value=""
                displayEmpty
                size="small"
                onChange={(e) => handleAdd(e.target.value)}
                disabled={loading}
                sx={{ 
                  width: '100%', 
                  borderRadius: 2, 
                  height: 36, 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  '& .MuiSelect-icon': { color: 'inherit' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  boxShadow: '0 4px 14px rgba(0, 229, 255, 0.4)',
                  '&:hover': { bgcolor: 'primary.dark' },
                  fontSize: '0.85rem'
                }}
                renderValue={(selected) => {
                  return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><AddIcon fontSize="small" /> Add to List</span>;
                }}
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}>+ Add to List</MenuItem>
                <MenuItem value="plan_to_watch">📝 Plan to Watch</MenuItem>
                <MenuItem value="watching">👀 Currently Watching</MenuItem>
                <MenuItem value="completed">✅ Already Completed</MenuItem>
              </Select>
            </Box>
          )}
        </Box>
      </Box>

      {/* Metadata visually disconnected from card boundaries */}
      <Box sx={{ pt: 1.5, pb: 0.5, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" component="div" noWrap title={title} sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {type}
          </Typography>
          {isWatchlist && item.status && (
            <Chip 
              label={item.status.replace('_', ' ').toUpperCase()} 
              size="small" 
              sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: item.status === 'completed' ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 42, 109, 0.2)', color: item.status === 'completed' ? '#00e5ff' : '#ff2a6d' }}
            />
          )}
        </Box>
      </Box>

      <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ width: '100%', bgcolor: 'background.paper', color: 'primary.main' }}>
          {message}
        </Alert>
      </Snackbar>
      <MovieDetailsDialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        tmdbId={item.id || item.tmdbId} 
        type={type} 
        basicTitle={title} 
      />
    </Card>
  );
};

export default MovieCard;
