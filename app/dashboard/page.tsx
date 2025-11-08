"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { LiquidCard } from "@/components/ui/liquid-card"
import { GlowButton } from "@/components/ui/glow-button"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { BackgroundAnimation } from "@/components/background-animation"
import { BoosterShop } from "@/components/booster-shop"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useLanguage } from "@/lib/language-context"

interface UserProfile {
  id: string
  wallet_address: string | null
  points: number
  mining_started_at: string | null
  last_claim_at: string | null
  has_auto_claim: boolean
  referral_code: string
}

interface ActiveBooster {
  id: string
  name: string
  type: string
  expires_at: string
  multiplier_value: number | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [nextClaim, setNextClaim] = useState<Date | null>(null)
  const [canClaim, setCanClaim] = useState(false)
  const [oblm, setOblm] = useState(0)
  const [activeBoosters, setActiveBoosters] = useState<ActiveBooster[]>([])
  const [showBoosterShop, setShowBoosterShop] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)
  const [showWalletNotification, setShowWalletNotification] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (!profile) return

        setUserProfile(profile)

        setOblm(Math.floor(profile.points / 10000) * 200)

        if (profile.mining_started_at) {
          const miningStart = new Date(profile.mining_started_at)
          const fourHoursLater = new Date(miningStart.getTime() + 4 * 60 * 60 * 1000)
          const now = new Date()

          setNextClaim(fourHoursLater)
          setCanClaim(now >= fourHoursLater)
        } else {
          const now = new Date()
          await supabase.from("profiles").update({ mining_started_at: now.toISOString() }).eq("id", user.id)

          const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000)
          setNextClaim(fourHoursLater)
          setCanClaim(false)
        }

        const { data: boosters } = await supabase
          .from("user_boosters")
          .select("id, booster_id, expires_at, boosters(name, type, multiplier_value)")
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString())

        if (boosters) {
          setActiveBoosters(
            boosters.map((b: any) => ({
              id: b.id,
              name: b.boosters?.name || "Unknown",
              type: b.boosters?.type || "unknown",
              expires_at: b.expires_at,
              multiplier_value: b.boosters?.multiplier_value,
            })),
          )

          const hasAutoClaim = boosters.some((b: any) => b.boosters?.type === "auto_claim")
          if (hasAutoClaim !== profile.has_auto_claim) {
            await supabase.from("profiles").update({ has_auto_claim: hasAutoClaim }).eq("id", user.id)
          }
        }
      } catch (error) {
        console.error("[v0] Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router])

  useEffect(() => {
    if (!userProfile || !canClaim || !userProfile.has_auto_claim) return

    const autoClaimPoints = async () => {
      await handleClaim()
    }

    autoClaimPoints()
  }, [canClaim, userProfile])

  const handleClaim = async () => {
    if (!userProfile || !canClaim || isClaiming) return

    setIsClaiming(true)
    try {
      const supabase = createClient()

      let basePoints = 400

      const multiplierBooster = activeBoosters.find((b) => b.type === "multiplier")
      if (multiplierBooster && multiplierBooster.multiplier_value) {
        basePoints *= multiplierBooster.multiplier_value
      }

      const newPoints = userProfile.points + basePoints
      const now = new Date()

      const { error } = await supabase
        .from("profiles")
        .update({
          points: newPoints,
          mining_started_at: now.toISOString(),
          last_claim_at: now.toISOString(),
        })
        .eq("id", userProfile.id)

      if (!error) {
        setUserProfile({ ...userProfile, points: newPoints })
        setOblm(Math.floor(newPoints / 10000) * 200)

        const fourHoursLater = new Date(now.getTime() + 4 * 60 * 60 * 1000)
        setNextClaim(fourHoursLater)
        setCanClaim(false)
      }
    } catch (error) {
      console.error("[v0] Error claiming points:", error)
    } finally {
      setIsClaiming(false)
    }
  }

  const handleRefreshBoosters = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: boosters } = await supabase
        .from("user_boosters")
        .select("id, booster_id, expires_at, boosters(name, type, multiplier_value)")
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())

      if (boosters) {
        setActiveBoosters(
          boosters.map((b: any) => ({
            id: b.id,
            name: b.boosters?.name || "Unknown",
            type: b.boosters?.type || "unknown",
            expires_at: b.expires_at,
            multiplier_value: b.boosters?.multiplier_value,
          })),
        )
      }
    } catch (error) {
      console.error("[v0] Error refreshing boosters:", error)
    }
  }

  const copyReferral = () => {
    if (userProfile?.referral_code) {
      navigator.clipboard.writeText(userProfile.referral_code)
      setReferralCopied(true)
      setTimeout(() => setReferralCopied(false), 2000)
    }
  }

  const handleWalletConnect = async (wallet: any) => {
    const supabase = createClient()
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userProfile?.id).single()

    if (profile) {
      setUserProfile(profile)
      setOblm(Math.floor(profile.points / 10000) * 200)
    }
  }

  const handleBrowseBoostersClick = () => {
    if (!userProfile?.wallet_address) {
      setShowWalletNotification(true)
      setTimeout(() => setShowWalletNotification(false), 3000)
      return
    }
    setShowBoosterShop(!showBoosterShop)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background flex items-center justify-center">
        <BackgroundAnimation />
        <div className="text-primary text-lg">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background pb-32 lg:pb-8">
      <BackgroundAnimation />
      <Navigation />

      {showWalletNotification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <LiquidCard className="p-4 bg-yellow-500/20 border-yellow-500/50">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-foreground font-bold text-sm mb-1">{t("walletRequired")}</p>
                <p className="text-foreground/70 text-xs">{t("walletRequiredDesc")}</p>
              </div>
            </div>
          </LiquidCard>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <LiquidCard className="p-8 text-center">
            <div className="text-foreground/60 text-sm mb-2">{t("totalPoints")}</div>
            <div className="text-5xl font-display font-black text-primary mb-2">
              {userProfile?.points.toLocaleString() || 0}
            </div>
            <div className="h-1 bg-gradient-to-r from-primary to-accent rounded-full mt-4" />
          </LiquidCard>

          <LiquidCard className="p-8 text-center">
            <div className="text-foreground/60 text-sm mb-2">{t("oblmTokens")}</div>
            <div className="text-5xl font-display font-black text-accent">{oblm}</div>
            <div className="h-1 bg-gradient-to-r from-accent to-primary rounded-full mt-4" />
          </LiquidCard>

          <LiquidCard className="p-8 text-center">
            <div className="text-foreground/60 text-sm mb-2">{t("conversionStatus")}</div>
            <div className="text-lg font-display font-bold text-success mb-4">{t("active")}</div>
            <div className="text-xs text-foreground/60">{t("autoConvert")}</div>
          </LiquidCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <LiquidCard className="lg:col-span-2 p-8">
            <h2 className="text-2xl font-display font-bold text-primary mb-6">{t("miningPanel")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-foreground/60 text-sm mb-4">{canClaim ? t("readyToClaim") : t("nextClaimIn")}</div>
                {nextClaim && !canClaim && <CountdownTimer targetTime={nextClaim} />}
                {canClaim && (
                  <div className="text-3xl font-display font-bold text-success animate-pulse">{t("ready")} ⚡</div>
                )}
              </div>

              <div>
                <div className="text-foreground/60 text-sm mb-4">
                  {t("activeBoosters")} ({activeBoosters.length})
                </div>
                {activeBoosters.length > 0 ? (
                  <div className="space-y-2">
                    {activeBoosters.map((booster) => (
                      <div
                        key={booster.id}
                        className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg"
                      >
                        <span className="text-foreground text-sm">{booster.name}</span>
                        <span className="text-success text-xs font-bold">{t("active").toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-foreground/5 border border-foreground/10 rounded-lg text-xs text-foreground/60 text-center">
                    {t("noActiveBoosters")}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <GlowButton onClick={handleClaim} className="w-full" disabled={!canClaim || isClaiming}>
                {isClaiming ? t("claiming") : canClaim ? `⚡ ${t("claimPoints")}` : `⏱ ${t("miningInProgress")}`}
              </GlowButton>
              {userProfile?.has_auto_claim && (
                <p className="text-xs text-center text-success mt-2">{t("autoClaimEnabled")}</p>
              )}
            </div>
          </LiquidCard>

          <LiquidCard className="p-8 flex flex-col">
            <h2 className="text-xl font-display font-bold text-secondary mb-6">{t("boosters")}</h2>

            <div className="flex-grow mb-6">
              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg mb-4">
                <div className="text-xs text-foreground/60 mb-1">{t("startingFrom")}</div>
                <div className="text-2xl font-display font-bold text-secondary">0.03 SOL</div>
              </div>
              <p className="text-sm text-foreground/60">{t("unlockMultipliers")}</p>
            </div>

            <GlowButton onClick={handleBrowseBoostersClick} variant="secondary" className="w-full">
              {showBoosterShop ? t("hideShop") : t("browseBoosters")}
            </GlowButton>

            {!userProfile?.wallet_address && (
              <p className="text-xs text-center text-foreground/40 mt-2">{t("connectWalletToPurchase")}</p>
            )}
          </LiquidCard>
        </div>

        {showBoosterShop && (
          <LiquidCard className="p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-primary">{t("boosterShop")}</h2>
              <button
                onClick={() => setShowBoosterShop(false)}
                className="text-foreground/60 hover:text-foreground transition"
              >
                ✕
              </button>
            </div>
            <BoosterShop
              walletAddress={userProfile?.wallet_address}
              userId={userProfile?.id}
              onPurchaseSuccess={handleRefreshBoosters}
            />
          </LiquidCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiquidCard className="p-8">
            <h2 className="text-xl font-display font-bold text-accent mb-6">{t("walletConnection")}</h2>
            <WalletConnectButton
              walletAddress={userProfile?.wallet_address}
              onConnect={handleWalletConnect}
              variant="accent"
            />
            {!userProfile?.wallet_address && (
              <p className="text-foreground/60 text-sm mt-4">{t("connectWalletBonus")}</p>
            )}
          </LiquidCard>
        </div>

        <LiquidCard className="p-8 mt-6">
          <h2 className="text-xl font-display font-bold text-accent mb-6">{t("referFriends")}</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-foreground/60 text-sm mb-4">{t("referFriendsDesc")}</p>
              <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                <div className="text-xs text-foreground/60 mb-2">{t("yourReferralCode")}</div>
                <div className="text-2xl font-display font-bold text-accent">
                  {userProfile?.referral_code || "Loading..."}
                </div>
              </div>
            </div>
            <GlowButton onClick={copyReferral} className="w-full md:w-auto" variant="accent">
              {referralCopied ? `✓ ${t("copied")}` : t("copyCode")}
            </GlowButton>
          </div>
        </LiquidCard>
      </div>
    </div>
  )
}
