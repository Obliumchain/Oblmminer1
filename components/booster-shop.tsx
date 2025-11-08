"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { LiquidCard } from "@/components/ui/liquid-card"
import { GlowButton } from "@/components/ui/glow-button"
import { createBoosterPurchaseTransaction } from "@/lib/solana/transfer-token"
import { RECIPIENT_WALLET, validateRecipientWallet } from "@/lib/solana/config"
import { useLanguage } from "@/lib/language-context"

interface Booster {
  id: string
  name: string
  description: string
  type: string
  multiplier_value: number
  duration_hours: number
  price_sol: number
}

interface BoosterShopProps {
  walletAddress?: string | null
  userId?: string
  onPurchaseSuccess?: () => void
}

export function BoosterShop({ walletAddress, userId, onPurchaseSuccess }: BoosterShopProps) {
  const [boosters, setBoosters] = useState<Booster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    const loadBoosters = async () => {
      try {
        console.log("[v0] Loading boosters from database...")
        const supabase = createClient()
        const { data, error: fetchError } = await supabase.from("boosters").select("*").eq("active", true)

        if (fetchError) {
          console.error("[v0] Error fetching boosters:", fetchError)
          throw fetchError
        }

        console.log("[v0] Boosters loaded:", data?.length || 0, "items")
        setBoosters(data || [])
      } catch (err) {
        console.error("[v0] Error loading boosters:", err)
        setError("Failed to load boosters")
      } finally {
        setIsLoading(false)
      }
    }

    loadBoosters()
  }, [])

  const handlePurchaseBooster = async (booster: Booster) => {
    if (!walletAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!userId) {
      setError("User not authenticated")
      return
    }

    if (!validateRecipientWallet()) {
      setError("Payment system not configured. Please contact support.")
      return
    }

    setIsPurchasing(booster.id)
    setError(null)

    try {
      const { solana } = window as any

      if (!solana?.isPhantom) {
        throw new Error("Phantom wallet not found. Please install Phantom wallet.")
      }

      console.log("[v0] Creating Solana transaction for", booster.price_sol, "SOL")

      const transaction = await createBoosterPurchaseTransaction(walletAddress, RECIPIENT_WALLET, booster.price_sol)

      console.log("[v0] Requesting wallet signature...")

      const { signature } = await solana.signAndSendTransaction(transaction)

      console.log("[v0] Transaction signed with signature:", signature)

      await solana.connection.confirmTransaction(signature, "confirmed")

      console.log("[v0] Transaction confirmed. Recording purchase in database...")

      const response = await fetch("/api/boosters/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          boosterId: booster.id,
          walletTxHash: signature,
          amountSol: booster.price_sol,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Purchase failed")
      }

      console.log("[v0] Purchase successful:", result.message)
      setError(null)
      onPurchaseSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed"
      console.error("[v0] Purchase error:", err)
      setError(message)
    } finally {
      setIsPurchasing(null)
    }
  }

  if (isLoading) {
    return <div className="text-foreground/60">{t("loadingBoosters")}</div>
  }

  if (boosters.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-foreground/60 mb-4">{t("noBoostersAvailable")}</p>
        <p className="text-xs text-foreground/40">{t("boostersWillAppear")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boosters.map((booster) => (
          <LiquidCard key={booster.id} className="p-6 flex flex-col">
            <div className="flex-grow mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground">{booster.name}</h3>
                {booster.multiplier_value > 1 && (
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-bold rounded">
                    {booster.multiplier_value}x
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/60 mb-4">{booster.description}</p>
              <div className="space-y-2 text-xs text-foreground/50">
                <p>
                  {t("duration")}: {booster.duration_hours}h
                </p>
                <p>
                  {t("type")}: {booster.type}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-foreground/60 text-sm">{t("price")}</span>
                <span className="font-display font-bold text-primary">{booster.price_sol} SOL</span>
              </div>

              <GlowButton
                onClick={() => handlePurchaseBooster(booster)}
                disabled={isPurchasing === booster.id || !walletAddress}
                className="w-full"
              >
                {isPurchasing === booster.id ? t("processing") : t("buyNow")}
              </GlowButton>

              {!walletAddress && <p className="text-xs text-center text-foreground/40">{t("connectWalletToBuy")}</p>}
            </div>
          </LiquidCard>
        ))}
      </div>
    </div>
  )
}
