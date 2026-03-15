/**
 * Line Shopping Module
 *
 * Compares odds across ALL bookmakers returned by The Odds API.
 * Finds the best available odds, consensus (average), and "sharp value" edges.
 * No additional API calls needed — uses existing bookmaker data.
 */

import { americanToImpliedProb, decimalToAmerican, americanToDecimal } from '../ai/parlayMath'

export interface MarketOutcome {
    name: string           // "Over", "Under", team name, player name
    description?: string   // Additional context
    point?: number         // Line threshold
    marketKey: string      // "h2h", "spreads", "player_points", etc.
}

export interface ShoppedLine {
    outcome: MarketOutcome
    bestOdds: number       // Best American odds across all books
    bestBook: string       // Which sportsbook has the best line
    consensusOdds: number  // Average American odds across all books
    edgePercent: number    // How much better the best line is vs consensus
    sharpValue: boolean    // True if edge > 3% (meaningful edge)
    bookCount: number      // How many books carry this line
}

export interface GameShoppingResult {
    gameId: string
    homeTeam: string
    awayTeam: string
    lines: ShoppedLine[]
}

/**
 * Shop lines for a single game across all bookmakers.
 * Returns the best odds for each distinct outcome.
 */
export function findBestOddsForGame(game: any): GameShoppingResult {
    const result: GameShoppingResult = {
        gameId: game.id,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        lines: []
    }

    const bookmakers = game.bookmakers || []
    if (bookmakers.length === 0) return result

    // Group all outcomes across all books by a unique key
    const outcomeMap = new Map<string, Array<{ odds: number; book: string; outcome: MarketOutcome }>>()

    for (const bookmaker of bookmakers) {
        const bookName = bookmaker.title || bookmaker.key || 'Unknown'

        for (const market of bookmaker.markets || []) {
            for (const outcome of market.outcomes || []) {
                const odds = outcome.price
                if (typeof odds !== 'number' || isNaN(odds) || odds === 0) continue

                // Create a unique key for this outcome
                const key = buildOutcomeKey(market.key, outcome)

                if (!outcomeMap.has(key)) outcomeMap.set(key, [])
                outcomeMap.get(key)!.push({
                    odds,
                    book: bookName,
                    outcome: {
                        name: outcome.description || outcome.name,
                        description: outcome.description,
                        point: outcome.point,
                        marketKey: market.key
                    }
                })
            }
        }
    }

    // Find best odds and consensus for each outcome
    Array.from(outcomeMap.values()).forEach(entries => {
        if (entries.length === 0) return

        // Sort by odds (highest = best for bettor)
        entries.sort((a: { odds: number; book: string; outcome: MarketOutcome }, b: { odds: number; book: string; outcome: MarketOutcome }) => compareOdds(b.odds, a.odds))

        const bestEntry = entries[0]
        const allOdds = entries.map((e: { odds: number }) => e.odds)
        const consensusOdds = calculateConsensusOdds(allOdds)

        // Calculate edge
        const bestImplied = americanToImpliedProb(bestEntry.odds)
        const consensusImplied = americanToImpliedProb(consensusOdds)
        const edgePercent = consensusImplied > 0
            ? ((consensusImplied - bestImplied) / consensusImplied) * 100
            : 0

        result.lines.push({
            outcome: bestEntry.outcome,
            bestOdds: bestEntry.odds,
            bestBook: bestEntry.book,
            consensusOdds,
            edgePercent: Math.round(edgePercent * 10) / 10,
            sharpValue: edgePercent > 3.0,
            bookCount: entries.length
        })
    })

    return result
}

/**
 * Build consensus market data for AI context.
 * For each game, returns markets with best odds, consensus, and edge indicators.
 */
export function buildMarketConsensus(games: any[]): Map<string, GameShoppingResult> {
    const results = new Map<string, GameShoppingResult>()

    for (const game of games) {
        const shopped = findBestOddsForGame(game)
        if (shopped.lines.length > 0) {
            results.set(game.id, shopped)
        }
    }

    return results
}

// ─── Internal Helpers ────────────────────────────────────────────────

/**
 * Create a unique key for an outcome to group across bookmakers.
 */
function buildOutcomeKey(marketKey: string, outcome: any): string {
    const name = (outcome.description || outcome.name || '').toLowerCase()
    const point = outcome.point !== undefined ? `:${outcome.point}` : ''
    return `${marketKey}|${name}${point}`
}

/**
 * Compare two American odds values (higher is better for bettor).
 * -110 < -105 < +100 < +110 < +200
 */
function compareOdds(a: number, b: number): number {
    // Convert to decimal for fair comparison
    const decA = americanToDecimal(a)
    const decB = americanToDecimal(b)
    return decA - decB
}

/**
 * Calculate consensus (average) odds from multiple bookmakers.
 * Averages in decimal space then converts back to American.
 */
function calculateConsensusOdds(americanOdds: number[]): number {
    if (americanOdds.length === 0) return -110
    if (americanOdds.length === 1) return americanOdds[0]

    const avgDecimal = americanOdds.reduce((sum, odds) => sum + americanToDecimal(odds), 0) / americanOdds.length
    return decimalToAmerican(avgDecimal)
}
