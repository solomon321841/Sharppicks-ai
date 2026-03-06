'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, Shield, Activity, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { TeamLogo } from "@/components/dashboard/TeamLogo"

const PARLAY_TYPES = [
    {
        type: 'safe',
        title: 'Safe Parlay',
        icon: Shield,
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        text: 'text-emerald-400',
        gradient: 'from-emerald-600 to-emerald-500',
        glow: 'from-emerald-500 via-emerald-400 to-emerald-500',
        ring: 'ring-emerald-500/20',
    },
    {
        type: 'balanced',
        title: 'Balanced Parlay',
        icon: Activity,
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        text: 'text-blue-400',
        gradient: 'from-blue-600 to-blue-500',
        glow: 'from-blue-500 via-blue-400 to-blue-500',
        ring: 'ring-blue-500/20',
    },
    {
        type: 'risky',
        title: 'High Risk Parlay',
        icon: Flame,
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        text: 'text-orange-400',
        gradient: 'from-orange-600 to-orange-500',
        glow: 'from-orange-500 via-orange-400 to-orange-500',
        ring: 'ring-orange-500/20',
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
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
            {/* Header */}
            <div className="shrink-0 pb-4">
                <h2 className="text-2xl font-black tracking-tight text-white">
                    Daily Picks<span className="text-emerald-500">.</span>
                </h2>
                <p className="text-zinc-500 text-xs font-medium flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    High-confidence AI selections — refreshed daily at 9:00 AM EST
                </p>
            </div>

            {/* Cards */}
            <div className="grid lg:grid-cols-3 gap-4 flex-1 min-h-0">
                {PARLAY_TYPES.map((config) => {
                    const pick = loading ? null : picks.find(p => p.parlay_type === config.type);
                    const Icon = config.icon;
                    if (!loading && !pick) return null;

                    return (
                        <Card key={config.type} className="bg-zinc-950 border-zinc-800/80 relative overflow-hidden flex flex-col min-h-0 hover:border-zinc-700/80 transition-colors">
                            {/* Accent line */}
                            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${config.glow}`} />

                            {/* Card Header */}
                            <CardHeader className="shrink-0 px-4 pt-3.5 pb-2.5 border-b border-zinc-800/60">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-[13px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                        <Icon className={`w-3.5 h-3.5 ${config.text}`} />
                                        {config.title}
                                    </CardTitle>
                                    <Badge variant="outline" className={`${config.badge} text-[10px] font-black px-2 py-0.5 tracking-tight`}>
                                        <Icon className="w-3 h-3 mr-1" />
                                        {loading ? '--' : (pick?.ai_confidence || 85)}%
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{loading ? '3' : pick?.num_legs || 3} Legs</span>
                                    <span className="text-[10px] text-zinc-700">•</span>
                                    <span className={`text-[11px] font-black ${config.text} tracking-tight`}>{loading ? '—' : pick?.total_odds || '+400'}</span>
                                </div>
                            </CardHeader>

                            {/* Legs — distributed evenly */}
                            <CardContent className="flex-1 min-h-0 flex flex-col justify-evenly px-3 py-1.5">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2">
                                        <Loader2 className={`h-6 w-6 animate-spin ${config.text}`} />
                                        <span className="text-[10px] text-zinc-600 animate-pulse">Analyzing games...</span>
                                    </div>
                                ) : pick ? (
                                    pick.legs.map((leg: any, i: number) => {
                                        const isProp = leg.player && leg.player.length > 0;
                                        const matchup = isProp ? `${leg.team} vs ${leg.opponent}` : `vs ${leg.opponent}`;
                                        const reasoning = leg.ai_reasoning || leg.reasoning || '';
                                        const short = reasoning.length > 100 ? reasoning.slice(0, 100) + '…' : reasoning;

                                        return (
                                            <div key={i} className="flex-1 flex flex-col justify-center rounded-lg bg-zinc-900/60 border border-zinc-800/40 px-3 py-2.5 my-1 hover:bg-zinc-900 transition-colors">
                                                {/* Row: logo, name, odds */}
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700/50 flex items-center justify-center shrink-0 ${config.ring} ring-1`}>
                                                        <TeamLogo name={leg.team} className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[12px] font-bold text-white truncate flex items-center gap-1">
                                                                {isProp ? leg.player : leg.team}
                                                                {isProp && <span className={`text-[8px] font-black uppercase ${config.text} opacity-80`}>PROP</span>}
                                                            </span>
                                                            <span className={`text-[11px] font-mono font-black ${config.text} shrink-0 ml-2`}>{leg.odds}</span>
                                                        </div>
                                                        <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-tight truncate">
                                                            {(leg.bet_type || '').replace(/_/g, ' ')}
                                                            <span className="text-zinc-600 lowercase ml-1">({matchup})</span>
                                                            {leg.line && <span className="text-zinc-300 font-bold ml-1">{leg.line === 'Yes' ? 'WIN' : leg.line}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* AI reasoning — compact */}
                                                <p className="text-[9px] leading-relaxed text-zinc-600 mt-1.5 pl-[42px] line-clamp-2">{short}</p>
                                            </div>
                                        )
                                    })
                                ) : null}
                            </CardContent>

                            {/* Footer */}
                            {pick && !loading && (
                                <CardFooter className="shrink-0 px-4 pt-2 pb-3 border-t border-zinc-800/40">
                                    <Button className={`w-full bg-gradient-to-r ${config.gradient} text-white text-[11px] h-9 rounded-lg uppercase tracking-widest font-black hover:opacity-90 transition-opacity relative overflow-hidden group`}>
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                        <span className="relative flex items-center gap-1.5">
                                            <Icon className="w-3.5 h-3.5" />
                                            Bet This Parlay
                                        </span>
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
