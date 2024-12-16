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