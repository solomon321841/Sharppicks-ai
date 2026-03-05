"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Zap, Sparkles, TrendingUp, Shield, Activity, BarChart3 } from "lucide-react"
import { FadeIn } from "./FadeIn"
import { AnimatedGridPattern } from "./AnimatedBackground"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { TeamLogo, getTeamLogoUrl } from "@/components/dashboard/TeamLogo"

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2, delay: number = 0.5) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const timeout = setTimeout(() => {
            const motionVal = useMotionValue(0)
            const unsubscribe = motionVal.on("change", (v) => {
                setCount(parseFloat(v.toFixed(1)))
            })

            animate(motionVal, target, {
                duration,
                ease: "easeOut",
            })

            return () => unsubscribe()
        }, delay * 1000)

        return () => clearTimeout(timeout)
    }, [target, duration, delay])

    return count
}

// Floating particles component
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-emerald-400/60 rounded-full"
                    style={{
                        left: `${15 + i * 15}%`,
                        top: `${30 + (i % 3) * 20}%`,
                    }}
                    animate={{
                        y: [-20, -60, -20],
                        x: [0, (i % 2 === 0 ? 15 : -15), 0],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}

export function Hero() {
    const [liveGames, setLiveGames] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGames() {
            try {
                const res = await fetch('/api/get-schedule')
                const data = await res.json()

                if (!Array.isArray(data)) {
                    setLiveGames([])
                    return
                }

                const now = new Date().getTime()
                const hourInMs = 60 * 60 * 1000

                const ALLOWED_LEAGUES = [
                    'basketball_nba',
                    'icehockey_nhl',
                    'soccer_epl',
                    'soccer_spain_la_liga',
                    'basketball_ncaab',
                    'soccer_uefa_champs_league'
                ]

                const extractGames = (windowHours: number) => {
                    const games: any[] = []
                    const windowEnd = now + (windowHours * hourInMs)

                    data.forEach((sport: any) => {
                        if (!ALLOWED_LEAGUES.includes(sport.sport)) return
                        if (!sport.matchups) return

                        sport.matchups.forEach((match: any) => {
                            const gameTime = new Date(match.time)
                            const gameTimeMs = gameTime.getTime()

                            if (gameTimeMs <= now || gameTimeMs > windowEnd) return

                            const homeLogo = getTeamLogoUrl(match.home)
                            const awayLogo = getTeamLogoUrl(match.away)
                            if (!homeLogo || !awayLogo) return

                            games.push({
                                team: match.home,
                                opponent: match.away,
                                time: gameTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                isLive: false,
                                odds: match.h2h?.[0]?.price ? (match.h2h[0].price > 0 ? `+${match.h2h[0].price}` : `${match.h2h[0].price}`) : "-110",
                                awayOdds: match.h2h?.[1]?.price ? (match.h2h[1].price > 0 ? `+${match.h2h[1].price}` : `${match.h2h[1].price}`) : "-110",
                                book: match.bestBook || "SmartBooks",
                                evScore: match.evScore || 0,
                                sport: sport.sport
                            })
                        })
                    })
                    return games
                }

                let allGames = extractGames(24)
                if (allGames.length === 0) allGames = extractGames(48)
                if (allGames.length === 0) allGames = extractGames(72)

                allGames = allGames.sort((a, b) => (b.evScore || 0) - (a.evScore || 0))

                let displayGames = [...allGames]
                if (displayGames.length > 0) {
                    while (displayGames.length < 6) {
                        displayGames = [...displayGames, ...allGames]
                    }
                }

                setLiveGames(displayGames)
            } catch (err) {
                console.error("Failed to fetch games for Hero", err)
                setLiveGames([])
            } finally {
                setLoading(false)
            }
        }

        fetchGames()
    }, [])

    const bestGame = liveGames[0] || {
        team: "Lakers",
        evScore: 12.4,
        odds: "+110",
        book: "FanDuel"
    }

    const getImpliedProb = (oddsStr: string) => {
        const odds = parseInt(oddsStr)
        if (isNaN(odds)) return 50

        if (odds > 0) {
            return (100 / (odds + 100)) * 100
        } else {
            return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
        }
    }

    const impliedProb = getImpliedProb(bestGame.odds ? bestGame.odds.toString() : "-110")
    // Cap the edge at a realistic maximum of 15%
    const rawEdge = bestGame.evScore || 0
    const cappedEdge = Math.min(rawEdge, 15)
    const aiProb = Math.min(95, impliedProb + cappedEdge)
    const edge = aiProb - impliedProb

    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-24 pb-8 md:pt-48 md:pb-32 min-h-screen">

            <AnimatedGridPattern />

            {/* === MOBILE HERO === */}
            <div className="md:hidden container px-4 relative z-10 flex flex-col items-center">

                {/* Aurora glow backdrop */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full pointer-events-none animate-aurora bg-gradient-to-r from-emerald-500/25 via-teal-400/15 to-emerald-600/20 blur-[80px]" />
                <div className="absolute top-40 -right-10 w-[200px] h-[200px] bg-teal-500/10 blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute top-80 -left-10 w-[150px] h-[150px] bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />

                {/* Floating particles */}
                <FloatingParticles />

                {/* Animated pill badge with glow */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "backOut" }}
                    className="mb-5 relative"
                >
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full pointer-events-none" />
                    <div className="relative inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 backdrop-blur-md shadow-[0_0_25px_-5px_rgba(16,185,129,0.5)]">
                        <span className="relative flex h-2 w-2 mr-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="tracking-wider text-[10px] uppercase font-black text-emerald-400">AI Models v2.0 Live</span>
                    </div>
                </motion.div>

                {/* Headline with shimmer text effect */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="relative mb-3"
                >
                    <h1 className="text-[2.75rem] font-black tracking-tighter leading-[0.95] text-white text-center">
                        Outsmart the
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500 animate-text-shimmer" style={{ backgroundSize: '200% auto' }}>
                            Sportsbooks
                        </span>
                    </h1>
                </motion.div>

                {/* Subtext — shorter, punchier */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    className="text-zinc-400 text-[14px] leading-relaxed text-center mb-5 max-w-[320px]"
                >
                    AI-powered edge detection finds{" "}
                    <span className="text-white font-semibold">+EV opportunities</span>{" "}
                    the sportsbooks don't want you to see.
                </motion.p>

                {/* === LIVE STATS BAR === */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="w-full mb-5"
                >
                    <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-mono font-black text-lg tracking-tight">247</span>
                            <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-wider">Picks Today</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col items-center">
                            <span className="text-white font-mono font-black text-lg tracking-tight">67.3%</span>
                            <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-wider">Win Rate</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col items-center">
                            <span className="text-emerald-400 font-mono font-black text-lg tracking-tight">+18%</span>
                            <span className="text-zinc-600 text-[8px] font-bold uppercase tracking-wider">Avg ROI</span>
                        </div>
                    </div>
                </motion.div>

                {/* === SIGNAL CARD with rotating gradient border === */}
                <motion.div
                    initial={{ opacity: 0, y: 25, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.45, ease: "backOut" }}
                    className="w-full mb-5 relative"
                >
                    {/* Rotating gradient border container */}
                    <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
                        <div className="absolute inset-[-50%] animate-rotate-gradient bg-[conic-gradient(from_0deg,transparent_0%,rgba(16,185,129,0.4)_20%,transparent_40%,transparent_60%,rgba(20,184,166,0.3)_80%,transparent_100%)]" />
                    </div>

                    {/* Card glow */}
                    <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-3xl pointer-events-none" />

                    <div className="relative bg-[#0a0a0b]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">

                        {/* Header with live indicator */}
                        <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between bg-gradient-to-r from-emerald-500/[0.04] to-transparent">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Live Signal</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Activity className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">Top Edge</span>
                            </div>
                        </div>

                        {/* Game ticker */}
                        <div className="px-4 py-2.5 border-b border-white/[0.04]">
                            <div className="h-[48px] overflow-hidden relative mask-linear-fade">
                                <motion.div
                                    animate={{ y: ["0%", "-50%"] }}
                                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                    className="will-change-transform"
                                >
                                    {[0, 1].map((setIndex) => (
                                        <div key={setIndex} className="space-y-1.5 pb-1.5">
                                            {liveGames.slice(0, 4).map((game, i) => (
                                                <div key={`${setIndex}-${i}`} className="flex items-center justify-between py-0.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-6 h-6 rounded-full bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                                                            <TeamLogo name={game.team} className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <span className="text-white text-[11px] font-bold block leading-tight">{game.team}</span>
                                                            <span className="text-zinc-600 text-[9px] leading-tight">vs {game.opponent}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-emerald-400 font-mono font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/15">
                                                        {game.odds}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>

                        {/* Edge visualization */}
                        <div className="px-4 py-3 space-y-2">
                            {/* Sportsbook prob */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                        <BarChart3 className="w-2.5 h-2.5" /> Book Line
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-zinc-400">{impliedProb.toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${impliedProb}%` }}
                                        transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                                        className="h-full bg-zinc-600 rounded-full"
                                    />
                                </div>
                            </div>

                            {/* AI prob */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5" /> AI Model
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-white">{aiProb.toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${aiProb}%` }}
                                        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Edge result — the punchline */}
                        <div className="mx-4 mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/[0.08] to-teal-500/[0.05] border border-emerald-500/15 flex items-center justify-between">
                            <div>
                                <div className="text-[8px] text-zinc-500 uppercase tracking-wider font-bold">Detected Edge</div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="text-2xl font-black text-white tracking-tighter leading-none flex items-start"
                                >
                                    <span className="text-sm text-emerald-500 mt-0.5 mr-0.5">+</span>
                                    <span>{edge.toFixed(1)}%</span>
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.5, type: "spring" }}
                                className="text-right"
                            >
                                <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/15 px-3 py-2 rounded-lg border border-emerald-500/25 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
                                    ✦ Bet Now
                                </div>
                            </motion.div>
                        </div>

                        {/* Animated progress bar */}
                        <motion.div
                            className="h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 12, ease: "linear", repeat: Infinity }}
                        />
                    </div>
                </motion.div>

                {/* CTA — dramatic pulsing glow */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex flex-col gap-3 w-full mb-5"
                >
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 blur-lg rounded-2xl animate-pulse-glow pointer-events-none" />
                        <Button size="lg" className="relative w-full btn-shimmer bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 font-black h-[52px] text-[15px] rounded-2xl border border-emerald-400/30 tracking-wide shadow-2xl" asChild>
                            <Link href="/login">
                                Generate Parlay <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                    <Button size="lg" variant="outline" className="h-11 text-sm rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white transition-all backdrop-blur-md font-bold" asChild>
                        <Link href="#how-it-works">
                            See How It Works
                        </Link>
                    </Button>
                </motion.div>

                {/* Trust row — compact icons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex items-center gap-5 text-[10px] text-zinc-500 font-bold"
                >
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500/70" /> Pro Grade</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500/70" /> Live Odds</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-500/70 fill-emerald-500/70" /> Instant</span>
                </motion.div>
            </div>

            {/* === DESKTOP HERO (unchanged) === */}
            <div className="hidden md:flex container px-4 md:px-6 relative z-10 flex-col items-center">

                <FadeIn className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">

                    <div className="inline-flex items-center rounded-full border border-white/5 bg-white/5 px-3 py-1 text-sm font-medium text-emerald-400 backdrop-blur-md shadow-sm transition-colors hover:bg-white/10">
                        <Zap className="mr-2 h-3.5 w-3.5 fill-emerald-400" />
                        <span className="tracking-wide text-xs uppercase font-semibold">AI Confidence Models v2.0 Live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] text-white">
                        Outsmart the <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700">Sportsbooks</span>
                    </h1>

                    <p className="mx-auto max-w-[650px] text-zinc-400 text-xl leading-relaxed font-light">
                        ProfitPicks leverages advanced machine learning to identify positive EV opportunities in real-time. Stop guessing, start <span className="text-emerald-400 font-medium">winning</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4 relative z-20">
                        <Button size="lg" className="btn-shimmer bg-white text-black hover:bg-zinc-200 font-bold h-12 px-8 text-base rounded-full shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105" asChild>
                            <Link href="/login">
                                Generate Parlay <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white transition-all backdrop-blur-sm" asChild>
                            <Link href="#how-it-works">
                                How it Works
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-500 mt-8 font-medium">
                        <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-emerald-500" /> Professional Grade Only</span>
                        <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-emerald-500" /> Live Odds Comparison</span>
                        <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-emerald-500" /> Instant Analysis</span>
                    </div>
                </FadeIn>

                {/* 3D Mockup */}
                <FadeIn delay={0.2} className="mt-24 w-full max-w-5xl relative perspective-1000 group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity duration-700" />

                    <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 relative">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

                            <div className="relative isolate overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />

                                <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center relative z-10">
                                    <div className="space-y-8">
                                        <div className="inline-flex items-center gap-2 text-emerald-400 text-[10px] font-mono font-bold tracking-widest uppercase bg-emerald-950/50 px-3 py-1.5 rounded border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                            </span>
                                            Live Analysis Active
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[0.9]">
                                                Value <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Edge</span><br />
                                                Detected
                                            </h3>
                                            <p className="text-zinc-400 text-sm border-l-2 border-emerald-500/30 pl-4">
                                                High-variance opportunities detected across <span className="text-white font-bold">ACTIVE LEAGUES</span>.
                                            </p>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute -top-4 -left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500/20" />
                                            <div className="absolute -bottom-4 -right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500/20" />

                                            <div className="space-y-3 pt-2 h-[220px] overflow-hidden relative mask-linear-fade">
                                                <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] opacity-20" />

                                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-900 z-10" />
                                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-900 z-10" />

                                                <motion.div
                                                    animate={{ y: ["0%", "-50%"] }}
                                                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                                                    className="will-change-transform"
                                                >
                                                    {[0, 1].map((setIndex) => (
                                                        <div key={setIndex} className="space-y-3 pb-3">
                                                            {liveGames.map((game, i) => (
                                                                <div key={`${setIndex}-${i}`} className="relative group/item">
                                                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-emerald-500/0 group-hover/item:bg-emerald-500 transition-colors duration-300" />
                                                                    <div className="p-3 pl-4 rounded bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between group-hover/item:translate-x-1 duration-300">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="flex -space-x-2">
                                                                                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center relative z-10">
                                                                                    <TeamLogo name={game.team} className="w-6 h-6" />
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="text-white text-sm font-bold tracking-tight">{game.team}</span>
                                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-zinc-400">{game.time}</span>
                                                                                </div>
                                                                                <div className="text-[11px] text-zinc-500 font-medium">vs {game.opponent}</div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="text-right">
                                                                            <div className="text-emerald-400 font-mono font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_10px_-4px_rgba(16,185,129,0.5)]">
                                                                                {game.odds}
                                                                            </div>
                                                                            <div className="text-[10px] text-zinc-600 font-medium mt-1 uppercase tracking-wider">{game.book}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Edge Card */}
                                    <div className="flex justify-center relative items-center z-10 w-full">
                                        <div className="relative w-full max-w-[320px] bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/5">

                                            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                    </span>
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Opportunity</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                                    <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Top Signal</span>
                                                </div>
                                            </div>

                                            <div className="p-5 space-y-6">
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sportsbook Implied Prob</span>
                                                            <span className="text-sm font-mono font-bold text-zinc-400">{impliedProb.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                                                            <div
                                                                className="absolute top-0 bottom-0 left-0 bg-zinc-600 rounded-full transition-all duration-1000"
                                                                style={{ width: `${impliedProb}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-end">
                                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                                                <Sparkles className="w-3 h-3" /> AI Model Projection
                                                            </span>
                                                            <span className="text-sm font-mono font-bold text-white">{aiProb.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                                                            <div
                                                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                                                style={{ width: `${aiProb}%` }}
                                                            />
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-emerald-500/30 border-l border-r border-white/20 transition-all duration-1000"
                                                                style={{ left: `${impliedProb}%`, width: `${Math.max(0, edge)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-dashed border-white/10 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Detected Edge</div>
                                                        <div className="text-3xl font-black text-white tracking-tighter leading-none flex items-start gap-0.5">
                                                            <span className="text-lg text-emerald-500 mt-1">+</span>{edge.toFixed(1)}%
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Recommendation</div>
                                                        <div className="text-sm font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                                            Bet Now
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.div
                                                className="h-0.5 bg-emerald-500"
                                                initial={{ width: "100%" }}
                                                animate={{ width: "0%" }}
                                                transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </FadeIn>

            </div>
        </section>
    )
}
