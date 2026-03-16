"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BrainCircuit } from "lucide-react"
import { FadeIn } from "./FadeIn"

export function Hero() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-32 pb-24 md:pt-48 md:pb-40 min-h-[100vh] justify-center bg-[#030303]">
            {/* Minimalist, breathtaking cinematic background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
                {/* Central AI Core Glow */}
                <div className="absolute top-[45%] w-[600px] md:w-[1200px] h-[600px] md:h-[1200px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none animate-pulse duration-[4000ms]" />
                <div className="absolute top-[45%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-400/15 blur-[100px] rounded-full pointer-events-none" />
                
                {/* Elegant radial grid mask */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_45%,black,transparent_100%)]" />
            </div>

            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full max-w-5xl mx-auto">
                
                {/* Top Badge: Powered by Claude 4.6 */}
                <FadeIn className="mb-10 md:mb-12">
                    <div className="relative group cursor-pointer inline-flex transition-transform hover:-translate-y-1 duration-300">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-emerald-500/50 rounded-full blur-md opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                        <div className="relative inline-flex items-center gap-3 px-5 py-2.5 bg-zinc-950/90 border border-white/10 rounded-full shadow-2xl backdrop-blur-xl group-hover:bg-zinc-900 transition-all">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <BrainCircuit className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs md:text-sm font-medium text-zinc-300 tracking-wide">
                                Powered by <span className="font-bold text-white tracking-widest uppercase ml-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Claude 4.6 Opus</span>
                            </span>
                        </div>
                    </div>
                </FadeIn>

                {/* Main Headline */}
                <FadeIn delay={0.1} className="text-center w-full max-w-5xl mx-auto space-y-6 md:space-y-8">
                    <h1 className="text-[4rem] leading-[0.95] sm:text-6xl md:text-[6.5rem] lg:text-[8rem] font-bold tracking-tighter text-white">
                        <span className="text-zinc-500 font-medium tracking-tight">The ultimate</span><br/>
                        <span className="relative inline-block mt-2 md:mt-4">
                            {/* Super-glow behind text */}
                            <span className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full" />
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200 drop-shadow-2xl">
                                Unfair Advantage.
                            </span>
                        </span>
                    </h1>
                    
                    <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
                        Institutional-grade predictive models running on the smartest AI ever built. We scan the entire Vegas board so you only bet when the math is in your favor.
                    </p>
                </FadeIn>

                {/* CTA Buttons */}
                <FadeIn delay={0.2} className="w-full flex flex-col sm:flex-row items-center justify-center gap-5 mt-12 md:mt-16 relative z-20">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-10 h-16 text-sm md:text-base font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 hover:scale-105 transition-all duration-300 rounded-full shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)]"
                        asChild
                    >
                        <Link href="/login">
                            Initialize Engine <ArrowUpRight className="ml-2 w-5 h-5 text-black" />
                        </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="ghost"
                        className="w-full sm:w-auto px-10 h-16 text-sm md:text-base font-medium tracking-widest text-white hover:bg-white/5 border border-white/10 backdrop-blur-md rounded-full transition-all duration-300 uppercase"
                        asChild
                    >
                        <Link href="#how-it-works">
                            Explore the Math
                        </Link>
                    </Button>
                </FadeIn>
                
                {/* Ultra-sleek single live indicator (Replaces bulky cards) */}
                <FadeIn delay={0.3} className="mt-24 md:mt-32">
                    <div className="inline-flex items-center gap-4 px-6 md:px-8 py-3.5 bg-black/40 border border-white/5 backdrop-blur-2xl rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] hover:border-emerald-500/20 transition-colors duration-500 cursor-default">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse" />
                        <div className="font-mono text-[10px] md:text-xs text-zinc-500 tracking-[0.2em] uppercase">
                            <span className="text-emerald-500 font-bold mr-3">[LIVE]</span> 
                            AI scanning <span className="text-white font-bold ml-1 mr-1">4.8M+</span> data points across 12 sportsbooks
                        </div>
                    </div>
                </FadeIn>

            </div>
        </section>
    )
}
