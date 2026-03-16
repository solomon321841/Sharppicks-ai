"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BarChart3, ChevronRight, Target, Zap, BrainCircuit, Activity, Cpu } from "lucide-react"
import { FadeIn } from "./FadeIn"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-24 pb-8 md:pt-32 md:pb-24 min-h-[95vh] justify-center">
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
                                <span className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 tracking-wide uppercase">Claude 3.5 Sonnet Engine</span>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Main Headline */}
                <FadeIn delay={0.1} className="text-center w-full max-w-5xl mx-auto space-y-6">
                    <h1 className="text-[3.5rem] leading-[0.9] sm:text-7xl md:text-[6rem] lg:text-[7.5rem] font-black tracking-tighter text-white uppercase italic">
                        Dominate the <br className="hidden md:block"/>
                        <span className="relative inline-block mt-1 md:mt-3 px-2 md:px-0">
                            <span className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full" />
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400 drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">Sportsbooks.</span>
                        </span>
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto font-medium leading-relaxed mt-6">
                        Stop guessing. We use the world's best AI system to scan millions of data points and uncover mathematically profitable bets in real-time.
                    </p>
                </FadeIn>

                {/* CTA Buttons */}
                <FadeIn delay={0.2} className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 md:mt-12 relative z-20">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 md:px-10 h-14 text-sm md:text-base font-black uppercase tracking-widest bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all duration-300 rounded-full shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)]"
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

                {/* Visualizer */}
                <FadeIn delay={0.3} className="mt-16 w-full max-w-5xl mx-auto relative hidden md:block">
                    <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500/20 to-transparent blur-2xl rounded-[2rem] opacity-50" />
                    
                    <div className="relative bg-[#0a0a0a]/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
                        {/* Window Header */}
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                    <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                </div>
                                <div className="h-4 w-px bg-white/10 mx-2" />
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 rounded border border-emerald-500/20">
                                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Claude v3.5 Sonnet / Edge Matrix Active</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono tracking-wider">LIVE VEGAS SYNC</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5 border-b border-white/5">
                            {/* Terminal output */}
                            <div className="col-span-2 p-6 bg-black/40">
                                <div className="font-mono text-[11px] md:text-sm text-zinc-500 space-y-2.5 h-[180px] overflow-hidden relative">
                                    <motion.div 
                                        animate={{ y: ["0%", "-50%"] }}
                                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                    >
                                        <p>&gt;<span className="text-emerald-500"> [SYS]</span> Connecting to SharpPicks API... 14ms</p>
                                        <p>&gt;<span className="text-emerald-400"> [CLAUDE_ENGINE]</span> Analyzing NBA slate (8 games)...</p>
                                        <p className="pl-4 border-l border-white/10 ml-2">Loading historical player data (LeBron James + AD)</p>
                                        <p className="pl-4 border-l border-white/10 ml-2">Factoring in recent travel schedule and back-to-back...</p>
                                        <p>&gt;<span className="text-emerald-500"> [MATH_MODEL]</span> Simulating game outcomes (10,000 iterations)...</p>
                                        <p>&gt;<span className="text-teal-400"> [DETECT]</span> Edge found: LAL Moneyline (+145 on DraftKings)</p>
                                        <p className="pl-4 border-l border-emerald-500/30 ml-2 text-white">True Probability: 45.2% | Implied: 40.8% | <span className="text-emerald-400 font-bold">+4.4% EV</span></p>
                                        <p>&gt;<span className="text-emerald-500"> [SYS]</span> Pushing to live dashboard.</p>
                                        <br/>
                                        <p>&gt;<span className="text-emerald-500"> [SYS]</span> Fetching live odds from FanDuel, BetMGM, Caesars...</p>
                                        <p>&gt;<span className="text-emerald-400"> [CLAUDE_ENGINE]</span> Running regression on NHL goalie start...</p>
                                        <p>&gt;<span className="text-emerald-500"> [MATH_MODEL]</span> Implied volatility detected. Recalculating.</p>
                                        <p>&gt;<span className="text-zinc-400"> [INFO]</span> No profitable edge detected. Standing by.</p>
                                        <br/>
                                        <p>&gt;<span className="text-emerald-500"> [SYS]</span> Connecting to SharpPicks API... 12ms</p>
                                    </motion.div>
                                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgb(6,6,6)] to-transparent" />
                                </div>
                            </div>
                            
                            {/* Live metrics */}
                            <div className="col-span-1 p-6 flex flex-col justify-center gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1.5"><Activity className="w-3 h-3" /> Process Speed</div>
                                        <div className="text-xs font-mono font-bold text-emerald-400">14.2ms</div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1.5"><Target className="w-3 h-3" /> Edge Threshold</div>
                                        <div className="text-xs font-mono font-bold text-teal-400">&gt; 3.5% EV</div>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-teal-400 w-[60%] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1.5"><BarChart3 className="w-3 h-3" /> Data Volume</div>
                                        <div className="text-xs font-mono font-bold text-white">24h Scope</div>
                                    </div>
                                    <div className="text-3xl font-black text-white italic tracking-tighter">4,821<span className="text-lg text-zinc-500">k</span><span className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">+</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </FadeIn>

            </div>
        </section>
    )
}
