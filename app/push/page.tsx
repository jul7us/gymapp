'use client';
import { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  Typography,
  Box,
  IconButton,
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

interface Workout {
  selectedExercises: {
    [key: string]: string[];
  };
  weights: {
    [key: string]: string;
  };
  completed?: boolean;
}

interface Workouts {
  [date: string]: Workout;
}

export default function PushPage() {
  const [muscleGroups, setMuscleGroups] = useState({});

  const [workouts, setWorkouts] = useState<Workouts>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | { type: string; value: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [date, setDate] = useState('');
  const [dropdownSelections, setDropdownSelections] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [weights, setWeights] = useState({});
  const [modifiedWeights, setModifiedWeights] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        
        // Filter and transform the config for push exercises
        const pushGroups = data.muscleGroups
          .filter((group: MuscleGroup) => group.category === 'push')
          .reduce((acc: { [key: string]: string[] }, group: MuscleGroup) => {
            acc[group.name] = group.exercises.map(ex => ex.name);
            return acc;
          }, {});
        
        setMuscleGroups(pushGroups);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };
    
    loadConfig();
  }, []);

  useEffect(() => {
    fetchAllDates();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchWorkoutData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const hasUnsavedChanges = () => {
      if (!selectedDate || !workouts[selectedDate]) return false;

      const workout = workouts[selectedDate];
      const exercises = workout.selectedExercises;

      // Only check for modified weights that haven't been saved
      return modifiedWeights.size > 0;
    };

    setUnsavedChanges(hasUnsavedChanges());
  }, [workouts, selectedDate, modifiedWeights]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

 // Fetch all unique dates from the database for the dropdown
 const fetchAllDates = async () => {
    try {
      const res = await fetch('/api/get-dates?type=push');
      const data = await res.json();
      
      console.log('API Response:', data);

      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      if (!Array.isArray(data)) {
        console.error('Expected array of dates but got:', data);
        return;
      }

      const formattedDates = data.map(date => 
        typeof date === 'string' ? date : date.date
      );

      setWorkouts(prev => {
        const newWorkouts = { ...prev };
        formattedDates.forEach(date => {
          if (!newWorkouts[date]) {
            newWorkouts[date] = { selectedExercises: {}, weights: {}, completed: false };
          }
        });
        return newWorkouts;
      });
    } catch (error) {
      console.error('Error fetching dates:', error);
    }
  };

  // Fetch all workouts for the selected date and ensure only matching entries are shown
  const fetchWorkoutData = async (date: string) => {
    try {
      const res = await fetch(`/api/get-workouts?date=${date}`);
      if (!res.ok) {
        throw new Error('Failed to fetch workout data');
      }
      
      const data = await res.json();
      console.log('Fetched workout data:', data);

      // Ensure data is an array
      const workoutData = Array.isArray(data) ? data : [];

      // Filter and organize workouts for the selected date
      const exercises: { [key: string]: string[] } = {};
      const weights: { [key: string]: string } = {};

      workoutData.forEach((entry: WorkoutEntry) => {
        if (entry.date === date) {
          exercises[entry.type] = exercises[entry.type] || [];
          exercises[entry.type].push(entry.exercise);
          weights[entry.exercise] = entry.weight;
        }
      });

      setWorkouts((prev) => ({
        ...prev,
        [date]: { selectedExercises: exercises, weights },
      }));
      setWeights(weights);
    } catch (error) {
      console.error('Error fetching workout data:', error);
    }
  };

  const handleNavigation = (path) => {
    if (unsavedChanges) {
      setPendingNavigation(path);
      setConfirmDialogOpen(true);
    } else {
      window.location.href = path;
    }
  };
  
  const confirmNavigation = async () => {
    if (unsavedChanges) {
      await handleFinishWorkout();
    }
    
    setConfirmDialogOpen(false);
    if (pendingNavigation) {
      if (typeof pendingNavigation === 'string') {
        window.location.href = pendingNavigation;
      } else if (pendingNavigation.type === 'date') {
        setSelectedDate(pendingNavigation.value);
      }
      setPendingNavigation(null);
    }
  };
  
  const cancelNavigation = () => {
    setConfirmDialogOpen(false);
    setPendingNavigation(null);
  };

  const handleAddWorkout = () => {
    if (!date) return;
    setSelectedDate(date);
    if (!workouts[date]) {
      setWorkouts((prev) => ({ ...prev, [date]: { selectedExercises: {}, weights: {}, completed: false } }));
    }
    setDate('');
  };

  const toggleGroupExpansion = (muscleGroup) => {
    setExpandedGroups((prev) => ({ ...prev, [muscleGroup]: !prev[muscleGroup] }));
  };

  const handleAddExercise = (muscleGroup) => {
    const exercise = dropdownSelections[muscleGroup];
    if (!exercise || (workouts[selectedDate]?.selectedExercises[muscleGroup] || []).length >= 5) return;

    setWorkouts((prev) => {
      const updatedExercises = {
        ...prev[selectedDate]?.selectedExercises,
        [muscleGroup]: [...(prev[selectedDate]?.selectedExercises[muscleGroup] || []), exercise],
      };
      return { ...prev, [selectedDate]: { ...prev[selectedDate], selectedExercises: updatedExercises } };
    });

    setDropdownSelections((prev) => ({ ...prev, [muscleGroup]: '' }));
  };

  const handleWeightChange = (exercise: string, weight: string) => {
    setWeights((prev) => ({ ...prev, [exercise]: weight }));
    setWorkouts((prev) => ({
      ...prev,
      [selectedDate]: {
        ...prev[selectedDate],
        weights: { ...prev[selectedDate]?.weights, [exercise]: weight },
      },
    }));
    setModifiedWeights(prev => new Set(prev).add(exercise));
  };

  // Save the workout to the database, overwriting existing values for the same exercise and date
const handleFinishWorkout = async () => {
  if (!workouts[selectedDate]) return;

  const exercises = workouts[selectedDate].selectedExercises;
  const weights = workouts[selectedDate].weights;

  try {
    console.log('Starting workout save with:', { exercises, weights, selectedDate });
    
    for (const [muscleGroup, groupExercises] of Object.entries(exercises)) {
      for (const exercise of groupExercises) {
        if (weights[exercise]) {
          const saveData = {
            type: muscleGroup,
            exercise,
            weight: weights[exercise],
            date: selectedDate
          };
          console.log('Saving exercise:', saveData);

          // Save the workout
          const res = await fetch('/api/save-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saveData),
          });

          const result = await res.json();
          console.log('Save response:', result);

          if (!res.ok) {
            throw new Error(result.error || 'Failed to save workout');
          }
        }
      }
    }
    
    setModifiedWeights(new Set());
    setUnsavedChanges(false);
    setSuccessMessage('Workout saved successfully!');

    // Refresh the dates list
    fetchAllDates();
  } catch (error) {
    console.error('Error saving workout:', error);
    alert(`Error saving workout: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  const handleDeleteWorkout = async () => {
    if (!selectedDate) return;
  
    try {
      // Delete all entries for the selected date
      const res = await fetch(`/api/delete-workout?date=${selectedDate}`, { method: 'DELETE' });
  
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error deleting workout:', errorData.message);
        alert('Failed to delete workout.');
        return;
      }
  
      // Remove workout locally
      setWorkouts((prev) => {
        const updatedWorkouts = { ...prev };
        delete updatedWorkouts[selectedDate];
        return updatedWorkouts;
      });
  
      setSelectedDate('');
      setSuccessMessage('Workout deleted successfully!');
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('An error occurred while deleting the workout.');
    }
  };
  const handleDeleteExercise = async (muscleGroup: string, exercise: string) => {
    if (!selectedDate || !exercise) return;

    // Remove the exercise from modifiedWeights first
    setModifiedWeights(prev => {
      const newSet = new Set(prev);
      newSet.delete(exercise);
      return newSet;
    });

    // Check if the exercise exists in the saved workouts
    const exerciseExists = workouts[selectedDate]?.weights[exercise] && !modifiedWeights.has(exercise);

    // Remove the exercise from local state
    setWorkouts((prev) => {
      const updatedExercises = { ...prev[selectedDate]?.selectedExercises };
      const updatedWeights = { ...prev[selectedDate]?.weights };

      updatedExercises[muscleGroup] = updatedExercises[muscleGroup]?.filter((e) => e !== exercise);
      delete updatedWeights[exercise];

      if (updatedExercises[muscleGroup]?.length === 0) {
        delete updatedExercises[muscleGroup];
      }

      return {
        ...prev,
        [selectedDate]: { ...prev[selectedDate], selectedExercises: updatedExercises, weights: updatedWeights },
      };
    });

    // Also remove from weights state
    setWeights(prev => {
      const newWeights = { ...prev };
      delete newWeights[exercise];
      return newWeights;
    });

    // Only try to delete from database if the exercise exists in saved workouts
    if (exerciseExists) {
      try {
        const res = await fetch(`/api/delete-workout?date=${selectedDate}&exercise=${encodeURIComponent(exercise)}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          console.error('Error deleting exercise from database');
        }
      } catch (error) {
        console.error('Error deleting exercise:', error);
      }
    }

    setSuccessMessage(`${exercise} removed successfully!`);
  };

  const handleDateChange = (newDate: string) => {
    if (unsavedChanges) {
      setPendingNavigation(null);
      setConfirmDialogOpen(true);
      setPendingNavigation({ type: 'date', value: newDate });
    } else {
      setSelectedDate(newDate);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile, side-by-side on desktop
      minHeight: '100vh',
    }}>
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        handleNavigation={handleNavigation}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 }, // Smaller padding on mobile
          margin: { xs: '0', sm: '0 20px' },
          width: { xs: '100%', sm: 'auto' }, // Full width on mobile
        }}
      >
        <Snackbar
  open={!!successMessage}
  autoHideDuration={3000}
  onClose={() => setSuccessMessage('')}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position at the top center
>
  <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ width: '100%' }}>
    {successMessage}
  </Alert>
</Snackbar>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, // Stack on mobile
          gap: { xs: 1, sm: 2 },
          alignItems: 'center', 
          mb: 2 
        }}>
          <Button
            variant="contained"
            onClick={handleAddWorkout}
            sx={{ 
              backgroundColor: '#1976d2',
              color: '#fff',
              width: { xs: '100%', sm: 'auto' } // Full width on mobile
            }}
          >
            Add Workout
          </Button>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{ 
              width: { xs: '100%', sm: '200px' },
              mt: { xs: 1, sm: 0 }
            }}
          />
          <Select
    value={selectedDate || ''}
    onChange={(e) => handleDateChange(e.target.value)}
    sx={{ 
      width: { xs: '100%', sm: 200 },
      mt: { xs: 1, sm: 0 }
    }}
    displayEmpty
  >
    <MenuItem value="" disabled>
      Select Date
    </MenuItem>
    {Object.keys(workouts).length > 0 ? (
      Object.keys(workouts)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map((date) => (
          <MenuItem key={date} value={date}>
            {date}
          </MenuItem>
        ))
    ) : (
      <MenuItem value="" disabled>
        No workouts found
      </MenuItem>
    )}
  </Select>
        </Box>

        {selectedDate &&
          Object.entries(muscleGroups).map(([muscleGroup, groupExercises]) => (
            <Box key={muscleGroup} sx={{ mb: 2 }}>
              <Box
                onClick={() => toggleGroupExpansion(muscleGroup)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: darkMode ? '#333' : '#ddd',
                  p: { xs: 1, sm: 2 },
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <Typography variant="h6">{muscleGroup}</Typography>
                {expandedGroups[muscleGroup] ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedGroups[muscleGroup]}>
                <Box sx={{ 
                  mt: 1,
                  px: { xs: 1, sm: 2 }
                }}>
                  {(workouts[selectedDate]?.selectedExercises[muscleGroup] || []).map((exercise) => (
                    <Box
                      key={exercise}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        mb: 1,
                      }}
                    >
                      <Typography>{exercise}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          type="number"
                          placeholder="Enter weight"
                          value={weights[exercise] || ''}
                          onChange={(e) => handleWeightChange(exercise, e.target.value)}
                          sx={{ width: '100px', mr: 2 }}
                        />
                       <IconButton
  color="error"
  onClick={() => handleDeleteExercise(muscleGroup, exercise)}
>
  <Delete />
</IconButton>
                      </Box>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Select
                      value={dropdownSelections[muscleGroup] || ''}
                      onChange={(e) =>
                        setDropdownSelections((prev) => ({ ...prev, [muscleGroup]: e.target.value }))
                      }
                      sx={{ width: '200px', mr: 2 }}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Exercise
                      </MenuItem>
                      {groupExercises
                        .filter((exercise) => !(workouts[selectedDate]?.selectedExercises[muscleGroup] || []).includes(exercise))
                        .map((exercise) => (
                          <MenuItem key={exercise} value={exercise}>
                            {exercise}
                          </MenuItem>
                        ))}
                    </Select>
                    <Button variant="contained" color="primary" onClick={() => handleAddExercise(muscleGroup)}>
                      Add
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          ))}
<Dialog open={confirmDialogOpen} onClose={cancelNavigation}>
  <DialogTitle>
    Unsaved Changes
    <IconButton
      aria-label="close"
      onClick={cancelNavigation}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: 'black',
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      You have unsaved changes. Do you want to save your workout before leaving this page?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={confirmNavigation} color="primary">
      Save and Close
    </Button>
    <Button 
      onClick={() => {
        setConfirmDialogOpen(false);
        if (pendingNavigation) {
          if (typeof pendingNavigation === 'string') {
            window.location.href = pendingNavigation;
          } else if (pendingNavigation.type === 'date') {
            setSelectedDate(pendingNavigation.value);
          }
          setPendingNavigation(null);
        }
      }} 
      color="error"
    >
      Skip and Close
    </Button>
  </DialogActions>
</Dialog>

{selectedDate && (
  <Box sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
    <Button variant="contained" color="error" onClick={handleDeleteWorkout} sx={{ mr: 2 }}>
      Delete Workout
    </Button>
    <Button variant="contained" color="success" onClick={handleFinishWorkout}>
      Finish Workout
    </Button>
  </Box>
)}
      </Box>
    </Box>
  );
}