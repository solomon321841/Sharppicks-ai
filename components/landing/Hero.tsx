"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BarChart3, ChevronRight, Target, Zap, BrainCircuit, Activity, Cpu, LineChart, ShieldCheck } from "lucide-react"
import { FadeIn } from "./FadeIn"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-24 pb-8 md:pt-32 md:pb-32 min-h-[90vh] justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] md:top-[-20%] left-1/2 -translate-x-1/2 w-[600px] md:w-[1200px] h-[500px] md:h-[800px] bg-emerald-500/15 blur-[120px] rounded-[100%] pointer-events-none opacity-50" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-emerald-700/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full">

                {/* Top Badge: Powered by Claude */}
                <FadeIn className="mb-8 md:mb-10">
                    <div className="relative group cursor-pointer inline-flex">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-500/30 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative inline-flex items-center gap-3 px-4 py-2 bg-zinc-950/80 border border-white/10 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl group-hover:border-white/20 transition-colors">
                            <div className="p-1.5 bg-white/5 rounded-full border border-white/10">
                                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="flex items-center gap-1.5 pr-2">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline-block">Powered by</span>
                                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 tracking-wide uppercase">Claude 3.5 Opus Engine</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Main Headline */}
                <FadeIn delay={0.1} className="text-center w-full max-w-5xl mx-auto space-y-6">
                    <h1 className="text-[3.5rem] leading-[1.05] sm:text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-tight text-white mb-6">
                        Precision Analytics. <br className="hidden md:block"/>
                        <span className="relative inline-block mt-1 md:mt-2">
                            <span className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full" />
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">Maximum Edge.</span>
                        </span>
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto font-medium leading-relaxed mt-6">
                        Stop guessing. We use the world's most advanced AI engine to scan millions of data points and uncover mathematically profitable bets in real-time.
                    </p>
                </FadeIn>

                {/* CTA Buttons */}
                <FadeIn delay={0.2} className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 md:mt-12 relative z-20">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 md:px-10 h-14 text-sm md:text-base font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all duration-300 rounded-full shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
                        asChild
                    >
                        <Link href="/login">
                            Initialize Engine <ArrowUpRight className="ml-2 w-5 h-5 text-emerald-500" />
                        </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto px-8 md:px-10 h-14 text-sm md:text-base font-bold uppercase tracking-widest bg-zinc-900/50 text-white hover:bg-white/10 hover:text-white border-white/10 backdrop-blur-md rounded-full transition-all duration-300"
                        asChild
                    >
                        <Link href="#how-it-works">
                            See The Math
                        </Link>
                    </Button>
                </FadeIn>

                {/* Visualizer - Liquid Glass Data Center */}
                <FadeIn delay={0.3} className="mt-20 w-full max-w-5xl mx-auto relative hidden md:block">
                    <div className="absolute inset-x-20 top-0 h-[200px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="relative grid grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="col-span-1 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden group hover:border-white/[0.1] transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-500" />
                            <div>
                                <Activity className="w-8 h-8 text-emerald-400/70 mb-6 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500" />
                                <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Algorithm Speed</div>
                                <div className="text-4xl font-light text-white tracking-tight">0.2<span className="text-xl text-emerald-500 ml-1">ms</span></div>
                            </div>
                            <div className="mt-8">
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[92%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                </div>
                            </div>
                        </div>

                        {/* Card 2  - Main Middle */}
                        <div className="col-span-1 rounded-3xl bg-gradient-to-b from-emerald-500/[0.08] to-transparent border border-emerald-500/20 backdrop-blur-3xl p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] flex flex-col justify-between relative overflow-hidden transform scale-105 z-10 hover:border-emerald-500/40 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 blur-[60px] rounded-full" />
                            
                            <div className="relative z-10">
                                <BrainCircuit className="w-8 h-8 text-emerald-400 mb-6" />
                                <div className="text-emerald-500 font-bold mb-2 tracking-widest uppercase text-[10px]">Claude 3.5 Opus Active</div>
                                <div className="text-5xl font-bold text-white tracking-tighter drop-shadow-md">4.8M<span className="text-3xl text-emerald-400">+</span></div>
                                <div className="text-zinc-400 text-sm mt-2">Data points processed / sec</div>
                            </div>
                            
                            <div className="relative z-10 mt-8 flex items-center gap-3 bg-black/40 w-max px-4 py-2 rounded-full border border-white/5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live Market Sync</span>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="col-span-1 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden group hover:border-white/[0.1] transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full group-hover:bg-teal-500/20 transition-all duration-500" />
                            <div>
                                <Target className="w-8 h-8 text-teal-400/70 mb-6 group-hover:text-teal-400 group-hover:scale-110 transition-all duration-500" />
                                <div className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Target Edge</div>
                                <div className="text-4xl font-light text-white tracking-tight">+18.4<span className="text-xl text-teal-500 ml-1">%</span></div>
                            </div>
                            <div className="mt-8">
                                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 w-[78%] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

            </div>
        </section>
    )
}
