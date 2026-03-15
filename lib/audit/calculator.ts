/**
 * Audit Calculator
 *
 * Computes performance statistics from bet history data.
 * All calculations are done on-the-fly from the database (no materialized table needed).
 */

import { prisma } from '@/lib/prisma'
import { americanToDecimal } from '@/lib/ai/parlayMath'

export interface AuditSummary {
    // Parlay-level stats
    totalParlays: number
    parlaysWon: number
    parlaysLost: number
    parlaysPending: number
    parlayHitRate: number       // percentage

    // Leg-level stats
    totalLegs: number
    legsWon: number
    legsLost: number
    legsPending: number
    legHitRate: number          // percentage

    // Financial
    totalStaked: number
    totalProfit: number
    totalPayout: number
    roi: number                 // percentage

    // CLV (Closing Line Value)
    avgCLV: number | null       // Average CLV across all graded legs with data
    clvLegsTracked: number      // How many legs have CLV data
    clvPositiveRate: number     // % of legs with positive CLV

    // Breakdowns
    byRiskLevel: Record<number, { parlays: number; won: number; hitRate: number; profit: number }>
    bySport: Record<string, { parlays: number; won: number; hitRate: number; legs: number; legsWon: number }>
    byBetType: Record<string, { legs: number; won: number; hitRate: number }>

    // Recent performance
    recentResults: Array<{
        id: string
        date: string
        result: string
        odds: string
        legs: number
        legsWon: number
        stake: number
        profit: number
    }>
}

/**
 * Get complete audit summary for a user.
 * Optionally filtered by time period.
 */
export async function getUserAuditSummary(
    userId: string,
    daysBack?: number
): Promise<AuditSummary> {
    const dateFilter = daysBack
        ? { gte: new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000) }
        : undefined

    // Fetch all bet history with full parlay + leg data
    const bets = await prisma.betHistory.findMany({
        where: {
            user_id: userId,
            ...(dateFilter ? { created_at: dateFilter } : {})
        },
        include: {
            parlay: {
                include: {
                    legs: true
                }
            }
        },
        orderBy: { created_at: 'desc' }
    })

    // ── Parlay-level stats ────────────────────────────────────────
    const resolved = bets.filter(b => b.result === 'won' || b.result === 'lost')
    const won = bets.filter(b => b.result === 'won')
    const lost = bets.filter(b => b.result === 'lost')
    const pending = bets.filter(b => b.result === 'pending')

    // ── Leg-level stats ───────────────────────────────────────────
    const allLegs = bets.flatMap(b => b.parlay?.legs || [])
    const resolvedLegs = allLegs.filter(l => l.result === 'won' || l.result === 'lost')
    const wonLegs = allLegs.filter(l => l.result === 'won')
    const lostLegs = allLegs.filter(l => l.result === 'lost')
    const pendingLegs = allLegs.filter(l => l.result === 'pending')

    // ── Financial ─────────────────────────────────────────────────
    let totalStaked = 0
    let totalProfit = 0
    let totalPayout = 0

    for (const bet of bets) {
        const stake = bet.stake_amount ? Number(bet.stake_amount) : 0
        totalStaked += stake

        if (bet.result === 'won') {
            const payout = bet.payout
                ? Number(bet.payout)
                : calculatePayout(stake, bet.parlay?.total_odds || '+100')
            totalPayout += payout
            totalProfit += payout - stake
        } else if (bet.result === 'lost') {
            totalProfit -= stake
        }
    }

    // ── By Risk Level ─────────────────────────────────────────────
    const byRiskLevel: AuditSummary['byRiskLevel'] = {}
    for (const bet of bets) {
        const risk = bet.parlay?.risk_level || 5
        if (!byRiskLevel[risk]) byRiskLevel[risk] = { parlays: 0, won: 0, hitRate: 0, profit: 0 }
        byRiskLevel[risk].parlays++
        if (bet.result === 'won') {
            byRiskLevel[risk].won++
            const stake = bet.stake_amount ? Number(bet.stake_amount) : 0
            const payout = bet.payout
                ? Number(bet.payout)
                : calculatePayout(stake, bet.parlay?.total_odds || '+100')
            byRiskLevel[risk].profit += payout - stake
        } else if (bet.result === 'lost') {
            byRiskLevel[risk].profit -= bet.stake_amount ? Number(bet.stake_amount) : 0
        }
    }
    for (const risk of Object.keys(byRiskLevel)) {
        const r = byRiskLevel[Number(risk)]
        r.hitRate = r.parlays > 0 ? Math.round((r.won / r.parlays) * 100) : 0
    }

    // ── By Sport ──────────────────────────────────────────────────
    const bySport: AuditSummary['bySport'] = {}
    for (const bet of bets) {
        const sports = bet.parlay?.sports || ['Mixed']
        for (const sport of sports) {
            const s = sport || 'Mixed'
            if (!bySport[s]) bySport[s] = { parlays: 0, won: 0, hitRate: 0, legs: 0, legsWon: 0 }
            bySport[s].parlays++
            if (bet.result === 'won') bySport[s].won++
        }
    }
    for (const leg of allLegs) {
        const sport = leg.sport || 'Mixed'
        if (!bySport[sport]) bySport[sport] = { parlays: 0, won: 0, hitRate: 0, legs: 0, legsWon: 0 }
        bySport[sport].legs++
        if (leg.result === 'won') bySport[sport].legsWon++
    }
    for (const sport of Object.keys(bySport)) {
        const s = bySport[sport]
        s.hitRate = s.parlays > 0 ? Math.round((s.won / s.parlays) * 100) : 0
    }

    // ── By Bet Type ───────────────────────────────────────────────
    const byBetType: AuditSummary['byBetType'] = {}
    for (const leg of allLegs) {
        const type = leg.bet_type || 'unknown'
        if (!byBetType[type]) byBetType[type] = { legs: 0, won: 0, hitRate: 0 }
        byBetType[type].legs++
        if (leg.result === 'won') byBetType[type].won++
    }
    for (const type of Object.keys(byBetType)) {
        const t = byBetType[type]
        t.hitRate = t.legs > 0 ? Math.round((t.won / t.legs) * 100) : 0
    }

    // ── Recent Results ────────────────────────────────────────────
    const recentResults = bets.slice(0, 20).map(bet => {
        const legs = bet.parlay?.legs || []
        const legsWon = legs.filter(l => l.result === 'won').length
        const stake = bet.stake_amount ? Number(bet.stake_amount) : 0
        let profit = 0
        if (bet.result === 'won') {
            profit = (bet.payout ? Number(bet.payout) : calculatePayout(stake, bet.parlay?.total_odds || '+100')) - stake
        } else if (bet.result === 'lost') {
            profit = -stake
        }

        return {
            id: bet.id.slice(0, 8),
            date: bet.created_at.toISOString(),
            result: bet.result || 'pending',
            odds: bet.parlay?.total_odds || '—',
            legs: legs.length,
            legsWon,
            stake,
            profit: Math.round(profit * 100) / 100
        }
    })

    // ── CLV Stats ────────────────────────────────────────────────
    const legsWithCLV = allLegs.filter(l => l.clv !== null && l.clv !== undefined)
    const avgCLV = legsWithCLV.length > 0
        ? Math.round(legsWithCLV.reduce((sum, l) => sum + (l.clv || 0), 0) / legsWithCLV.length * 100) / 100
        : null
    const clvPositiveRate = legsWithCLV.length > 0
        ? Math.round(legsWithCLV.filter(l => (l.clv || 0) > 0).length / legsWithCLV.length * 100)
        : 0

    return {
        totalParlays: bets.length,
        parlaysWon: won.length,
        parlaysLost: lost.length,
        parlaysPending: pending.length,
        parlayHitRate: resolved.length > 0 ? Math.round((won.length / resolved.length) * 100) : 0,

        totalLegs: allLegs.length,
        legsWon: wonLegs.length,
        legsLost: lostLegs.length,
        legsPending: pendingLegs.length,
        legHitRate: resolvedLegs.length > 0 ? Math.round((wonLegs.length / resolvedLegs.length) * 100) : 0,

        totalStaked: Math.round(totalStaked * 100) / 100,
        totalProfit: Math.round(totalProfit * 100) / 100,
        totalPayout: Math.round(totalPayout * 100) / 100,
        roi: totalStaked > 0 ? Math.round((totalProfit / totalStaked) * 10000) / 100 : 0,

        avgCLV,
        clvLegsTracked: legsWithCLV.length,
        clvPositiveRate,

        byRiskLevel,
        bySport,
        byBetType,
        recentResults
    }
}

/**
 * Calculate payout from stake and American odds.
 */
export function calculatePayout(stake: number, oddsStr: string): number {
    const odds = parseInt(oddsStr.replace('+', ''))
    if (isNaN(odds) || stake <= 0) return 0

    const decimal = americanToDecimal(odds)
    return Math.round(stake * decimal * 100) / 100
}
