import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { referralCode } = await request.json()

    if (!referralCode || !referralCode.trim()) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    // Call the database function to process referral
    const { data, error } = await supabase.rpc("process_referral_reward", {
      p_referrer_code: referralCode.trim(),
      p_new_user_id: user.id,
    })

    if (error) {
      console.error("[v0] Referral processing error:", error)
      return NextResponse.json({ error: "Failed to process referral" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Referral processed successfully" })
  } catch (error) {
    console.error("[v0] Referral API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
