"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LanguageSelector } from "./language-selector"
import { useLanguage } from "@/lib/language-context"

const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const TasksIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
)

const LeaderboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0012 0V2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const iconMap = {
  "/dashboard": DashboardIcon,
  "/tasks": TasksIcon,
  "/leaderboard": LeaderboardIcon,
  "/profile": ProfileIcon,
}

export function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), key: "dashboard" },
    { href: "/tasks", label: t("tasks"), key: "tasks" },
    { href: "/leaderboard", label: t("leaderboard"), key: "leaderboard" },
    { href: "/profile", label: t("profile"), key: "profile" },
  ]

  return (
    <>
      <nav className="hidden lg:flex items-center justify-between w-full px-8 py-4 fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-cyan-500/20">
        <Link href="/welcome" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Oblium"
            width={40}
            height={40}
            className="hover:scale-110 transition-transform duration-300"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent">
            OBLIUM
          </span>
        </Link>

        <div className="flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const Icon = iconMap[item.href as keyof typeof iconMap]
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:bg-cyan-500/10 ${
                    pathname === item.href ? "text-cyan-400 bg-cyan-500/10" : "text-gray-400 hover:text-cyan-400"
                  }`}
                >
                  <Icon />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
        </div>

        <LanguageSelector />
      </nav>

      <div className="lg:hidden">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-cyan-500/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/welcome" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Oblium" width={32} height={32} />
              <span className="text-lg font-bold bg-gradient-to-r from-white via-cyan-400 to-white bg-clip-text text-transparent">
                OBLIUM
              </span>
            </Link>

            <LanguageSelector />
          </div>
        </nav>

        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
          <div className="relative mx-auto max-w-md">
            <div className="relative bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

              <div className="flex items-center justify-around px-2 py-4">
                {navItems.map((item, index) => {
                  const Icon = iconMap[item.href as keyof typeof iconMap]
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex-1 max-w-[90px] group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col items-center gap-1.5 transition-all duration-300">
                        <div className="relative">
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-cyan-500/30 rounded-2xl blur-xl animate-pulse" />
                          )}

                          <div
                            className={`relative p-3.5 rounded-2xl transition-all duration-300 ${
                              isActive
                                ? "bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-cyan-500/20 text-cyan-400 scale-110 shadow-lg shadow-cyan-500/30"
                                : "text-gray-500 group-hover:text-cyan-400 group-hover:bg-cyan-500/5 group-hover:scale-105"
                            }`}
                          >
                            <Icon />
                          </div>

                          {isActive && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-semibold transition-all duration-300 ${
                            isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-gray-300"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>

              <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
            </div>
          </div>
        </nav>
      </div>

      <div className="h-16 lg:h-20" />
      <div className="h-24 lg:hidden" />
    </>
  )
}
