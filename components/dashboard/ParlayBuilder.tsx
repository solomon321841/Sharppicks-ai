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
import { Loader2, Activity, Lock, RefreshCw } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ParlayBuilder() {
    const [sports, setSports] = useState<string[]>([])
    const [risk, setRisk] = useState(5)
    const [betTypes, setBetTypes] = useState<string[]>(['moneyline', 'spread'])
    const [numLegs, setNumLegs] = useState(3)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [errorState, setErrorState] = useState<string | null>(null)
    const [tier, setTier] = useState<string>('pro') // Default to pro for demo
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
                const { data } = await supabase.from('users').select('subscription_tier').eq('id', user.id).single()
                if (data) setTier(data.subscription_tier)
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
                // Handle expected business logic errors (like no games) without toast
                if (response.status === 400 && data.error) {
                    setErrorState(data.error)
                    return // Stop further execution, don't throw
                }
                throw new Error(data.error || 'Failed to generate parlay')
            }

            setResult(data)
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
        <div className="grid gap-6 lg:grid-cols-12 items-start h-[calc(100vh-140px)] min-h-[500px]">
            <div className="lg:col-span-7 h-full flex flex-col">
                <div className="flex-1 space-y-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-2xl flex flex-col">

                    {/* Compact Header */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 min-h-[40px]">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight text-white">Parlay Config</h3>
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400">AI Powered</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Legs</label>
                                <Select value={numLegs.toString()} onValueChange={(val) => setNumLegs(parseInt(val))}>
                                    <SelectTrigger className="w-14 h-7 text-sm border-0 bg-transparent text-emerald-400 font-extrabold focus:ring-0 p-0 text-right">
                                        <SelectValue placeholder="3" />
                                    </SelectTrigger>
                                    <SelectContent className="border-white/10 bg-zinc-950">
                                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
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
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5 h-full space-y-4">
                {/* Schedule / Results Column */}
                {!result && !errorState && schedule && (
                    <div className="h-full rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Live Schedule</h3>
                            {loadingSchedule && (
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                    <span>Syncing</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                            <UpcomingGamesPanel schedule={schedule} />
                        </div>
                    </div>
                )}

                {errorState ? (
                    <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 p-8 text-center bg-red-500/5 backdrop-blur-sm">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Activity className="h-8 w-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {(() => {
                                const err = errorState?.toLowerCase() || '';
                                if (err.includes('no games')) return 'No Games Available';
                                if (err.includes('risk') || err.includes('validation')) return 'No Risky Parlays Found';
                                return 'Generation Issue';
                            })()}
                        </h3>
                        <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                            {(() => {
                                const err = errorState?.toLowerCase() || '';
                                if (err.includes('risk')) return "We couldn't find a parlay that matched your strict risk criteria. Try lowering the risk level or selecting more sports.";
                                return errorState;
                            })()}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setErrorState(null)}
                            className="bg-zinc-900/50 hover:bg-zinc-900 border-white/10 text-white hover:text-emerald-400"
                        >
                            {errorState?.toLowerCase().includes('no games') ? 'Try Another Sport' : 'Adjust Settings'}
                        </Button>
                    </div>
                ) : result ? (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col">
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-white">AI Analysis Result</h3>
                            </div>
                            <div className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Success</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1">
                            <ParlayCard
                                legs={result.legs}
                                totalOdds={result.totalOdds}
                                confidence={result.confidence}
                                riskLevel={risk}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-2 text-zinc-400 hover:text-white hover:bg-white/5 h-8 text-xs"
                            onClick={() => setResult(null)}
                        >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Reset & Build Another
                        </Button>
                    </div>
                ) : null}

                {!result && !errorState && !schedule && (
                    <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 p-8 text-center bg-white/5">
                        <Loader2 className="h-6 w-6 animate-spin mb-3 text-emerald-500" />
                        <p className="text-zinc-400 animate-pulse text-xs">Syncing live odds...</p>
                    </div>
                )}
            </div>
        </div >
    )
}
