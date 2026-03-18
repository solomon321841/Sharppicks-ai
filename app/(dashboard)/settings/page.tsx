import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ManageSubscriptionButton } from "@/components/settings/ManageSubscriptionButton"
import Link from "next/link"
import { Shield, Mail, CreditCard, Activity, Clock, Crown, Zap, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { getTierFeatures } from "@/lib/config/tiers"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let profile = null;
    if (user) {
        profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { 
                subscription_tier: true, 
                subscription_status: true,
                parlay_credits: true,
                credits_reset_at: true 
            }
        })

        // Auto-sync manual DB edits
        if (profile) {
            const tier = profile.subscription_tier || 'free'
            const limit = getTierFeatures(tier).customBuilderLimit;
            if ((tier === 'pro' || tier === 'whale') && profile.parlay_credits < limit && (!profile.credits_reset_at || new Date().getTime() - new Date(profile.credits_reset_at).getTime() > 24 * 60 * 60 * 1000 * 30)) {
                profile.parlay_credits = limit
                await prisma.user.update({
                    where: { id: user.id },
                    data: { parlay_credits: limit }
                })
            }
        }
    }

    const tier = profile?.subscription_tier || 'free'
    const status = profile?.subscription_status || 'inactive'
    const credits = profile?.parlay_credits ?? 3
    
    // Format reset date
    let resetDate = 'Next Billing Cycle'
    if (profile?.credits_reset_at) {
        resetDate = new Date(profile.credits_reset_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const isPremium = tier === 'pro' || tier === 'whale'

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4 lg:px-0 py-6 min-h-[calc(100vh-80px)]">
            
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-zinc-900/80 via-black to-zinc-950/80 border border-white/[0.08] p-8 sm:p-10 mb-8 backdrop-blur-xl shadow-2xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/[0.12] flex items-center justify-center shrink-0 shadow-inner">
                        <User className="w-8 h-8 text-white/90 drop-shadow-lg" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase drop-shadow-md">Account Settings</h2>
                        <p className="text-zinc-400 font-medium flex items-center gap-2 text-sm tracking-wide">
                            <Shield className="w-4 h-4 text-emerald-500 shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Manage your personal profile and subscription preferences.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column - Profile Details */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col h-full space-y-6">
                    <div className="rounded-[24px] border border-white/[0.06] bg-black/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group flex-1">
                        {/* Shimmer Border */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 flex items-center justify-center text-white shrink-0">
                                <Mail className="w-5 h-5 opacity-80" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-wide">Profile Details</h3>
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Your personal info</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Email Address</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
                                        <Mail className="w-4 h-4 text-zinc-400 group-hover/input:text-emerald-400 transition-colors" />
                                    </div>
                                    <Input 
                                        value={user?.email || ''} 
                                        disabled 
                                        className="h-12 bg-white/[0.03] border-white/10 text-white font-medium pl-11 focus-visible:ring-emerald-500/30 rounded-xl cursor-not-allowed opacity-90"
                                    />
                                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent group-hover/input:ring-white/10 transition-all pointer-events-none" />
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-2 pl-1 italic">Email address cannot be changed currently.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Subscription Info */}
                <div className="lg:col-span-12 xl:col-span-7 flex flex-col h-full space-y-6">
                    <div className="rounded-[24px] border border-white/[0.06] bg-black/40 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group flex-1 flex flex-col">
                        {/* Dramatic Hover Effects */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-150 group-hover:bg-emerald-500/10" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-105
                                        ${isPremium 
                                            ? 'bg-gradient-to-br from-emerald-500/20 to-black border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' 
                                            : 'bg-gradient-to-br from-white/[0.08] to-transparent border-white/20 text-white'}`}
                                    >
                                        {isPremium ? <Crown className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Subscription</h3>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Manage your plan</p>
                                    </div>
                                </div>
                                
                                <div className="shrink-0 self-start sm:self-center">
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                        ${status === 'active' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] animate-pulse' 
                                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                                    >
                                        <Activity className="w-3 h-3 mr-1.5" />
                                        {status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {/* Tier Card */}
                                <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white-[0.05] rounded-2xl p-5 relative overflow-hidden group/card hover:border-white/10 transition-colors">
                                    <div className="absolute top-0 left-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Current Tier</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-3xl font-black uppercase tracking-widest ${isPremium ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-400' : 'text-white'}`}>
                                            {tier}
                                        </span>
                                    </div>
                                </div>

                                {/* Credits Card */}
                                <div className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white-[0.05] rounded-2xl p-5 relative overflow-hidden group/card hover:border-emerald-500/20 transition-colors">
                                    <div className="absolute top-0 right-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Parlay Credits</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                                            </div>
                                            <span className="text-3xl font-black text-white">{credits}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            Resets: {resetDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-auto pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                                    {tier === 'free'
                                        ? "Upgrade to unlock AI analysis, custom parlays, and more."
                                        : tier === 'whale'
                                        ? "You're on the top tier. Manage your billing securely via Stripe."
                                        : "Upgrade to unlock more features, or manage your billing via Stripe."}
                                </p>
                                
                                <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                                    {tier !== 'whale' && (
                                        <Link href={tier === 'free' ? '/#pricing' : tier === 'starter' ? '/checkout/pro' : '/checkout/whale'} className="w-full sm:w-auto inline-block">
                                            <Button className="w-full sm:w-auto h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 uppercase tracking-widest shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:-translate-y-0.5 whitespace-nowrap">
                                                Upgrade Plan
                                            </Button>
                                        </Link>
                                    )}
                                    {tier !== 'free' && (
                                        <ManageSubscriptionButton />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
