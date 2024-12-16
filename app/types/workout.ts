export interface Exercise {
  name: string;
  category: 'push' | 'pull' | 'legs';
}

export interface MuscleGroup {
  name: string;
  category: string;
  exercises: {
    name: string;
    [key: string]: unknown;
  }[];
}

export interface WorkoutConfig {
  muscleGroups: MuscleGroup[];
}

export interface SidebarProps {
  darkMode: boolean;
  handleNavigation: (path: string) => void;
}

export interface ExpandedGroups {
  [key: string]: boolean;
}

export interface DropdownSelections {
  [key: string]: string;
}

export interface Weights {
  [key: string]: string;
}

export type MuscleGroupName = 'Chest' | 'Shoulders' | 'Triceps' | 'Back' | 'Biceps' | 'Forearms' | 'Quadriceps' | 'Hamstrings' | 'Calves' | 'Glutes';
export type WorkoutCategory = 'push' | 'pull' | 'legs';

export interface WorkoutData {
  type: MuscleGroupName;
  date: string;
  // Add other properties that exist in your workout data
} 