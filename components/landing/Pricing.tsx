"use client"

import { Button } from "@/components/ui/button"
import { Check, X, Zap } from "lucide-react"
import { FadeIn } from "./FadeIn"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const tiers = [
    {
        name: 'Free Trial',
        id: 'free',
        price: '$0',
        description: 'Test the waters with limited access.',
        features: ['2 Custom Parlay Credits', '3 Days Full Access', '1 Daily Pick (Safe)', 'Standard Odds Data', 'Community Support'],
        limitations: ['No Bet Tracking', 'Limited Risk Models'],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Starter',
        id: 'starter',
        price: '$9',
        period: '/mo',
        description: 'Perfect for casual bettors.',
        features: ['2 Daily Picks (Safe + Balanced)', 'All Sports (NFL, NBA, NHL, Soccer)', 'Standard Odds Data', 'Basic Bet Tracking'],
        limitations: ['No Custom Builder', 'Limited Risk Models'],
        cta: 'Get Started',
        popular: false,
    },
    {
        name: 'Pro',
        id: 'pro',
        price: '$24',
        period: '/mo',
        description: 'For serious bettors who want control.',
        features: ['4 Daily Picks (All Risk Levels)', 'Unlimited Custom AI Parlays', 'All Sports + Player Props', 'Custom Parlay Builder', 'Advanced Risk Models (1-10)', 'Full Bet Tracking'],
        limitations: [],
        cta: 'Go Pro',
        popular: true,
    },
    {
        name: 'Whale',
        id: 'whale',
        price: '$49',
        period: '/mo',
        description: 'Maximum edge with exclusive insights.',
        features: ['Everything in Pro', 'Real-time Line Movement Alerts', 'Highest AI Confidence Picks', 'Priority Support', 'Early Access Features'],
        limitations: [],
        cta: 'Join Elite',
        popular: false,
    },
]

export function Pricing() {
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()
    const { toast } = useToast()

    const handleSubscribe = async (tier: any) => {
        if (tier.id === 'free') {
            router.push('/login')
            return
        }

        setLoading(tier.id)
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tier.name.toLowerCase() })
            })

            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Checkout failed')

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error: any) {
            console.error('Subscription error:', error)
            if (error.message.includes('Unauthorized')) {
                router.push('/login')
            } else {
                toast({
                    title: "Error",
                    description: error.message || "Something went wrong. Please try again.",
                    variant: "destructive"
                })
            }
        } finally {
            setLoading(null)
        }
    }

    return (
        <section id="pricing" className="py-20 bg-black relative overflow-hidden flex justify-center">
            {/* Background Gradients - Optimized */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none transform-gpu">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[80px] opacity-20" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)] opacity-10" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center">
                <FadeIn className="flex flex-col items-center justify-center space-y-6 text-center mb-24 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-6 py-2">
                        <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Pricing Plans</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
                        Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Transparent</span> Pricing
                    </h2>
                    <p className="max-w-[700px] text-zinc-400 text-xl font-light">
                        Choose the plan that fits your betting style. Cancel anytime.
                    </p>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center max-w-[1400px] mx-auto w-full pt-6">
                    {tiers.map((tier, i) => (
                        <FadeIn key={tier.name} delay={i * 0.1} className={`relative flex flex-col h-full group ${tier.popular ? 'scale-105 z-10' : ''}`}>

                            {/* Floating Badge (Outside Overflow) */}
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-4 ring-black">
                                    Most Popular
                                </div>
                            )}

                            {/* Main Card Content */}
                            <div className={`flex flex-col h-full bg-zinc-900/40 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-500 ${tier.popular ? 'border-emerald-500/50 shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)]' : 'border-white/10 hover:border-white/20 hover:bg-zinc-900/60'}`}>

                                {tier.popular && (
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                                )}

                                <div className="p-8 flex flex-col h-full pt-10">
                                    <div className="mb-8 text-center">
                                        <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-5xl font-black text-white tracking-tight">{tier.price}</span>
                                            {tier.period && <span className="text-zinc-500 font-medium">{tier.period}</span>}
                                        </div>
                                        <p className="mt-4 text-sm text-zinc-400 leading-relaxed font-medium min-h-[40px] flex items-center justify-center">{tier.description}</p>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        {tier.features.map((feature) => (
                                            <div key={feature} className="flex items-start text-sm group/item">
                                                <div className="mr-3 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover/item:border-emerald-500/50 transition-colors">
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                </div>
                                                <span className="text-zinc-300 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                        {tier.limitations.map((limitation) => (
                                            <div key={limitation} className="flex items-start text-sm text-zinc-600">
                                                <div className="mr-3 mt-0.5 w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                                    <X className="w-3 h-3 text-zinc-600" />
                                                </div>
                                                {limitation}
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleSubscribe(tier)}
                                        disabled={loading !== null}
                                        className={`w-full h-12 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${tier.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20'}`}>
                                        {loading === tier.id ? 'Processing...' : tier.cta}
                                    </Button>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    )
}
