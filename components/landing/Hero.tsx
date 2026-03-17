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
    Activity
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
        <div className="relative w-full max-w-4xl mx-auto h-[260px] md:h-[320px] rounded-3xl border border-white/[0.08] bg-black/60 backdrop-blur-2xl overflow-hidden flex items-center justify-center shadow-[0_0_80px_-20px_rgba(16,185,129,0.15)] group">
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-emerald-500/[0.08] pointer-events-none" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]" />

            {/* Simulated Live Chart / Wave */}
            <div className="absolute inset-0 flex items-center justify-center px-8">
                <svg viewBox="0 0 800 200" className="w-full h-full opacity-60 mix-blend-screen" preserveAspectRatio="none">
                    <motion.path
                        d="M 0 150 Q 50 150 100 120 T 200 140 T 300 80 T 400 130 T 500 60 T 600 90 T 700 40 T 800 60"
                        fill="none"
                        stroke="url(#gradient-line)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    />
                    <motion.path
                        d="M 0 180 Q 80 160 150 190 T 300 150 T 450 180 T 600 130 T 800 160"
                        fill="none"
                        stroke="url(#gradient-line-faint)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.5 }}
                        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                    />
                    <defs>
                        <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(16,185,129,0)" />
                            <stop offset="50%" stopColor="rgba(16,185,129,1)" />
                            <stop offset="100%" stopColor="rgba(45,212,191,1)" />
                        </linearGradient>
                        <linearGradient id="gradient-line-faint" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(45,212,191,0)" />
                            <stop offset="50%" stopColor="rgba(45,212,191,0.5)" />
                            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Glowing Data Point */}
            <motion.div 
                className="absolute w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,1)]"
                animate={{ 
                    x: ["-200px", "200px", "-200px"],
                    y: ["40px", "-40px", "40px"],
                    scale: [1, 1.3, 1]
                }}
                transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
            >
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-70" />
            </motion.div>

            {/* Floating Glass UI Element */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative z-10 px-5 py-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center gap-4 shadow-2xl"
            >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex flex-col pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Live Edge Detected</span>
                    </div>
                    <span className="text-sm font-semibold text-white tracking-wide">KC Chiefs +4.7% EV</span>
                </div>
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
                    className="text-center max-w-2xl mx-auto mb-10"
                >
                    <p className="text-[15px] sm:text-[17px] text-zinc-400/90 leading-relaxed font-normal">
                        We scan millions of data points across every major sportsbook in real-time. Our proprietary algorithms instantly surface mathematical advantages so you only bet when the numbers are in your favor.
                    </p>
                </motion.div>

                {/* CTA BUTTONS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-20 w-full sm:w-auto"
                >
                    <div className="relative group w-full sm:w-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
                        <Button 
                            className="relative w-full sm:w-auto px-8 h-12 bg-white hover:bg-zinc-100 text-black rounded-lg text-sm font-bold tracking-wide transition-colors shadow-2xl flex items-center justify-center gap-2"
                            asChild
                        >
                            <Link href="/login">
                                Start Winning Today
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </div>
                    
                    <Button 
                        variant="ghost"
                        className="w-full sm:w-auto px-6 h-12 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group"
                        asChild
                    >
                        <Link href="#how-it-works">
                            See How It Works
                            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                        </Link>
                    </Button>
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

