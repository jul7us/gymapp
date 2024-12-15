'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import emotionCache from './emotion-cache';
import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff', // Customize your primary color
    },
    secondary: {
      main: '#ff4081', // Customize your secondary color
    },
  },
});

export const metadata = {
  title: 'Workout Tracker',
  description: 'Track your workouts',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content={metadata.viewport} />
      </head>
      <body>
        <Box sx={{ 
          width: '100vw',
          minHeight: '100vh',
          overflow: 'hidden'
        }}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </CacheProvider>
        </Box>
      </body>
    </html>
  );
}
