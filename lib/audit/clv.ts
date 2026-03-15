/**
 * CLV (Closing Line Value) Tracker
 *
 * CLV is the #1 metric professional sharps use to prove they have an edge.
 * It measures: "Did we get a better line than the market consensus?"
 *
 * We use pick_odds vs consensus_odds (stored at pick time from line shopping)
 * as a free proxy for true closing line value. Positive CLV = we beat the market.
 *
 * Formula:
 *   CLV = (consensus_implied_prob - pick_implied_prob) * 100
 *   Positive = we got a better price than the market average (GOOD)
 *   Negative = we took a worse price than available (BAD)
 */

import { americanToImpliedProb } from '@/lib/ai/parlayMath'

/**
 * Calculate CLV for a single leg.
 * Returns percentage points of edge (e.g., 3.2 means 3.2% better than consensus).
 * Returns null if either odds value is missing/invalid.
 */
export function calculateLegCLV(pickOdds: string | null, consensusOdds: string | null): number | null {
    if (!pickOdds || !consensusOdds) return null

    const pickNum = parseInt(pickOdds.replace('+', ''))
    const consensusNum = parseInt(consensusOdds.replace('+', ''))

    if (isNaN(pickNum) || isNaN(consensusNum)) return null
    if (pickNum === 0 || consensusNum === 0) return null

    const pickImplied = americanToImpliedProb(pickNum)
    const consensusImplied = americanToImpliedProb(consensusNum)

    // CLV = how much lower our implied probability was vs consensus
    // Lower implied prob = better odds for us = positive CLV
    const clv = (consensusImplied - pickImplied) * 100

    return Math.round(clv * 100) / 100 // 2 decimal places
}

/**
 * Calculate CLV for a batch of legs.
 * Returns a map of legId -> CLV value.
 */
export function calculateBatchCLV(
    legs: Array<{ id: string; odds: string | null; consensus_odds: string | null }>
): Map<string, number> {
    const results = new Map<string, number>()

    for (const leg of legs) {
        const clv = calculateLegCLV(leg.odds, leg.consensus_odds)
        if (clv !== null) {
            results.set(leg.id, clv)
        }
    }

    return results
}

/**
 * Interpret CLV value for display.
 */
export function interpretCLV(avgCLV: number): { label: string; color: string } {
    if (avgCLV >= 3) return { label: 'Elite Edge', color: 'text-emerald-400' }
    if (avgCLV >= 1.5) return { label: 'Sharp', color: 'text-emerald-400' }
    if (avgCLV >= 0.5) return { label: 'Positive Edge', color: 'text-blue-400' }
    if (avgCLV >= -0.5) return { label: 'Neutral', color: 'text-zinc-400' }
    if (avgCLV >= -1.5) return { label: 'Slight Leak', color: 'text-amber-400' }
    return { label: 'Line Disadvantage', color: 'text-red-400' }
}
