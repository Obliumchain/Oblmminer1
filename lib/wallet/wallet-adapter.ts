// Wallet connection utilities for Solana and other blockchain wallets

export interface WalletInfo {
  address: string
  type: "phantom" | "metamask" | "solflare" | "ledger"
  connected_at: string
}

function getPhantomWallet(): any {
  if (typeof window === "undefined") return null

  // Check standard Phantom injection
  if ((window as any).solana?.isPhantom) {
    return (window as any).solana
  }

  // Check alternative Phantom injection point
  if ((window as any).phantom?.solana?.isPhantom) {
    return (window as any).phantom.solana
  }

  return null
}

export async function connectPhantomWallet(): Promise<WalletInfo | null> {
  try {
    let attempts = 0
    let solana = getPhantomWallet()

    while (!solana && attempts < 30) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      solana = getPhantomWallet()
      attempts++
    }

    if (!solana) {
      throw new Error("Phantom wallet not found. Please install Phantom from phantom.app and refresh the page.")
    }

    const response = await solana.connect({ onlyIfTrusted: false })

    if (!response.publicKey) {
      throw new Error("Failed to get wallet address. Please try again.")
    }

    return {
      address: response.publicKey.toString(),
      type: "phantom",
      connected_at: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("[v0] Phantom connection error:", error)

    if (error.code === 4001) {
      throw new Error("Connection rejected. Please approve the connection in Phantom.")
    }

    if (error.message?.includes("User rejected")) {
      throw new Error("Connection rejected. Please try again and approve in Phantom.")
    }

    throw error
  }
}

export async function disconnectPhantomWallet(): Promise<void> {
  try {
    const solana = getPhantomWallet()
    if (solana) {
      await solana.disconnect()
      console.log("[v0] Phantom wallet disconnected")
    }
  } catch (error) {
    console.error("[v0] Phantom disconnection error:", error)
    throw error
  }
}

export function formatWalletAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-6)}`
}

export function getWalletExplorerUrl(address: string, type = "phantom"): string {
  return `https://solscan.io/account/${address}`
}
