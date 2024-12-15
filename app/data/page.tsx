'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

interface WorkoutData {
  date: string;
  type: string;
  exercise: string;
  weight: string;
  workout_type: string;
}

export default function DataPage() {
  const [data, setData] = useState<WorkoutData[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching workouts data...');
        const res = await fetch('/api/get-workouts');
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('Error response:', errorData);
          throw new Error(errorData.details || 'Failed to fetch workouts');
        }
        
        const workoutData = await res.json();
        console.log('Fetched workout data:', workoutData);
        
        if (Array.isArray(workoutData)) {
          setData(workoutData);
        } else if (workoutData.error) {
          throw new Error(`API Error: ${workoutData.error}\nDetails: ${workoutData.details || 'No details provided'}`);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleDeleteEntry = async (date: string, exercise: string) => {
    try {
      const res = await fetch(`/api/delete-workout?date=${date}&exercise=${encodeURIComponent(exercise)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete entry');
      }

      // Refresh data after deletion
      const updatedData = data.filter(row => !(row.date === date && row.exercise === exercise));
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        handleNavigation={handleNavigation}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Workout Type</TableCell>
                  <TableCell>Muscle Group</TableCell>
                  <TableCell>Exercise</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.workout_type || 'Unknown'}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.exercise}</TableCell>
                    <TableCell>{row.weight}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete entry">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteEntry(row.date, row.exercise)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}