'use client'

import { Brain, TrendingUp, Shield, Zap, BarChart3, Target, Trophy } from "lucide-react"
import { FadeIn } from "./FadeIn"

const features = [
    {
        icon: Brain,
        title: "AI-Powered Analysis",
        description: "Advanced algorithms analyze thousands of data points across all major sports",
        stat: "10K+ data points",
        color: "emerald"
    },
    {
        icon: Target,
        title: "Risk Control",
        description: "Adjust risk levels 1-10 to match your betting style and bankroll",
        stat: "10 risk levels",
        color: "blue"
    },
    {
        icon: BarChart3,
        title: "Player Props",
        description: "Deep player statistics for NBA, NFL, NHL, and Soccer leagues",
        stat: "All major sports",
        color: "purple"
    },
    {
        icon: Shield,
        title: "Smart Parlays",
        description: "AI detects and avoids correlated bets for better parlay construction",
        stat: "Auto-detection",
        color: "orange"
    },
    {
        icon: TrendingUp,
        title: "Bet Tracking",
        description: "Track your performance with detailed analytics and win/loss records",
        stat: "Full history",
        color: "cyan"
    },
    {
        icon: Zap,
        title: "Daily Picks",
        description: "Fresh AI-generated parlays every morning at 9:00 AM EST",
        stat: "4 picks daily",
        color: "yellow"
    },
];

export function Testimonials() {
    return (
        <section id="features" className="py-20 bg-black relative overflow-hidden">
            {/* Background Effects - Optimized */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none transform-gpu">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-[100%] blur-[80px] opacity-40" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[80px]" />
                <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[60px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                {/* Header */}
                <FadeIn className="text-center mb-20 max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md shadow-lg shadow-emerald-500/5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-[0.2em]">System Capabilities</span>
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 drop-shadow-sm">Domination</span>
                    </h2>

                    <p className="text-zinc-400 text-xl leading-relaxed font-light">
                        The world's most advanced sports analytics platform. <br className="hidden md:block" />
                        Engineered to give you an unfair mathematical advantage.
                    </p>
                </FadeIn>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="group relative h-full bg-zinc-900/40 border border-white/5 rounded-3xl p-8 hover:bg-zinc-900/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden">

                                    {/* Hover Border Gradient */}
                                    <div className="absolute inset-0 border border-transparent group-hover:border-emerald-500/30 rounded-3xl transition-colors duration-500" />

                                    {/* Inner Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        {/* Icon Ring */}
                                        <div className="relative w-20 h-20 mb-6 group-hover:scale-110 transition-transform duration-500">
                                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center shadow-inner group-hover:border-emerald-500/50 transition-colors">
                                                <Icon className="w-8 h-8 text-emerald-400" />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors tracking-tight">
                                            {feature.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                                            {feature.description}
                                        </p>

                                        {/* Stat Badge */}
                                        <div className="mt-auto">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-400 group-hover:bg-emerald-500/20 transition-colors uppercase tracking-wider">
                                                {feature.stat}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        );
                    })}
                </div>

                {/* Testimonials section */}
                <div className="mt-32">
                    <FadeIn className="text-center mb-16">
                        <h3 className="text-3xl font-bold text-white mb-2">Member <span className="text-emerald-400">Voices</span></h3>
                        <p className="text-zinc-500">Trusted by over 2,400 serious bettors worldwide.</p>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {[
                            {
                                name: "Marcus T.",
                                role: "Professional Bettor",
                                quote: "The AI precision is unlike anything I've used. It consistently finds value in player props that I would have missed manually.",
                                rating: 5
                            },
                            {
                                name: "Sarah L.",
                                role: "Data Analyst",
                                quote: "I love the mathematical approach. The risk levels are incredibly accurate, allowing me to manage my bankroll with confidence.",
                                rating: 5
                            },
                            {
                                name: "Jason R.",
                                role: "Sports Enthusiast",
                                quote: "SharpPicks turned my hobby into a profitable venture. The daily picks are a must-have for my morning routine.",
                                rating: 5
                            }
                        ].map((t, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl relative">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Trophy key={i} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                                        ))}
                                    </div>
                                    <p className="text-zinc-300 italic mb-6">"{t.quote}"</p>
                                    <div>
                                        <p className="text-white font-bold">{t.name}</p>
                                        <p className="text-zinc-500 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>

                {/* Stats Bar - Unified Glass Bar */}
                <FadeIn delay={0.6} className="mt-24 max-w-5xl mx-auto">
                    <div className="relative bg-zinc-900/30 border border-white/10 rounded-2xl p-6 md:p-12 backdrop-blur-md overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] animate-[shimmer_3s_infinite]" />

                        <div className="flex flex-col items-center text-center flex-1 relative z-10">
                            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 drop-shadow-lg">
                                2,400<span className="text-emerald-500">+</span>
                            </div>
                            <div className="text-sm font-bold text-emerald-500/80 uppercase tracking-widest">Active Users</div>
                        </div>

                        <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                        <div className="flex flex-col items-center text-center flex-1 relative z-10">
                            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 drop-shadow-lg">
                                58<span className="text-emerald-500">%</span>
                            </div>
                            <div className="text-sm font-bold text-emerald-500/80 uppercase tracking-widest">Win Rate</div>
                        </div>

                        <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                        <div className="flex flex-col items-center text-center flex-1 relative z-10">
                            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 drop-shadow-lg">
                                4.7<span className="text-zinc-600 text-3xl">/5</span>
                            </div>
                            <div className="text-sm font-bold text-emerald-500/80 uppercase tracking-widest">User Rating</div>
                        </div>
                    </div>
                </FadeIn>
            </div>
        </section>
    )
}
