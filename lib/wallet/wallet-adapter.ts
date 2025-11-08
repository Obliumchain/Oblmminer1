// Wallet connection utilities for Solana and other blockchain wallets

export interface WalletInfo {
  address: string
  type: "phantom" | "metamask" | "solflare" | "ledger"
  connected_at: string
}

function getPhantomWallet(): any {
  if (typeof window === "undefined") return null

  console.log("[v0] Checking for Phantom wallet...")
  console.log("[v0] window.solana:", (window as any).solana)
  console.log("[v0] window.phantom:", (window as any).phantom)
  console.log("[v0] window.solana?.isPhantom:", (window as any).solana?.isPhantom)

  // Check standard Phantom injection
  if ((window as any).solana?.isPhantom) {
    console.log("[v0] Found Phantom at window.solana")
    return (window as any).solana
  }

  // Check alternative Phantom injection point
  if ((window as any).phantom?.solana?.isPhantom) {
    console.log("[v0] Found Phantom at window.phantom.solana")
    return (window as any).phantom.solana
  }

  // Check if Phantom exists but without isPhantom flag (mobile app in-browser)
  if ((window as any).solana && typeof (window as any).solana.connect === "function") {
    console.log("[v0] Found possible Phantom at window.solana (no isPhantom flag)")
    return (window as any).solana
  }

  // Check for Solana provider array (multi-wallet scenario)
  if ((window as any).solana?.providers) {
    const phantomProvider = (window as any).solana.providers.find((p: any) => p.isPhantom)
    if (phantomProvider) {
      console.log("[v0] Found Phantom in providers array")
      return phantomProvider
    }
  }

  console.log("[v0] Phantom wallet not found")
  return null
}

export async function connectPhantomWallet(): Promise<WalletInfo | null> {
  try {
    console.log("[v0] Starting Phantom connection...")
    let attempts = 0
    let solana = getPhantomWallet()

    while (!solana && attempts < 50) {
      console.log(`[v0] Retry attempt ${attempts + 1}/50...`)
      await new Promise((resolve) => setTimeout(resolve, 100))
      solana = getPhantomWallet()
      attempts++
    }

    if (!solana) {
      console.error("[v0] Phantom wallet not detected after 50 attempts")
      throw new Error("Phantom wallet not found. Please install Phantom from phantom.app and refresh the page.")
    }

    console.log("[v0] Phantom found, attempting connection...")
    const response = await solana.connect({ onlyIfTrusted: false })
    console.log("[v0] Connection response:", response)

    if (!response.publicKey) {
      throw new Error("Failed to get wallet address. Please try again.")
    }

    console.log("[v0] Successfully connected to Phantom:", response.publicKey.toString())

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
