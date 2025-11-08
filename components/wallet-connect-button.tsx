"use client"

import { useState, useEffect } from "react"
import {
  connectPhantomWallet,
  disconnectPhantomWallet,
  formatWalletAddress,
  type WalletInfo,
} from "@/lib/wallet/wallet-adapter"
import { GlowButton } from "@/components/ui/glow-button"

interface WalletConnectButtonProps {
  onConnect?: (wallet: WalletInfo) => void
  onDisconnect?: () => void
  walletAddress?: string | null
  variant?: "primary" | "accent" | "secondary"
}

export function WalletConnectButton({
  onConnect,
  onDisconnect,
  walletAddress,
  variant = "primary",
}: WalletConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPhantomInstalled, setIsPhantomInstalled] = useState<boolean | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const checkPhantom = () => {
      const hasPhantom = !!((window as any).solana?.isPhantom || (window as any).phantom?.solana?.isPhantom)
      setIsPhantomInstalled(hasPhantom)
    }

    checkPhantom()

    const timers = [setTimeout(checkPhantom, 500), setTimeout(checkPhantom, 1000), setTimeout(checkPhantom, 2000)]

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const wallet = await connectPhantomWallet()
      if (wallet) {
        const response = await fetch("/api/wallet/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_address: wallet.address }),
        })

        const data = await response.json()

        if (data.success) {
          if (data.bonus_awarded > 0) {
            setSuccessMessage(`Wallet connected! You earned ${data.bonus_awarded} points! 🎉`)
          } else {
            setSuccessMessage("Wallet connected successfully!")
          }
          onConnect?.(wallet)
        } else {
          setError(data.error || "Failed to save wallet connection")
        }
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await disconnectPhantomWallet()
      onDisconnect?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnection failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (walletAddress) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 px-4 py-3 bg-background/50 border border-primary/30 rounded-lg">
            <div className="text-xs text-foreground/60 mb-1">Connected Wallet</div>
            <div className="text-sm font-mono text-primary">{formatWalletAddress(walletAddress)}</div>
          </div>
          <GlowButton onClick={handleDisconnect} disabled={isLoading} variant={variant} className="px-6">
            {isLoading ? "..." : "Disconnect"}
          </GlowButton>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {isPhantomInstalled === false && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg mb-2">
          <p className="text-xs text-cyan-400 mb-2">Phantom wallet not detected</p>
          <a
            href="https://phantom.app/download"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-300 underline hover:text-cyan-200"
          >
            Install Phantom Wallet →
          </a>
        </div>
      )}

      <GlowButton
        onClick={handleConnect}
        disabled={isLoading || isPhantomInstalled === false}
        variant={variant}
        className="w-full"
      >
        {isLoading ? "Connecting..." : "Connect Phantom Wallet"}
      </GlowButton>

      {successMessage && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-xs text-green-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
