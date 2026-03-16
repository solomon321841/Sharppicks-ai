"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
    ArrowRight, 
    BrainCircuit, 
    ChevronRight, 
    Flame, 
    Lock, 
    ShieldCheck, 
    Sparkles, 
    Target, 
    TrendingUp, 
    Zap 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from "react"

// Animated counter component
function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: { 
    end: number; suffix?: string; prefix?: string; duration?: number 
}) {
    const [count, setCount] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true) },
            { threshold: 0.3 }
        )
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [hasStarted])

    useEffect(() => {
        if (!hasStarted) return
        let startTime: number
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [hasStarted, end, duration])

    return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Rotating taglines for the live scanner
const scannerLines = [
    { sport: "NFL", matchup: "KC Chiefs @ Ravens", edge: "+4.7%", odds: "+145" },
    { sport: "NBA", matchup: "Celtics @ Bucks", edge: "+6.2%", odds: "-110" },
    { sport: "MLB", matchup: "Dodgers @ Yankees", edge: "+3.8%", odds: "+130" },
    { sport: "NHL", matchup: "Oilers @ Panthers", edge: "+5.1%", odds: "+125" },
]

export function Hero() {
    const [activeScan, setActiveScan] = useState(0)
    const [liveCount, setLiveCount] = useState(2847)

    // Rotate through scanner lines
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveScan((prev) => (prev + 1) % scannerLines.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    // Simulate live user count fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount(prev => prev + Math.floor(Math.random() * 5) - 2)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const currentScan = scannerLines[activeScan]

    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-28 pb-20 md:pt-36 md:pb-28 min-h-[100vh] justify-center bg-[#030304]">
            
            {/* === CINEMATIC BACKGROUND SYSTEM === */}
            {/* Primary aurora glow - top center */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[600px] md:h-[900px] rounded-[100%] pointer-events-none animate-aurora"
                 style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, rgba(13,148,136,0.06) 40%, transparent 70%)' }} />
            
            {/* Secondary accent glow - left */}
            <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
                 style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
            
            {/* Tertiary accent glow - right */}
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none opacity-30"
                 style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)' }} />

            {/* Subtle noise texture */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animation: `float-particle ${3 + i * 0.5}s ease-in-out ${i * 0.7}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* === MAIN CONTENT === */}
            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full max-w-6xl mx-auto">
                
                {/* Live Status Bar */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.6 }}
                   className="mb-8 md:mb-14"
                >
                    <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-[#0A0A0C]/50 border border-white/[0.05] rounded-full backdrop-blur-md shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#1ee6a6] shadow-[0_0_8px_rgba(30,230,166,0.8)]" />
                            </div>
                            <span className="text-[12px] font-bold text-[#1ee6a6] uppercase tracking-widest">Live</span>
                        </div>
                        <div className="w-px h-3.5 bg-white/10" />
                        <span className="text-[12.5px] text-zinc-400 font-medium">
                            <span className="text-white font-bold">{liveCount.toLocaleString()}</span> lines scanned right now
                        </span>
                        <div className="w-px h-3.5 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                            <BrainCircuit className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="text-[12.5px] text-zinc-500 font-medium tracking-wide">AI Engine v4.6</span>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN HEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-center w-full max-w-[900px] mx-auto mb-6 relative z-10"
                >
                    <h1 className="text-[4rem] sm:text-[5rem] md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-tight text-white leading-[1.03] mb-0" style={{ letterSpacing: '-0.02em' }}>
                        Our AI Finds the
                        <br />
                        <span className="relative inline-block pb-1">
                            <span className="text-[#38efb0]" style={{ textShadow: '0 0 50px rgba(56, 239, 176, 0.4)' }}>
                                Profitable Edge
                            </span>
                            {/* Underline glow accent */}
                            <span className="absolute bottom-1 left-[3%] right-[3%] h-[2px] bg-gradient-to-r from-transparent via-[#38efb0] to-transparent rounded-full shadow-[0_0_20px_rgba(56,239,176,0.8)]" />
                        </span>
                        {" "}You
                        <br />
                        Can't.
                    </h1>
                </motion.div>

                {/* SUBHEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-center max-w-[850px] mx-auto mb-12"
                >
                    <p className="text-base sm:text-lg md:text-[1.35rem] text-zinc-400 leading-[1.6] font-light tracking-wide">
                        ProfitPicks scans <strong className="text-white font-medium">every sportsbook line in real-time</strong>, comparing public <br className="hidden md:block"/>
                        odds against our proprietary AI models to surface <strong className="text-[#38efb0] font-medium">mathematically<br className="hidden md:block"/>
                        proven edges</strong> — so you only bet when the numbers are in your favor.
                    </p>
                </motion.div>

                {/* CTA BUTTONS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20 w-full sm:w-auto mt-2"
                >
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-9 h-[54px] text-[13px] font-bold uppercase tracking-[0.1em] bg-[#1ee6a6] hover:bg-[#15d496] text-[#0A0A0C] border-none rounded-full transition-all duration-300 shadow-[0_0_40px_-10px_rgba(30,230,166,0.6)] group"
                        asChild
                    >
                        <Link href="/login">
                            START WINNING TODAY
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto px-9 h-[54px] text-[14px] font-semibold text-zinc-300 hover:text-white bg-transparent hover:bg-white/[0.04] rounded-full transition-all duration-300 border border-white/[0.08]"
                        asChild
                    >
                        <Link href="#how-it-works">
                            See How It Works
                            <ChevronRight className="ml-1 w-4 h-4 text-zinc-500" />
                        </Link>
                    </Button>
                </motion.div>

                {/* === SOCIAL PROOF STATS BAR === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-16 mb-24 w-full max-w-4xl mx-auto px-4"
                >
                    {[
                        { value: 67, suffix: "%", label: "WIN RATE", prefix: "" },
                        { value: 12, suffix: "%", prefix: "+", label: "AVG. MONTHLY ROI" },
                        { value: 50000, suffix: "+", prefix: "", label: "PICKS ANALYZED" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center group flex flex-col items-center justify-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                {i === 0 && <div className="w-5 h-5 rounded-full border border-[#1ee6a6]/30 flex items-center justify-center"><div className="w-2.5 h-2.5 bg-[#1ee6a6] rounded-full shadow-[0_0_10px_rgba(30,230,166,0.8)]"></div></div>}
                                {i === 1 && <TrendingUp className="w-6 h-6 text-[#1ee6a6]" />}
                                {i === 2 && <div className="hidden"></div>}
                                <span className="text-5xl md:text-[56px] font-black text-white tracking-tight leading-none">
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                                </span>
                            </div>
                            <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* === THE PRODUCT SHOWCASE === */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-5xl mx-auto relative group"
                >
                    {/* Dramatic glow behind the product showcase */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] pointer-events-none transition-all duration-1000"
                         style={{ background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.04) 50%, transparent 70%)', filter: 'blur(80px)' }} />
                    
                    <div className="relative bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/[0.07] rounded-2xl md:rounded-3xl shadow-[0_50px_100px_-30px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden">
                        
                        {/* Top Chrome Bar */}
                        <div className="bg-white/[0.02] border-b border-white/[0.05] px-5 md:px-6 py-3 md:py-3.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06] border border-white/[0.08]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06] border border-white/[0.08]" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/40 relative">
                                        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse scale-50" />
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 ml-2">
                                    <div className="px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                                        <span className="text-[10px] font-mono text-zinc-500">profitpicks.ai/dashboard</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Lock className="w-3 h-3 text-emerald-500/60" />
                                <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest hidden sm:inline">Encrypted</span>
                            </div>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-4 md:p-6 lg:p-8">
                            
                            {/* Dashboard Header Row */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
                                        <BrainCircuit className="w-4.5 h-4.5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white tracking-tight">AI Edge Scanner</h3>
                                        <p className="text-[10px] text-zinc-500 font-medium">Real-time odds analysis across all major sportsbooks</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Scanning Live</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-mono">
                                        <span className="text-zinc-400 font-semibold">{liveCount.toLocaleString()}</span> lines analyzed
                                    </div>
                                </div>
                            </div>

                            {/* Live Picks Grid */}
                            <div className="space-y-3">
                                <AnimatePresence mode="wait">
                                    {scannerLines.map((pick, i) => (
                                        <motion.div
                                            key={pick.sport}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ 
                                                opacity: i === activeScan ? 1 : 0.4, 
                                                x: 0,
                                                scale: i === activeScan ? 1 : 0.98,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className={`relative flex items-center gap-4 md:gap-6 p-4 md:p-5 rounded-xl border transition-all duration-500 ${
                                                i === activeScan 
                                                    ? 'bg-emerald-500/[0.04] border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)]' 
                                                    : 'bg-white/[0.01] border-white/[0.04]'
                                            }`}
                                        >
                                            {/* Active indicator */}
                                            {i === activeScan && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            )}
                                            
                                            {/* Sport Badge */}
                                            <div className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                                                pick.sport === 'NFL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                pick.sport === 'NBA' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                pick.sport === 'MLB' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                            }`}>
                                                {pick.sport}
                                            </div>

                                            {/* Matchup */}
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-bold text-white truncate block">{pick.matchup}</span>
                                                <span className="text-[10px] text-zinc-500 font-medium">Moneyline · Public: {pick.odds}</span>
                                            </div>

                                            {/* AI Model Confidence - Visual Bar */}
                                            <div className="hidden md:flex flex-col items-end gap-1 w-32">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">AI Confidence</span>
                                                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                    <motion.div 
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: i === activeScan ? '78%' : '60%' }}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Edge Value */}
                                            <div className={`shrink-0 text-right transition-all duration-500 ${i === activeScan ? 'scale-100' : 'scale-95'}`}>
                                                <div className={`text-xl md:text-2xl font-black tracking-tighter ${
                                                    i === activeScan 
                                                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300' 
                                                        : 'text-zinc-500'
                                                }`}>
                                                    {pick.edge}
                                                </div>
                                                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">EV Edge</span>
                                            </div>

                                            {/* Action Button */}
                                            {i === activeScan && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="hidden lg:block shrink-0"
                                                >
                                                    <div className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-emerald-400 transition-colors shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
                                                        View Pick
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Bottom Stats Row */}
                            <div className="mt-6 pt-5 border-t border-white/[0.04] grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Today's Edges Found", value: "23", icon: Zap, color: "text-emerald-400" },
                                    { label: "Avg Edge Size", value: "+4.8%", icon: TrendingUp, color: "text-teal-400" },
                                    { label: "Model Accuracy", value: "67.2%", icon: Target, color: "text-emerald-400" },
                                    { label: "Books Scanned", value: "12", icon: ShieldCheck, color: "text-zinc-400" },
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center shrink-0">
                                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                        </div>
                                        <div>
                                            <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                                            <div className="text-[9px] text-zinc-600 font-semibold uppercase tracking-widest">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
                >
                    {[
                        { icon: ShieldCheck, text: "256-bit Encryption" },
                        { icon: Lock, text: "Bank-Level Security" },
                        { icon: Flame, text: "Cancel Anytime" },
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <badge.icon className="w-3.5 h-3.5 text-zinc-600" />
                            <span className="text-[11px] text-zinc-600 font-medium">{badge.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
