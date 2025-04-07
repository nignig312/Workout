"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Award } from "lucide-react"
import confetti from "canvas-confetti"
import { getUserProgress } from "@/lib/user-progress"

export function LevelUpModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [newLevel, setNewLevel] = useState(1)

  useEffect(() => {
    // Check if there was a recent level up
    const progress = getUserProgress()

    if (progress.lastLevelUp) {
      const levelUpTime = new Date(progress.lastLevelUp).getTime()
      const now = new Date().getTime()
      const timeSinceLevelUp = now - levelUpTime

      // If level up was in the last 5 seconds, show the modal
      if (timeSinceLevelUp < 5000) {
        setNewLevel(progress.level)
        setIsOpen(true)

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 max-w-sm mx-auto text-center">
        <div className="py-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <Trophy className="h-10 w-10 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Congratulations! You've reached level {newLevel}</p>

          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-lg font-medium">+50 XP Earned</span>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4 w-full">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Keep up the great work! Complete more workouts to level up faster.
            </p>
          </div>

          <Button onClick={() => setIsOpen(false)} className="bg-blue-600 hover:bg-blue-700">
            <Award className="mr-2 h-4 w-4" />
            Continue Training
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
