'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, CalendarDays, PlusCircle, History, Settings, LogOut, Lock, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { canAccessFeature } from '@/lib/config/tiers'
import { useNotification } from '@/contexts/NotificationContext'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const { hasNewBet, clearNewBetNotification } = useNotification()
    const [tier, setTier] = useState<string>('pro') // Default to pro for demo
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserTier = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // In a real app, we would fetch the profile here. 
                // For now, we'll simulate it or fetch if the table exists.
                const { data: profile } = await supabase
                    .from('users')
                    .select('subscription_tier')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setTier(profile.subscription_tier)
                }
            }
            setLoading(false)
        }
        fetchUserTier()
    }, [supabase])

    // Clear notification when visiting Bet History
    useEffect(() => {
        if (pathname === '/bet-history') {
            clearNewBetNotification()
        }
    }, [pathname, clearNewBetNotification])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/')
    }

    const sidebarItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiredFeature: null },
        { name: 'Daily Picks', href: '/daily-picks', icon: CalendarDays, requiredFeature: 'daily' },
        { name: 'Build Parlay', href: '/build-parlay', icon: PlusCircle, requiredFeature: 'build' },
        { name: 'Bet History', href: '/bet-history', icon: History, requiredFeature: 'track' },
        { name: 'How to Use', href: '/how-to-use', icon: HelpCircle, requiredFeature: null },
        { name: 'Settings', href: '/settings', icon: Settings, requiredFeature: null },
    ]

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-card px-3 py-4">
            <div className="mb-8 px-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10">
                    <span className="text-white text-[15px] font-black tracking-[-0.08em]">PP</span>
                </div>
                <Link href="/" className="flex flex-col leading-none group">
                    <span className="text-[17px] font-black tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">ProfitPicks</span>
                    <span className="text-[10px] font-bold text-emerald-500/80 tracking-[0.15em] mt-0.5">ANALYTICS</span>
                </Link>
            </div>

            <div className="flex-1 space-y-1">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    // Check access
                    const isLocked = item.requiredFeature && !canAccessFeature(tier, item.requiredFeature as any)
                    const showBadge = item.name === 'Bet History' && hasNewBet

                    return (
                        <Link key={item.href} href={item.href} onClick={(e) => {
                            if (isLocked) {
                                e.preventDefault();
                                // Optional: Trigger upgrade modal here
                            } else if (onNavigate) {
                                onNavigate();
                            }
                        }}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start gap-2 relative group',
                                    isActive ? 'bg-emerald text-emerald-foreground hover:bg-emerald/90' : 'text-muted-foreground hover:text-foreground',
                                    isLocked && 'opacity-50 cursor-not-allowed hover:bg-transparent'
                                )}
                            >
                                <div className="relative">
                                    <Icon className="h-4 w-4" />
                                    {showBadge && (
                                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                </div>
                                {item.name}
                                {isLocked && <Lock className="ml-auto h-3 w-3 text-muted-foreground group-hover:text-emerald" />}
                            </Button>
                        </Link>
                    )
                })}
            </div>

            <div className="border-t pt-4 space-y-2">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono">
                    Plan: <span className="uppercase text-emerald font-bold">{loading ? '...' : tier}</span>
                </div>
                <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={() => {
                    handleSignOut();
                    if (onNavigate) onNavigate();
                }}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
