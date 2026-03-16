"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Activity, ChevronRight, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-32 pb-24 md:pt-40 md:pb-32 min-h-[95vh] justify-center bg-[#050505]">
            {/* Spotlight Background */}
            <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_center_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-[#050505] to-[#050505] pointer-events-none" />
            
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]" />
                {/* Animated Scanner line */}
                <motion.div 
                    animate={{ top: ["-10%", "110%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                />
            </div>

            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full max-w-5xl mx-auto">
                
                {/* Ultra-premium badge */}
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5 }}
                   className="mb-8 md:mb-12"
                >
                    <div className="relative group cursor-pointer inline-flex transition-all duration-300 hover:-translate-y-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500"></div>
                        <div className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-black/80 border border-white/10 rounded-full backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-zinc-300">
                                Powered by <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 ml-1">Claude 4.6 Opus</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-zinc-500 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center w-full space-y-6 md:space-y-8"
                >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.05]">
                        Precision Analytics. <br className="hidden sm:block"/>
                        <span className="relative inline-block mt-2">
                            <span className="absolute -inset-2 bg-emerald-500/20 blur-2xl rounded-full" />
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400 drop-shadow-lg">
                                Maximum Edge.
                            </span>
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto font-normal leading-relaxed">
                        Stop gambling. Start investing. Our AI Engine analyzes millions of real-time market data points to find the <strong className="text-white font-semibold flex-inline">exact moments</strong> the sportsbooks make a mistake.
                    </p>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 md:mt-14"
                >
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-10 h-14 md:h-16 text-base font-bold bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all duration-300 rounded-full shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)]"
                        asChild
                    >
                        <Link href="/login">
                            Initialize Engine <ArrowUpRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto px-10 h-14 md:h-16 text-base font-bold text-white hover:bg-white/10 hover:text-white rounded-full transition-all duration-300 border border-white/10 bg-black/20 backdrop-blur-md"
                        asChild
                    >
                        <Link href="#how-it-works">
                            Explore the Math
                        </Link>
                    </Button>
                </motion.div>
                
                {/* Visual Eye-Catcher - The "Edge Graph" */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="w-full max-w-4xl mx-auto mt-20 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none" />
                    
                    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-xl p-6 md:p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden group">
                        
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
                        
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                            
                            {/* Left Side: System Status */}
                            <div className="flex items-center gap-5 w-full md:w-auto">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]">
                                    <Activity className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-bold text-xl tracking-wide mb-1">System Active</h3>
                                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Live Sync</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Stats Grid */}
                            <div className="flex items-center gap-8 md:gap-12 w-full md:w-auto justify-between md:justify-end">
                                <div className="text-left">
                                    <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5">Processing</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-white text-3xl md:text-4xl font-bold tracking-tight">4.8M</p>
                                        <span className="text-zinc-500 font-medium">/sec</span>
                                    </div>
                                </div>
                                
                                <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                                
                                <div className="text-left">
                                    <p className="text-zinc-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1.5">Avg Edge</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 text-3xl md:text-4xl font-bold tracking-tight">+18.4</p>
                                        <span className="text-teal-500 font-medium">%</span>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
