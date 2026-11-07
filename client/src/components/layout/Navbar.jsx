import { useState } from 'react';
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useTheme as useMuiTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { toggleColorMode, mode } = useThemeContext();
  const theme = useMuiTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user ? [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Explore', path: '/explore' },
    { text: 'For You', path: '/for-you' },
    { text: 'Watchlist', path: '/watchlist' },
  ] : [
    { text: 'Login', path: '/login' },
    { text: 'Signup', path: '/signup' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        NextWatch
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} component={Link} to={item.path} sx={{ textAlign: 'center', color: 'inherit', textDecoration: 'none' }}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {user && (
          <ListItemButton onClick={handleLogout} sx={{ textAlign: 'center', color: 'inherit' }}>
            <ListItemText primary="Logout" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            NextWatch
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
            {menuItems.map((item) => (
              <Button key={item.text} component={Link} to={item.path} color="inherit">
                {item.text}
              </Button>
            ))}
            {user && (
              <Button onClick={handleLogout} color="inherit">
                Logout
              </Button>
            )}
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

export default Navbar;
