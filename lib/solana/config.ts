// Solana network configuration with environment variable validation
export type SolanaCluster = "devnet" | "testnet" | "mainnet-beta"

const VALID_CLUSTERS: SolanaCluster[] = ["devnet", "testnet", "mainnet-beta"]

export function getSolanaCluster(): SolanaCluster {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK as string

  if (!cluster) {
    console.warn("[v0] NEXT_PUBLIC_SOLANA_NETWORK not set. Defaulting to devnet. Add it to your Vars section.")
    return "devnet"
  }

  if (!VALID_CLUSTERS.includes(cluster as SolanaCluster)) {
    console.warn(
      `[v0] Invalid NEXT_PUBLIC_SOLANA_NETWORK: ${cluster}. Must be one of: ${VALID_CLUSTERS.join(", ")}. Using devnet.`,
    )
    return "devnet"
  }

  return cluster as SolanaCluster
}

export const SOLANA_CONFIG = {
  cluster: getSolanaCluster(),
  rpcUrl: getRpcUrl(),
}

function getRpcUrl(): string {
  const cluster = getSolanaCluster()
  const rpcMap: Record<SolanaCluster, string> = {
    devnet: "https://api.devnet.solana.com",
    testnet: "https://api.testnet.solana.com",
    "mainnet-beta": "https://api.mainnet-beta.solana.com",
  }
  return rpcMap[cluster]
}

export const BOOSTER_PRICE_SOL = 0.07
export const RECIPIENT_WALLET = process.env.NEXT_PUBLIC_RECIPIENT_WALLET || ""

export function validateRecipientWallet(): boolean {
  if (!RECIPIENT_WALLET) {
    console.error("[v0] NEXT_PUBLIC_RECIPIENT_WALLET not set. Please add it to your Vars section.")
    return false
  }
  return true
}
