"use client"

import { useEffect, useRef } from "react"

interface AnimatedBackgroundProps {
  particleCount?: number
}

export function AnimatedBackground({ particleCount = 20 }: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    // Clear any existing particles
    container.innerHTML = ""

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.classList.add("particle")

      // Random size between 5px and 20px
      const size = Math.random() * 15 + 5
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`

      // Random horizontal position
      particle.style.left = `${Math.random() * 100}%`

      // Random animation duration between 10s and 30s
      const duration = Math.random() * 20 + 10
      particle.style.animationDuration = `${duration}s`

      // Random delay so they don't all start at once
      const delay = Math.random() * 10
      particle.style.animationDelay = `${delay}s`

      container.appendChild(particle)
    }

    return () => {
      container.innerHTML = ""
    }
  }, [particleCount])

  return <div ref={containerRef} className="particles" />
}
