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

// Sleek Live Edge Ticker Component
function EdgeTicker() {
    return (
        <div className="w-full max-w-6xl mx-auto overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl relative flex items-center h-20 shadow-[0_0_40px_-15px_rgba(16,185,129,0.15)] ring-1 ring-white/[0.02]">
           {/* Fade edges */}
           <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
           <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-black via-black/80 to-transparent z-10" />
           
           {/* Scanning laser line */}
           <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.5)] z-20 pointer-events-none" />

           <motion.div 
               className="flex whitespace-nowrap gap-6 items-center px-4"
               animate={{ x: ["0%", "-50%"] }}
               transition={{ duration: 30, ease: "linear", repeat: Infinity }}
           >
               {[...Array(2)].map((_, i) => (
                   <div key={i} className="flex gap-6 items-center">
                       {[
                           { team: "KC Chiefs ML", line: "+145", ev: "+4.7%" },
                           { team: "LAL Lakers -4.5", line: "-110", ev: "+3.2%" },
                           { team: "BOS Bruins U 5.5", line: "+105", ev: "+5.1%" },
                           { team: "NYY Yankees RL", line: "+130", ev: "+2.8%" },
                           { team: "DAL Cowboys O 48.5", line: "-115", ev: "+4.1%" },
                           { team: "MIA Heat ML", line: "+180", ev: "+6.2%" },
                       ].map((bet, j) => (
                           <div key={j} className="flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors py-2.5 px-6 rounded-full border border-white/5 cursor-default group">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                               <span className="text-white text-base font-bold tracking-tight">{bet.team}</span>
                               <span className="text-zinc-500 text-sm font-semibold">{bet.line}</span>
                               <div className="w-px h-4 bg-white/10 mx-1" />
                               <div className="flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                                  <span className="text-emerald-400 font-bold text-sm tracking-wide bg-emerald-400/10 px-2.5 py-1 rounded-md">{bet.ev} EV</span>
                               </div>
                           </div>
                       ))}
                   </div>
               ))}
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
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center w-full max-w-5xl mx-auto mb-8 relative z-10"
                >
                    <h1 className="text-[3.5rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] font-black tracking-[-0.04em] leading-[0.95]">
                        <span className="text-white block drop-shadow-md">Our AI Finds The</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 block pb-1 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            Profitable Edge
                        </span>
                        <span className="text-white/30 block mt-2 text-[2.5rem] sm:text-[3.5rem] md:text-[4.5rem] font-extrabold tracking-[-0.02em]">
                            You Can't.
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
                    className="w-full relative mt-8"
                >
                    <EdgeTicker />
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

