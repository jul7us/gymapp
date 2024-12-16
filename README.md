# Workout Tracker

A Next.js application for tracking workouts with SQLite database.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database:
   ```bash
   npm run init-db
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Testing

Run the test suite:

## API Endpoints

- `GET /api/get-workouts` - Get all workouts
- `GET /api/get-dates?type=[push|pull|legs]` - Get dates for specific workout type
- `POST /api/save-workout` - Save a new workout
- `DELETE /api/delete-workout` - Delete a workout
- `GET /api/config` - Get muscle group configuration
- `POST /api/config` - Update muscle group configuration

## Database Schema

### Workouts Table
```sql
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  exercise TEXT NOT NULL,
  weight TEXT NOT NULL
);
```

### Muscle Groups Table
```sql
CREATE TABLE muscle_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  exercises TEXT NOT NULL,
  UNIQUE(name)
);
```
