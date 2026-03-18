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
    'americanfootball_nfl',
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
    { key: 'americanfootball_nfl', label: 'NFL' },
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
        'americanfootball_nfl': 'NFL',
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
        'americanfootball_nfl': 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png',
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
            <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-none -mx-1 px-1">
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
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 border active:scale-95",
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
                                                    "group/game relative rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden",
                                                    isExpanded
                                                        ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.08] via-zinc-900/40 to-black/60 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]"
                                                        : "border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-emerald-500/30 hover:bg-white/[0.05]"
                                                )}
                                            >
                                                {/* Animated Glass Reflection */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent opacity-0 group-hover/game:opacity-100 transition-opacity duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover/game:translate-x-[100%]" />
                                                
                                                {/* Deep Background Glow on hover */}
                                                {!isExpanded && (
                                                    <div className="absolute -inset-4 opacity-0 group-hover/game:opacity-40 transition-opacity duration-500 blur-2xl rounded-full bg-emerald-500/10 pointer-events-none" />
                                                )}
                                            
                                                {/* Header / Time Row */}
                                                <div className="relative z-10 flex items-center justify-between px-3 sm:px-4 pt-3 pb-2 border-b border-transparent group-hover/game:border-white/[0.04] transition-colors">
                                                    <span className={cn(
                                                        "flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] uppercase rounded-full px-2 py-0.5",
                                                        isLive ? "text-red-400 bg-red-400/10 shadow-[0_0_10px_rgba(248,113,113,0.3)]" : "text-emerald-400 bg-emerald-400/10"
                                                    )}>
                                                        {isLive ? (
                                                            <>
                                                                <span className="relative flex h-1.5 w-1.5 shrink-0">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                                                </span>
                                                                <span className="animate-pulse">LIVE</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="w-3 h-3" />
                                                                {relative}
                                                            </>
                                                        )}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.15em] bg-black/40 px-2 py-0.5 rounded-full border border-white/5">{time}</span>
                                                    </div>
                                                </div>
                                            
                                                {/* Matchup Body */}
                                                <div className="relative z-10 px-3 sm:px-4 py-3 flex flex-col gap-3">
                                                    {/* Teams Area - Modern Face-Off Stack Layout */}
                                                    <div className="relative flex justify-between items-center bg-black/20 rounded-xl p-2 sm:p-3 border border-white/[0.03] group-hover/game:border-white/[0.08] transition-colors">
                                                        {/* Away Team */}
                                                        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-[40%] min-w-0">
                                                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-zinc-800 to-black border border-white/10 p-1 sm:p-1.5 flex items-center justify-center shadow-lg group-hover/game:border-white/30 transition-all duration-300 group-hover/game:scale-110 shrink-0">
                                                                <TeamLogo name={game.away} className="w-full h-full object-contain" />
                                                            </div>
                                                            <span className="text-[10px] sm:text-[11px] font-black text-white text-center leading-tight truncate w-full">
                                                                {game.away}
                                                            </span>
                                                        </div>
                                            
                                                        {/* VS Badge */}
                                                        <div className="flex flex-col items-center justify-center gap-1 w-[20%]">
                                                            <div className="w-6 h-6 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 relative">
                                                                <span className="text-[8px] font-black text-zinc-500 tracking-widest">VS</span>
                                                            </div>
                                                        </div>
                                            
                                                        {/* Home Team */}
                                                        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-[40%] min-w-0">
                                                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-zinc-800 to-black border border-white/10 p-1 sm:p-1.5 flex items-center justify-center shadow-lg group-hover/game:border-white/30 transition-all duration-300 group-hover/game:scale-110 shrink-0">
                                                                <TeamLogo name={game.home} className="w-full h-full object-contain" />
                                                            </div>
                                                            <span className="text-[10px] sm:text-[11px] font-black text-white text-center leading-tight truncate w-full">
                                                                {game.home}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Preview (Unexpanded) */}
                                                    {!isExpanded && (
                                                        <div className="flex items-center justify-between px-1">
                                                            <span className="text-[10px] font-black text-zinc-500 tracking-[0.15em] uppercase hover:text-white transition-colors">More Information</span>
                                                            <ChevronDown className="w-4 h-4 text-zinc-600 transition-transform duration-300 group-hover/game:text-emerald-400 group-hover/game:-translate-y-0.5" />
                                                        </div>
                                                    )}
                                                </div>
                                            
                                                {/* Expanded Detail (Odds Panel) */}
                                                <div className={cn(
                                                    "relative z-10 overflow-hidden transition-all duration-500 ease-in-out",
                                                    isExpanded ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0"
                                                )}>
                                                    <div className="mx-3 sm:mx-4 mb-4 pt-4 border-t border-white/[0.08]">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="group/odds flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-black/60 to-black/80 border border-white/[0.05] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black group-hover/odds:text-zinc-400 transition-colors">Away ML</span>
                                                                <span className="text-[14px] font-black text-white group-hover/odds:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover/odds:drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                                                                    {awayOdds ? formatOdds(awayOdds) : '---'}
                                                                </span>
                                                            </div>
                                                            <div className="group/odds flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-black/60 to-black/80 border border-white/[0.05] hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black group-hover/odds:text-zinc-400 transition-colors">Home ML</span>
                                                                <span className="text-[14px] font-black text-white group-hover/odds:text-emerald-400 transition-colors drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover/odds:drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                                                                    {homeOdds ? formatOdds(homeOdds) : '---'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
