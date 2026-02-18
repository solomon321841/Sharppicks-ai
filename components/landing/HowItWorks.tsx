'use client'

import React, { useRef } from "react"
import { useScroll, useTransform, useSpring, motion, MotionValue } from "framer-motion"
import { BrainCircuit, TrendingUp, Wallet, Check, ArrowRight, Trophy, Globe, Users, GraduationCap, Star } from "lucide-react"
import { FadeIn } from "./FadeIn"

const content = [
    {
        title: "AI Analysis Engine",
        description:
            "Our Claude 3.5 Sonnet engine actively scans thousands of live odds from major sportsbooks instantly. It processes injury reports, historical trends, and line movement patterns in milliseconds.",
        icon: BrainCircuit,
        color: "from-emerald-500 to-teal-500",
        stats: ["10k+ Data Points", "Real-time Odds", "ML Powered"]
    },
    {
        title: "Value Detection Algorithm",
        description:
            "We calculate the true win probability of every event and compare it against the sportsbook's implied probability. When the gap is significant, we flag it as a Positive EV (Expected Value) play.",
        icon: TrendingUp,
        color: "from-blue-500 to-indigo-500",
        stats: ["+18% ROI avg", "Smart Money Tracking", "Gap Analysis"]
    },
    {
        title: "Profit Generation",
        description:
            "Copy the optimized parlay directly to your sportsbook. We track every bet we recommend on our transparent ledger so you can verify our historic performance.",
        icon: Wallet,
        color: "from-purple-500 to-pink-500",
        stats: ["Automated Tracking", "Bankroll Mgmt", "Instant Alerts"]
    },
]

export function HowItWorks() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    })

    return (
        <section ref={ref} id="how-it-works" className="relative bg-black pt-12 pb-24">
            {/* Section Header */}
            <FadeIn className="text-center mb-24 relative z-10">
                <div className="inline-flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-5 py-2 mb-6 shadow-xl">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">The Process</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
                    How We <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600">Win</span>
                </h2>
                <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                    A three-step quantitative approach to beating the books.
                </p>
            </FadeIn>

            <div className="flex flex-col relative">
                {content.map((item, index) => {
                    const targetScale = 1 - (content.length - index) * 0.05
                    return (
                        <Card
                            key={index}
                            i={index}
                            {...item}
                            progress={scrollYProgress}
                            range={[index * 0.25, 1]}
                            targetScale={targetScale}
                        />
                    )
                })}
            </div>

            {/* Comprehensive League List - Premium Design */}
            <FadeIn className="container px-4 mx-auto mt-32 relative z-20">
                <div className="max-w-7xl mx-auto">

                    {/* Section Header */}
                    <div className="flex flex-col items-center text-center mb-20">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                            <Globe className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Global Reach</span>
                        </div>
                        <h3 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter loading-none">
                            Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Coverage</span>
                        </h3>
                        <p className="text-xl text-zinc-400 max-w-2xl font-light leading-relaxed">
                            Elite data analytics for the world's most competitive leagues. We track every line movement across the globe.
                        </p>
                    </div>

                    {/* League Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <LeagueCategoryCard
                            title="US Major Sports"
                            icon={Trophy}
                            color="emerald"
                            leagues={["NFL Football", "NBA Basketball", "MLB Baseball", "NHL Hockey"]}
                            status="Active"
                        />
                        <LeagueCategoryCard
                            title="European Domestic"
                            icon={Globe}
                            color="blue"
                            leagues={["Premier League", "Spanish La Liga", "Italian Serie A", "German Bundesliga", "French Ligue 1"]}
                            status="Active"
                        />
                        <LeagueCategoryCard
                            title="Elite Tournaments"
                            icon={Star}
                            color="purple"
                            leagues={["UEFA Champions League", "Copa Libertadores"]}
                            status="Active"
                        />
                        <LeagueCategoryCard
                            title="Collegiate"
                            icon={GraduationCap}
                            color="pink"
                            leagues={["NCAA Basketball"]}
                            status="Active"
                        />
                    </div>

                    {/* Coming Soon Banner */}
                    <div className="relative group overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl p-8 md:p-12 text-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                        <h4 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Coming Soon to ProfitPicks
                        </h4>

                        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
                            {["College Football", "UEFA Europa League", "UFC / MMA", "PGA Tour Golf", "ATP Tennis"].map((league) => (
                                <div key={league} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/20 hover:text-white transition-all cursor-default">
                                    {league}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </FadeIn>
        </section>
    )
}

const LeagueCategoryCard = ({ title, icon: Icon, color, leagues, status }: { title: string, icon: any, color: string, leagues: string[], status: string }) => {
    const colorStyles: any = {
        emerald: {
            border: "group-hover:border-emerald-500/50",
            bg: "hover:bg-emerald-500/5",
            text: "text-emerald-400",
            iconBg: "bg-emerald-500/10",
            glow: "from-emerald-500/20"
        },
        blue: {
            border: "group-hover:border-blue-500/50",
            bg: "hover:bg-blue-500/5",
            text: "text-blue-400",
            iconBg: "bg-blue-500/10",
            glow: "from-blue-500/20"
        },
        purple: {
            border: "group-hover:border-purple-500/50",
            bg: "hover:bg-purple-500/5",
            text: "text-purple-400",
            iconBg: "bg-purple-500/10",
            glow: "from-purple-500/20"
        },
        pink: {
            border: "group-hover:border-pink-500/50",
            bg: "hover:bg-pink-500/5",
            text: "text-pink-400",
            iconBg: "bg-pink-500/10",
            glow: "from-pink-500/20"
        }
    }

    const style = colorStyles[color]

    return (
        <div className={`group relative p-8 rounded-[2rem] border border-white/10 bg-zinc-900/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 ${style.border} ${style.bg} overflow-hidden h-full flex flex-col`}>
            {/* Glow Effect */}
            <div className={`absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br ${style.glow} to-transparent blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon className={`w-7 h-7 ${style.text}`} />
                    </div>
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {status}
                    </div>
                </div>

                <h4 className="text-2xl font-bold text-white mb-6 tracking-tight">{title}</h4>

                <ul className="space-y-4 flex-grow">
                    {leagues.map((league, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-white transition-colors`} />
                            <span className="text-sm font-medium">{league}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

interface CardProps {
    i: number;
    title: string;
    description: string;
    icon: any;
    color: string;
    stats: string[];
    progress: MotionValue<number>;
    range: number[];
    targetScale: number;
}

const Card = ({ i, title, description, icon: Icon, color, stats, progress, range, targetScale }: CardProps) => {
    const container = useRef(null)
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ['start end', 'start start']
    })

    // Optimized spring physics for performance
    const smoothProgress = useSpring(progress, { stiffness: 200, damping: 50, mass: 0.5 }) as MotionValue<number>
    const scale = useTransform(smoothProgress, range, [1, targetScale])

    return (
        <div ref={container} className="h-[80vh] flex items-center justify-center sticky top-24">
            <motion.div
                style={{ scale, top: `calc(-5vh + ${i * 40}px)` }}
                className="flex flex-col relative w-full max-w-[900px] mx-4 md:mx-0 bg-[#09090b] border border-white/10 rounded-[2.5rem] p-8 md:p-12 origin-top shadow-2xl overflow-hidden will-change-transform"
            >
                {/* Background Ambient Light */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b ${color} opacity-5 pointer-events-none`} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Floating Icon */}
                    <div className="mb-10 relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${color} blur-2xl opacity-40 animate-pulse`} />
                        <div className="relative w-24 h-24 rounded-3xl bg-black border border-white/20 flex items-center justify-center shadow-2xl">
                            <Icon className="w-10 h-10 text-white" />
                        </div>
                        {/* Connecting Line */}
                        {i < 2 && (
                            <div className="absolute top-full left-1/2 w-px h-32 bg-gradient-to-b from-white/20 to-transparent -translate-x-1/2 -z-10" />
                        )}
                    </div>

                    <h2 className="text-5xl font-black text-white tracking-tighter mb-6">{title}</h2>
                    <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mb-12">{description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                        {stats.map((s: string, idx: number) => (
                            <div key={idx} className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/10">
                                <Check className="w-5 h-5 text-emerald-400 mb-2" />
                                <span className="text-sm font-mono font-bold text-zinc-300 uppercase tracking-wider">{s}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Bar for Step */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                    <motion.div
                        style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
                        className={`h-full bg-gradient-to-r ${color}`}
                    />
                </div>
            </motion.div>
        </div>
    )
}
