'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { SportSelector } from './SportSelector'
import { RiskSlider } from './RiskSlider'
import { BetTypeSelector } from './BetTypeSelector'
import { ParlayCard } from './ParlayCard'
import { UpcomingGamesPanel } from './UpcomingGamesPanel'
import { canAccessFeature } from '@/lib/config/tiers'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, Activity, Lock, RefreshCw, Zap } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function ParlayBuilder() {
    const [sports, setSports] = useState<string[]>([])
    const [risk, setRisk] = useState(5)
    const [betTypes, setBetTypes] = useState<string[]>(['moneyline', 'spread'])
    const [numLegs, setNumLegs] = useState(3)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [errorState, setErrorState] = useState<string | null>(null)
    const [warnings, setWarnings] = useState<string[]>([])
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [tier, setTier] = useState<string>('pro') // Default to pro for demo
    const [credits, setCredits] = useState<number | null>(null)
    const [checkingTier, setCheckingTier] = useState(true)
    const [schedule, setSchedule] = useState<any[] | undefined>(undefined)
    const [loadingSchedule, setLoadingSchedule] = useState(true)

    const { toast } = useToast()
    const supabase = createClient() // Create client instance

    // Fetch tier on mount
    useState(() => {
        const checkTier = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('users').select('subscription_tier, parlay_credits').eq('id', user.id).single()
                if (data) {
                    setTier(data.subscription_tier)
                    setCredits(data.parlay_credits ?? 0)
                }
            }
            setCheckingTier(false)
        }
        checkTier()
    })

    // Fetch Schedule on mount
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await fetch('/api/get-schedule')
                if (res.ok) {
                    const data = await res.json()
                    setSchedule(data)
                }
            } catch (e) {
                console.error("Failed to fetch schedule", e)
            } finally {
                setLoadingSchedule(false)
            }
        }
        fetchSchedule()
    }, [])

    // Automatically remove forbidden bet types if soccer is selected
    useEffect(() => {
        const isSoccerSelected = sports.some(s => s === 'soccer_epl' || s === 'soccer_spain_la_liga' || s === 'soccer_uefa_champs_league');
        if (isSoccerSelected) {
            const forbidden = ['spread', 'totals'];
            const hasForbidden = betTypes.some(bt => forbidden.includes(bt));
            if (hasForbidden) {
                setBetTypes(prev => prev.filter(bt => !forbidden.includes(bt)));
            }
        }
    }, [sports, betTypes]);

    const canBuild = canAccessFeature(tier, 'build')

    const handleGenerate = async () => {
        if (sports.length === 0) {
            toast({ variant: "destructive", title: "Select sports", description: "Please choose at least one sport to continue." })
            return
        }
        if (betTypes.length === 0) {
            toast({ variant: "destructive", title: "Select bet types", description: "Please choose at least one bet type." })
            return
        }

        setLoading(true)
        setResult(null)
        setErrorState(null)
        setWarnings([])

        try {
            const response = await fetch('/api/generate-parlay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sports, // Send array
                    riskLevel: risk,
                    numLegs,
                    betTypes
                })
            })

            const data = await response.json()

            if (!response.ok) {
                // If it's a trial limit error, show the upgrade modal
                if (response.status === 403 && data.error === 'trial_limit_reached') {
                    setShowUpgradeModal(true)
                    return
                }

                // Handle expected business logic errors (like no games) without toast
                if (response.status === 400 && data.error) {
                    setErrorState(data.error)
                    return // Stop further execution, don't throw
                }
                throw new Error(data.error || 'Failed to generate parlay')
            }

            setResult(data)
            setWarnings(data.warnings || [])
            setCredits(prev => prev !== null ? Math.max(0, prev - 1) : null)
        } catch (error: any) {
            console.error('Generation error:', error)
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: error.message || "Failed to generate parlay. Please try again."
            })
        } finally {
            setLoading(false)
        }
    }

    if (checkingTier) {
        return <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>
    }

    if (!canBuild) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <Lock className="h-8 w-8 text-zinc-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Pro Feature Locked</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                    The Custom Parlay Builder is available exclusively for Pro and Whale tier members. Upgrade to build your own high-EV parlays.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">Upgrade to Pro</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 lg:grid-cols-12 items-start lg:h-[calc(100vh-140px)] lg:min-h-[500px]">
            <div className="lg:col-span-7 h-auto lg:h-full flex flex-col">
                <div className="flex-1 space-y-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-2xl flex flex-col">

                    {/* Compact Header */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 min-h-[40px]">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight text-white">Parlay Config</h3>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400">AI Powered</span>
                            {credits !== null && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow-[0_0_10px_-2px_rgba(16,185,129,0.3)]">
                                    <Zap className="w-3 h-3 fill-emerald-400" />
                                    {credits} CREDITS LEFT
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Legs</label>
                                <Select value={numLegs.toString()} onValueChange={(val) => setNumLegs(parseInt(val))}>
                                    <SelectTrigger className="w-14 h-7 text-sm border-0 bg-transparent text-emerald-400 font-extrabold focus:ring-0 p-0 text-right">
                                        <SelectValue placeholder="3" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-zinc-950">
                                        {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <SelectItem key={n} value={n.toString()} className="focus:bg-zinc-900 focus:text-emerald-400 font-bold">{n}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                            <SportSelector value={sports} onChange={setSports} schedule={schedule} />
                        </div>

                        <div className="pt-4 mt-auto space-y-4">
                            <div className="px-1">
                                <RiskSlider value={risk} onChange={setRisk} />
                            </div>

                            {/* Restricted Bet Types Logic for Soccer */}
                            {(() => {
                                const isSoccerSelected = sports.some(s => s === 'soccer_epl' || s === 'soccer_spain_la_liga' || s === 'soccer_uefa_champs_league');
                                const disabledBetTypes = isSoccerSelected ? ['spread', 'totals'] : [];

                                return (
                                    <BetTypeSelector
                                        value={betTypes}
                                        onChange={setBetTypes}
                                        disabledTypes={disabledBetTypes}
                                    />
                                );
                            })()}
                        </div>
                    </div>

                    {/* Exclude Players & Teams — Coming Soon */}
                    <div className="relative mt-1 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden group/exclude">
                        {/* Shimmer overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover/exclude:animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />

                        <div className="p-3 flex items-start gap-3">
                            {/* Icon */}
                            <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/15 flex items-center justify-center mt-0.5">
                                <svg className="w-4 h-4 text-amber-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">Exclude Players & Teams</h4>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-400/70 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15 whitespace-nowrap">
                                        Coming Soon
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-600 leading-relaxed">
                                    Block specific players or teams from your AI-generated parlays.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Button
                            className={`
                                w-full font-bold h-10 text-sm uppercase tracking-widest relative overflow-hidden group transition-all duration-300
                                ${loading
                                    ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5'}
                            `}
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Analyzing...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                    <Activity className="h-4 w-4 fill-current" />
                                    <span>Generate Parlay</span>
                                </div>
                            )}

                            {/* Shine Effect */}
                            {!loading && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />}
                        </Button>
                        
                        {loading && (
                            <p className="text-center text-[10px] text-emerald-500/80 mt-2 font-bold animate-pulse uppercase tracking-wider">
                                Please wait, AI analysis may take 15-30 seconds...
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5 h-auto lg:h-full space-y-4">
                {/* Schedule / Results Column */}
                {!result && !errorState && schedule && (
                <div className="h-full max-h-[500px] lg:max-h-none rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-black/40 to-black/80 backdrop-blur-xl overflow-hidden flex flex-col relative shadow-2xl">
                        {/* Shimmer line top */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                        
                        <div className="px-5 py-4 border-b border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent flex justify-between items-center">
                            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">Live Schedule</h3>
                            {loadingSchedule && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span>Syncing</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <UpcomingGamesPanel schedule={schedule} />
                        </div>
                    </div>
                )}

                {errorState ? (
                    <div className="h-full flex flex-col items-center justify-center rounded-[24px] border border-dashed border-red-500/20 p-8 text-center bg-gradient-to-b from-red-500/[0.02] to-transparent backdrop-blur-xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Activity className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {(() => {
                                const err = errorState?.toLowerCase() || '';
                                if (err.includes('no live games') || err.includes('no games') || err.includes('not enough odds') || err.includes('lines posted')) return 'No Games Available';
                                if (err.includes('not available') || err.includes('props are not') || err.includes('unique bets') || err.includes('not enough unique')) return 'Not Enough Data';
                                if (err.includes('risk') || err.includes('couldn\'t build') || err.includes('couldn\'t generate') || err.includes('adjust')) return 'Constraints Too Strict';
                                if (err.includes('bet type') || err.includes('moneyline') || err.includes('spread') || err.includes('player_props')) return 'Bet Type Mismatch';
                                if (err.includes('credit') || err.includes('billing')) return 'Out of Credits';
                                if (err.includes('server') || err.includes('overload') || err.includes('busy') || err.includes('timeout')) return 'System Overloaded';
                                if (err.includes('configured') || err.includes('support')) return 'Service Error';
                                return 'Generation Issue';
                            })()}
                        </h3>
                        <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                            {errorState}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setErrorState(null)}
                            className="bg-zinc-900/50 hover:bg-zinc-900 border-white/10 text-white hover:text-emerald-400"
                        >
                            {(() => {
                                const err = errorState?.toLowerCase() || '';
                                if (err.includes('no live games') || err.includes('no games') || err.includes('lines posted')) return 'Try Another Sport';
                                if (err.includes('not available') || err.includes('props')) return 'Change Bet Types';
                                if (err.includes('server') || err.includes('busy') || err.includes('timeout') || err.includes('credits')) return 'Try Again';
                                return 'Adjust Settings';
                            })()}
                        </Button>
                    </div>
                ) : result ? (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col min-h-0">
                        <div className="mb-4 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-widest">AI Analysis Result</h3>
                            </div>
                            <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Success</span>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 flex flex-col">
                            {warnings.length > 0 && (
                                <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 shrink-0">
                                    {warnings.map((w, i) => (
                                        <p key={i} className="text-xs text-amber-400 flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5">&#9888;</span>
                                            <span>{w}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 min-h-0">
                                <ParlayCard
                                    legs={result.legs}
                                    totalOdds={result.totalOdds}
                                    confidence={result.confidence}
                                    riskLevel={risk}
                                    strategy={result.strategy}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full mt-4 shrink-0 text-zinc-400 hover:text-white hover:bg-white/5 h-12 text-sm font-bold uppercase tracking-widest border border-dashed border-white/10"
                                onClick={() => setResult(null)}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset & Build Another
                            </Button>
                        </div>
                    </div>
                ) : null}

                {!result && !errorState && !schedule && (
                    <div className="h-full flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 p-8 text-center bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl">
                        <Loader2 className="h-6 w-6 animate-spin mb-3 text-emerald-500" />
                        <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse text-[10px]">Syncing live odds...</p>
                    </div>
                )}
            </div>

            {/* Trial Limits Reached Modal */}
            <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
                <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                            <Zap className="h-6 w-6 text-emerald-400" />
                        </div>
                        <DialogTitle className="text-center text-xl font-bold">Out of Credits</DialogTitle>
                        <DialogDescription className="text-center pt-2 pb-4">
                            {tier === 'whale' ? (
                                "You've exhausted your 500 monthly Whale credits. Please contact support to add more to your account."
                            ) : tier === 'pro' ? (
                                "You've run out of Pro credits for the month. Upgrade to the Whale tier to unlock 500 monthly credits and maximize your edge."
                            ) : (
                                "You've run out of Custom Parlay credits. Upgrade your account to unlock monthly credits and build high-EV parlays instantly."
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        {tier !== 'whale' && (
                            <Button 
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.02]"
                                onClick={async () => {
                                    try {
                                        setLoading(true)
                                        const upgradeTier = tier === 'pro' ? 'whale' : 'pro';
                                        const res = await fetch('/api/stripe/checkout', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ tier: upgradeTier, skipTrial: true }) 
                                        })
                                        const data = await res.json()
                                        if (data.url) window.location.href = data.url
                                    } catch (error) {
                                        console.error('Upgrade failed', error)
                                    } finally {
                                        setLoading(false)
                                    }
                                }}
                            >
                                {tier === 'pro' ? 'Upgrade to Whale Plan' : 'Upgrade for Monthly Access'}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            className="w-full text-zinc-400 hover:text-white"
                            onClick={() => setShowUpgradeModal(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div >
    )
}
