/**
 * Data Enrichment Utilities for AI-First Parlay Generation
 * Extracts player context, line difficulty, and strategic metadata from raw odds data
 */

export interface EnrichedOutcome {
    name: string; // "Over", "Yes", team name, etc.
    description?: string; // Player name or additional context
    price: number; // American odds
    point?: number; // Line threshold (e.g., 2.5 for "Over 2.5")

    // AI Context Fields
    playerName?: string; // Extracted clean player name
    lineThreshold?: number; // Parsed threshold value
    playerImportance?: 'star' | 'starter' | 'bench' | 'unknown'; // Inferred role
    lineDifficulty?: 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard'; // Strategic assessment
}

/**
 * Extract clean player name from description
 * Examples:
 * - "Kylian Mbappe" → "Kylian Mbappe"
 * - "Over 2.5 - Kylian Mbappe" → "Kylian Mbappe"
 */
export function extractPlayerName(description?: string): string | undefined {
    if (!description) return undefined;

    // Remove common prefixes
    const cleaned = description
        .replace(/^(Over|Under|Yes|No)\s*[\d.]*\s*-?\s*/i, '')
        .trim();

    return cleaned || undefined;
}

/**
 * Parse line threshold from point value or description
 * Examples:
 * - point: 2.5 → 2.5
 * - description: "Over 2.5 Shots" → 2.5
 */
export function parseLineThreshold(outcome: { point?: number; description?: string; name?: string }): number | undefined {
    // Priority 1: Use point if available
    if (outcome.point !== undefined) return outcome.point;

    // Priority 2: Extract from description
    const text = outcome.description || outcome.name || '';
    const match = text.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : undefined;
}

/**
 * Infer player importance based on odds positioning
 * Logic: In a list of player props, stars are typically listed first with better odds
 * 
 * @param outcomes - All outcomes for this market
 * @param currentOutcome - The outcome to assess
 */
export function inferPlayerImportance(
    outcomes: Array<{ description?: string; price: number }>,
    currentOutcome: { description?: string; price: number }
): 'star' | 'starter' | 'bench' | 'unknown' {
    if (!currentOutcome.description) return 'unknown';

    const index = outcomes.findIndex(o => o.description === currentOutcome.description);
    if (index === -1) return 'unknown';

    const totalPlayers = outcomes.length;
    const position = index / totalPlayers;

    // Top 20% = stars (Mbappe, Haaland, LeBron, Mahomes, etc.)
    if (position < 0.2) return 'star';

    // Top 50% = starters
    if (position < 0.5) return 'starter';

    // Bottom 50% = bench/reserves
    return 'bench';
}

/**
 * Assess line difficulty based on threshold value and sport context
 * Supports: Soccer, Basketball, Football, Baseball, Hockey
 * 
 * Examples:
 * - Soccer: "Over 0.5 Goals" for Mbappe = very_easy
 * - Basketball: "Over 25.5 Points" for LeBron = moderate
 * - Football: "Over 250.5 Passing Yards" for Mahomes = moderate
 */
export function assessLineDifficulty(
    threshold: number | undefined,
    marketType: string
): 'very_easy' | 'easy' | 'moderate' | 'hard' | 'very_hard' {
    if (threshold === undefined) return 'moderate';

    const market = marketType.toLowerCase();

    // ========== SOCCER ==========
    // Goals/Assists (rare events)
    if (market.includes('goal') || market.includes('assist')) {
        if (threshold <= 0.5) return 'very_easy';
        if (threshold <= 1.5) return 'easy';
        if (threshold <= 2.5) return 'moderate';
        if (threshold <= 3.5) return 'hard';
        return 'very_hard';
    }

    // Shots (common events)
    if (market.includes('shot')) {
        if (threshold <= 1.5) return 'very_easy';
        if (threshold <= 2.5) return 'easy';
        if (threshold <= 3.5) return 'moderate';
        if (threshold <= 5.5) return 'hard';
        return 'very_hard';
    }

    // ========== BASKETBALL ==========
    // Points (high-scoring)
    if (market.includes('point') && !market.includes('3')) {
        if (threshold <= 15.5) return 'very_easy';
        if (threshold <= 22.5) return 'easy';
        if (threshold <= 28.5) return 'moderate';
        if (threshold <= 35.5) return 'hard';
        return 'very_hard';
    }

    // Rebounds
    if (market.includes('rebound')) {
        if (threshold <= 5.5) return 'very_easy';
        if (threshold <= 8.5) return 'easy';
        if (threshold <= 11.5) return 'moderate';
        if (threshold <= 14.5) return 'hard';
        return 'very_hard';
    }

    // 3-Pointers Made
    if (market.includes('3') || market.includes('three')) {
        if (threshold <= 1.5) return 'very_easy';
        if (threshold <= 2.5) return 'easy';
        if (threshold <= 3.5) return 'moderate';
        if (threshold <= 5.5) return 'hard';
        return 'very_hard';
    }

    // ========== FOOTBALL (AMERICAN) ==========
    // Passing Yards
    if (market.includes('passing') && market.includes('yard')) {
        if (threshold <= 225.5) return 'very_easy';
        if (threshold <= 275.5) return 'easy';
        if (threshold <= 325.5) return 'moderate';
        if (threshold <= 375.5) return 'hard';
        return 'very_hard';
    }

    // Rushing Yards
    if (market.includes('rushing') && market.includes('yard')) {
        if (threshold <= 50.5) return 'very_easy';
        if (threshold <= 75.5) return 'easy';
        if (threshold <= 100.5) return 'moderate';
        if (threshold <= 125.5) return 'hard';
        return 'very_hard';
    }

    // Receiving Yards
    if (market.includes('receiving') && market.includes('yard')) {
        if (threshold <= 50.5) return 'very_easy';
        if (threshold <= 75.5) return 'easy';
        if (threshold <= 100.5) return 'moderate';
        if (threshold <= 125.5) return 'hard';
        return 'very_hard';
    }

    // Touchdowns (all types)
    if (market.includes('touchdown') || market.includes('td')) {
        if (threshold <= 0.5) return 'very_easy';
        if (threshold <= 1.5) return 'easy';
        if (threshold <= 2.5) return 'moderate';
        if (threshold <= 3.5) return 'hard';
        return 'very_hard';
    }

    // Receptions
    if (market.includes('reception') || market.includes('catch')) {
        if (threshold <= 4.5) return 'very_easy';
        if (threshold <= 6.5) return 'easy';
        if (threshold <= 8.5) return 'moderate';
        if (threshold <= 10.5) return 'hard';
        return 'very_hard';
    }

    // ========== BASEBALL ==========
    // Hits
    if (market.includes('hit') && !market.includes('pitcher')) {
        if (threshold <= 0.5) return 'very_easy';
        if (threshold <= 1.5) return 'easy';
        if (threshold <= 2.5) return 'moderate';
        if (threshold <= 3.5) return 'hard';
        return 'very_hard';
    }

    // Home Runs
    if (market.includes('home') || market.includes('hr')) {
        if (threshold <= 0.5) return 'easy';
        if (threshold <= 1.5) return 'moderate';
        if (threshold <= 2.5) return 'hard';
        return 'very_hard';
    }

    // Strikeouts (pitcher)
    if (market.includes('strikeout') || market.includes('strike')) {
        if (threshold <= 4.5) return 'very_easy';
        if (threshold <= 6.5) return 'easy';
        if (threshold <= 8.5) return 'moderate';
        if (threshold <= 10.5) return 'hard';
        return 'very_hard';
    }

    // RBIs
    if (market.includes('rbi') || market.includes('batted')) {
        if (threshold <= 0.5) return 'very_easy';
        if (threshold <= 1.5) return 'easy';
        if (threshold <= 2.5) return 'moderate';
        if (threshold <= 3.5) return 'hard';
        return 'very_hard';
    }

    // ========== HOCKEY ==========
    // Saves (goalie) - check first to avoid conflict with "save" in other contexts
    if (market.includes('save')) {
        if (threshold <= 20.5) return 'very_easy';
        if (threshold <= 28.5) return 'easy';
        if (threshold <= 35.5) return 'moderate';
        if (threshold <= 42.5) return 'hard';
        return 'very_hard';
    }

    // ========== DEFAULT HEURISTIC ==========
    // Fallback for unknown market types
    if (threshold <= 1.5) return 'very_easy';
    if (threshold <= 2.5) return 'easy';
    if (threshold <= 4.5) return 'moderate';
    if (threshold <= 6.5) return 'hard';
    return 'very_hard';
}

/**
 * Enrich a single outcome with AI context
 */
export function enrichOutcome(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    outcome: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allOutcomesInMarket: any[],
    marketKey: string
): EnrichedOutcome {
    const playerName = extractPlayerName(outcome.description);
    const lineThreshold = parseLineThreshold(outcome);
    const playerImportance = playerName ? inferPlayerImportance(allOutcomesInMarket, outcome) : undefined;
    const lineDifficulty = assessLineDifficulty(lineThreshold, marketKey);

    return {
        ...outcome,
        playerName,
        lineThreshold,
        playerImportance,
        lineDifficulty
    };
}

/**
 * Enrich all outcomes in a game's bookmaker data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enrichGameData(game: any): any {
    if (!game.bookmakers || !Array.isArray(game.bookmakers)) return game;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrichedBookmakers = game.bookmakers.map((bookmaker: any) => {
        if (!bookmaker.markets || !Array.isArray(bookmaker.markets)) return bookmaker;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const enrichedMarkets = bookmaker.markets.map((market: any) => {
            if (!market.outcomes || !Array.isArray(market.outcomes)) return market;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const enrichedOutcomes = market.outcomes.map((outcome: any) =>
                enrichOutcome(outcome, market.outcomes, market.key)
            );

            return {
                ...market, // Use spread syntax
                outcomes: enrichedOutcomes
            };
        });

        return {
            ...bookmaker,
            markets: enrichedMarkets
        };
    });

    return {
        ...game,
        bookmakers: enrichedBookmakers
    };
}
