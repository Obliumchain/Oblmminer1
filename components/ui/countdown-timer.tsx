"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  targetTime: Date | number
  onComplete?: () => void
}

export function CountdownTimer({ targetTime, onComplete }: CountdownTimerProps) {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const target = new Date(targetTime).getTime()
      const distance = target - now

      if (distance < 0) {
        setTime({ hours: 0, minutes: 0, seconds: 0 })
        onComplete?.()
        return
      }

      setTime({
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [targetTime, onComplete])

  return (
    <div className="flex gap-2 justify-center items-center font-display">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{String(time.hours).padStart(2, "0")}</div>
        <div className="text-xs text-foreground/60">hours</div>
      </div>
      <span className="text-primary">:</span>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{String(time.minutes).padStart(2, "0")}</div>
        <div className="text-xs text-foreground/60">mins</div>
      </div>
      <span className="text-primary">:</span>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{String(time.seconds).padStart(2, "0")}</div>
        <div className="text-xs text-foreground/60">secs</div>
      </div>
    </div>
  )
}
