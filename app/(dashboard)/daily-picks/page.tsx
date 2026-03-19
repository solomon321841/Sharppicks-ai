'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Zap, Shield, Activity, Flame, TrendingUp, Lock, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { TeamLogo } from "@/components/dashboard/TeamLogo"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useNotification } from "@/contexts/NotificationContext"

const PARLAY_TYPES = [
    {
        type: 'safe',
        title: 'Safe',
        icon: Shield,
        accent: 'emerald',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]',
        border: 'border-emerald-500/20',
        button: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
        orb: 'bg-emerald-500/10',
        badge: 'bg-emerald-500/10',
        borderLeft: 'border-emerald-500/30',
        hoverBorder: 'group-hover/leg:border-emerald-500/40'
    },
    {
        type: 'balanced',
        title: 'Balanced',
        icon: Activity,
        accent: 'blue',
        text: 'text-blue-400',
        bg: 'bg-blue-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]',
        border: 'border-blue-500/20',
        button: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
        orb: 'bg-blue-500/10',
        badge: 'bg-blue-500/10',
        borderLeft: 'border-blue-500/30',
        hoverBorder: 'group-hover/leg:border-blue-500/40'
    },
    {
        type: 'risky',
        title: 'High Risk',
        icon: Flame,
        accent: 'orange',
        text: 'text-orange-400',
        bg: 'bg-orange-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)]',
        border: 'border-orange-500/20',
        button: 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
        orb: 'bg-orange-500/10',
        badge: 'bg-orange-500/10',
        borderLeft: 'border-orange-500/30',
        hoverBorder: 'group-hover/leg:border-orange-500/40'
    },
    {
        type: 'lotto',
        title: 'Moonshot',
        icon: Zap,
        accent: 'purple',
        text: 'text-purple-400',
        bg: 'bg-purple-500',
        glow: 'shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)]',
        border: 'border-purple-500/20',
        button: 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
        orb: 'bg-purple-500/10',
        badge: 'bg-purple-500/10',
        borderLeft: 'border-purple-500/30',
        hoverBorder: 'group-hover/leg:border-purple-500/40'
    },
];

export default function DailyPicksPage() {
    const [picks, setPicks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [tier, setTier] = useState<string>('pro')
    const [lockDialog, setLockDialog] = useState<string | null>(null)
    const [stake, setStake] = useState("10")
    const [sportsbook, setSportsbook] = useState("FanDuel")
    const [locking, setLocking] = useState(false)
    const { toast } = useToast()
    const { triggerNewBetNotification } = useNotification()
    const supabase = createClient()

    const handleLockIn = async (pick: any) => {
        const parsedStake = parseFloat(stake)
        if (isNaN(parsedStake) || parsedStake <= 0) {
            toast({ variant: "destructive", title: "Invalid wager", description: "Please enter a valid wager amount." })
            return
        }
        setLocking(true)
        try {
            const riskMap: Record<string, number> = { safe: 2, balanced: 5, risky: 8, lotto: 10 }
            const response = await fetch('/api/track-bet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stake: parsedStake,
                    sportsbook,
                    legs: pick.legs,
                    totalOdds: pick.total_odds,
                    confidence: pick.ai_confidence,
                    riskLevel: riskMap[pick.parlay_type] || 5
                })
            })
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to track')
            }
            toast({ title: "Bet Locked In! 🔒", description: "Added to your Bet History." })
            triggerNewBetNotification()
            setLockDialog(null)
            setStake("10")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to lock in bet."
            })
        } finally {
            setLocking(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            // Fetch tier and picks in parallel
            const tierPromise = (async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('subscription_tier')
                        .eq('id', user.id)
                        .single()
                    if (profile) setTier(profile.subscription_tier)
                }
            })()

            const picksPromise = (async () => {
                const res = await fetch(`/api/daily-picks?t=${Date.now()}`)
                if (res.ok) {
                    const data = await res.json()
                    setPicks(Array.isArray(data) ? data : [data])
                }
            })()

            await Promise.all([tierPromise, picksPromise]).catch(console.error)
            setLoading(false)
        }
        fetchData()
    }, [supabase])

    return (
        <div className="relative flex flex-col h-full overflow-y-auto overflow-x-hidden">
            {/* Ambient Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Header section - Compacted margins */}
            <div className="relative z-10 shrink-0 mb-4 px-2 pt-2 flex items-end justify-between">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                        <Zap className="w-3 h-3 fill-yellow-500" />
                        AI GENERATED — 9:00 AM EST
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
                        Sharp<span className="font-light">Picks</span><span className="text-emerald-500">.</span>
                    </h2>
                </div>

                {/* Stats / Status summary right side */}
                <div className="hidden sm:flex items-center gap-5 pb-1">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Total Edge</span>
                        <span className="text-lg font-black text-white leading-none mt-1">+14.2%</span>
                    </div>
                    <div className="w-px h-6 bg-zinc-800" />
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">System Status</span>
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            OPTIMIZED
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid layout for cards - updated to 4 columns to fit Lotto */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 pb-4 lg:pb-2">
                {PARLAY_TYPES.map((config, index) => {
                    const pick = loading ? null : picks.find(p => p.parlay_type === config.type);
                    const Icon = config.icon;
                    if (!loading && !pick) return null;

                    // Starter plan: lock 4th parlay (index 3 = lotto)
                    const isLocked = tier === 'starter' && index >= 3;

                    return (
                        <div key={config.type} className="relative group flex flex-col min-h-0 h-auto lg:h-full">
                            {/* Card Glow Effect */}
                            <div className={`absolute inset-0 bg-gradient-to-b ${config.orb} opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-700 pointer-events-none rounded-3xl`} />

                            <Card className={`relative flex-1 flex flex-col min-h-0 bg-black/40 backdrop-blur-2xl border border-white/[0.05] hover:border-white/[0.1] rounded-[24px] overflow-hidden transition-all duration-500 ${config.glow}`}>

                                {/* Lock overlay for starter users on 4th parlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[24px] p-6 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
                                            <Lock className="w-6 h-6 text-zinc-500" />
                                        </div>
                                        <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">Moonshot Locked</h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed mb-5 max-w-[200px]">
                                            Upgrade to <span className="text-white font-bold">Pro</span> to unlock all 4 daily parlays including Moonshot picks.
                                        </p>
                                        <Button className="h-10 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-[10px] rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] px-6" asChild>
                                            <Link href="/checkout/pro">
                                                Upgrade to Pro <ArrowRight className="ml-2 h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {/* Premium Card Header */}
                                <CardHeader className="shrink-0 p-4 pb-3 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.02] to-transparent">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-7 h-7 rounded-full bg-black border ${config.border} flex items-center justify-center shadow-inner`}>
                                                <Icon className={`w-3.5 h-3.5 ${config.text}`} />
                                            </div>
                                            <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">{config.title}</h3>
                                        </div>

                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-0.5">Win Prob</span>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className={`w-3 h-3 ${config.text}`} />
                                                <span className={`text-[12px] font-black ${config.text}`}>{loading ? '--' : (pick?.ai_confidence || 85)}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-black/50 rounded-lg p-2 border border-white/[0.03] flex items-center justify-between">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Legs</span>
                                            <span className="text-[11px] font-black text-white">{loading ? '-' : pick?.num_legs || 3}</span>
                                        </div>
                                        <div className="flex-1 bg-black/50 rounded-lg p-2 border border-white/[0.03] flex items-center justify-between">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Return</span>
                                            <span className="text-[11px] font-black text-white">{loading ? '---' : pick?.total_odds || '+400'}</span>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Premium Content Area / Legs */}
                                <CardContent className="flex-1 min-h-0 block p-2 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-3 min-h-[200px]">
                                            <div className={`w-10 h-10 rounded-full border-t-2 border-r-2 flex items-center justify-center ${config.text.replace('text', 'border')} animate-spin`}>
                                                <Loader2 className={`w-4 h-4 ${config.text}`} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] animate-pulse">Running Physics Engine...</span>
                                        </div>
                                    ) : pick ? (
                                        pick.legs.map((leg: any, i: number) => {
                                            const isProp = leg.player && leg.player.length > 0;
                                            const reasoning = leg.ai_reasoning || leg.reasoning || '';

                                            return (
                                                <div key={i} className={`mb-2 shrink-0 group/leg flex flex-col justify-center rounded-[16px] px-3 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 border border-white/[0.05] hover:border-white/[0.1] backdrop-blur-md relative overflow-hidden`}>
                                                    {/* Background Glow Effect on hover */}
                                                    <div className={`absolute -inset-2 opacity-0 group-hover/leg:opacity-20 transition-opacity duration-500 blur-xl rounded-full ${config.bg}`} />

                                                    <div className="relative z-10 flex items-center gap-3">
                                                        {/* Sleek Logo Container */}
                                                        <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shrink-0 shadow-lg ${config.hoverBorder} transition-colors`}>
                                                            <TeamLogo name={leg.team} className="w-5 h-5 relative z-10 filter drop-shadow-md" />
                                                        </div>

                                                        {/* Team / Prop Name */}
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="text-[13px] font-black text-white truncate pb-0.5">
                                                                    {isProp ? leg.player : leg.team}
                                                                </span>
                                                                <span className={`text-[12px] font-black ${config.text} px-1.5 py-0.5 rounded-md ${config.badge}`}>{leg.odds}</span>
                                                            </div>

                                                            {/* Sleek Data Row */}
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold mt-0.5">
                                                                <span className="text-zinc-400 uppercase tracking-widest block truncate max-w-[120px]">
                                                                    {isProp && leg.prop_market ? leg.prop_market : (leg.bet_type || '').replace(/_/g, ' ')}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                                {isProp ? (
                                                                    <span className="text-zinc-500 truncate">{leg.team} vs {leg.opponent}</span>
                                                                ) : (
                                                                    <span className="text-zinc-500 truncate">vs {leg.opponent}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* AI Insight */}
                                                    <div className={`relative z-10 mt-3 ml-10 sm:ml-12 pl-3 border-l-2 ${config.borderLeft}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>AI Logic</span>
                                                            {leg.line && <span className="text-[9px] font-black text-white bg-white/10 px-1.5 py-0.5 rounded-sm">{leg.line === 'Yes' ? 'WIN' : leg.line}</span>}
                                                        </div>
                                                        <p className="text-[10px] leading-relaxed text-zinc-300">
                                                            {reasoning}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : null}
                                </CardContent>

                                {/* Lock In Button */}
                                {pick && !loading && (
                                    <div className="shrink-0 p-3 mt-auto border-t border-white/[0.03] bg-gradient-to-t from-black/40 to-transparent">
                                        <Dialog open={lockDialog === config.type} onOpenChange={(open) => setLockDialog(open ? config.type : null)}>
                                            <DialogTrigger asChild>
                                                <Button className={`w-full h-10 rounded-[12px] font-black uppercase tracking-[0.2em] text-[10px] group border transition-all duration-300 ${config.button}`}>
                                                    <span className="flex items-center gap-2 relative z-10">
                                                        <Lock className="w-3.5 h-3.5" /> LOCK IN
                                                    </span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[425px]">
                                                <DialogHeader>
                                                    <DialogTitle>Lock In Bet</DialogTitle>
                                                    <DialogDescription>
                                                        Track this bet to calculate your winnings and hit rate.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                                        <Label htmlFor="sportsbook" className="text-left sm:text-right">
                                                            Book
                                                        </Label>
                                                        <Select value={sportsbook} onValueChange={setSportsbook}>
                                                            <SelectTrigger className="col-span-1 sm:col-span-3">
                                                                <SelectValue placeholder="Select sportsbook" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="FanDuel">FanDuel</SelectItem>
                                                                <SelectItem value="DraftKings">DraftKings</SelectItem>
                                                                <SelectItem value="BetMGM">BetMGM</SelectItem>
                                                                <SelectItem value="Caesars">Caesars</SelectItem>
                                                                <SelectItem value="Other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                                                        <Label htmlFor="stake" className="text-left sm:text-right">
                                                            Wager ($)
                                                        </Label>
                                                        <Input
                                                            id="stake"
                                                            type="number"
                                                            value={stake}
                                                            onChange={(e) => setStake(e.target.value)}
                                                            className="col-span-1 sm:col-span-3"
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" onClick={() => handleLockIn(pick)} disabled={locking} className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto">
                                                        {locking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Confirm Lock
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
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
