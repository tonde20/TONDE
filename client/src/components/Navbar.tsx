import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  School,
  Home,
  Login,
  PersonAdd,
  Logout,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo et titre */}
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <School sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={() => navigate('/')}
          >
            EduManager
          </Typography>
        </Box>

        {/* Navigation principale */}
        {!isMobile && (
          <Box display="flex" alignItems="center" sx={{ mr: 2 }}>
            <Button
              color="inherit"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{ 
                mx: 1,
                backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Accueil
            </Button>
            <Button
              color="inherit"
              startIcon={<School />}
              onClick={() => navigate('/courses')}
              sx={{ 
                mx: 1,
                backgroundColor: isActive('/courses') ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              Formations
            </Button>
          </Box>
        )}

        {/* Actions utilisateur */}
        {isAuthenticated ? (
          <Box display="flex" alignItems="center">
            {!isMobile && (
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  mr: 1,
                  backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
              >
                {user?.role === 'admin' ? 'Administration' : 'Mon Espace'}
              </Button>
            )}
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                <Dashboard sx={{ mr: 1 }} />
                {user?.role === 'admin' ? 'Administration' : 'Mon Espace'}
              </MenuItem>
              
              {user?.role === 'admin' && (
                <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  Panneau Admin
                </MenuItem>
              )}
              
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <AccountCircle sx={{ mr: 1 }} />
                Mon Profil
              </MenuItem>
              
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box display="flex" alignItems="center">
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{ mr: 1 }}
            >
              Connexion
            </Button>
            <Button
              color="secondary"
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/register')}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              }}
            >
              Inscription
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;