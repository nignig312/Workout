"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getWorkoutData, saveWorkoutData } from "@/lib/storage"
import type { Exercise } from "@/lib/types"

interface EditExerciseDialogProps {
  exerciseId: string
  workoutType: string
  onClose: () => void
  onSave: () => void
}

export default function EditExerciseDialog({ exerciseId, workoutType, onClose, onSave }: EditExerciseDialogProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [name, setName] = useState("")
  const [sets, setSets] = useState("")
  const [reps, setReps] = useState("")
  const [weight, setWeight] = useState("")

  useEffect(() => {
    const workoutData = getWorkoutData()
    const workout = workoutData[workoutType]

    if (workout) {
      const foundExercise = workout.exercises.find((ex) => ex.id === exerciseId)
      if (foundExercise) {
        setExercise(foundExercise)
        setName(foundExercise.name)
        setSets(foundExercise.sets.toString())
        setReps(foundExercise.reps)
        setWeight(foundExercise.weight || "")
      }
    }
  }, [exerciseId, workoutType])

  const handleSave = () => {
    if (!exercise) return

    const workoutData = getWorkoutData()
    const workout = workoutData[workoutType]

    if (workout) {
      const updatedExercises = workout.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            name,
            sets: Number.parseInt(sets),
            reps,
            weight: weight || undefined,
          }
        }
        return ex
      })

      workoutData[workoutType] = {
        ...workout,
        exercises: updatedExercises,
      }

      saveWorkoutData(workoutData)
      onSave()
    }
  }

  if (!exercise) return null

  return (
    <Dialog open={!!exerciseId} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>Edit Exercise</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Exercise Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (optional)</Label>
            <Input
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 20 lbs, Bodyweight"
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
