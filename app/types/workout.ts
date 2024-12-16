export type WorkoutCategory = 'push' | 'pull' | 'legs';

export interface MuscleGroup {
  name: string;
  exercises: string[];
  category: WorkoutCategory;
}

export interface Workout {
  id?: number;
  date: string;
  type: string;
  exercise: string;
  weight: string;
  workout_type?: string;
} 