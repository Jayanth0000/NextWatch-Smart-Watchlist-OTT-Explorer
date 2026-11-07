import { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Typography, CircularProgress, ToggleButtonGroup, ToggleButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import MovieCard from '../components/common/MovieCard';
import api from '../api/axios';

const Explore = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrending = async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const res = await api.get(`/explore/trending?page=${pageNum}`);
      if (pageNum === 1) {
        setResults(res.data.results);
      } else {
        setResults(prev => [...prev, ...res.data.results]);
      }
      setHasMore(pageNum < (res.data.totalPages || 50));
    } catch (err) {
      console.error(err);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  const executeSearch = async (pageNum = 1, searchQuery) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const res = await api.get('/explore/search', { params: { query: searchQuery, page: pageNum } });
      if (pageNum === 1) {
        setResults(res.data.results);
      } else {
        setResults(prev => [...prev, ...res.data.results]);
      }
      setHasMore(pageNum < (res.data.totalPages || 1));
    } catch (err) {
      console.error(err);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchTrending(1);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    if (!query) return fetchTrending(1);
    executeSearch(1, query);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (query) {
      executeSearch(nextPage, query);
    } else {
      fetchTrending(nextPage);
    }
  };

  // Math algorithm to guarantee symmetrical 6-item cinematic rows
  const renderLimit = Math.floor(results.length / 6) * 6;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>Explore Platform</Typography>
      
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField 
          label="Search Movies & Series" 
          variant="outlined" 
          fullWidth 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" type="submit" startIcon={<SearchIcon />} size="large" sx={{ px: 4 }}>
          Search
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {query ? 'Search Results' : 'Trending Now'}
        </Typography>
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 8 }} />
      ) : results.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>No data found.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Grid container spacing={2}>
            {results.slice(0, renderLimit).map((item, index) => (
              <Grid item key={`${item.id}-${index}`} xs={6} sm={4} md={3} lg={2}>
                <MovieCard item={item} />
              </Grid>
            ))}
          </Grid>
          
          {hasMore && renderLimit > 0 && (
            <Button 
              variant="outlined" 
              onClick={handleLoadMore} 
              disabled={loadingMore}
              startIcon={loadingMore ? <CircularProgress size={20} /> : <AutorenewIcon />}
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
              {loadingMore ? 'Loading Data...' : 'Load More Titles'}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Explore;
