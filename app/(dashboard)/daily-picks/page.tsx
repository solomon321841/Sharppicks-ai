'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, Zap, Shield, Activity, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { TeamLogo } from "@/components/dashboard/TeamLogo"

// Parlay type configurations
const PARLAY_TYPES = [
    {
        type: 'safe',
        title: 'Safe',
        icon: Shield,
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        text: 'text-emerald-400',
        gradient: 'from-emerald-600 to-emerald-400',
        borderGlow: 'from-emerald-600 via-emerald-400 to-emerald-600',
        shadowText: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
        locked: false
    },
    {
        type: 'balanced',
        title: 'Balanced',
        icon: Activity,
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        text: 'text-blue-400',
        gradient: 'from-blue-600 to-blue-400',
        borderGlow: 'from-blue-600 via-blue-400 to-blue-600',
        shadowText: 'shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]',
        locked: false
    },
    {
        type: 'risky',
        title: 'High Risk',
        icon: Flame,
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        text: 'text-orange-400',
        gradient: 'from-orange-600 to-orange-400',
        borderGlow: 'from-orange-600 via-orange-400 to-orange-600',
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
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden animate-in fade-in duration-700">
            {/* Header — compact */}
            <div className="flex items-center justify-between shrink-0 pb-3">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                        Daily Picks <span className="text-emerald-500">.</span>
                    </h2>
                    <p className="text-muted-foreground font-medium flex items-center gap-1.5 text-xs mt-0.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        High-confidence AI selections dropped daily at 9:00 AM EST.
                    </p>
                </div>
            </div>

            {/* Cards Grid — fills remaining space */}
            <div className="grid gap-4 lg:grid-cols-3 flex-1 min-h-0">
                {PARLAY_TYPES.map((config) => {
                    const pick = loading ? null : picks.find(p => p.parlay_type === config.type);
                    const Icon = config.icon;
                    const isLocked = config.locked;

                    if (!loading && !pick) return null;

                    return (
                        <Card key={config.type} className={`bg-gradient-to-b from-zinc-900 to-black border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col min-h-0 transition-all duration-500 hover:border-zinc-700 ${isLocked ? 'opacity-60' : ''}`}>
                            {/* Top Glow Border */}
                            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${config.borderGlow} opacity-80`} />

                            {/* Confidence Badge */}
                            <div className="absolute top-2.5 right-3 z-10">
                                <Badge variant="outline" className={`${config.badge} backdrop-blur-md px-2 py-0.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-tight ${config.shadowText}`}>
                                    <Icon className="w-3 h-3" />
                                    {loading ? '--' : (pick?.ai_confidence || 85)}%
                                </Badge>
                            </div>

                            {isLocked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] z-30 p-4 text-center">
                                    <div className="p-3 rounded-full bg-zinc-900/80 mb-3 ring-1 ring-white/10">
                                        <Lock className="text-zinc-400 w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg text-white mb-1">Pro Pick Locked</h3>
                                    <p className="text-xs text-zinc-400 mb-4 max-w-[180px]">Upgrade to unlock high-reward Daily Lotto.</p>
                                    <Button size="sm" variant="outline" className={`${config.text} text-xs`}>Upgrade</Button>
                                </div>
                            )}

                            {/* Header */}
                            <CardHeader className="flex flex-col space-y-0 pb-2 pt-3 px-4 relative z-20 border-b border-white/5 bg-white/[0.02] shrink-0">
                                <CardTitle className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1.5">
                                    <Icon className={`w-3.5 h-3.5 ${config.text}`} /> {config.title} PARLAY
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 leading-none mt-0.5">
                                    <span className="text-white/80">{loading ? '3' : (pick?.num_legs || 3)} LEGS</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full" />
                                    <span className={`${config.text}`}>{loading ? '+Odds' : (pick?.total_odds || '+400')}</span>
                                </CardDescription>
                            </CardHeader>

                            {/* Content — legs distribute evenly */}
                            <CardContent className="flex-1 min-h-0 overflow-hidden px-3 py-2 flex flex-col justify-evenly relative z-10">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2">
                                        <Loader2 className={`h-7 w-7 animate-spin ${config.text}`} />
                                        <span className="text-xs font-medium text-zinc-500 animate-pulse">Running AI Simulations...</span>
                                    </div>
                                ) : pick ? (
                                    pick.legs.map((leg: any, i: number) => {
                                        const isProp = leg.player && leg.player.length > 0;
                                        const subText = isProp ? `${leg.team} vs ${leg.opponent}` : `vs ${leg.opponent}`;
                                        const reasoning = leg.ai_reasoning || leg.reasoning || '';
                                        // Truncate reasoning to ~80 chars
                                        const shortReasoning = reasoning.length > 90 ? reasoning.slice(0, 90) + '…' : reasoning;

                                        return (
                                            <div key={i} className="group rounded-xl bg-zinc-900/50 border border-white/[0.04] hover:border-white/10 p-3 transition-all duration-200 flex-1 flex flex-col justify-center">
                                                {/* Top row: Logo + Name + Odds */}
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative w-8 h-8 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                                        <TeamLogo name={leg.team} className="w-5 h-5 relative z-10" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-1">
                                                            <span className="text-[12px] font-bold text-white tracking-tight truncate flex items-center gap-1">
                                                                {isProp ? leg.player : leg.team}
                                                                {isProp && (
                                                                    <Badge className={`${config.badge} bg-opacity-20 border-none text-[7px] h-3.5 px-1 font-black uppercase tracking-widest shrink-0`}>
                                                                        PROP
                                                                    </Badge>
                                                                )}
                                                            </span>
                                                            <Badge variant="outline" className={`text-[10px] font-mono font-black h-[18px] px-1.5 ${config.badge} bg-opacity-10 py-0 leading-none flex items-center shrink-0`}>
                                                                {leg.odds}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-[10px] text-zinc-500 font-medium truncate block uppercase tracking-tight">
                                                            {(leg.bet_type || '').replace('_', ' ')} <span className="text-zinc-600 lowercase">({subText})</span>
                                                            {leg.line && <span className="text-white/80 ml-1 font-bold">{leg.line === 'Yes' ? 'WIN' : leg.line}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* AI Reasoning — 1–2 lines max */}
                                                <p className="text-[10px] leading-snug text-zinc-500 mt-1.5 pl-[42px] line-clamp-2">
                                                    {shortReasoning}
                                                </p>
                                            </div>
                                        )
                                    })
                                ) : null}
                            </CardContent>

                            {/* Footer */}
                            {pick && !loading && !isLocked && (
                                <CardFooter className="flex flex-col gap-1.5 pt-2.5 pb-3 px-4 bg-gradient-to-t from-black/60 to-transparent border-t border-white/5 relative z-20 mt-auto shrink-0">
                                    <Button className={`w-full relative overflow-hidden bg-gradient-to-r ${config.gradient} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-[11px] h-9 rounded-lg uppercase tracking-widest font-black group`}>
                                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 transform skew-x-12" />
                                        <span className="relative z-10 flex items-center gap-1.5">
                                            <Icon className="w-3.5 h-3.5" />
                                            Bet This Parlay
                                        </span>
                                    </Button>
                                    <p className="text-[9px] text-center text-zinc-600 font-mono uppercase tracking-widest">
                                        Track & Analyze Performance
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
