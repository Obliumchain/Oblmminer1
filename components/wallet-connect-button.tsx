"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { GlowButton } from "@/components/ui/glow-button"

interface WalletConnectButtonProps {
  onConnect?: (wallet: any) => void
  onDisconnect?: () => void
  walletAddress?: string | null
  variant?: "primary" | "accent" | "secondary"
}

export function WalletConnectButton({
  onConnect,
  onDisconnect,
  walletAddress: propWalletAddress,
  variant = "primary",
}: WalletConnectButtonProps) {
  const { publicKey, disconnect, connected, connecting } = useWallet()
  const { setVisible } = useWalletModal()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleConnection = async () => {
      if (connected && publicKey) {
        const walletAddress = publicKey.toString()

        try {
          const response = await fetch("/api/wallet/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet_address: walletAddress }),
          })

          const data = await response.json()

          if (data.success) {
            if (data.bonus_awarded > 0) {
              setSuccessMessage(`Wallet connected! You earned ${data.bonus_awarded} points! 🎉`)
            } else {
              setSuccessMessage("Wallet connected successfully!")
            }
            onConnect?.({ address: walletAddress, type: "phantom", connected_at: new Date().toISOString() })
          } else {
            setError(data.error || "Failed to save wallet connection")
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Connection failed")
        }
      }
    }

    handleConnection()
  }, [connected, publicKey, onConnect])

  const handleConnect = () => {
    setError(null)
    setSuccessMessage(null)
    setVisible(true)
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      onDisconnect?.()
      setSuccessMessage(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnection failed")
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`
  }

  if (connected && publicKey) {
    const walletAddress = publicKey.toString()
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 px-4 py-3 bg-background/50 border border-primary/30 rounded-lg">
            <div className="text-xs text-foreground/60 mb-1">Connected Wallet</div>
            <div className="text-sm font-mono text-primary">{formatAddress(walletAddress)}</div>
          </div>
          <GlowButton onClick={handleDisconnect} variant={variant} className="px-6">
            Disconnect
          </GlowButton>
        </div>
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

  return (
    <div className="space-y-2">
      <GlowButton onClick={handleConnect} disabled={connecting} variant={variant} className="w-full">
        {connecting ? "Connecting..." : "Connect Wallet"}
      </GlowButton>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
