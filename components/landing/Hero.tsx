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
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-700" />
                        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
                            <BrainCircuit className="w-4 h-4 text-emerald-400 animate-pulse ml-1" />
                            <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">Powered by Opus 4.6</span>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <span className="text-[12px] text-zinc-400 font-medium tracking-wide pr-1">
                                Engine <span className="text-white font-semibold">Active</span>
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN HEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center w-full max-w-4xl mx-auto mb-8 relative z-10"
                >
                    <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-black tracking-tight leading-[1.05]">
                        <span className="text-white block drop-shadow-md">We Do The Math.</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 block pb-2 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            You Place The Bet.
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
                    <p className="text-[16px] md:text-[19px] text-zinc-400 leading-relaxed font-normal">
                        The <span className="text-white font-medium">Opus 4.6</span> AI engine processes millions of data points instantly, uncovering hidden mathematical advantages across global sportsbooks. <br className="hidden sm:block mt-1" />
                        <span className="text-emerald-400 font-medium border-b border-emerald-500/30 pb-0.5">Bet with institutional-grade intel.</span>
                    </p>
                </motion.div>

                {/* CTA BUTTONS */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 mb-24 w-full sm:w-auto"
                >
                    <motion.div 
                        whileHover={{ scale: 1.03, y: -2 }} 
                        whileTap={{ scale: 0.97 }}
                        className="relative group w-full sm:w-auto z-20"
                    >
                        {/* Shimmering Button Glow */}
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-all duration-500 animate-[shimmer_2s_linear_infinite] bg-[length:200%_auto]" />
                        <Link 
                            href="/login"
                            className="relative w-full sm:w-auto pl-6 pr-4 py-2 h-14 bg-white text-black rounded-xl text-[16px] font-black tracking-wide transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-between gap-4 group-hover:shadow-[0_0_60px_rgba(16,185,129,0.6)]"
                        >
                            Start Winning Today
                            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center group-hover:rotate-[-10deg] transition-transform duration-300">
                                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                            </div>
                        </Link>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.03, y: -2 }} 
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto relative z-10"
                    >
                        <Link 
                            href="#how-it-works"
                            className="relative w-full sm:w-auto px-8 h-14 bg-zinc-900 border border-white/10 hover:bg-zinc-800 hover:border-white/20 text-white rounded-xl text-[16px] font-bold transition-all flex items-center justify-center gap-2 shadow-lg group"
                        >
                            See The Engine In Action
                            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
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

