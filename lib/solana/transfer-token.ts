import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import { SOLANA_CONFIG, BOOSTER_PRICE_SOL } from "./config"

const CONNECTION = new Connection(SOLANA_CONFIG.rpcUrl)

export async function createBoosterPurchaseTransaction(
  userWalletAddress: string,
  recipientAddress: string,
  amountSol: number = BOOSTER_PRICE_SOL,
): Promise<Transaction> {
  try {
    const fromPubkey = new PublicKey(userWalletAddress)
    const toPubkey = new PublicKey(recipientAddress)

    // Convert SOL to lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = Math.round(amountSol * 1e9)

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      }),
    )

    // Get recent blockhash
    const { blockhash } = await CONNECTION.getLatestBlockhash("confirmed")
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey

    return transaction
  } catch (error) {
    console.error("[v0] Error creating Solana transaction:", error)
    throw new Error("Failed to create transaction")
  }
}

export function formatSolAmount(lamports: number): string {
  return (lamports / 1e9).toFixed(8)
}
