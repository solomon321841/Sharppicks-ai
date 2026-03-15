'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Activity, Zap } from 'lucide-react'

interface AuditData {
    totalParlays: number
    parlaysWon: number
    parlaysLost: number
    parlaysPending: number
    parlayHitRate: number
    totalLegs: number
    legsWon: number
    legsLost: number
    legsPending: number
    legHitRate: number
    totalStaked: number
    totalProfit: number
    totalPayout: number
    roi: number
    avgCLV: number | null
    clvLegsTracked: number
    clvPositiveRate: number
    byRiskLevel: Record<string, { parlays: number; won: number; hitRate: number; profit: number }>
    bySport: Record<string, { parlays: number; won: number; hitRate: number; legs: number; legsWon: number }>
    byBetType: Record<string, { legs: number; won: number; hitRate: number }>
    recentResults: Array<{
        id: string; date: string; result: string; odds: string
        legs: number; legsWon: number; stake: number; profit: number
    }>
}

type Period = 'all' | '7d' | '30d' | '90d'

export function AuditDashboard() {
    const [data, setData] = useState<AuditData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<Period>('all')

    useEffect(() => {
        setLoading(true)
        fetch(`/api/audit?period=${period}`)
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [period])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="ml-2 text-sm text-zinc-400">Loading audit data...</span>
            </div>
        )
    }

    if (!data || data.totalParlays === 0) {
        return (
            <div className="text-center py-20 space-y-3">
                <BarChart3 className="w-12 h-12 mx-auto text-zinc-600" />
                <h3 className="text-lg font-bold text-zinc-300">No Betting Data Yet</h3>
                <p className="text-sm text-zinc-500 max-w-md mx-auto">
                    Lock in some parlays to start tracking your performance. Your audit dashboard will populate automatically as bets are graded.
                </p>
            </div>
        )
    }

    const profitColor = data.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
    const roiColor = data.roi >= 0 ? 'text-emerald-400' : 'text-red-400'

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-2">
                {(['all', '7d', '30d', '90d'] as Period[]).map(p => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${period === p
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {p === 'all' ? 'ALL TIME' : p.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <KPICard
                    label="Parlay Hit Rate"
                    value={`${data.parlayHitRate}%`}
                    sub={`${data.parlaysWon}W / ${data.parlaysLost}L`}
                    icon={<Target className="w-4 h-4 text-emerald-400" />}
                    highlight={data.parlayHitRate > 30}
                />
                <KPICard
                    label="Leg Hit Rate"
                    value={`${data.legHitRate}%`}
                    sub={`${data.legsWon}W / ${data.legsLost}L`}
                    icon={<Activity className="w-4 h-4 text-blue-400" />}
                    highlight={data.legHitRate > 50}
                />
                <KPICard
                    label="Total Profit"
                    value={`${data.totalProfit >= 0 ? '+' : ''}$${data.totalProfit.toFixed(2)}`}
                    sub={`$${data.totalStaked.toFixed(2)} staked`}
                    icon={data.totalProfit >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    highlight={data.totalProfit > 0}
                    valueColor={profitColor}
                />
                <KPICard
                    label="ROI"
                    value={`${data.roi >= 0 ? '+' : ''}${data.roi}%`}
                    sub={`${data.totalParlays} parlays`}
                    icon={<DollarSign className="w-4 h-4 text-amber-400" />}
                    highlight={data.roi > 0}
                    valueColor={roiColor}
                />
                <KPICard
                    label="Avg CLV"
                    value={data.avgCLV !== null ? `${data.avgCLV > 0 ? '+' : ''}${data.avgCLV}%` : '—'}
                    sub={data.clvLegsTracked > 0 ? `${data.clvLegsTracked} legs tracked` : 'Needs graded bets'}
                    icon={<Zap className="w-4 h-4 text-purple-400" />}
                    highlight={data.avgCLV !== null && data.avgCLV > 0}
                    valueColor={data.avgCLV !== null ? (data.avgCLV > 0 ? 'text-emerald-400' : data.avgCLV < 0 ? 'text-red-400' : 'text-zinc-400') : undefined}
                />
                <KPICard
                    label="CLV+ Rate"
                    value={data.clvLegsTracked > 0 ? `${data.clvPositiveRate}%` : '—'}
                    sub={data.clvLegsTracked > 0 ? 'Legs beating consensus' : 'Needs line shopping data'}
                    icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
                    highlight={data.clvPositiveRate > 55}
                    valueColor={data.clvPositiveRate > 55 ? 'text-emerald-400' : data.clvPositiveRate > 0 ? 'text-zinc-300' : undefined}
                />
            </div>

            {/* Breakdown Cards */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* By Risk Level */}
                <Card className="bg-zinc-900/60 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">By Risk Level</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(data.byRiskLevel)
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([risk, stats]) => (
                                <div key={risk} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`text-[9px] font-mono px-1.5 ${Number(risk) <= 3 ? 'border-emerald-500/30 text-emerald-400' :
                                            Number(risk) <= 7 ? 'border-amber-500/30 text-amber-400' :
                                                'border-red-500/30 text-red-400'
                                            }`}>
                                            R{risk}
                                        </Badge>
                                        <span className="text-[11px] text-zinc-400">{stats.parlays} parlays</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-zinc-300">{stats.hitRate}% hit</span>
                                        <span className={`text-[10px] font-mono font-bold ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {stats.profit >= 0 ? '+' : ''}${stats.profit.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        {Object.keys(data.byRiskLevel).length === 0 && (
                            <p className="text-xs text-zinc-600 text-center py-4">No data yet</p>
                        )}
                    </CardContent>
                </Card>

                {/* By Bet Type */}
                <Card className="bg-zinc-900/60 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">By Bet Type</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {Object.entries(data.byBetType).map(([type, stats]) => (
                            <div key={type} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-white uppercase">{type.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-zinc-500">{stats.legs} legs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-400">{stats.won}W</span>
                                    <Badge variant="outline" className={`text-[9px] font-mono px-1.5 ${stats.hitRate >= 55 ? 'border-emerald-500/30 text-emerald-400' :
                                        stats.hitRate >= 40 ? 'border-amber-500/30 text-amber-400' :
                                            'border-red-500/30 text-red-400'
                                        }`}>
                                        {stats.hitRate}%
                                    </Badge>
                                </div>
                            </div>
                        ))}
                        {Object.keys(data.byBetType).length === 0 && (
                            <p className="text-xs text-zinc-600 text-center py-4">No data yet</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Results */}
            <Card className="bg-zinc-900/60 border-white/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-zinc-400">Recent Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {data.recentResults.map((bet) => (
                            <div key={bet.id} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] last:border-0">
                                <div className="flex items-center gap-3">
                                    <Badge className={`text-[8px] font-black uppercase w-14 justify-center ${bet.result === 'won' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        bet.result === 'lost' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                            'bg-zinc-800 text-zinc-400 border-zinc-700'
                                        }`}>
                                        {bet.result}
                                    </Badge>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-300">{bet.odds} | {bet.legsWon}/{bet.legs} legs</span>
                                        <span className="text-[9px] text-zinc-600">{new Date(bet.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-zinc-500">${bet.stake.toFixed(2)}</span>
                                    <span className={`text-[11px] font-mono font-bold ${bet.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {bet.profit >= 0 ? '+' : ''}${bet.profit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {data.recentResults.length === 0 && (
                            <p className="text-xs text-zinc-600 text-center py-4">No results yet</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// ─── KPI Card Component ──────────────────────────────────────────────

function KPICard({ label, value, sub, icon, highlight, valueColor }: {
    label: string; value: string; sub: string; icon: React.ReactNode
    highlight?: boolean; valueColor?: string
}) {
    return (
        <Card className={`bg-zinc-900/60 border-white/5 ${highlight ? 'ring-1 ring-emerald-500/20' : ''}`}>
            <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
                    {icon}
                </div>
                <p className={`text-xl font-black tracking-tight ${valueColor || 'text-white'}`}>{value}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-bold">{sub}</p>
            </CardContent>
        </Card>
    )
}
