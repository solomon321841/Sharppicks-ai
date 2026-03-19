export function americanToDecimal(odds: number): number {
    if (odds > 0) return (odds / 100) + 1;
    return (100 / Math.abs(odds)) + 1;
}

export function americanToImpliedProb(odds: number): number {
    if (odds > 0) return 100 / (odds + 100);
    return Math.abs(odds) / (Math.abs(odds) + 100);
}

export function decimalToAmerican(decimal: number): number {
    if (decimal >= 2.0) {
        return Math.round((decimal - 1) * 100);
    } else {
        return Math.round(-100 / (decimal - 1));
    }
}

export function calculateNoVigProbability(sideAOdds: number, sideBOdds: number): { probA: number, probB: number } {
    const probA = americanToImpliedProb(sideAOdds);
    const probB = americanToImpliedProb(sideBOdds);
    const totalImplied = probA + probB;

    return {
        probA: probA / totalImplied,
        probB: probB / totalImplied
    };
}

export function calculateCombinedParlayMetrics(legs: { odds: number }[]) {
    // In a real system we'd need BOTH sides of the market to perfectly remove vig.
    // However, if we only have the selected leg's odds, we can estimate fair probability 
    // by assuming a standard vig (e.g., typical NBA/NFL spread is -110/-110 = ~4.76% vig).
    // For this engine, we will calculate the naive implied probability to construct the baseline,
    // but the Prompt tells the AI to look at both sides if possible.
    // Since we only *receive* the selected leg from Claude, we calculate implied prob,
    // and apply a standard 4.5% vig reduction for accuracy before combining.

    let combinedFairProb = 1.0;

    for (const leg of legs) {
        const impliedProb = americanToImpliedProb(leg.odds);

        // Estimate no-vig fair probability by removing ~4.5% standard market vig
        // (If implied is 52.38% from -110, fair is ~50%)
        // This is a dynamic estimation since we don't have the opposing line in the AI response.
        // For heavy favorites (e.g. -500 -> 83%), the vig proportion is smaller.
        const normalizedFairProb = impliedProb / 1.045; // Approximating removing juice

        combinedFairProb *= Math.min(normalizedFairProb, 0.99); // Cap at 99%
    }

    const combinedAmericanOdds = decimalToAmerican(1 / combinedFairProb);

    return {
        combinedFairProb,
        combinedAmericanOdds
    };
}

export function getTargetRange(riskLevel: number, numLegs?: number): [number, number] {
    const baseRanges: Record<number, [number, number]> = {
        1: [-300, 400],
        2: [-200, 500],
        3: [100, 600],
        4: [150, 800],
        5: [200, 1500],
        6: [300, 2500],
        7: [500, 6000],
        8: [800, 10000],
        9: [2000, 50000],
        10: [2000, 50000]
    };

    const range = baseRanges[riskLevel];
    if (!range) return [0, 50000];

    let [lower, upper] = range;

    // Scale bounds for more legs — each additional leg beyond 2 naturally
    // compounds the combined odds even when every individual pick is safe.
    // e.g. 3 legs of -115 each ≈ +600 combined, which exceeds a base cap of +500.
    if (numLegs && numLegs > 2) {
        const extraLegs = numLegs - 2;
        upper = Math.round(upper * Math.pow(1.5, extraLegs));
        // Also scale lower bound down slightly so the AI has room
        if (lower > 0) {
            lower = Math.round(lower * Math.pow(0.8, extraLegs));
        }
    }

    return [lower, upper];
}

export function validateRiskLevel(riskLevel: number, totalOdds: number, numLegs?: number): boolean {
    const [lower, upper] = getTargetRange(riskLevel, numLegs);
    return totalOdds >= lower && totalOdds <= upper;
}

export function enforceLegCount(riskLevel: number, requestedLegs: number): number {
    // A parlay requires at least 2 legs, max 10
    return Math.max(2, Math.min(requestedLegs, 10));
}

export function enforceBetTypes(riskLevel: number, requestedTypes: string[]): string[] {
    // We will now honor exactly what the user requested.
    // If they ask for props at Risk 1, they get props at Risk 1.
    // The AI will handle picking lines that fit the risk boundary.
    let allowedTypes = [...requestedTypes];

    if (allowedTypes.length === 0) {
        allowedTypes = ['moneyline', 'spread'];
    }

    return allowedTypes;
}

export function checkCorrelation(legs: { game_id: string, bet_type: string }[], riskLevel: number) {
    const gameCounts: Record<string, string[]> = {};
    let hasNonPropCorrelation = false;
    let isSameGameMLAndTotal = false;

    for (const leg of legs) {
        if (!gameCounts[leg.game_id]) gameCounts[leg.game_id] = [];

        gameCounts[leg.game_id].push(leg.bet_type);

        if (gameCounts[leg.game_id].length > 1) {
            // Player props from the same game (different players) are NOT correlated
            const nonPropTypes = gameCounts[leg.game_id].filter(t => t !== 'player_props');
            if (nonPropTypes.length > 1) {
                hasNonPropCorrelation = true;
            }

            // Specifically check for ML/Spread + Total in same game
            const types = gameCounts[leg.game_id];
            const hasSide = types.some(t => t === 'moneyline' || t === 'spread');
            const hasTotal = types.some(t => t === 'totals' || t === 'total' || t === 'over/under');

            if (hasSide && hasTotal) {
                isSameGameMLAndTotal = true;
            }
        }
    }

    if (riskLevel <= 5 && hasNonPropCorrelation) {
        return { valid: false, reason: 'Same-game parlays (non-prop) are blocked at Risk Level 1-5.' };
    }

    if (riskLevel <= 7 && isSameGameMLAndTotal) {
        return { valid: false, reason: 'Combining Moneyline/Spread with Over/Under from the same game is blocked below Risk 8.' };
    }

    return { valid: true, correlated: hasNonPropCorrelation };
}

export function getUnitSize(riskLevel: number): string {
    const units: Record<number, string> = {
        1: '3-5 Units',
        2: '2-4 Units',
        3: '2-3 Units',
        4: '1.5-2.5 Units',
        5: '1-2 Units',
        6: '1-1.5 Units',
        7: '0.5-1 Unit',
        8: '0.5 Units',
        9: '0.25 Units',
        10: '0.1-0.25 Units'
    };
    return units[riskLevel] || '1 Unit';
}
