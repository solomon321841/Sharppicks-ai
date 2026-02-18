'use client'

import { DashboardCard } from "@/components/dashboard/DashboardCard"
import { Brain, CalendarDays, PlusCircle, History, Zap, Trophy, Target, Sparkles, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

const sections = [
    {
        title: "Elite Hub",
        icon: Brain,
        color: "emerald",
        description: "Your central command center for all-time stats and Recent Logs.",
        items: [
            "All-Time Record: Tracks every verified sequence deployed.",
            "Accuracy: Real-time hit rate across all sports.",
            "Recent Logs: A live feed of your most recent betting sequences."
        ]
    },
    {
        title: "Daily Picks",
        icon: CalendarDays,
        color: "blue",
        description: "AI-generated parlays optimized for various risk profiles.",
        items: [
            "Generated every 24 hours based on live odds data.",
            "Multiple risk levels: Safe, Balanced, and High-Risk.",
            "Probability Edge: Every pick has a calculated advantage vs. the market."
        ]
    },
    {
        title: "Build Parlay",
        icon: PlusCircle,
        color: "purple",
        description: "The custom engine to refine your own targeted strategies.",
        items: [
            "Sport Selection: Toggle multiple sports for cross-market parlays.",
            "Risk Slider: Adjust AI aggression for higher payouts or safer plays.",
            "Leg Control: Define the exact number of legs for your custom slip."
        ]
    },
    {
        title: "Bet History",
        icon: History,
        color: "amber",
        description: "Review every past performance to optimize your edge.",
        items: [
            "Verified Results: Automatic grading of all historical slips.",
            "Profit/Loss Tracking: Comprehensive visibility into your bankroll growth.",
            "Pattern Analysis: See which sports and risk levels perform best for you."
        ]
    }
]

export function HowToUseContent({ isPublic = false }: { isPublic?: boolean }) {
    return (
        <div className="relative h-full flex flex-col space-y-6 overflow-hidden px-4 md:px-0 py-6">
            {/* Mesh Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <HelpCircle className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Platform Guide</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                        How to <span className="text-emerald-500">Dominate</span>
                    </h1>
                    <p className="text-zinc-500 font-medium max-w-2xl">
                        Master the platform to turn raw data into verified profit sequences. Follow the guides below to optimize your workflow.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {sections.map((section, i) => {
                        const Icon = section.icon
                        return (
                            <DashboardCard
                                key={section.title}
                                delay={i * 0.1}
                                className="border-white/5 bg-zinc-950/40 backdrop-blur-xl"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl bg-${section.color}-500/10 border border-${section.color}-500/20`}>
                                            <Icon className={`w-6 h-6 text-${section.color}-400`} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">{section.title}</h3>
                                            <p className="text-xs text-zinc-500 mt-1">{section.description}</p>
                                        </div>
                                    </div>

                                    <ul className="space-y-3">
                                        {section.items.map((item, idx) => (
                                            <li key={idx} className="flex gap-3 text-sm text-zinc-400">
                                                <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </DashboardCard>
                        )
                    })}
                </div>

                {/* Pro Tip Strategy Section */}
                <DashboardCard delay={0.4} glowColor="amber" className="bg-amber-500/5 border-amber-500/10 mb-8">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shrink-0">
                            <Sparkles className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-white italic tracking-tight uppercase leading-none">
                                    Strategy <span className="text-amber-500">Optimization</span>
                                </h3>
                                <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">
                                    Official Recommendation
                                </p>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl font-medium">
                                For the most consistent long-term results, we recommend keeping your Risk Level <span className="text-amber-400 font-bold">below 5</span>. This "Sweet Spot" is engineered to balance high-probability plays with sustainable bankroll growth, optimizing your ROI while minimizing the volatility of high-variance outcomes.
                            </p>
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard delay={0.5} glowColor="emerald" className="bg-emerald-500/5 border-emerald-500/20">
                    <div className="p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Ready to Start?</h3>
                            <p className="text-zinc-400 text-sm max-w-md">Our AI is currently processing live odds for upcoming events in NFL, NBA, NHL, and major Soccer leagues.</p>
                        </div>
                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-xl bg-emerald-500 text-black font-black uppercase italic text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
                                onClick={() => window.location.href = isPublic ? '/login' : '/daily-picks'}
                            >
                                {isPublic ? 'Get Started Free' : 'Activate Daily Picks'}
                            </motion.button>
                        </div>
                    </div>
                </DashboardCard>
            </div>
        </div>
    )
}
