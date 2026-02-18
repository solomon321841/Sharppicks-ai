"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, Zap, Sparkles } from "lucide-react"
import { FadeIn } from "./FadeIn"
import { AnimatedGridPattern } from "./AnimatedBackground"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { TeamLogo, getTeamLogoUrl } from "@/components/dashboard/TeamLogo"

// Fallback mock data removed.

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

                // Strict League Allow List
                const ALLOWED_LEAGUES = [
                    'basketball_nba',
                    'icehockey_nhl',
                    'soccer_epl',
                    'soccer_spain_la_liga',
                    'basketball_ncaab',
                    'soccer_uefa_champs_league'
                ]

                // Helper: extract valid games within a time window
                const extractGames = (windowHours: number) => {
                    const games: any[] = []
                    const windowEnd = now + (windowHours * hourInMs)

                    data.forEach((sport: any) => {
                        // 1. League Filter — strict allowlist
                        if (!ALLOWED_LEAGUES.includes(sport.sport)) return

                        if (!sport.matchups) return

                        sport.matchups.forEach((match: any) => {
                            const gameTime = new Date(match.time)
                            const gameTimeMs = gameTime.getTime()

                            // 2. Time Window — future only, within window
                            if (gameTimeMs <= now || gameTimeMs > windowEnd) return

                            // 3. Logo Validation — BOTH teams MUST exist in our logo map
                            // This ensures no obscure/small-conference teams sneak through
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

                // Tiered time window: try 24h first, then 48h, then 72h
                // This handles league breaks (NBA All-Star, NHL break) gracefully
                let allGames = extractGames(24)
                if (allGames.length === 0) allGames = extractGames(48)
                if (allGames.length === 0) allGames = extractGames(72)

                // Sort by EV Score (descending) so the "best" edge is at the top
                allGames = allGames.sort((a, b) => (b.evScore || 0) - (a.evScore || 0))

                // Duplicate for infinite scroll sensation if we have games
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
        evScore: 12.4, // Realistic "Elite" edge
        odds: "+110",
        book: "FanDuel"
    }

    // Helper to calculate probabilities
    const getImpliedProb = (oddsStr: string) => {
        const odds = parseInt(oddsStr)
        if (isNaN(odds)) return 50 // fallback

        if (odds > 0) {
            return (100 / (odds + 100)) * 100
        } else {
            return (Math.abs(odds) / (Math.abs(odds) + 100)) * 100
        }
    }

    const impliedProb = getImpliedProb(bestGame.odds ? bestGame.odds.toString() : "-110")
    const aiProb = Math.min(99, impliedProb + (bestGame.evScore || 0)) // AI Prob = Market + Edge
    const edge = aiProb - impliedProb

    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-32 pb-20 md:pt-48 md:pb-32 min-h-screen">

            <AnimatedGridPattern />

            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center">

                {/* Text Content */}
                <FadeIn className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">

                    {/* Pill Badge */}
                    <div className="inline-flex items-center rounded-full border border-white/5 bg-white/5 px-3 py-1 text-sm font-medium text-emerald-400 backdrop-blur-md shadow-sm transition-colors hover:bg-white/10">
                        <Zap className="mr-2 h-3.5 w-3.5 fill-emerald-400" />
                        <span className="tracking-wide text-xs uppercase font-semibold">AI Confidence Models v2.0 Live</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-white">
                        Outsmart the <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700">Sportsbooks</span>
                    </h1>

                    {/* Subtext */}
                    <p className="mx-auto max-w-[650px] text-zinc-400 text-lg md:text-xl leading-relaxed font-light">
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

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-500 mt-8 font-medium">
                        <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-emerald-500" /> Professional Grade Only</span>
                        <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-emerald-500" /> Live Odds Comparison</span>
                        <span className="flex items-center"><Check className="mr-2 h-4 w-4 text-emerald-500" /> Instant Analysis</span>
                    </div>
                </FadeIn>

                {/* 3D Mockup */}
                <FadeIn delay={0.2} className="mt-24 w-full max-w-5xl relative perspective-1000 group">
                    {/* Glow behind card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity duration-700" />

                    <motion.div
                        initial={{ y: 0 }}
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5 relative">
                            {/* Ambient Glows */}
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

                            {/* Dashboard Content Mock */}
                            <div className="relative isolate overflow-hidden">
                                {/* Subtle Noise Texture */}
                                <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />

                                <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 items-center relative z-10">
                                    <div className="space-y-8">
                                        {/* Badge */}
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
                                            {/* Techy Borders */}
                                            <div className="absolute -top-4 -left-4 w-4 h-4 border-t-2 border-l-2 border-emerald-500/20" />
                                            <div className="absolute -bottom-4 -right-4 w-4 h-4 border-b-2 border-r-2 border-emerald-500/20" />

                                            <div className="space-y-3 pt-2 h-[220px] overflow-hidden relative mask-linear-fade">
                                                {/* Scanline */}
                                                <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[size:100%_4px] opacity-20" />

                                                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-900 z-10" />
                                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-900 z-10" />

                                                <motion.div
                                                    animate={{ y: ["0%", "-50%"] }}
                                                    transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                                                    className="will-change-transform"
                                                >
                                                    {/* Render the list twice for seamless looping */}
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

                                    {/* Live Edge Card - Explaining the Value Proposition */}
                                    <div className="flex justify-center relative items-center z-10 w-full">
                                        <div className="relative w-full max-w-[320px] bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] ring-1 ring-white/5">

                                            {/* Header */}
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

                                            {/* Main Content */}
                                            <div className="p-5 space-y-6">

                                                {/* The "Review" - Probability Comparison */}
                                                <div className="space-y-3">

                                                    {/* Vegas Line */}
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

                                                    {/* AI Line - The "Edge" Visualized */}
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
                                                            {/* The Gap Marker */}
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-emerald-500/30 border-l border-r border-white/20 transition-all duration-1000"
                                                                style={{ left: `${impliedProb}%`, width: `${Math.max(0, edge)}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* The Result / CTA */}
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

                                            {/* Progress Bar at Bottom */}
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
