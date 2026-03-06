'use client'

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, Shield, Activity, Flame, TrendingUp, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { TeamLogo } from "@/components/dashboard/TeamLogo"

const PARLAY_TYPES = [
    {
        type: 'safe',
        title: 'Safe Builder',
        icon: Shield,
        accent: 'emerald',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]',
        border: 'border-emerald-500/20',
        button: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        orb: 'bg-emerald-500/10',
    },
    {
        type: 'balanced',
        title: 'Balanced Model',
        icon: Activity,
        accent: 'blue',
        text: 'text-blue-400',
        bg: 'bg-blue-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]',
        border: 'border-blue-500/20',
        button: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        orb: 'bg-blue-500/10',
    },
    {
        type: 'risky',
        title: 'High Risk Edge',
        icon: Flame,
        accent: 'orange',
        text: 'text-orange-400',
        bg: 'bg-orange-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)]',
        border: 'border-orange-500/20',
        button: 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
        orb: 'bg-orange-500/10',
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
        <div className="relative flex flex-col h-[calc(100vh-2rem)] py-6 overflow-hidden">
            {/* Ambient Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header section */}
            <div className="relative z-10 shrink-0 mb-8 px-2 flex items-end justify-between">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                        <Zap className="w-3 h-3 fill-yellow-500" />
                        AI GENERATED — 9:00 AM EST
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
                        Sharp<span className="font-light">Picks</span><span className="text-emerald-500">.</span>
                    </h2>
                </div>

                {/* Stats / Status summary right side */}
                <div className="hidden sm:flex items-center gap-6 pb-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Edge</span>
                        <span className="text-xl font-black text-white">+14.2%</span>
                    </div>
                    <div className="w-px h-8 bg-zinc-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">System Status</span>
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mt-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            OPTIMIZED
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Cards Grid */}
            <div className="relative z-10 grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {PARLAY_TYPES.map((config, index) => {
                    const pick = loading ? null : picks.find(p => p.parlay_type === config.type);
                    const Icon = config.icon;
                    if (!loading && !pick) return null;

                    return (
                        <div key={config.type} className="relative group flex flex-col min-h-0">
                            {/* Card Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${config.orb} opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 pointer-events-none rounded-3xl`} />

                            <Card className={`relative flex-1 flex flex-col min-h-0 bg-black/40 backdrop-blur-2xl border-white/[0.05] hover:border-white/[0.1] rounded-[24px] overflow-hidden transition-all duration-500 ${config.glow}`}>

                                {/* Premium Card Header */}
                                <CardHeader className="shrink-0 p-6 pb-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full bg-black border ${config.border} flex items-center justify-center shadow-inner`}>
                                                <Icon className={`w-4 h-4 ${config.text}`} />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-[0.15em]">{config.title}</h3>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Win Prob</span>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className={`w-3 h-3 ${config.text}`} />
                                                <span className={`text-[13px] font-black ${config.text}`}>{loading ? '--' : (pick?.ai_confidence || 85)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-black/50 rounded-lg p-2.5 border border-white/[0.03] flex items-center justify-between">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Legs</span>
                                            <span className="text-xs font-black text-white">{loading ? '-' : pick?.num_legs || 3}</span>
                                        </div>
                                        <div className="flex-1 bg-black/50 rounded-lg p-2.5 border border-white/[0.03] flex items-center justify-between">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Return</span>
                                            <span className="text-xs font-black text-white">{loading ? '---' : pick?.total_odds || '+400'}</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Premium Content Area / Legs */}
                                <CardContent className="flex-1 min-h-0 flex flex-col p-2 space-y-1">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-4">
                                            <div className={`w-12 h-12 rounded-full border-t-2 border-r-2 ${config.border} animate-spin flex items-center justify-center`}>
                                                <Loader2 className={`w-4 h-4 ${config.text}`} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] animate-pulse">Running Physics Engine...</span>
                                        </div>
                                    ) : pick ? (
                                        pick.legs.map((leg: any, i: number) => {
                                            const isProp = leg.player && leg.player.length > 0;
                                            const reasoning = leg.ai_reasoning || leg.reasoning || '';

                                            return (
                                                <div key={i} className="flex-1 group/leg flex flex-col justify-center rounded-xl px-4 py-3 hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/[0.02]">
                                                    <div className="flex items-center gap-4">
                                                        {/* Sleek Logo Container */}
                                                        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-zinc-700/50 flex items-center justify-center shrink-0 shadow-lg">
                                                            <div className="absolute inset-0 rounded-full bg-black/20 backdrop-blur-sm" />
                                                            <TeamLogo name={leg.team} className="w-6 h-6 relative z-10 filter drop-shadow-md" />
                                                        </div>

                                                        {/* Team / Prop Name */}
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-black text-white truncate pb-0.5 border-b border-transparent group-hover/leg:border-zinc-700 transition-colors">
                                                                    {isProp ? leg.player : leg.team}
                                                                </span>
                                                                <span className={`text-[13px] font-black ${config.text}`}>{leg.odds}</span>
                                                            </div>

                                                            {/* Sleek Data Row */}
                                                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                                                <span className="text-zinc-500 uppercase tracking-widest block truncate max-w-[120px]">
                                                                    {(leg.bet_type || '').replace(/_/g, ' ')}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                                                {isProp ? (
                                                                    <span className="text-zinc-600 truncate">{leg.team} vs {leg.opponent}</span>
                                                                ) : (
                                                                    <span className="text-zinc-600 truncate">vs {leg.opponent}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Ultra-minimal AI Insight */}
                                                    <div className="mt-3 ml-14 pl-3 border-l-2 border-zinc-800/50">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">AI Logic</span>
                                                            {leg.line && <span className="text-[10px] font-black text-white bg-white/10 px-1.5 py-0.5 rounded">{leg.line === 'Yes' ? 'WIN' : leg.line}</span>}
                                                        </div>
                                                        <p className="text-[11px] leading-relaxed text-zinc-400 line-clamp-2">
                                                            {reasoning}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : null}
                                </CardContent>

                                {/* Premium Floating Action Button CTA */}
                                {pick && !loading && (
                                    <div className="shrink-0 p-4 border-t border-white/[0.02] bg-gradient-to-t from-black/20 to-transparent">
                                        <Button className={`w-full h-12 rounded-[16px] font-black uppercase tracking-[0.2em] text-[11px] group border border-transparent transition-all duration-300 ${config.button}`}>
                                            <span className="flex items-center gap-2 relative z-10 transition-transform group-hover:-translate-x-1">
                                                Execute Strategy
                                                <ChevronRight className="w-4 h-4 transition-all group-hover:translate-x-2 group-hover:opacity-100 opacity-50" />
                                            </span>
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
