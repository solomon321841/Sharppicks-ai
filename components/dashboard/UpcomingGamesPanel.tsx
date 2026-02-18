'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Activity, ChevronDown, ChevronUp, Zap } from "lucide-react"
import { TeamLogo, getTeamLogoUrl } from "./TeamLogo"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

type Matchup = {
    id: string
    home: string
    away: string
    time: string
    h2h?: { name: string, price: number }[]
}

type SportSchedule = {
    sport: string
    gamesCount: number
    matchups: Matchup[]
}

// ── League Config ──────────────────────────────────
const ALLOWED_LEAGUES = [
    'basketball_nba',
    'icehockey_nhl',
    'soccer_epl',
    'soccer_spain_la_liga',
    'basketball_ncaab',
    'soccer_uefa_champs_league'
] as const

type LeagueTab = 'all' | typeof ALLOWED_LEAGUES[number]

const LEAGUE_TABS: { key: LeagueTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'basketball_nba', label: 'NBA' },
    { key: 'icehockey_nhl', label: 'NHL' },
    { key: 'soccer_epl', label: 'EPL' },
    { key: 'soccer_spain_la_liga', label: 'La Liga' },
    { key: 'basketball_ncaab', label: 'NCAAB' },
    { key: 'soccer_uefa_champs_league', label: 'UCL' },
]

// ── Helpers ────────────────────────────────────────
const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    let relative = ''
    if (diffMs < 0) {
        relative = 'LIVE'
    } else if (diffHrs === 0) {
        relative = `${diffMins}m`
    } else if (diffHrs < 24) {
        relative = `${diffHrs}h ${diffMins}m`
    } else {
        relative = `${Math.floor(diffHrs / 24)}d ${diffHrs % 24}h`
    }

    return {
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isLive: diffMs < 0,
        relative,
        diffHrs
    }
}

const formatOdds = (odds?: number) => {
    if (!odds) return 'N/A'
    return odds > 0 ? `+${odds}` : odds.toString()
}

const getSportName = (key: string) => {
    const map: Record<string, string> = {
        'basketball_nba': 'NBA',
        'icehockey_nhl': 'NHL',
        'soccer_epl': 'EPL',
        'soccer_spain_la_liga': 'La Liga',
        'basketball_ncaab': 'NCAAB',
        'soccer_uefa_champs_league': 'Champions League'
    }
    return map[key] || key.replace(/_/g, ' ').toUpperCase()
}

const getSportLogo = (key: string) => {
    const map: Record<string, string> = {
        'basketball_nba': 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
        'icehockey_nhl': 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png',
        'soccer_epl': 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png',
        'soccer_spain_la_liga': 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png',
        'basketball_ncaab': 'https://a.espncdn.com/i/espn/misc_logos/500/ncaa.png',
        'soccer_uefa_champs_league': 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
    }
    return map[key]
}

// ── Component ──────────────────────────────────────
export function UpcomingGamesPanel({ schedule }: { schedule: SportSchedule[] }) {
    const [expandedGames, setExpandedGames] = useState<Record<string, boolean>>({})
    const [activeTab, setActiveTab] = useState<LeagueTab>('all')

    const toggleGame = (gameId: string) => {
        setExpandedGames(prev => ({
            ...prev,
            [gameId]: !prev[gameId]
        }))
    }

    // ── Filter: league, time window (24→48→72h), logo validation ──
    const filteredSports = useMemo(() => {
        const now = new Date().getTime()
        const hourMs = 60 * 60 * 1000

        // Only keep allowed leagues
        const allowedSports = schedule.filter(s =>
            (ALLOWED_LEAGUES as readonly string[]).includes(s.sport)
        )

        const getGamesInWindow = (windowHours: number) => {
            const windowEnd = now + (windowHours * hourMs)
            return allowedSports.map(sport => {
                const validMatchups = sport.matchups.filter(game => {
                    const gameTimeMs = new Date(game.time).getTime()
                    // Allow games that started up to 3 hours ago (Live) up to windowEnd
                    if (gameTimeMs < (now - 3 * 3600000) || gameTimeMs > windowEnd) return false
                    return true
                })
                return { ...sport, matchups: validMatchups, gamesCount: validMatchups.length }
            }).filter(s => s.gamesCount > 0)
        }

        // Tiered: try 24h, then 48h, then 72h
        let result = getGamesInWindow(24)
        if (result.length === 0) result = getGamesInWindow(48)
        if (result.length === 0) result = getGamesInWindow(72)

        // Apply tab filter
        if (activeTab !== 'all') {
            result = result.filter(s => s.sport === activeTab)
        }

        return result
    }, [schedule, activeTab])

    // Count games per league for tab badges (unfiltered by tab)
    const allLeagueGames = useMemo(() => {
        const now = new Date().getTime()
        const hourMs = 60 * 60 * 1000
        const allowedSports = schedule.filter(s =>
            (ALLOWED_LEAGUES as readonly string[]).includes(s.sport)
        )
        const getGamesInWindow = (windowHours: number) => {
            const windowEnd = now + (windowHours * hourMs)
            return allowedSports.map(sport => {
                const validMatchups = sport.matchups.filter(game => {
                    const gameTimeMs = new Date(game.time).getTime()
                    if (gameTimeMs < (now - 3 * 3600000) || gameTimeMs > windowEnd) return false
                    return true
                })
                return { ...sport, matchups: validMatchups, gamesCount: validMatchups.length }
            }).filter(s => s.gamesCount > 0)
        }
        let result = getGamesInWindow(24)
        if (result.length === 0) result = getGamesInWindow(48)
        if (result.length === 0) result = getGamesInWindow(72)
        return result
    }, [schedule])

    const leagueCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        allLeagueGames.forEach(s => {
            counts[s.sport] = (counts[s.sport] || 0) + s.gamesCount
        })
        return counts
    }, [allLeagueGames])

    const totalGames = allLeagueGames.reduce((sum, s) => sum + s.gamesCount, 0)

    // ── Empty State ──
    if (schedule.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-zinc-900/50 to-zinc-950/80">
                <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4 ring-1 ring-white/10">
                    <CalendarDays className="h-7 w-7 text-zinc-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">No Upcoming Games</h3>
                <p className="text-xs text-zinc-500 mt-1.5 max-w-[200px]">
                    Check back later for live odds and schedules.
                </p>
            </div>
        )
    }

    return (
        <Card className="h-full border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-2">
                <CardTitle className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    Upcoming
                    <span className="text-zinc-600 font-mono text-[10px] tracking-normal">·</span>
                    <span className="text-zinc-600 font-mono text-[10px] tracking-normal font-medium">{totalGames} games</span>
                </CardTitle>
            </CardHeader>

            {/* ── League Tabs ── */}
            <div className="flex gap-1 pb-3 overflow-x-auto scrollbar-none">
                {LEAGUE_TABS.map(tab => {
                    const count = tab.key === 'all' ? totalGames : (leagueCounts[tab.key] || 0)
                    const isActive = activeTab === tab.key
                    // Hide tabs with 0 games (except All)
                    if (tab.key !== 'all' && count === 0) return null

                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 border",
                                isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_10px_-4px_rgba(16,185,129,0.25)]"
                                    : "bg-white/[0.03] text-zinc-500 border-white/[0.04] hover:bg-white/[0.06] hover:text-zinc-400"
                            )}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={cn(
                                    "text-[9px] min-w-[16px] text-center px-1 py-px rounded font-mono font-bold",
                                    isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.06] text-zinc-600"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            <CardContent className="px-0 relative">
                {/* Fade Mask Top */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />

                <div className="h-[440px] overflow-y-auto pr-0.5 space-y-4 pb-6 scrollbar-thin scrollbar-thumb-zinc-800/50 scrollbar-track-transparent">
                    {filteredSports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <CalendarDays className="h-7 w-7 text-zinc-700 mb-3" />
                            <p className="text-sm text-zinc-500 font-medium">No games for this league</p>
                            <p className="text-xs text-zinc-600 mt-1">Try another tab or check back later</p>
                        </div>
                    ) : (
                        filteredSports.map((sport) => (
                            <div key={sport.sport} className="space-y-2">
                                {/* Sport Header */}
                                <div className="flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-lg py-1.5 z-10">
                                    <div className="flex items-center gap-2">
                                        {getSportLogo(sport.sport) ? (
                                            <div className="relative w-5 h-5 shrink-0">
                                                <Image
                                                    src={getSportLogo(sport.sport)!}
                                                    alt={sport.sport}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <Activity className="w-4 h-4 text-emerald-400" />
                                        )}
                                        <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">
                                            {getSportName(sport.sport)}
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-600 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.04]">
                                        {sport.gamesCount}
                                    </span>
                                </div>

                                {/* Games List */}
                                <div className="space-y-1.5">
                                    {sport.matchups.map((game, i) => {
                                        const { time, isLive, relative } = formatTime(game.time)
                                        const isExpanded = expandedGames[game.id] || false
                                        const homeOdds = game.h2h?.find(o => o.name === game.home)?.price
                                        const awayOdds = game.h2h?.find(o => o.name === game.away)?.price

                                        return (
                                            <div
                                                key={game.id || i}
                                                onClick={() => toggleGame(game.id)}
                                                className={cn(
                                                    "group relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                                                    isExpanded
                                                        ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.04] to-transparent shadow-[0_0_20px_-8px_rgba(16,185,129,0.12)]"
                                                        : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.04]"
                                                )}
                                            >
                                                {/* Time Row */}
                                                <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                                                    <span className={cn(
                                                        "flex items-center gap-1.5 text-[10px] font-bold tracking-wide",
                                                        isLive ? "text-red-400" : "text-emerald-400/70"
                                                    )}>
                                                        {isLive ? (
                                                            <Zap className="w-3 h-3 animate-pulse" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {isLive ? 'LIVE' : relative}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-zinc-600 font-mono">{time}</span>
                                                        <ChevronDown className={cn(
                                                            "w-3 h-3 text-zinc-600 transition-transform duration-300",
                                                            isExpanded && "rotate-180 text-emerald-400/50"
                                                        )} />
                                                    </div>
                                                </div>

                                                {/* Teams Container */}
                                                <div className="px-3 pb-2.5">
                                                    {/* Away Team */}
                                                    <div className="flex items-center justify-between gap-2 py-1.5">
                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                            <TeamLogo name={game.away} className="w-7 h-7 shrink-0" />
                                                            <span className="text-[13px] font-semibold text-zinc-200 truncate">
                                                                {game.away}
                                                            </span>
                                                        </div>
                                                        {awayOdds && (
                                                            <span className={cn(
                                                                "text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded-md tabular-nums",
                                                                awayOdds > 0
                                                                    ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/15"
                                                                    : "text-zinc-400 bg-white/[0.04]"
                                                            )}>
                                                                {formatOdds(awayOdds)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* VS Divider */}
                                                    <div className="flex items-center gap-3 py-0.5">
                                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                                                        <span className="text-[8px] font-bold text-zinc-700 tracking-widest">VS</span>
                                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                                                    </div>

                                                    {/* Home Team */}
                                                    <div className="flex items-center justify-between gap-2 py-1.5">
                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                            <TeamLogo name={game.home} className="w-7 h-7 shrink-0" />
                                                            <span className="text-[13px] font-semibold text-zinc-200 truncate">
                                                                {game.home}
                                                            </span>
                                                        </div>
                                                        {homeOdds && (
                                                            <span className={cn(
                                                                "text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded-md tabular-nums",
                                                                homeOdds > 0
                                                                    ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/15"
                                                                    : "text-zinc-400 bg-white/[0.04]"
                                                            )}>
                                                                {formatOdds(homeOdds)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Expanded Detail */}
                                                {isExpanded && (
                                                    <div className="mx-3 mb-3 pt-2 border-t border-white/[0.05]">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                                                <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Away ML</span>
                                                                <span className="text-sm font-mono font-bold text-emerald-400">
                                                                    {formatOdds(awayOdds)}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                                                <span className="text-[9px] text-zinc-600 uppercase tracking-wider font-semibold">Home ML</span>
                                                                <span className="text-sm font-mono font-bold text-emerald-400">
                                                                    {formatOdds(homeOdds)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Fade Mask Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            </CardContent>
        </Card>
    )
}
