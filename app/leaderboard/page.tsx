"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { LiquidCard } from "@/components/ui/liquid-card"
import { BackgroundAnimation } from "@/components/background-animation"
import { useLanguage } from "@/lib/language-context"

interface LeaderboardEntry {
  rank: number
  id: string
  nickname: string
  points: number
  referrals: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const supabase = createClient()

        // Get all profiles ordered by points
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, nickname, points")
          .order("points", { ascending: false })
          .limit(100)

        if (error) throw error

        if (profiles) {
          // Get referral counts for each user
          const leaderboardData = await Promise.all(
            profiles.map(async (profile, index) => {
              const { count } = await supabase
                .from("referrals")
                .select("*", { count: "exact", head: true })
                .eq("referrer_id", profile.id)

              return {
                rank: index + 1,
                id: profile.id,
                nickname: profile.nickname || "Anonymous",
                points: profile.points || 0,
                referrals: count || 0,
              }
            }),
          )

          setLeaderboard(leaderboardData)
        }
      } catch (error) {
        console.error("[v0] Error loading leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboard()
  }, [])

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-600"
    if (rank === 2) return "from-gray-300 to-gray-500"
    if (rank === 3) return "from-orange-400 to-orange-600"
    return "from-primary to-accent"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background flex items-center justify-center">
        <BackgroundAnimation />
        <div className="text-primary text-lg">{t("loadingLeaderboard")}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[#0a0015] to-background pb-32 lg:pb-8">
      <BackgroundAnimation />
      <Navigation />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">{t("leaderboardTitle")}</h1>
          <p className="text-foreground/60">{t("leaderboardSubtitle")}</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {leaderboard.slice(0, 3).map((entry) => (
              <div key={entry.id}>
                <LiquidCard className="p-8 text-center relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getRankColor(entry.rank)} opacity-10 blur-3xl`}
                  />

                  <div className="relative z-10">
                    <div className="text-5xl mb-4">{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}</div>

                    <div
                      className={`text-lg font-display font-bold mb-2 bg-gradient-to-r ${getRankColor(entry.rank)} bg-clip-text text-transparent`}
                    >
                      #{entry.rank}
                    </div>

                    <h3 className="text-2xl font-display font-bold text-foreground mb-4">{entry.nickname}</h3>

                    <div className="mb-4">
                      <div className="text-foreground/60 text-xs mb-1">{t("points")}</div>
                      <div className="text-3xl font-display font-black text-primary">
                        {entry.points >= 1000 ? `${(entry.points / 1000).toFixed(1)}K` : entry.points}
                      </div>
                    </div>

                    <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
                      <div className="text-foreground/60 text-xs mb-1">{t("referrals")}</div>
                      <div className="text-xl font-display font-bold text-accent">{entry.referrals}</div>
                    </div>
                  </div>
                </LiquidCard>
              </div>
            ))}
          </div>
        )}

        {/* Full Leaderboard */}
        <LiquidCard className="p-8 overflow-x-auto">
          <h2 className="text-2xl font-display font-bold text-primary mb-6">{t("fullRankings")}</h2>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">{t("noMinersYet")}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-display font-bold text-foreground/60 text-sm">{t("rank")}</th>
                  <th className="text-left py-4 px-4 font-display font-bold text-foreground/60 text-sm">
                    {t("miner")}
                  </th>
                  <th className="text-right py-4 px-4 font-display font-bold text-foreground/60 text-sm">
                    {t("points")}
                  </th>
                  <th className="text-right py-4 px-4 font-display font-bold text-foreground/60 text-sm">
                    {t("referrals")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-border/50 hover:bg-primary/5 transition-colors duration-300 group"
                  >
                    <td className="py-4 px-4">
                      <div className="font-display font-bold text-primary text-lg">#{entry.rank}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-background">
                          {entry.nickname[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {entry.nickname}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-display font-bold text-primary">
                        {entry.points >= 1000 ? `${(entry.points / 1000).toFixed(1)}K` : entry.points}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-accent">{entry.referrals}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </LiquidCard>
      </div>
    </div>
  )
}
