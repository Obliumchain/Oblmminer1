import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

// Get current user profile with referral code
export async function getUserProfile() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return { user, profile }
}

// Get referral count for user
export async function getReferralCount(userId: string) {
  const supabase = await createServerClient()

  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", userId)

  return count || 0
}

// Get referred users
export async function getReferredUsers(userId: string) {
  const supabase = await createServerClient()

  const { data } = await supabase
    .from("referrals")
    .select(`
      *,
      user:referred_user_id(id, email)
    `)
    .eq("referrer_id", userId)

  return data || []
}

// Validate referral code exists
export async function validateReferralCode(code: string) {
  const supabase = createBrowserClient()

  const { data } = await supabase.from("profiles").select("id").eq("referral_code", code).single()

  return data ? true : false
}
