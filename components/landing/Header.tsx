"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
    return (
        <header className="fixed w-full z-50 top-0 transition-all duration-300 bg-black/50 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-black/20">
            <div className="container px-4 md:px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <Link className="flex items-center justify-center gap-3 group" href="/">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] border border-white/10 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-white text-base font-black tracking-tighter">PP</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">ProfitPicks</span>
                        <span className="text-[9px] font-bold text-emerald-500/80 tracking-[0.2em] group-hover:text-emerald-400/80 transition-colors">ANALYTICS</span>
                    </div>
                </Link>

                {/* Nav Links - Desktop */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group py-2"
                        href="/#features"
                    >
                        Features
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                    </Link>
                    <Link
                        className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group py-2"
                        href="/how-it-works"
                    >
                        How it Works
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                    </Link>
                    <Link
                        className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group py-2"
                        href="/#pricing"
                    >
                        Pricing
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                    </Link>
                </nav>

                {/* CTA Buttons */}
                <div className="flex items-center gap-4">
                    <Link className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block" href="/login">
                        Login
                    </Link>
                    <Button className="btn-shimmer bg-white text-black hover:bg-zinc-200 font-bold h-10 px-6 text-sm rounded-full transition-all hover:scale-105" asChild>
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}
