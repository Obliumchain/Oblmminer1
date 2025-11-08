import type React from "react"

interface LiquidCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "elevated" | "muted"
}

export function LiquidCard({ children, className = "", variant = "default", ...props }: LiquidCardProps) {
  const variants = {
    default: "card-modern p-6 hover:border-primary/40 transition-all duration-300",
    elevated: "card-modern p-6 shadow-2xl shadow-primary/10 border-primary/30",
    muted: "card-modern p-6 bg-obsidian/50 border-steel/30",
  }

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
