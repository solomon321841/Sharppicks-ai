'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { canAccessFeature } from '@/lib/config/tiers'
import { Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TierGateProps {
    feature: 'build' | 'track' | 'daily'
    children: React.ReactNode
    featureName?: string
}

export function TierGate({ feature, children, featureName }: TierGateProps) {
    const [tier, setTier] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchTier = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('subscription_tier')
                    .eq('id', user.id)
                    .single()

                setTier(profile?.subscription_tier || 'free')
            } else {
                setTier('free')
            }
            setLoading(false)
        }
        fetchTier()
    }, [supabase])

    if (loading) {
        return <>{children}</>
    }

    const hasAccess = canAccessFeature(tier || 'free', feature)

    if (hasAccess) {
        return <>{children}</>
    }

    // Show upgrade prompt instead of the content
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-zinc-500" />
                </div>
                <div className="absolute -inset-4 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                {featureName || 'Feature'} Locked
            </h3>
            <p className="text-zinc-500 text-sm max-w-[300px] mb-6 leading-relaxed">
                Upgrade your plan to unlock{' '}
                <span className="text-white font-semibold">
                    {featureName || 'this feature'}
                </span>{' '}
                and get the full SharpPicks experience.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <Button className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]" asChild>
                    <Link href="/#pricing">
                        Upgrade Plan <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button variant="ghost" className="text-zinc-600 hover:text-white text-xs font-bold" asChild>
                    <Link href="/dashboard">
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}
