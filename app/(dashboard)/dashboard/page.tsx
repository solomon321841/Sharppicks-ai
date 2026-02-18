'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Activity, ChevronRight, Loader2, Sparkles, HelpCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getTierFeatures } from "@/lib/config/tiers"
import { DashboardCard } from "@/components/dashboard/DashboardCard"
import { RecentLogItem } from "@/components/dashboard/RecentLogItem"
import { motion } from "framer-motion"
import { User } from "@supabase/supabase-js"

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [tier, setTier] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentBets, setRecentBets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        record: "0-0-0",
        streak: "--",
        profit: "$0",
        roi: "0%",
        hitRate: 0
    })
    const [activeLeagues, setActiveLeagues] = useState<string[]>(['NBA', 'NHL', 'UCL', 'EPL'])

    const SPORT_LABELS: Record<string, string> = {
        'basketball_nba': 'NBA',
        'basketball_ncaab': 'NCAAB',
        'icehockey_nhl': 'NHL',
        'soccer_epl': 'EPL',
        'soccer_spain_la_liga': 'LA LIGA',
        'soccer_uefa_champs_league': 'UCL'
    }

    useEffect(() => {
        // Load active leagues from cache first for instant UI
        const cachedLeagues = localStorage.getItem('active_leagues_cache')
        if (cachedLeagues) {
            try {
                setActiveLeagues(JSON.parse(cachedLeagues))
            } catch (e) {
                console.warn('Failed to parse leagues cache', e)
            }
        }

        const fetchData = async () => {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUser(user)
                    const { data: profileData } = await supabase.from('users').select('subscription_tier').eq('id', user.id).single()
                    if (profileData && profileData.subscription_tier) {
                        setTier(profileData.subscription_tier)
                    } else {
                        setTier('free') // Default or handle null
                    }

                    // Fetch bet history for "Recent Logs"
                    const response = await fetch('/api/bet-history')
                    if (response.ok) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const history: any[] = await response.json()

                        if (history && history.length > 0) {
                            console.log('[Dashboard] History fetched:', history.length)

                            // Set stats
                            const wins = history.filter(h => h.result === 'won').length
                            const losses = history.filter(h => h.result === 'lost').length
                            const pushes = history.filter(h => h.result === 'push').length

                            const resolvedCount = wins + losses
                            const rate = resolvedCount > 0 ? Math.round((wins / resolvedCount) * 100) : 0

                            // Simple streak calc (last 5)
                            const last5 = history.slice(0, 5)
                            const currentStreak = last5.filter(h => h.result === 'won').length

                            setStats(prev => ({
                                ...prev,
                                record: `${wins}-${losses}-${pushes}`,
                                hitRate: rate,
                                streak: `${currentStreak}W`
                            }))

                            // Set recent bets (take top 6)
                            setRecentBets(history.slice(0, 6))
                        } else {
                            // No history yet — leave empty to show empty state
                            setRecentBets([])
                        }
                    }

                    // Fetch active leagues from schedule
                    const scheduleRes = await fetch('/api/get-schedule')
                    if (scheduleRes.ok) {
                        const schedule = await scheduleRes.json()
                        const active = schedule
                            .filter((s: any) => s.gamesCount > 0)
                            .map((s: any) => SPORT_LABELS[s.sport] || s.sport)

                        if (active.length > 0) {
                            setActiveLeagues(active)
                            localStorage.setItem('active_leagues_cache', JSON.stringify(active))
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load dashboard:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        // Background check for results - Defer by 3 seconds to let UI breathe
        const checkTimeout = setTimeout(() => {
            fetch('/api/check-results', { method: 'POST' }).catch(err => console.error('Background check failed:', err))
        }, 3000)

        return () => clearTimeout(checkTimeout)
    }, [])

    const tierInfo = getTierFeatures(tier || 'free')

    return (
        <div className="relative h-auto lg:h-full flex flex-col space-y-2 lg:space-y-3 lg:overflow-hidden px-4 md:px-0 py-2">
            {/* Simplified Animated Mesh Background for Performance */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <motion.div
                    animate={{
                        opacity: [0.03, 0.05, 0.03],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[5%] w-[60%] h-[60%] bg-emerald-500 blur-[120px] rounded-full"
                />
                <motion.div
                    animate={{
                        opacity: [0.02, 0.04, 0.02],
                        scale: [1, 1.08, 1],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[30%] -right-[5%] w-[50%] h-[50%] bg-blue-600 blur-[150px] rounded-full"
                />
            </div>

            {/* Header Section: Compact */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10 shrink-0 min-h-[60px]">
                <div className="space-y-1">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-white/5 backdrop-blur-md"
                    >
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Live Intelligence Active</span>
                    </motion.div>

                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl md:text-4xl font-black tracking-custom text-white uppercase italic leading-tight">
                            Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">Hub</span>
                        </h2>
                        <Link
                            href="/how-to-use"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group"
                        >
                            <HelpCircle className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400" />
                            <span className="text-[9px] font-black text-zinc-500 group-hover:text-emerald-400 uppercase tracking-widest leading-none">How it works</span>
                        </Link>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4 bg-zinc-950/50 backdrop-blur-xl border border-white/5 px-4 py-2 rounded-xl">
                    <div className="text-right">
                        <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Network Status</div>
                        <div className="flex items-center justify-end gap-2">
                            <div className="text-emerald-400 font-mono font-black text-[10px] pr-2 border-r border-white/10 italic">STABLE</div>
                            <div className="text-white font-mono font-black text-[10px]">24MS</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview: Ultra Compact */}
            <div className="grid gap-3 md:grid-cols-3 relative z-10 shrink-0 h-auto md:h-24">
                <DashboardCard glowColor="emerald" delay={0.1} className="py-0" contentClassName="p-4">
                    <div className="flex flex-col h-full justify-between gap-4 md:gap-0">
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">All-Time Record</div>
                            <Activity className="w-4 h-4 text-emerald-500/50" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none">
                                {stats.record}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <motion.div
                                    className="text-[8px] font-black px-1 py-px rounded italic bg-emerald-500/10 text-emerald-400"
                                >
                                    {stats.streak} Streak
                                </motion.div>
                                <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard glowColor="blue" delay={0.2} className="py-0" contentClassName="p-4">
                    <div className="flex flex-col h-full justify-between gap-4 md:gap-0">
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Accuracy</div>
                            <Activity className="w-4 h-4 text-blue-500/50" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none">
                                {stats.hitRate}<span className="text-blue-500/50">%</span>
                            </div>
                            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.hitRate}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                />
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard glowColor={tier !== 'free' ? 'gold' : 'zinc'} delay={0.3} className="py-0" contentClassName="p-4">
                    <div className="flex flex-col h-full justify-between gap-4 md:gap-0">
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">License</div>
                            <Activity className={`w-4 h-4 ${tier !== 'free' ? 'text-yellow-500/50' : 'text-zinc-500/50'}`} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white tracking-tighter leading-none capitalize italic">
                                {loading ? <Loader2 className="h-5 w-5 animate-spin text-zinc-500" /> : tierInfo.label}
                            </div>
                            <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter mt-1">
                                {tier === 'free' ? 'Upgrade for VIP' : 'Priority Compute Lock'}
                            </div>
                        </div>
                    </div>
                </DashboardCard>
            </div>

            {/* Tactical Content Grid: Viewport-Filling */}
            <div className="shrink-0 lg:flex-1 lg:min-h-0 grid gap-3 lg:gap-4 lg:grid-cols-12 relative z-10 pb-2">
                {/* Recent Logs: Fluid container */}
                <DashboardCard className="lg:col-span-7 flex flex-col h-[400px] lg:h-full" delay={0.4} contentClassName="p-4 flex flex-col h-full">
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                <h3 className="text-lg font-black text-white tracking-tighter uppercase italic leading-none">Recent Logs</h3>
                            </div>
                            <Button variant="ghost" className="h-7 px-2 rounded border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-emerald-500 hover:text-black transition-all" asChild>
                                <Link href="/bet-history">Archive <ChevronRight className="w-3 h-3 ml-1" /></Link>
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-1.5 mt-3">
                            {recentBets.length > 0 ? (
                                <div className="space-y-1.5 pr-2">
                                    {recentBets.map((bet, i) => (
                                        <RecentLogItem key={bet.id} bet={bet} delay={0.5 + (i * 0.1)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-4">
                                    <div className="relative">
                                        <Activity className="w-8 h-8 text-zinc-800" />
                                        <motion.div
                                            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                            className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-full"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-zinc-400 uppercase italic">Awaiting Signals</div>
                                        <p className="text-[9px] text-zinc-600 font-bold max-w-[180px] leading-snug mx-auto">System online. Deploy sequences to populate logs.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DashboardCard>

                {/* The Ticket: Optimized for vertical space */}
                <div className="lg:col-span-5 h-auto lg:h-full lg:min-h-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative group h-full"
                    >
                        <div className="relative h-full bg-zinc-950/80 rounded-[1.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all hover:bg-zinc-950">
                            {/* Perforated Edge */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around py-4 opacity-30">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-0.5 h-0.5 rounded-full bg-black border border-white/10" />
                                ))}
                            </div>

                            <div className="ml-4 h-full flex flex-col">
                                {/* Ticket Header */}
                                <div className="p-4 border-b border-dashed border-white/10 shrink-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-3 h-3 text-emerald-400" />
                                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">Quick Actions</span>
                                    </div>
                                    <h3 className="text-xl lg:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Elite<span className="text-emerald-500">Picks</span></h3>
                                </div>

                                {/* Ticket Body */}
                                <div className="p-4 flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="space-y-3">
                                        <div className="flex flex-col md:flex-row justify-between md:items-end gap-3">
                                            <div className="space-y-1.5">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-none">Active Intelligence</p>
                                                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                                    {activeLeagues.map((league) => (
                                                        <span key={league} className="px-1.5 py-0.5 rounded-sm bg-zinc-900 border border-white/[0.03] text-[9px] font-black text-zinc-400 uppercase italic tracking-tighter">
                                                            {league}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:text-right shrink-0">
                                                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">AI Engine</p>
                                                <div className="flex items-center md:justify-end gap-1.5">
                                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <p className="text-sm font-black text-emerald-500 italic tracking-tighter">LIVE</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link href="/build-parlay" className="block p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/15 hover:border-emerald-500/30 transition-all group/card">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                                        <Activity className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-white leading-none mb-0.5">Build Custom Parlay</p>
                                                        <p className="text-[9px] font-bold text-zinc-500">AI-powered picks across all leagues</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover/card:text-emerald-400 group-hover/card:translate-x-0.5 transition-all" />
                                            </div>
                                        </Link>

                                        <Link href="/daily-picks" className="block p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all group/card">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                        <Sparkles className="w-4 h-4 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[11px] font-black text-white leading-none mb-0.5">Daily Picks</p>
                                                        <p className="text-[9px] font-bold text-zinc-500">Today&apos;s top AI-analyzed plays</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover/card:text-blue-400 group-hover/card:translate-x-0.5 transition-all" />
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="space-y-2 pt-4 shrink-0">
                                        <Button className="w-full h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-tighter text-xs italic group/btn flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(16,185,129,0.3)]" asChild>
                                            <Link href="/build-parlay">
                                                Generate Parlay
                                                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="w-full h-6 text-zinc-600 hover:text-white text-[8px] font-black uppercase tracking-[0.2em]" asChild>
                                            <Link href="/bet-history">View Bet History</Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Gloss Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-[1.5rem]" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
