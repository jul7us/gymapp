import Link from 'next/link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';

export default function Home() {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '50px',
        textAlign: 'center',
      }}
    >
      <Typography variant="h3" gutterBottom>
        Welcome to Gym Tracker
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select your workout for today:
      </Typography>
      <Box style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <Link href="/push" passHref>
          <Button variant="contained" color="primary">
            Push
          </Button>
        </Link>
        <Link href="/pull" passHref>
          <Button variant="contained" color="secondary">
            Pull
          </Button>
        </Link>
        <Link href="/legs" passHref>
          <Button variant="contained" color="success">
            Legs
          </Button>
        </Link>
      </Box>
    </Box>
  );
}