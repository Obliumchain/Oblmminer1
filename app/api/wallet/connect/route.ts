import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { wallet_address } = await request.json()

    if (!wallet_address) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("wallet_address, points")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const isFirstConnection = !profile.wallet_address
    const bonusPoints = isFirstConnection ? 500 : 0
    const newPoints = profile.points + bonusPoints

    const { error } = await supabase
      .from("profiles")
      .update({
        wallet_address,
        points: newPoints,
      })
      .eq("id", user.id)

    if (error) {
      console.error("[v0] Error updating wallet:", error)
      return NextResponse.json({ error: "Failed to connect wallet" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      wallet_address,
      bonus_awarded: bonusPoints,
      new_points: newPoints,
    })
  } catch (error) {
    console.error("[v0] Wallet connection error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
