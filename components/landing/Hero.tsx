"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
    ArrowRight, 
    ChevronRight, 
    Flame, 
    Lock, 
    ShieldCheck, 
    Sparkles, 
    Target, 
    TrendingUp, 
    Zap,
    Activity,
    BrainCircuit
} from "lucide-react"
import { motion } from "framer-motion"
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

// Abstract Edge Visualizer Component
function EdgeVisualizer() {
    return (
        <div className="relative w-full max-w-5xl mx-auto h-[400px] md:h-[500px] rounded-3xl border border-white/[0.08] bg-black/60 backdrop-blur-2xl overflow-hidden flex items-center justify-center shadow-[0_0_80px_-20px_rgba(16,185,129,0.15)] group perspective-[2000px]">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-emerald-500/[0.08] pointer-events-none" />
            
            {/* 3D Grid Pattern */}
            <div className="absolute inset-x-0 bottom-0 h-full origin-bottom" style={{ transform: 'rotateX(60deg) scale(2.5)' }}>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_top,black,transparent_80%)]" />
                
                {/* Traveling grid lines */}
                <motion.div 
                    className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(16,185,129,0.2),transparent)] h-2"
                    animate={{ y: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Glowing Core Elements */}
            <div className="absolute inset-0 flex items-center justify-center mix-blend-screen pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full bg-radial-gradient from-emerald-500/10 to-transparent blur-3xl opacity-50" />
            </div>

            {/* Simulated Floating UI - Main Dashboard Screen */}
            <motion.div 
                 initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                 animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                 transition={{ duration: 1, delay: 0.2, type: "spring" }}
                 className="relative z-10 w-[90%] md:w-[70%] h-[75%] rounded-2xl bg-[#0a0a0cd0] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
                 style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Header */}
                <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 bg-white/[0.02]">
                    <div className="flex gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-mono text-zinc-400">profitpicks.ai / analyze</span>
                    </div>
                    <div className="w-16" /> {/* Spacer */}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 relative flex gap-6">
                    {/* Main Chart Area */}
                    <div className="flex-1 border border-white/5 rounded-xl bg-black/30 p-4 relative overflow-hidden flex flex-col justify-end">
                        <div className="absolute top-4 left-4 flex flex-col">
                            <span className="text-white font-bold text-lg">KC Chiefs ML</span>
                            <span className="text-zinc-500 text-xs">+145 (DraftKings)</span>
                        </div>
                        <div className="absolute top-4 right-4 text-right">
                            <span className="text-emerald-400 font-black text-2xl inline-block drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">+4.7% EV</span>
                            <span className="text-zinc-500 text-xs block">Mathematical Edge</span>
                        </div>

                        {/* Line Chart Graphic */}
                        <div className="w-full h-32 relative mt-12">
                            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                                <motion.path
                                    d="M0,45 C20,40 30,20 50,25 C70,30 80,10 100,5"
                                    fill="none"
                                    stroke="url(#line-gradient)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            {/* Animated Scanner line sweeping over the chart */}
                            <motion.div 
                                className="absolute top-0 bottom-0 w-[1px] bg-emerald-400 shadow-[0_0_15px_2px_rgba(16,185,129,0.8)] z-10"
                                animate={{ left: ["0%", "100%", "0%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </div>

                    {/* Side Panel - AI Analysis */}
                    <div className="w-48 border border-white/5 rounded-xl bg-black/30 p-3 flex flex-col gap-3">
                        <div className="text-xs font-bold text-zinc-400 border-b border-white/10 pb-2 flex items-center justify-between">
                            AI ANALYSIS
                            <BrainCircuit className="w-4 h-4 text-emerald-400" />
                        </div>
                        
                        {/* Fake data lines */}
                        {[
                            { label: "Public Money", val: "72%", col: "text-rose-400" },
                            { label: "Sharp Money", val: "88%", col: "text-emerald-400" },
                            { label: "Line Movement", val: "Favored", col: "text-emerald-400" },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">{item.label}</span>
                                <span className={`font-mono font-bold ${item.col}`}>{item.val}</span>
                            </div>
                        ))}

                        <div className="mt-auto border border-emerald-500/30 bg-emerald-500/10 rounded-lg p-2 text-center text-emerald-400 text-xs font-bold animate-pulse">
                            RECOMMENDATION: BET
                        </div>
                    </div>
                </div>

                {/* Floating elements popping out */}
                <motion.div 
                    initial={{ opacity: 0, x: 20, y: -20, translateZ: 50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="absolute -right-6 -top-6 bg-black border border-white/20 rounded-xl p-3 shadow-2xl flex items-center gap-3"
                    style={{ transform: 'translateZ(50px)' }}
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                        <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">FanDuel Line Shift</div>
                        <div className="text-sm font-white font-bold ml-1 text-blue-300">Chiefs +140 → +145</div>
                    </div>
                </motion.div>
                
                 <motion.div 
                    initial={{ opacity: 0, x: -20, y: 20, translateZ: 80 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.8 }}
                    className="absolute -left-8 -bottom-4 bg-black border border-white/20 rounded-xl p-3 shadow-2xl flex items-center gap-3"
                    style={{ transform: 'translateZ(80px)' }}
                >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Edge Verified</div>
                        <div className="text-sm font-white font-bold ml-1 text-emerald-300">Confidence: 94.2%</div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    )
}

export function Hero() {
    const [liveCount, setLiveCount] = useState(2847)

    // Simulate live user count fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount(prev => prev + Math.floor(Math.random() * 5) - 2)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-28 pb-20 md:pt-36 md:pb-28 min-h-[100vh] justify-center bg-[#000000]">
            
            {/* === CINEMATIC BACKGROUND SYSTEM === */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.08) 0%, rgba(45,212,191,0.04) 40%, transparent 70%)' }} />
            
            <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)' }} />

            <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 60%)' }} />

            {/* Glowing top line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            {/* === MAIN CONTENT === */}
            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full max-w-5xl mx-auto">
                
                {/* Sleek Top Pill */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   className="mb-8 md:mb-10"
                >
                    <div className="relative group cursor-pointer inline-block">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-700" />
                        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-white/10 rounded-full shadow-lg">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
                            <span className="text-[11px] font-semibold text-emerald-400 tracking-wide uppercase">Engine Active</span>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <span className="text-[12px] text-zinc-400 font-medium tracking-wide pr-1">
                                <span className="text-white font-semibold">{liveCount.toLocaleString()}</span> lines scanning
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN HEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center w-full max-w-4xl mx-auto mb-6 relative z-10"
                >
                    <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-white leading-[1.1] mb-0" style={{ letterSpacing: '-0.02em' }}>
                        Our AI Finds The Profitable Edge
                        <br className="hidden sm:block" />
                        <span className="relative inline-block mt-1 sm:mt-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                                You Can't.
                            </span>
                        </span>
                    </h1>
                </motion.div>

                {/* SUBHEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-2xl mx-auto mb-12"
                >
                    <p className="text-[16px] sm:text-[18px] text-zinc-400 leading-relaxed font-medium">
                        We scan <span className="text-white font-semibold">millions of data points</span> across every major sportsbook in real-time. Our <span className="text-emerald-400 font-semibold drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">AI-powered engine</span> instantly surfaces mathematical advantages so you <span className="text-white font-semibold border-b border-emerald-500/30 pb-0.5">only bet when the numbers are in your favor</span>.
                    </p>
                </motion.div>

                {/* CTA BUTTONS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20 w-full sm:w-auto"
                >
                    <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="relative group w-full sm:w-auto"
                    >
                        {/* Animated Glow Behind Button */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse" />
                        <Link 
                            href="/login"
                            className="relative w-full sm:w-auto px-8 h-14 bg-white hover:bg-zinc-100 text-black rounded-xl text-[16px] font-black tracking-wide transition-colors shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]"
                        >
                            Start Winning Today
                            <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto"
                    >
                        <Link 
                            href="#how-it-works"
                            className="relative w-full sm:w-auto px-8 h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white rounded-xl text-[16px] font-bold transition-all flex items-center justify-center gap-2 group overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                See How It Works
                                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                            </span>
                            {/* Glass shine effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* === SOCIAL PROOF STATS === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-16 w-full max-w-4xl mx-auto mb-20 md:mb-24"
                >
                    {[
                        { value: 67, suffix: "%", label: "Win Rate", desc: "Across tracked bets", color: "text-emerald-400" },
                        { value: 12, suffix: "%", prefix: "+", label: "Monthly ROI", desc: "Average return", color: "text-teal-400" },
                        { value: 50, suffix: "k+", prefix: "", label: "Picks Analyzed", desc: "Every minute", color: "text-cyan-400" },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center text-center">
                            <div className="flex items-baseline gap-0.5 mb-1">
                                <span className={`text-3xl md:text-4xl font-black tracking-tight ${stat.color}`}>
                                    <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                                </span>
                            </div>
                            <span className="text-[13px] font-bold text-zinc-300 tracking-wide uppercase">{stat.label}</span>
                            <span className="text-[11px] text-zinc-500 mt-1">{stat.desc}</span>
                        </div>
                    ))}
                </motion.div>

                {/* === EDGE VISUALIZER SHOWCASE === */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full relative"
                >
                    <EdgeVisualizer />
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
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

