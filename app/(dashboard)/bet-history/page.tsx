'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Loader2, History, ArrowUpRight, ChevronRight, Activity, ShieldCheck, Zap, Cpu } from "lucide-react"
import Link from 'next/link'
import { DashboardCard } from '@/components/dashboard/DashboardCard'

interface Bet {
    id: string
    parlay: {
        total_odds: string
        legs: {
            team: string,
            bet_type: string,
            odds: string,
            result: string,
            league?: string,
            game_time?: string // Added for live status
        }[]
    }
    stake_amount: number
    sportsbook: string
    result: string // 'pending' | 'won' | 'lost'
    created_at: string
}

export default function BetHistoryPage() {
    const [bets, setBets] = useState<Bet[]>([])
    const [loading, setLoading] = useState(true)
    const [container, setContainer] = useState<HTMLDivElement | null>(null)

    const { scrollYProgress } = useScroll({
        container: container ? { current: container } : undefined
    })

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('/api/bet-history')
                if (response.ok) {
                    const data = await response.json()
                    setBets(data)
                }
            } catch (error) {
                console.error('Failed to load history:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    // ── Status Helpers ──
    const getLegStatus = (gameTime?: string) => {
        if (!gameTime) return 'upcoming'
        const now = new Date()
        const start = new Date(gameTime)
        const diffMs = now.getTime() - start.getTime()
        const hourMs = 60 * 60 * 1000

        if (diffMs < 0) return 'upcoming'
        // Assume game lasts ~3.5 hours for live status
        if (diffMs > 0 && diffMs < 3.5 * hourMs) return 'live'
        return 'finished'
    }

    const calculateReturn = (stake: number, oddsStr: string) => {
        const odds = parseInt(oddsStr.replace(/[^0-9-]/g, ''))
        if (isNaN(odds)) return stake * 2 // Fallback

        let multiplier = 0
        if (odds > 0) {
            multiplier = (odds / 100) + 1
        } else {
            multiplier = (100 / Math.abs(odds)) + 1
        }
        return stake * multiplier
    }

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-emerald-500/50" />
                <div className="absolute inset-0 blur-xl bg-emerald-500/20 rounded-full animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] animate-pulse">Synchronizing Ledger...</p>
        </div>
    )

    return (
        <div className="relative h-full flex flex-col space-y-6 lg:space-y-8 overflow-hidden">
            {/* Sober Elite Background: Reduced movement, lower opacity */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 30, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-emerald-500/3 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        x: [0, -30, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[30%] -right-[10%] w-[70%] h-[70%] bg-blue-600/3 blur-[180px] rounded-full"
                />
            </div>

            {/* Header Section: Refined and Sober */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 shrink-0 px-4 md:px-0">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-2 py-0.5 rounded border border-white/5 bg-zinc-950/50 backdrop-blur-md"
                    >
                        <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Institutional Grade Storage</span>
                    </motion.div>

                    <div className="space-y-0">
                        <h2 className="text-3xl md:text-5xl lg:text-5xl font-black tracking-custom text-white uppercase italic leading-[1]">
                            Bet <span className="text-emerald-500/90">Archive</span>
                        </h2>
                        <p className="text-zinc-600 font-bold tracking-[0.2em] uppercase text-[9px] mt-1 border-l border-emerald-500/30 pl-3">
                            Immutable Betting History • Verified Analysis
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-zinc-950/40 border border-white/5 p-3 px-5 rounded-xl flex items-center gap-6">
                        <div className="space-y-0.5">
                            <div className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Sequences</div>
                            <div className="text-lg font-black text-white font-mono leading-none">{bets.length.toString().padStart(3, '0')}</div>
                        </div>
                        <div className="h-6 w-px bg-white/5" />
                        <div className="space-y-0.5 text-right">
                            <div className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Status</div>
                            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Synced</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 relative z-10 px-4 md:px-0">
                <div
                    ref={setContainer}
                    className="h-full overflow-y-auto lg:pl-12 custom-scrollbar pb-20 pt-2"
                >
                    {bets.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="relative opacity-20">
                                <History className="h-16 w-16 text-zinc-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-zinc-500 uppercase italic tracking-tighter">No Archive Entries</h3>
                                <p className="text-[10px] text-zinc-600 font-bold max-w-[200px] leading-relaxed mx-auto">
                                    Archive empty. Secure your first parlay sequence to initiate logging.
                                </p>
                                <div className="pt-4">
                                    <Link href="/build-parlay" className="group flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5 rounded-lg text-emerald-400 font-black uppercase text-[10px] italic transition-all hover:bg-emerald-500/20 active:scale-95">
                                        INITIALIZE SECOUND
                                        <ArrowUpRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative space-y-8">
                            {/* THE LEDGER LINE: More subtle, less glow */}
                            <div className="absolute -left-[44px] top-0 bottom-0 w-[1px] bg-zinc-900/50 hidden lg:block">
                                <motion.div
                                    style={{ scaleY, transformOrigin: "top" }}
                                    className="h-full w-full bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                />
                            </div>

                            {bets.map((bet, index) => (
                                <motion.div
                                    key={bet.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    className="relative"
                                >
                                    {/* Timeline Node: Subtle circle */}
                                    <div className="absolute -left-[48px] top-10 w-2 h-2 rounded-full bg-zinc-950 border border-emerald-500/30 hidden lg:block z-30" />
                                    <div className="absolute -left-[56px] top-[43px] h-px w-3 bg-emerald-500/10 hidden lg:block" />

                                    <DashboardCard
                                        className="relative border-white/[0.03] group !p-0 overflow-hidden bg-zinc-950/20"
                                        glowColor={bet.result === 'won' ? 'emerald' : bet.result === 'lost' ? 'red' : 'zinc'}
                                    >
                                        <div className="flex flex-col lg:flex-row">
                                            {/* Data Sidebar: Professional spacing */}
                                            <div className="lg:w-40 bg-zinc-950/40 border-r border-white/5 p-5 flex lg:flex-col justify-between items-start gap-4 shrink-0">
                                                <div className="space-y-1">
                                                    <div className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Entry ID</div>
                                                    <div className="text-[9px] font-mono font-bold text-zinc-500 truncate w-24">
                                                        #{bet.id.substring(0, 8).toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Timestamp</div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-zinc-400">{new Date(bet.created_at).toLocaleDateString()}</span>
                                                        <span className="text-[8px] font-mono text-zinc-700">14:23 UTC</span>
                                                    </div>
                                                </div>

                                                <div className="hidden lg:block pt-3 border-t border-white/5 w-full">
                                                    <div className="flex items-center gap-1.5 opacity-30">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest italic">Archived</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Main Entry Body: Cleaner typography */}
                                            <div className="flex-1 p-5 md:p-6 space-y-6 relative">
                                                {/* Extremely Subtle Watermark */}
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-white/[0.003] pointer-events-none select-none uppercase -rotate-3 tracking-tighter">
                                                    {bet.result === 'won' ? 'VERIFIED' : 'SECURED'}
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                                    <div className="space-y-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${bet.result === 'won' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                                                bet.result === 'lost' ? 'bg-red-500/5 border-red-500/20' :
                                                                    'bg-zinc-900/50 border-white/5'
                                                                }`}>
                                                                <Zap className={`w-5 h-5 ${bet.result === 'won' ? 'text-emerald-500/50' :
                                                                    bet.result === 'lost' ? 'text-red-500/50' :
                                                                        'text-zinc-700'
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2.5">
                                                                    <h4 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">
                                                                        {bet.parlay.legs.length} Leg <span className="text-zinc-500">Sequence</span>
                                                                    </h4>
                                                                    <div className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px] font-mono font-bold text-zinc-500">
                                                                        {bet.parlay.total_odds}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <span className="flex items-center gap-1.5 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                                                                        {bet.sportsbook}
                                                                    </span>
                                                                    <div className="h-2 w-px bg-zinc-800" />
                                                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Risk: ${bet.stake_amount}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Legs Breakdown: Flatter, more professional cards */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {bet.parlay.legs.map((leg, i) => {
                                                                const status = getLegStatus(leg.game_time)
                                                                return (
                                                                    <div key={i} className="group/leg relative bg-zinc-950/30 border border-white/[0.02] rounded-lg p-3 transition-colors hover:border-white/[0.05]">
                                                                        <div className="space-y-1">
                                                                            <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                                                <div className="text-[10px] font-black text-zinc-300 italic truncate">{leg.team}</div>
                                                                                {status === 'live' && (
                                                                                    <span className="flex items-center gap-1 text-[7px] font-black text-emerald-500 uppercase tracking-tighter shrink-0 animate-pulse bg-emerald-500/10 px-1 rounded ring-1 ring-emerald-500/20">
                                                                                        <Zap className="w-2 h-2 fill-current" />
                                                                                        LIVE
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[8px] font-bold text-zinc-600 uppercase">{leg.bet_type}</span>
                                                                                <span className="text-[9px] font-mono font-bold text-emerald-500/60">{leg.odds}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Impact Rating & Finality */}
                                                    <div className="md:text-right space-y-4 pt-4 md:pt-0">
                                                        <div className="space-y-0.5">
                                                            <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Process Result</div>
                                                            <div className={`text-lg font-black italic tracking-tighter uppercase ${bet.result === 'won' ? 'text-emerald-500/80' :
                                                                bet.result === 'lost' ? 'text-red-500/60' :
                                                                    bet.parlay.legs.some(l => getLegStatus(l.game_time) === 'live') ? 'text-emerald-400' :
                                                                        bet.parlay.legs.every(l => getLegStatus(l.game_time) === 'finished') ? 'text-zinc-500' :
                                                                            'text-zinc-600'
                                                                }`}>
                                                                {bet.result === 'won' ? 'Success' :
                                                                    bet.result === 'lost' ? 'Void' :
                                                                        bet.parlay.legs.some(l => getLegStatus(l.game_time) === 'live') ? 'LIVE' :
                                                                            bet.parlay.legs.every(l => getLegStatus(l.game_time) === 'finished') ? 'Processing' :
                                                                                'Active'}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-0 pt-3 border-t border-white/5">
                                                            <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Archive Return</div>
                                                            <div className={`text-2xl font-black italic tracking-tighter leading-none ${bet.result === 'won' ? 'text-zinc-200' : 'text-zinc-800'
                                                                }`}>
                                                                ${calculateReturn(bet.stake_amount, bet.parlay.total_odds).toFixed(2)}
                                                            </div>
                                                        </div>

                                                        <button className="group/link flex items-center md:justify-end gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors">
                                                            Archive Detail
                                                            <ChevronRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </DashboardCard>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
