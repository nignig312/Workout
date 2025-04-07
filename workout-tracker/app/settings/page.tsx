"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { getWorkoutData, saveWorkoutData, clearWorkoutProgress } from "@/lib/storage"
import { defaultWorkoutData } from "@/lib/workout-data"
import type { WorkoutData } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const router = useRouter()
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setWorkoutData(getWorkoutData())
    setIsLoading(false)
  }, [])

  const resetToDefaults = () => {
    if (confirm("Are you sure you want to reset all workouts to default? This will erase any customizations.")) {
      saveWorkoutData(defaultWorkoutData)
      clearWorkoutProgress()
      setWorkoutData(defaultWorkoutData)
    }
  }

  const clearProgress = () => {
    if (confirm("Are you sure you want to clear your current workout progress?")) {
      clearWorkoutProgress()
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-950 text-gray-900 dark:text-white p-4">
        <div className="animate-pulse">
          <div className="h-12 w-12 rounded-full bg-blue-500/20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white p-4">
      <header className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold ml-2">Settings</h1>
      </header>

      <div className="w-full max-w-md mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Workout Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your workout data and progress</p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={resetToDefaults}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset to Default Workouts
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20"
              onClick={clearProgress}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Current Progress
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              This app stores all data locally on your device. No data is sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
