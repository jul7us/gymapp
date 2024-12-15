'use client';
import { Box, List, ListItem, ListItemText, Switch, Typography, Drawer } from '@mui/material';

interface SidebarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  handleNavigation: (path: string) => void;
}

export default function Sidebar({ darkMode, setDarkMode, handleNavigation }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: '100%', sm: 240 },
        backgroundColor: darkMode ? '#1e1e1e' : '#fff',
        borderRight: { xs: 'none', sm: '1px solid rgba(0, 0, 0, 0.12)' },
        position: { xs: 'static', sm: 'sticky' },
        top: 0,
        height: { xs: 'auto', sm: '100vh' },
        overflow: 'auto',
      }}
    >
      <List>
        {/* Home Link */}
        <ListItem
          component="button"
          onClick={() => handleNavigation('/')}
          sx={{
            backgroundColor: window.location.pathname === '/' ? (darkMode ? '#333' : '#000000') : 'transparent',
            color: window.location.pathname === '/' ? '#ffffff' : darkMode ? '#ffffff' : '#000000',
            marginBottom: '10px',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          <ListItemText primary="Home" />
        </ListItem>

        {/* Spacer */}
        <Box sx={{ marginBottom: '10px' }} />

        {/* Push, Pull, Legs Links */}
        <ListItem
          component="button"
          onClick={() => handleNavigation('/push')}
          sx={{
            backgroundColor: window.location.pathname === '/push' ? (darkMode ? '#333' : '#000000') : 'transparent',
            color: window.location.pathname === '/push' ? '#ffffff' : darkMode ? '#ffffff' : '#000000',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          <ListItemText primary="Push" />
        </ListItem>
        <ListItem
          component="button"
          onClick={() => handleNavigation('/pull')}
          sx={{
            backgroundColor: window.location.pathname === '/pull' ? (darkMode ? '#333' : '#000000') : 'transparent',
            color: window.location.pathname === '/pull' ? '#ffffff' : darkMode ? '#ffffff' : '#000000',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          <ListItemText primary="Pull" />
        </ListItem>
        <ListItem
          component="button"
          onClick={() => handleNavigation('/legs')}
          sx={{
            backgroundColor: window.location.pathname === '/legs' ? (darkMode ? '#333' : '#000000') : 'transparent',
            color: window.location.pathname === '/legs' ? '#ffffff' : darkMode ? '#ffffff' : '#000000',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          <ListItemText primary="Legs" />
        </ListItem>

        {/* Spacer */}
        <Box sx={{ marginBottom: '10px', marginTop: '10px' }} />

        {/* Data Link */}
        <ListItem
          component="button"
          onClick={() => handleNavigation('/data')}
          sx={{
            backgroundColor: window.location.pathname === '/data' ? (darkMode ? '#333' : '#000000') : 'transparent',
            color: window.location.pathname === '/data' ? '#ffffff' : darkMode ? '#ffffff' : '#000000',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          <ListItemText primary="Data" />
        </ListItem>

        {/* Workout Split Link */}
        <ListItem
          component="button"
          onClick={() => handleNavigation('/config')}
          sx={{
            backgroundColor: window.location.pathname === '/config' ? (darkMode ? '#333' : '#000000') : 'transparent',
            color: window.location.pathname === '/config' ? '#ffffff' : darkMode ? '#ffffff' : '#000000',
            marginTop: '10px',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          <ListItemText primary="Workout Split" />
        </ListItem>
      </List>

      {/* Bright/Dark Mode Toggle */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          width: '100%',
          textAlign: 'center',
          color: darkMode ? '#ffffff' : '#000000',
        }}
      >
        <Typography variant="body2" sx={{ marginBottom: '5px' }}>
          {darkMode ? 'Dark Mode' : 'Bright Mode'}
        </Typography>
        <Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
      </Box>
    </Drawer>
  );
} 