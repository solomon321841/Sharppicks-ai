"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BarChart3, ChevronRight, Target, Zap } from "lucide-react"
import { FadeIn } from "./FadeIn"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-24 pb-8 md:pt-40 md:pb-32 min-h-[90vh] justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] md:top-[-20%] left-1/2 -translate-x-1/2 w-[600px] md:w-[1200px] h-[500px] md:h-[800px] bg-emerald-500/15 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-700/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6">

                {/* Status Pill */}
                <FadeIn className="mb-6 md:mb-10">
                    <div className="relative group cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 md:px-5 md:py-2 bg-black border border-emerald-500/20 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-xl group-hover:border-emerald-500/40 transition-colors">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em]">SharpPicks Engine v2.0 Live</span>
                            <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>
                </FadeIn>

                {/* Main Headline */}
                <FadeIn delay={0.1} className="text-center max-w-5xl mx-auto space-y-6 md:space-y-8">
                    <h1 className="text-[4rem] leading-[0.85] md:text-7xl lg:text-[8rem] font-black tracking-tighter text-white uppercase italic">
                        The Unfair <br className="hidden md:block"/>
                        <span className="relative inline-block px-2">
                            <span className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-500 to-teal-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">Advantage.</span>
                        </span>
                    </h1>
                    
                    <p className="text-sm md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto font-light leading-relaxed">
                        Institutional-grade sports analytics in your pocket. We scan millions of data points to find mathematically profitable bets before the sportsbooks adjust.
                    </p>
                </FadeIn>

                {/* CTA Buttons */}
                <FadeIn delay={0.2} className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 md:mt-14 relative z-20">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 md:px-10 h-14 md:h-16 text-sm md:text-base font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all duration-300 rounded-2xl shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
                        asChild
                    >
                        <Link href="/login">
                            Initialize Engine <ArrowUpRight className="ml-2 w-5 h-5 text-emerald-500" />
                        </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto px-8 md:px-10 h-14 md:h-16 text-sm md:text-base font-bold uppercase tracking-widest bg-zinc-900/50 text-white hover:bg-white/10 hover:text-white border-white/10 backdrop-blur-md rounded-2xl transition-all duration-300"
                        asChild
                    >
                        <Link href="#how-it-works">
                            See The Math
                        </Link>
                    </Button>
                </FadeIn>

                {/* Data Bar */}
                <FadeIn delay={0.3} className="mt-20 md:mt-24 w-full max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md shadow-2xl">
                        {[
                            { value: "48K+", label: "Daily Games Analyzed", icon: BarChart3 },
                            { value: "+18.4%", label: "Average Edge", icon: Target },
                            { value: "0.2s", label: "Line Sync Speed", icon: Zap },
                            { value: "24/7", label: "Algorithm Uptime", icon: ArrowUpRight },
                        ].map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <div key={i} className="bg-black/40 p-6 md:p-8 flex flex-col items-center justify-center text-center group hover:bg-emerald-500/5 transition-colors">
                                    <Icon className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300 mb-4" />
                                    <div className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2 italic drop-shadow-lg">{stat.value}</div>
                                    <div className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-tight">{stat.label}</div>
                                </div>
                            )
                        })}
                    </div>
                </FadeIn>

            </div>
        </section>
    )
}
