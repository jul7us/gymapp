export interface Exercise {
  name: string;
  category: 'push' | 'pull' | 'legs';
}

export interface MuscleGroup {
  name: string;
  exercises: Exercise[];
  category: 'push' | 'pull' | 'legs';
}

export interface WorkoutConfig {
  muscleGroups: MuscleGroup[];
} 