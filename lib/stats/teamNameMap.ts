/**
 * Team Name Matching: Odds API ↔ ESPN
 * Normalizes team names across different API formats for reliable matching.
 * Also provides ESPN team IDs for direct team endpoint lookups.
 */

// Common name variations that need normalization
const NAME_ALIASES: Record<string, string> = {
    // NBA
    'philadelphia 76ers': 'philadelphia 76ers',
    'sixers': 'philadelphia 76ers',
    'la clippers': 'la clippers',
    'los angeles clippers': 'la clippers',
    'trail blazers': 'portland trail blazers',
    'blazers': 'portland trail blazers',
    'timberwolves': 'minnesota timberwolves',
    't-wolves': 'minnesota timberwolves',

    // NFL
    'washington commanders': 'washington commanders',
    'washington football team': 'washington commanders',
    'las vegas raiders': 'las vegas raiders',
    'oakland raiders': 'las vegas raiders',
    'la rams': 'los angeles rams',
    'la chargers': 'los angeles chargers',

    // NHL
    'montreal canadiens': 'montréal canadiens',
    'montréal canadiens': 'montréal canadiens',
    'vegas golden knights': 'vegas golden knights',
    'utah hockey club': 'utah hockey club',
    'arizona coyotes': 'utah hockey club',

    // Soccer - EPL
    'tottenham hotspur': 'tottenham hotspur',
    'tottenham': 'tottenham hotspur',
    'spurs': 'tottenham hotspur',
    'wolverhampton wanderers': 'wolverhampton wanderers',
    'wolves': 'wolverhampton wanderers',
    'man city': 'manchester city',
    'man united': 'manchester united',
    'man utd': 'manchester united',
    'newcastle': 'newcastle united',
    'newcastle utd': 'newcastle united',
    'west ham': 'west ham united',
    'brighton': 'brighton and hove albion',
    'brighton & hove albion': 'brighton and hove albion',
    'nottingham forest': "nottingham forest",
    "nott'm forest": "nottingham forest",
    'leicester': 'leicester city',
    'ipswich': 'ipswich town',

    // Soccer - La Liga
    'atletico madrid': 'atlético madrid',
    'atlético de madrid': 'atlético madrid',
    'athletic bilbao': 'athletic club',
    'athletic club bilbao': 'athletic club',
    'real sociedad': 'real sociedad',
    'celta vigo': 'celta de vigo',
    'rc celta': 'celta de vigo',
    'deportivo alavés': 'deportivo alavés',
    'alavés': 'deportivo alavés',
    'rayo vallecano': 'rayo vallecano',
}

/**
 * Normalize a team name for consistent comparison.
 * Lowercases, strips common suffixes, and resolves known aliases.
 */
export function normalizeTeamName(name: string): string {
    let n = name.toLowerCase().trim()

    // Remove common suffixes that vary between APIs
    n = n.replace(/\s*(fc|sc|cf|afc)$/i, '').trim()

    // Check alias map
    if (NAME_ALIASES[n]) return NAME_ALIASES[n]

    return n
}

/**
 * Check if two team names refer to the same team.
 * Uses normalization + substring matching for robustness.
 */
export function teamsMatch(oddsApiName: string, espnName: string): boolean {
    const a = normalizeTeamName(oddsApiName)
    const b = normalizeTeamName(espnName)

    // Exact match after normalization
    if (a === b) return true

    // One contains the other (handles "Boston Celtics" vs "Celtics")
    if (a.includes(b) || b.includes(a)) return true

    // Last-word match (handles "Celtics" matching "Boston Celtics")
    const aWords = a.split(' ')
    const bWords = b.split(' ')
    const aLast = aWords[aWords.length - 1]
    const bLast = bWords[bWords.length - 1]

    // Only match on last word if it's distinctive (>3 chars, not generic)
    const generic = new Set(['city', 'united', 'club', 'town', 'real'])
    if (aLast === bLast && aLast.length > 3 && !generic.has(aLast)) return true

    return false
}

/**
 * Find the ESPN competitor that matches an Odds API team name.
 * Returns the ESPN competitor object or null.
 */
export function findMatchingCompetitor(
    oddsApiTeamName: string,
    competitors: Array<{ team: { displayName: string; shortDisplayName?: string; abbreviation?: string }; homeAway: string }>
): typeof competitors[number] | null {
    for (const comp of competitors) {
        const espnName = comp.team.displayName
        const shortName = comp.team.shortDisplayName || ''

        if (teamsMatch(oddsApiTeamName, espnName)) return comp
        if (shortName && teamsMatch(oddsApiTeamName, shortName)) return comp
    }
    return null
}
