import Link from "next/link"
import { LiquidCard } from "@/components/ui/liquid-card"
import { GlowButton } from "@/components/ui/glow-button"
import { BackgroundAnimation } from "@/components/background-animation"

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background overflow-hidden flex items-center justify-center px-4">
      <BackgroundAnimation />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <LiquidCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/50">
              <span className="text-xl">✓</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-accent mb-2">Check Your Email</h1>
            <p className="text-foreground/60">We sent a confirmation link to your email address</p>
          </div>

          {/* Info */}
          <div className="space-y-4 text-foreground/80">
            <p className="text-sm">Click the link in the email to verify your account and start mining.</p>
            <p className="text-xs text-foreground/50">
              If you don't see the email, check your spam folder or try signing up again.
            </p>
          </div>

          {/* Button */}
          <Link href="/auth" className="block mt-6">
            <GlowButton className="w-full">Back to Sign In</GlowButton>
          </Link>
        </LiquidCard>
      </div>
    </div>
  )
}
