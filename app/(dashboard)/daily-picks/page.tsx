'use client'

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, Shield, Activity, Flame, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { TeamLogo } from "@/components/dashboard/TeamLogo"

const PARLAY_TYPES = [
    {
        type: 'safe',
        title: 'Safe',
        icon: Shield,
        accent: 'emerald',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        bgSoft: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-600 to-emerald-500',
        glow: 'from-emerald-500/80 via-emerald-400 to-emerald-500/80',
    },
    {
        type: 'balanced',
        title: 'Balanced',
        icon: Activity,
        accent: 'blue',
        text: 'text-blue-400',
        bg: 'bg-blue-500',
        bgSoft: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        gradient: 'from-blue-600 to-blue-500',
        glow: 'from-blue-500/80 via-blue-400 to-blue-500/80',
    },
    {
        type: 'risky',
        title: 'High Risk',
        icon: Flame,
        accent: 'orange',
        text: 'text-orange-400',
        bg: 'bg-orange-500',
        bgSoft: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        gradient: 'from-orange-600 to-orange-500',
        glow: 'from-orange-500/80 via-orange-400 to-orange-500/80',
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
            <div className="shrink-0 mb-5">
                <h2 className="text-[28px] font-black tracking-tight text-white leading-none">
                    Daily Picks<span className="text-emerald-500">.</span>
                </h2>
                <p className="text-zinc-500 text-[11px] font-medium flex items-center gap-1.5 mt-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    High-confidence AI selections — refreshed daily at 9:00 AM EST
                </p>
            </div>

            {/* 3 Cards */}
            <div className="grid lg:grid-cols-3 gap-5 flex-1 min-h-0">
                {PARLAY_TYPES.map((config) => {
                    const pick = loading ? null : picks.find(p => p.parlay_type === config.type);
                    const Icon = config.icon;
                    if (!loading && !pick) return null;

                    return (
                        <Card key={config.type} className="bg-[#0f0f0f] border-[#1a1a1a] relative overflow-hidden flex flex-col min-h-0 rounded-2xl">
                            {/* Top accent */}
                            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${config.glow}`} />

                            {/* Header row */}
                            <CardHeader className="shrink-0 px-5 pt-4 pb-3 space-y-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-lg ${config.bgSoft} flex items-center justify-center`}>
                                            <Icon className={`w-4 h-4 ${config.text}`} />
                                        </div>
                                        <div>
                                            <span className="text-[13px] font-extrabold text-white uppercase tracking-wide">{config.title}</span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-zinc-600 font-medium">{loading ? '3' : pick?.num_legs || 3} legs</span>
                                                <span className="text-[10px] text-zinc-700">•</span>
                                                <span className={`text-[11px] font-black ${config.text}`}>{loading ? '—' : pick?.total_odds || '+400'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${config.bgSoft} ${config.border} border rounded-full px-2.5 py-1 flex items-center gap-1`}>
                                        <TrendingUp className={`w-3 h-3 ${config.text}`} />
                                        <span className={`text-[11px] font-black ${config.text}`}>{loading ? '--' : (pick?.ai_confidence || 85)}%</span>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Legs — clean rows, no boxes */}
                            <CardContent className="flex-1 min-h-0 flex flex-col px-5 pb-2">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-2">
                                        <Loader2 className={`h-6 w-6 animate-spin ${config.text}`} />
                                        <span className="text-[10px] text-zinc-600 animate-pulse">Analyzing games...</span>
                                    </div>
                                ) : pick ? (
                                    <div className="flex flex-col justify-evenly flex-1">
                                        {pick.legs.map((leg: any, i: number) => {
                                            const isProp = leg.player && leg.player.length > 0;
                                            const matchup = isProp ? `${leg.team} vs ${leg.opponent}` : `vs ${leg.opponent}`;
                                            const reasoning = leg.ai_reasoning || leg.reasoning || '';
                                            const short = reasoning.length > 120 ? reasoning.slice(0, 120) + '…' : reasoning;

                                            return (
                                                <div key={i} className="py-3 border-b border-zinc-800/50 last:border-0">
                                                    {/* Main row */}
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-[#161616] border border-zinc-800/60 flex items-center justify-center shrink-0">
                                                            <TeamLogo name={leg.team} className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[13px] font-bold text-white truncate">
                                                                    {isProp ? leg.player : leg.team}
                                                                    {isProp && <span className={`text-[8px] font-black uppercase ${config.text} ml-1.5 align-middle`}>PROP</span>}
                                                                </span>
                                                                <span className={`text-[13px] font-black ${config.text} tabular-nums ml-2 shrink-0`}>{leg.odds}</span>
                                                            </div>
                                                            <div className="text-[10px] text-zinc-500 font-medium mt-0.5">
                                                                <span className="uppercase tracking-wide">{(leg.bet_type || '').replace(/_/g, ' ')}</span>
                                                                <span className="text-zinc-700 mx-1">•</span>
                                                                <span className="text-zinc-600">{matchup}</span>
                                                                {leg.line && <span className="text-zinc-300 font-bold ml-1.5">{leg.line === 'Yes' ? 'WIN' : leg.line}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* AI insight — subtle */}
                                                    <p className="text-[10px] leading-relaxed text-zinc-600 mt-2 ml-12 line-clamp-2">{short}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : null}
                            </CardContent>

                            {/* CTA */}
                            {pick && !loading && (
                                <CardFooter className="shrink-0 px-5 pt-3 pb-4 mt-auto">
                                    <Button className={`w-full bg-gradient-to-r ${config.gradient} text-white text-[11px] h-10 rounded-xl uppercase tracking-[0.15em] font-black shadow-lg hover:brightness-110 transition-all relative overflow-hidden group`}>
                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                        <span className="relative flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
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
