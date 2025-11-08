// API route to handle booster purchase completion and database updates
import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    })

    const { userId, boosterId, walletTxHash, amountSol } = await request.json()

    if (!userId || !boosterId || !walletTxHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: booster, error: boosterError } = await supabase
      .from("boosters")
      .select("*")
      .eq("id", boosterId)
      .single()

    if (boosterError || !booster) {
      return NextResponse.json({ error: "Booster not found" }, { status: 404 })
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("booster_transactions")
      .insert({
        user_id: userId,
        booster_id: boosterId,
        amount_sol: amountSol,
        wallet_tx_hash: walletTxHash,
        status: "completed",
      })
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
    }

    const expiresAt = new Date(Date.now() + booster.duration_hours * 60 * 60 * 1000)
    const { data: userBooster, error: userBoosterError } = await supabase
      .from("user_boosters")
      .insert({
        user_id: userId,
        booster_id: boosterId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (userBoosterError) {
      return NextResponse.json({ error: "Failed to activate booster" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transaction,
      userBooster,
      message: `Booster activated for ${booster.duration_hours} hours!`,
    })
  } catch (error) {
    console.error("[v0] Booster purchase error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
