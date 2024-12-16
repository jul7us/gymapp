'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Delete, Close as CloseIcon } from '@mui/icons-material';
import type { MuscleGroup } from '../types/workout';
import Sidebar from '../components/Sidebar';

export default function ConfigPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [newMuscleGroup, setNewMuscleGroup] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'push' | 'pull' | 'legs'>('push');
  const [newExercises, setNewExercises] = useState<{ [key: string]: string[] }>({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setMuscleGroups(data.muscleGroups || []);
    } catch (error) {
      console.error('Error loading config:', error);
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
    await saveConfig();
    setConfirmDialogOpen(false);
    if (pendingNavigation) {
      window.location.href = pendingNavigation;
    }
  };

  const cancelNavigation = () => {
    setConfirmDialogOpen(false);
    setPendingNavigation(null);
  };

  const saveConfig = async () => {
    try {
      // Add new exercises to their respective muscle groups
      const updatedMuscleGroups = muscleGroups.map(group => ({
        ...group,
        exercises: [
          ...group.exercises,
          ...(newExercises[group.name]?.filter(ex => ex) || []).map(exerciseName => ({
            name: exerciseName,
            category: group.category
          }))
        ]
      }));

      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ muscleGroups: updatedMuscleGroups }),
      });

      setNewExercises({});
      setUnsavedChanges(false);
      loadConfig(); // Reload the config to get the updated data
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const handleAddMuscleGroup = () => {
    if (!newMuscleGroup) return;
    setMuscleGroups([
      ...muscleGroups,
      { name: newMuscleGroup, exercises: [], category: selectedCategory },
    ]);
    setNewMuscleGroup('');
    setUnsavedChanges(true);
  };

  const handleDeleteMuscleGroup = (name: string) => {
    setMuscleGroups(muscleGroups.filter((group) => group.name !== name));
    setUnsavedChanges(true);
  };

  const handleExerciseChange = (muscleGroupName: string, value: string) => {
    setNewExercises(prev => ({
      ...prev,
      [muscleGroupName]: [value]
    }));
    setUnsavedChanges(true);
  };

  const handleMuscleGroupKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newMuscleGroup) {
      handleAddMuscleGroup();
    }
  };

  const handleExerciseKeyPress = (muscleGroupName: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newExercises[muscleGroupName]?.length > 0) {
      const currentExercise = newExercises[muscleGroupName][newExercises[muscleGroupName].length - 1];
      if (currentExercise) {
        handleAddExercise(muscleGroupName);
      }
    }
  };

  const handleAddExercise = (muscleGroupName: string) => {
    const currentExercise = newExercises[muscleGroupName]?.[newExercises[muscleGroupName].length - 1];
    if (!currentExercise) return;

    setMuscleGroups(prev => 
      prev.map(group => 
        group.name === muscleGroupName
          ? {
              ...group,
              exercises: [...group.exercises, { name: currentExercise, category: group.category }]
            }
          : group
      )
    );

    setNewExercises(prev => ({
      ...prev,
      [muscleGroupName]: ['']
    }));
    setUnsavedChanges(true);
  };

  const handleDeleteExercise = (muscleGroupName: string, exerciseName: string) => {
    setMuscleGroups(prev => 
      prev.map(group => 
        group.name === muscleGroupName
          ? {
              ...group,
              exercises: group.exercises.filter(ex => ex.name !== exerciseName)
            }
          : group
      )
    );
    setUnsavedChanges(true);
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
      
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Workout Split Configuration
        </Typography>

        {/* Add Muscle Group */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add Muscle Group
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Muscle Group Name"
              value={newMuscleGroup}
              onChange={(e) => setNewMuscleGroup(e.target.value)}
              onKeyPress={handleMuscleGroupKeyPress}
            />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'push' | 'pull' | 'legs')}
            >
              <MenuItem value="push">Push</MenuItem>
              <MenuItem value="pull">Pull</MenuItem>
              <MenuItem value="legs">Legs</MenuItem>
            </Select>
            <Button variant="contained" onClick={handleAddMuscleGroup}>
              Add Muscle Group
            </Button>
          </Box>
        </Box>

        {/* Muscle Groups Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Muscle Group / Exercise</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Add Exercise</TableCell>
                <TableCell sx={{ width: '60px', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {muscleGroups.map((group) => (
                <React.Fragment key={group.name}>
                  {/* Muscle Group Row */}
                  <TableRow>
                    <TableCell>{group.name}</TableCell>
                    <TableCell>{group.category}</TableCell>
                    <TableCell>
                      <TextField
                        placeholder="Add new exercise"
                        value={newExercises[group.name]?.[0] || ''}
                        onChange={(e) => handleExerciseChange(group.name, e.target.value)}
                        onKeyPress={(e) => handleExerciseKeyPress(group.name, e)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeleteMuscleGroup(group.name)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {/* Exercise Rows */}
                  {group.exercises.map((exercise) => (
                    <TableRow key={`${group.name}-${exercise.name}`}>
                      <TableCell sx={{ pl: 4 }}>{exercise.name}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteExercise(group.name, exercise.name)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button 
          variant="contained" 
          color="primary" 
          onClick={saveConfig} 
          sx={{ mt: 2 }}
          disabled={!unsavedChanges}
        >
          Save Configuration
        </Button>

        {/* Navigation Confirmation Dialog */}
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
              You have unsaved changes. Do you want to save your configuration before leaving this page?
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
                  window.location.href = pendingNavigation;
                }
              }} 
              color="error"
            >
              Skip and Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
} 