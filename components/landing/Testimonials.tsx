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
        <section id="features" className="py-12 md:py-20 bg-black relative overflow-hidden">
            {/* Background Effects - Optimized */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none transform-gpu">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-[100%] blur-[80px] opacity-40" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[80px]" />
                <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[60px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                {/* Header */}
                <FadeIn className="text-center mb-12 md:mb-20 max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md shadow-lg shadow-emerald-500/5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-[0.2em]">System Capabilities</span>
                    </div>

                    <h2 className="text-3xl md:text-7xl font-black tracking-tighter text-white">
                        Built for <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 drop-shadow-sm">Domination</span>
                    </h2>

                    <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-light">
                        The world&apos;s most advanced sports analytics platform. <br className="hidden md:block" />
                        Engineered to give you an unfair mathematical advantage.
                    </p>
                </FadeIn>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        
                        const colorMap: Record<string, any> = {
                            emerald: {
                                border: "group-hover:border-emerald-500/50",
                                glow: "bg-emerald-500/50",
                                iconText: "text-emerald-400",
                                titleHover: "group-hover:text-emerald-300",
                                gradient: "from-emerald-500/5 via-emerald-500/0",
                            },
                            blue: {
                                border: "group-hover:border-blue-500/50",
                                glow: "bg-blue-500/50",
                                iconText: "text-blue-400",
                                titleHover: "group-hover:text-blue-300",
                                gradient: "from-blue-500/5 via-blue-500/0",
                            },
                            purple: {
                                border: "group-hover:border-purple-500/50",
                                glow: "bg-purple-500/50",
                                iconText: "text-purple-400",
                                titleHover: "group-hover:text-purple-300",
                                gradient: "from-purple-500/5 via-purple-500/0",
                            },
                            orange: {
                                border: "group-hover:border-orange-500/50",
                                glow: "bg-orange-500/50",
                                iconText: "text-orange-400",
                                titleHover: "group-hover:text-orange-300",
                                gradient: "from-orange-500/5 via-orange-500/0",
                            },
                            cyan: {
                                border: "group-hover:border-cyan-500/50",
                                glow: "bg-cyan-500/50",
                                iconText: "text-cyan-400",
                                titleHover: "group-hover:text-cyan-300",
                                gradient: "from-cyan-500/5 via-cyan-500/0",
                            },
                            yellow: {
                                border: "group-hover:border-yellow-500/50",
                                glow: "bg-yellow-500/50",
                                iconText: "text-yellow-400",
                                titleHover: "group-hover:text-yellow-300",
                                gradient: "from-yellow-500/5 via-yellow-500/0",
                            }
                        };

                        const s = colorMap[feature.color] || colorMap.emerald;

                        return (
                            <FadeIn key={i} delay={i * 0.1} className="h-full">
                                <div className={`group relative h-full bg-[#0a0a0c] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center`}>

                                    {/* Ambient Background Gradient (Color specific) */}
                                    <div className={`absolute inset-0 bg-gradient-to-b ${s.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                                    
                                    {/* Top Shine */}
                                    <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                    {/* Hover Border Gradient */}
                                    <div className={`absolute inset-0 border-[1.5px] border-transparent ${s.border} rounded-[2.5rem] transition-colors duration-700 pointer-events-none`} />

                                    <div className="relative z-10 flex flex-col items-center flex-1 w-full">
                                        {/* Icon Container - Floating & Glowing */}
                                        <div className="relative w-20 h-20 mb-8 group-hover:scale-110 transition-transform duration-700 ease-out">
                                            {/* Intense back glow */}
                                            <div className={`absolute inset-0 ${s.glow} blur-[30px] rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700`} />
                                            {/* Icon Box */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/80 to-black/80 border border-white/10 rounded-[1.5rem] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl group-hover:border-white/20 transition-colors duration-500">
                                                <Icon className={`w-8 h-8 ${s.iconText} drop-shadow-[0_0_15px_rgba(currentColor,0.5)]`} />
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className={`text-[1.35rem] font-black text-white mb-4 ${s.titleHover} transition-colors duration-500 tracking-tight`}>
                                            {feature.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-zinc-400 text-[15px] leading-relaxed mb-8 max-w-[280px]">
                                            {feature.description}
                                        </p>

                                        {/* Premium Animated Badge */}
                                        <div className="mt-auto pt-5 w-full flex justify-center border-t border-white/[0.04]">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-500 group-hover:bg-white/5`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${s.iconText} bg-current shadow-[0_0_10px_currentColor] animate-pulse`} />
                                                <span className={`text-[11px] font-black ${s.iconText} uppercase tracking-[0.2em] opacity-90`}>
                                                    {feature.stat}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        );
                    })}
                </div>


                {/* Stats Bar - Unified Glass Bar */}
                <FadeIn delay={0.6} className="mt-12 md:mt-24 max-w-5xl mx-auto">
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
