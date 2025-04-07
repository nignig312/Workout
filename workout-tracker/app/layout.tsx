import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { MusicPlayer } from "@/components/music-player"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Workout Tracker",
  description: "Track your workouts and progress",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <MusicPlayer />
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'