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
        <section className="relative overflow-hidden flex flex-col items-center pt-24 pb-12 md:pt-32 md:pb-16 min-h-[90vh] justify-center bg-[#000000]">
            
            {/* === CINEMATIC BACKGROUND SYSTEM === */}
            {/* Subtle high-tech grid */}
            <div className="absolute inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,white,transparent)] opacity-20" />
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px]"
                     style={{ background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.06) 0%, rgba(45,212,191,0.03) 40%, transparent 70%)' }} />

                <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 60%)' }} />

                <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full"
                     style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.04) 0%, transparent 60%)' }} />
            </div>

            {/* Glowing top line */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.5)]" />

            {/* === MAIN CONTENT === */}
            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full max-w-5xl mx-auto">
                
                {/* Sleek Top Pill */}
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 10 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                   className="mb-8"
                >
                    <div className="relative group cursor-default inline-block">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur opacity-50 transition duration-700" />
                        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-full shadow-lg">
                            <BrainCircuit className="w-3.5 h-3.5 text-emerald-400/80 ml-1" />
                            <span className="text-[11px] font-bold text-emerald-400/90 tracking-widest uppercase">Powered by Opus 4.6</span>
                            <div className="w-px h-3 bg-white/10 mx-1" />
                            <span className="text-[12px] text-zinc-400 font-medium tracking-wide pr-1 flex items-center gap-1.5">
                                Engine <span className="text-white font-semibold inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Active</span>
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* MAIN HEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center w-full max-w-4xl mx-auto mb-6 relative z-10"
                >
                    <h1 className="text-[2.25rem] sm:text-[3rem] md:text-[5rem] lg:text-[5.5rem] font-black tracking-[-0.03em] leading-[1.05]">
                        <span className="text-white block">We Do The Math.</span>
                        <motion.span 
                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                            transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
                            className="bg-[length:200%_auto] text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 block pb-2 drop-shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                        >
                            You Place The Bet.
                        </motion.span>
                    </h1>
                </motion.div>

                {/* SUBHEADLINE */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-2xl mx-auto mb-10"
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
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10 md:mb-16 w-full sm:w-auto"
                >
                    <motion.div 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="relative group w-full sm:w-auto z-20"
                    >
                        {/* Elegant Button Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
                        <Link 
                            href="/#pricing"
                            className="relative w-full sm:w-auto px-8 h-14 bg-white hover:bg-zinc-100 text-black rounded-xl text-[16px] font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 overflow-hidden"
                        >
                            {/* Glass Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Start Winning Today
                                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto relative z-10"
                    >
                        <Link 
                            href="#how-it-works"
                            className="relative w-full sm:w-auto px-8 h-14 bg-transparent border border-white/10 hover:bg-white/5 text-white rounded-xl text-[16px] font-medium transition-all flex items-center justify-center gap-2 group"
                        >
                            See The Engine In Action
                            <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                    </motion.div>
                </motion.div>

                {/* === SOCIAL PROOF STATS === */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-16 w-full max-w-4xl mx-auto mb-16 px-4"
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


            </div>
        </section>
    )
}

