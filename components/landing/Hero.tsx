"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BrainCircuit } from "lucide-react"
import { FadeIn } from "./FadeIn"

export function Hero() {
    return (
        <section className="relative overflow-hidden flex flex-col items-center pt-24 pb-16 md:pt-32 md:pb-24 min-h-[85vh] justify-center bg-[#09090b]">
            {/* Extremely subtle background - removed giant cinematic glowing orbs */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.05] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div className="container relative z-10 flex flex-col items-center px-4 md:px-6 w-full max-w-4xl mx-auto">
                
                {/* Clean, standard pill badge - no massive glows */}
                <FadeIn className="mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-sm">
                        <BrainCircuit className="w-4 h-4 text-emerald-400" />
                        <span className="text-[13px] font-medium text-zinc-300">
                            Powered by <span className="font-semibold text-white ml-0.5">Claude 4.6 Opus</span>
                        </span>
                    </div>
                </FadeIn>

                {/* Main Headline - Elegantly sized, no more massive typography */}
                <FadeIn delay={0.1} className="text-center w-full space-y-6">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                        Precision Analytics. <br className="hidden sm:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Maximum Edge.</span>
                    </h1>
                    
                    <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
                        We use the world's most advanced AI engine to scan millions of data points across the Vegas board in real-time, uncovering mathematically profitable bets.
                    </p>
                </FadeIn>

                {/* Clean, Standard CTA Buttons */}
                <FadeIn delay={0.2} className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                    <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 h-12 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors border-0"
                        asChild
                    >
                        <Link href="/login">
                            Initialize Engine <ArrowUpRight className="ml-2 w-4 h-4" />
                        </Link>
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline"
                        className="w-full sm:w-auto px-8 h-12 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-white/10 bg-transparent"
                        asChild
                    >
                        <Link href="#how-it-works">
                            Explore the Math
                        </Link>
                    </Button>
                </FadeIn>
                
                {/* Very subtle status band */}
                <FadeIn delay={0.3} className="mt-16 sm:mt-20">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Live processing <strong className="font-medium text-zinc-300">4.8M+</strong> daily data points</span>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
