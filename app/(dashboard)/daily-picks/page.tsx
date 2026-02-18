'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, Calendar, Zap, Shield, Activity, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { TeamLogo } from "@/components/dashboard/TeamLogo"
import { PlayerAvatar } from "@/components/dashboard/PlayerAvatar"


// Helper for League Badges
const getLeagueInfo = (sport: string) => {
    if (sport?.includes('nba')) return { name: 'NBA', color: 'bg-orange-500/20 text-orange-500 border-orange-500/50', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png' }
    if (sport?.includes('nhl')) return { name: 'NHL', color: 'bg-cyan-500/20 text-cyan-500 border-cyan-500/50', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png' }
    if (sport?.includes('nfl')) return { name: 'NFL', color: 'bg-blue-500/20 text-blue-500 border-blue-500/50', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png' }
    if (sport?.includes('epl')) return { name: 'EPL', color: 'bg-purple-500/20 text-purple-500 border-purple-500/50', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png' }
    if (sport?.includes('la_liga')) return { name: '', color: 'bg-red-500/20 text-red-500 border-red-500/50', logo: '/laliga.png' }
    if (sport?.includes('mlb')) return { name: 'MLB', color: 'bg-red-500/20 text-red-500 border-red-500/50', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/mlb.png' }
    return { name: 'MIXED', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50', logo: null }
}

// Parlay type configurations
const PARLAY_TYPES = [
    {
        type: 'safe',
        title: 'Safe Bet',
        icon: Shield,
        color: 'emerald',
        gradient: 'from-emerald-600 to-emerald-400',
        borderGlow: 'from-emerald-600 via-emerald-400 to-emerald-600',
        description: 'Heavy favorites - very safe picks',
        locked: false
    },
    {
        type: 'balanced',
        title: 'Balanced',
        icon: Activity,
        color: 'blue',
        gradient: 'from-blue-600 to-blue-400',
        borderGlow: 'from-blue-600 via-blue-400 to-blue-600',
        description: 'Mix of safe and moderate picks',
        locked: false
    },
    {
        type: 'risky',
        title: 'High Risk',
        icon: Flame,
        color: 'orange',
        gradient: 'from-orange-600 to-orange-400',
        borderGlow: 'from-orange-600 via-orange-400 to-orange-600',
        description: 'Underdogs and high-reward props',
        locked: false
    },

];

export default function DailyPicksPage() {
    const [picks, setPicks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDailyPicks = async () => {
            try {
                const res = await fetch(`/api/daily-picks?t=${Date.now()}`)
                if (res.ok) {
                    const data = await res.json()
                    setPicks(Array.isArray(data) ? data : [data])
                }
            } catch (error) {
                console.error('Failed to fetch daily picks:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchDailyPicks()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    Daily Picks <span className="text-emerald-500">.</span>
                </h2>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    High-confidence AI selections dropped daily at 9:00 AM EST.
                </p>
            </div>

            <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-[1600px] w-full items-start ${loading ? '' : 'justify-center mx-auto'}`}>
                {PARLAY_TYPES.map((config, idx) => {
                    const pick = picks[idx];
                    const Icon = config.icon;
                    const isLocked = config.locked;

                    // Hide card if no pick available and not loading
                    if (!loading && !pick) return null;

                    return (
                        <Card key={config.type} className={`w-full bg-gradient-to-b from-zinc-900 to-black border-zinc-800 shadow-2xl relative overflow-hidden group/card flex flex-col h-full transform transition-all duration-500 hover:scale-[1.01] ${isLocked ? 'opacity-60' : ''}`}>
                            {/* Top Glow Border */}
                            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.borderGlow} opacity-80`} />

                            {/* Top Right Confidence Badge */}
                            <div className="absolute top-3 right-3 z-10">
                                <Badge variant="outline" className={`bg-emerald/10 text-emerald border-emerald/50 backdrop-blur-md shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] px-2.5 py-0.5 flex items-center gap-1 text-[10px]`}>
                                    <Activity className="w-3 h-3" />
                                    {loading ? '--' : (pick?.ai_confidence || 85)}% Confidence
                                </Badge>
                            </div>

                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-30 p-6 text-center">
                                    <div className="p-4 rounded-full bg-zinc-900/80 mb-4 ring-1 ring-white/10">
                                        <Lock className="text-zinc-400 w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-xl text-white mb-2">Pro Pick Locked</h3>
                                    <p className="text-sm text-zinc-400 mb-6 max-w-[200px]">Upgrade to Sharppicks Pro to unlock high-reward Daily Lotto.</p>
                                    <Button variant="outline" className={`border-${config.color}/50 text-${config.color} hover:bg-${config.color} hover:text-white transition-all`}>
                                        Upgrade to Unlock
                                    </Button>
                                </div>
                            )}

                            <CardHeader className="pl-4 pb-2 pt-6">
                                <CardTitle className="flex items-center gap-2">
                                    <span className="bg-emerald/10 p-1.5 rounded-lg ring-1 ring-emerald/20">
                                        <Activity className="w-4 h-4 text-emerald" />
                                    </span>
                                    <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                                        AI PARLAY
                                    </span>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-sm font-medium text-emerald/90 pl-1">
                                    <span className="font-bold text-white">{loading ? '3' : (pick?.num_legs || 3)} Legs</span>
                                    <span className="w-1 h-1 bg-white/30 rounded-full" />
                                    <span className="font-mono text-emerald-400 font-bold">{loading ? '+Odds' : (pick?.total_odds || '+400')} Odds</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-2 relative z-10 px-3 pb-3 flex-grow flex flex-col">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                                        <span className="text-xs text-zinc-500 animate-pulse">Running AI Simulations...</span>
                                    </div>
                                ) : pick ? (
                                    pick.legs.map((leg: any, i: number) => {
                                        const league = getLeagueInfo(leg.sport);
                                        const isProp = leg.player && leg.player.length > 0;
                                        const headerText = isProp ? leg.player : leg.team;
                                        const subText = `${leg.team} vs ${leg.opponent}`;

                                        return (
                                            <div key={i} className="group flex flex-col p-2.5 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-emerald/40 transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_-10px_rgba(16,185,129,0.2)]">
                                                {/* Header: Logo + Name + Odds */}
                                                <div className="flex justify-between items-center h-[28px]">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <div className="relative w-6 h-6 rounded-full ring-1 ring-white/10 group-hover:ring-emerald/40 transition-colors flex items-center justify-center shrink-0">
                                                            {isProp ? (
                                                                <PlayerAvatar url={leg.player_image_url} name={leg.player} team={leg.team} className="w-6 h-6" />
                                                            ) : (
                                                                <TeamLogo name={leg.team} className="w-4 h-4" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors leading-tight line-clamp-1 tracking-tight">
                                                            {headerText}
                                                        </span>
                                                    </div>
                                                    <Badge variant="secondary" className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0 h-4 shrink-0 ml-1.5 shadow-[0_0_10px_-5px_rgba(16,185,129,0.3)]">
                                                        {leg.odds}
                                                    </Badge>
                                                </div>

                                                {/* Meta Row: Badge + Matchup */}
                                                <div className="flex items-center gap-2 mt-1.5 h-[20px]">
                                                    {(() => {
                                                        const type = leg.bet_type?.toLowerCase();
                                                        let label = 'Moneyline';
                                                        let colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

                                                        if (isProp) {
                                                            label = 'Prop';
                                                            colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                                                        } else if (type === 'spread') {
                                                            label = 'Spread';
                                                            colorClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                                                        } else if (type === 'totals' || type === 'total') {
                                                            label = 'Total';
                                                            colorClass = 'bg-pink-500/10 text-pink-400 border-pink-500/20';
                                                        }

                                                        return (
                                                            <Badge variant="outline" className={`mt-0.5 shrink-0 text-[8px] px-1 py-0 h-3.5 uppercase tracking-wider font-bold border-white/10 shadow-sm ${colorClass}`}>
                                                                {label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                    <span className="text-[9px] text-muted-foreground/80 leading-tight font-medium truncate">
                                                        {subText}
                                                    </span>
                                                </div>

                                                {/* Bet Line / Action */}
                                                <div className="mt-1.5 h-[20px] flex items-center">
                                                    {leg.bet_type?.toLowerCase() !== 'moneyline' ? (
                                                        <span className="text-xs font-black text-white tracking-tight truncate w-full pl-0.5 drop-shadow-sm">
                                                            {leg.line === 'Yes' ? 'To Score' : (leg.line || leg.bet_type)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-black text-transparent select-none" aria-hidden="true">-</span>
                                                    )}
                                                </div>

                                                {/* Reasoning */}
                                                <div className="mt-1.5 pt-1.5 border-t border-white/5 relative">
                                                    <div className="absolute left-0 top-2 bottom-0 w-0.5 bg-emerald-500/40 rounded-full"></div>
                                                    <p className="text-[9px] text-muted-foreground/90 italic pl-2 leading-snug line-clamp-2">
                                                        {leg.ai_reasoning || leg.reasoning}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    // This branch is technically covered by the initial 'if (!loading && !pick) return null'
                                    // But kept for safety during loading or unexpected states
                                    null
                                )}
                            </CardContent>

                            {pick && !loading && !isLocked && (
                                <CardFooter className="flex flex-col gap-3 pt-3 pb-5 px-4 bg-gradient-to-t from-emerald-950/20 to-transparent border-t border-white/5 relative z-20 mt-auto">
                                    <Button className={`w-full relative overflow-hidden bg-gradient-to-r ${config.gradient} text-white border-0 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] text-xs h-10 uppercase tracking-widest font-black group`}>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 transform skew-x-12" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                                            Bet This Parlay
                                        </span>
                                    </Button>
                                    <p className="text-[9px] text-center text-muted-foreground/40 font-mono uppercase tracking-widest">
                                        Track & Analyze Your Performance
                                    </p>
                                </CardFooter>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
