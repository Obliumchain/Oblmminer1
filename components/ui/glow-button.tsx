import type React from "react"
interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "accent"
  size?: "default" | "sm" | "lg"
}

export function GlowButton({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: GlowButtonProps) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-primary bg-gradient-to-r from-accent via-primary to-accent",
  }

  const sizes = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  }

  return (
    <button className={`${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
