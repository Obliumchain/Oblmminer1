"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { LiquidCard } from "@/components/ui/liquid-card"
import { GlowButton } from "@/components/ui/glow-button"
import { BackgroundAnimation } from "@/components/background-animation"
import { useLanguage } from "@/lib/language-context"
import { LanguageSelector } from "@/components/language-selector"

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [repeatPassword, setRepeatPassword] = useState("")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (isSignUp) {
        if (password !== repeatPassword) {
          throw new Error("Passwords do not match")
        }

        if (!nickname.trim()) {
          throw new Error("Nickname is required")
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
            data: {
              nickname: nickname.trim(),
            },
          },
        })

        if (signUpError) throw signUpError

        if (data.user && referralCode.trim()) {
          try {
            const response = await fetch("/api/referral/process", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ referralCode: referralCode.trim() }),
            })

            const result = await response.json()

            if (!response.ok) {
              console.error("[v0] Referral processing failed:", result.error)
            }
          } catch (referralError) {
            console.error("[v0] Referral processing error:", referralError)
          }
        }

        router.push("/auth/check-email")
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) throw loginError
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background overflow-hidden flex items-center justify-center px-4">
      <BackgroundAnimation />

      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <LiquidCard className="p-8">
          <div className="text-center mb-8">
            <Image src="/logo.png" alt="Oblium Logo" width={64} height={64} className="mx-auto mb-4 drop-shadow-lg" />
            <h1 className="text-3xl font-display font-bold text-primary mb-2">OBLIUM</h1>
            <p className="text-foreground/60">{isSignUp ? t("createAccount") : t("enterMiningNetwork")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">{t("email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full px-4 py-3 bg-background/50 border border-primary/30 rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all duration-300"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">{t("nickname")}</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t("nicknamePlaceholder")}
                  className="w-full px-4 py-3 bg-background/50 border border-primary/30 rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all duration-300"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-foreground/80 mb-2">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full px-4 py-3 bg-background/50 border border-primary/30 rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all duration-300"
                required
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">{t("repeatPassword")}</label>
                <input
                  type="password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full px-4 py-3 bg-background/50 border border-primary/30 rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all duration-300"
                  required
                />
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">{t("referralCodeOptional")}</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder={t("referralCodePlaceholder")}
                  className="w-full px-4 py-3 bg-background/50 border border-accent/30 rounded-lg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent focus:shadow-lg focus:shadow-accent/20 transition-all duration-300"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <GlowButton type="submit" disabled={isLoading} className="w-full">
              {isLoading
                ? isSignUp
                  ? t("creatingAccount")
                  : t("connecting")
                : isSignUp
                  ? t("createAccount")
                  : t("startMining")}
            </GlowButton>
          </form>

          <div className="text-center text-sm text-foreground/60 mt-6">
            {isSignUp ? t("alreadyHaveAccount") : t("newToOblium")}{" "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="text-primary hover:underline font-bold"
            >
              {isSignUp ? t("signIn") : t("createAccount")}
            </button>
          </div>

          {isSignUp && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
              <p className="text-xs text-accent/80">{t("confirmationEmailSent")}</p>
            </div>
          )}
        </LiquidCard>
      </div>
    </div>
  )
}
