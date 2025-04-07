import type { Exercise, WorkoutData } from "./types"
import { v4 as uuidv4 } from "uuid"

// Helper function to create exercises with unique IDs
const createExercise = (name: string, sets: number, reps: string, weight?: string): Exercise => ({
  id: uuidv4(),
  name,
  sets,
  reps,
  weight,
})

// Default workout data
export const defaultWorkoutData: WorkoutData = {
  "chest-biceps": {
    title: "Chest + Biceps",
    exercises: [
      createExercise("Pseudo Planche Push-Ups", 4, "8-12 reps"),
      createExercise("Archer Push-Ups", 3, "6 reps each side"),
      createExercise("Explosive Decline Push-Ups", 3, "8-10 reps"),
      createExercise("Deep Push-Ups", 3, "10-15 reps"),
      createExercise("Weighted Chin-Ups", 4, "5-8 reps", "Bodyweight"),
      createExercise("Incline Dumbbell Curls", 3, "8-12 reps", "15 lbs"),
      createExercise("Dumbbell Hammer Curls", 3, "10-12 reps", "20 lbs"),
      createExercise("Barbell Curls", 3, "6-10 reps", "40 lbs"),
      createExercise("Concentration Curls", 2, "12-15 reps", "15 lbs"),
    ],
  },
  "back-shoulders": {
    title: "Back + Shoulders",
    exercises: [
      createExercise("Pull-Ups", 4, "Max reps"),
      createExercise("Australian Rows", 3, "12-15 reps"),
      createExercise("Chin-Ups", 3, "8-10 reps"),
      createExercise("Archer Pull-Ups", 3, "6 reps each side"),
      createExercise("Superman Holds", 3, "30 sec hold"),
      createExercise("Pike Push-Ups", 4, "10-12 reps"),
      createExercise("Wall Handstand Hold", 3, "30-60 sec hold"),
      createExercise("Wall Handstand Push-Ups", 4, "4-6 reps"),
      createExercise("Pseudo Planche Push-Ups", 3, "10-12 reps"),
      createExercise("Tuck Planche Hold", 3, "Max hold"),
    ],
  },
  "triceps-abs": {
    title: "Triceps + Abs",
    exercises: [
      createExercise("Diamond Push-Ups", 4, "10-15 reps"),
      createExercise("Close-Grip Push-Ups", 3, "10-12 reps"),
      createExercise("Bench Dips", 3, "12-15 reps"),
      createExercise("Bodyweight Tricep Extensions", 3, "8-12 reps"),
      createExercise("Triceps Burnout Circuit", 3, "10 reps each exercise"),
      createExercise("Hanging Leg Raises", 3, "10-15 reps"),
      createExercise("Lying Leg Raises", 3, "15 reps"),
      createExercise("Hollow Body Hold", 3, "30 sec hold"),
      createExercise("Russian Twists", 3, "20 reps"),
      createExercise("Plank-to-Elbow Touch", 3, "12 reps each side"),
    ],
  },
}
