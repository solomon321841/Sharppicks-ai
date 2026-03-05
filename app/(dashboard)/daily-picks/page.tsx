'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, Calendar, Zap, Shield, Activity, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { TeamLogo } from "@/components/dashboard/TeamLogo"


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
        title: 'Safe',
        icon: Shield,
        color: 'emerald',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        text: 'text-emerald-400',
        bgHover: 'hover:bg-emerald-500/[0.04]',
        gradient: 'from-emerald-600 to-emerald-400',
        borderGlow: 'from-emerald-600 via-emerald-400 to-emerald-600',
        description: 'Heavy favorites - very safe picks',
        shadowText: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
        locked: false
    },
    {
        type: 'balanced',
        title: 'Balanced',
        icon: Activity,
        color: 'blue',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        text: 'text-blue-400',
        bgHover: 'hover:bg-blue-500/[0.04]',
        gradient: 'from-blue-600 to-blue-400',
        borderGlow: 'from-blue-600 via-blue-400 to-blue-600',
        description: 'Mix of safe and moderate picks',
        shadowText: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]',
        locked: false
    },
    {
        type: 'risky',
        title: 'High Risk',
        icon: Flame,
        color: 'orange',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        text: 'text-orange-400',
        bgHover: 'hover:bg-orange-500/[0.04]',
        gradient: 'from-orange-600 to-orange-400',
        borderGlow: 'from-orange-600 via-orange-400 to-orange-600',
        description: 'Underdogs and high-reward props',
        shadowText: 'shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]',
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
                <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    Daily Picks <span className="text-emerald-500">.</span>
                </h2>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    High-confidence AI selections dropped daily at 9:00 AM EST.
                </p>
            </div>

            <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-[1600px] w-full items-start ${loading ? '' : 'justify-center mx-auto'}`}>
                {PARLAY_TYPES.map((config) => {
                    const pick = loading ? null : picks.find(p => p.parlay_type === config.type);
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
                                <Badge variant="outline" className={`${config.badge} backdrop-blur-md px-2.5 py-0.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter ${config.shadowText}`}>
                                    <Icon className="w-3 h-3 animate-pulse" />
                                    {loading ? '--' : (pick?.ai_confidence || 85)}%
                                </Badge>
                            </div>

                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-30 p-6 text-center">
                                    <div className="p-4 rounded-full bg-zinc-900/80 mb-4 ring-1 ring-white/10">
                                        <Lock className="text-zinc-400 w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-xl text-white mb-2">Pro Pick Locked</h3>
                                    <p className="text-sm text-zinc-400 mb-6 max-w-[200px]">Upgrade to Sharppicks Pro to unlock high-reward Daily Lotto.</p>
                                    <Button variant="outline" className={`border-${config.color}-500/50 ${config.text} hover:bg-${config.color}-500 hover:text-white transition-all`}>
                                        Upgrade to Unlock
                                    </Button>
                                </div>
                            )}

                            <CardHeader className="flex flex-col space-y-0.5 pb-2 pt-3 px-4 relative z-20 border-b border-white/5">
                                <CardTitle className="text-sm font-black text-white tracking-widest uppercase flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Icon className={`w-3 h-3 ${config.text}`} /> {config.title} PARLAY
                                    </span>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-[9px] font-bold text-white/50 leading-none">
                                    <span className="text-white/80">{loading ? '3' : (pick?.num_legs || 3)} LEGS</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                                    <span className={`${config.text}`}>{loading ? '+Odds' : (pick?.total_odds || '+400')}</span>
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-1 relative z-10 px-2 py-1 flex-1 overflow-hidden">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className={`h-8 w-8 animate-spin ${config.text}`} />
                                        <span className="text-xs text-zinc-500 animate-pulse">Running AI Simulations...</span>
                                    </div>
                                ) : pick ? (
                                    pick.legs.map((leg: any, i: number) => {
                                        const isProp = leg.player && leg.player.length > 0;
                                        const subText = isProp ? `${leg.team} vs ${leg.opponent}` : `vs ${leg.opponent}`;

                                        return (
                                            <div key={i} className={`group relative flex flex-col gap-1 py-1.5 px-2 rounded-xl border border-white/[0.03] bg-zinc-900/40 ${config.bgHover} transition-all duration-300`}>
                                                <div className="relative z-10 flex justify-between items-center gap-2">
                                                    <div className="flex gap-2 items-center min-w-0">
                                                        <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                                                            <div className="absolute inset-0 bg-white/5 rounded-full blur-[1px]" />
                                                            <div className="relative w-full h-full rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center overflow-hidden">
                                                                <TeamLogo name={leg.team} className="w-3.5 h-3.5 relative z-10" />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[11px] font-black text-white tracking-tight truncate">
                                                                    {isProp ? leg.player : leg.team}
                                                                </span>
                                                                {isProp && (
                                                                    <Badge className={`${config.badge} bg-opacity-10 border-none text-[7px] h-3 px-1 font-black leading-none`}>
                                                                        PROP
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-[8px] font-bold text-zinc-500 truncate uppercase mt-[-1px]">
                                                                {(leg.bet_type || '').replace('_', ' ')} <span className="text-zinc-700 italic lowercase font-medium">({subText})</span>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end shrink-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-black text-white tracking-tighter">
                                                                {leg.line === 'Yes' ? 'WIN' : (leg.line || leg.bet_type)}
                                                            </span>
                                                            <Badge variant="outline" className={`text-[10px] font-mono font-black h-4 px-1.5 ${config.badge}`}>
                                                                {leg.odds}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative z-10 bg-black/30 py-1.5 px-2 rounded-lg border border-white/[0.02]">
                                                    <p className="text-[9px] leading-[1.25] text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">
                                                        {leg.ai_reasoning || leg.reasoning}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : null}
                            </CardContent>

                            {pick && !loading && !isLocked && (
                                <CardFooter className="flex flex-col gap-3 pt-3 pb-5 px-4 bg-gradient-to-t from-black/50 to-transparent border-t border-white/5 relative z-20 mt-auto">
                                    <Button className={`w-full relative overflow-hidden bg-gradient-to-r ${config.gradient} text-white border-0 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.2)] transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02] text-xs h-10 uppercase tracking-widest font-black group`}>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 transform skew-x-12" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
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
