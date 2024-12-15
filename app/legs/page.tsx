'use client';
import { ListItemIcon } from '@mui/material';
import { useState, useEffect } from 'react';
import { Home, FitnessCenter, TableChart } from '@mui/icons-material';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  Typography,
  Box,
  IconButton,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Switch,
  Snackbar,
  Alert,
} from '@mui/material';
import { ExpandMore, ExpandLess, Delete, Menu, Close as CloseIcon } from '@mui/icons-material';
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

interface MuscleGroup {
  category: string;
  name: string;
  exercises: { name: string }[];
}

interface WorkoutEntry {
  date: string;
  type: string;
  exercise: string;
  weight: string;
}

interface ExpandedGroups {
  [key: string]: boolean;
}

interface DropdownSelections {
  [key: string]: string;
}

interface Weights {
  [key: string]: string;
}

export default function LegsPage() {
  const [muscleGroups, setMuscleGroups] = useState({});

  const [workouts, setWorkouts] = useState<Workouts>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | { type: string; value: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [date, setDate] = useState('');
  const [dropdownSelections, setDropdownSelections] = useState<DropdownSelections>({});
  const [expandedGroups, setExpandedGroups] = useState<ExpandedGroups>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [weights, setWeights] = useState<Weights>({});
  const [modifiedWeights, setModifiedWeights] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        
        // Filter and transform the config for legs exercises
        const legsGroups = data.muscleGroups
          .filter((group: MuscleGroup) => group.category === 'legs')
          .reduce((acc: { [key: string]: string[] }, group: MuscleGroup) => {
            acc[group.name] = group.exercises.map(ex => ex.name);
            return acc;
          }, {});
        
        setMuscleGroups(legsGroups);
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
      const res = await fetch('/api/get-dates?type=legs');
      const data = await res.json();
      
      // Log the response for debugging
      console.log('API Response:', data);

      // Handle error response
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array of dates but got:', data);
        return;
      }

      // Format dates if needed (in case they're not in the expected format)
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
      const workoutData: WorkoutEntry[] = await res.json();
  
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

  const handleNavigation = (path: string) => {
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

  const toggleGroupExpansion = (muscleGroup: string) => {
    setExpandedGroups((prev) => ({ ...prev, [muscleGroup]: !prev[muscleGroup] }));
  };

  const handleAddExercise = (muscleGroup: string) => {
    const exercise = dropdownSelections[muscleGroup as keyof typeof dropdownSelections];
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
      for (const [muscleGroup, groupExercises] of Object.entries(exercises)) {
        for (const exercise of groupExercises) {
          if (weights[exercise]) {
            // Overwrite logic: Delete the old entry first
            await fetch(`/api/delete-workout?date=${selectedDate}&exercise=${encodeURIComponent(exercise)}`, {
              method: 'DELETE',
            });
  
            // Insert the new entry
            const saveData = {
              type: muscleGroup,
              exercise,
              weight: weights[exercise],
              date: selectedDate
            };
            await fetch('/api/save-workout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(saveData),
            });
          }
        }
      }
      
      // Clear modified weights after successful save
      setModifiedWeights(new Set());
      setUnsavedChanges(false);
      setSuccessMessage('Workout saved successfully!');
    } catch (error) {
      console.error('Error saving workout:', error);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!selectedDate) return;
  
    try {
      // Delete only legs entries for the selected date
      const res = await fetch(`/api/delete-workout?date=${selectedDate}&workoutType=legs`, { 
        method: 'DELETE' 
      });
  
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
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        color: darkMode ? '#ffffff' : '#000000',
      }}
    >
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        handleNavigation={handleNavigation}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          margin: '0 20px',
        }}
      >
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            severity="success" 
            onClose={() => setSuccessMessage('')}
            sx={{ width: '100%' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleAddWorkout}
            sx={{ backgroundColor: '#1976d2', color: '#fff' }}
          >
            Add Workout
          </Button>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{ width: '200px', ml: 2 }}
          />
          <Select
            value={selectedDate || ''}
            onChange={(e) => handleDateChange(e.target.value)}
            sx={{ ml: 'auto', width: 200 }}
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
            <Box key={muscleGroup} sx={{ mb: 3 }}>
              <Box
                onClick={() => toggleGroupExpansion(muscleGroup)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: darkMode ? '#333' : '#ddd',
                  p: 2,
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <Typography variant="h6">{muscleGroup}</Typography>
                {expandedGroups[muscleGroup] ? <ExpandLess /> : <ExpandMore />}
              </Box>
              <Collapse in={expandedGroups[muscleGroup]}>
                <Box sx={{ mt: 2 }}>
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
                      {(groupExercises as string[])
                        .filter((exercise: string) => 
                          !(workouts[selectedDate]?.selectedExercises[muscleGroup] || []).includes(exercise))
                        .map((exercise: string) => (
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
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      Do you want to save your changes before leaving?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={confirmNavigation}>Save and Continue</Button>
    <Button onClick={cancelNavigation} color="error">Cancel</Button>
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