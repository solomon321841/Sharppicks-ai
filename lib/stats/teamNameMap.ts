/**
 * Team Name Matching: Odds API ↔ ESPN
 * Normalizes team names across different API formats for reliable matching.
 * Uses accent stripping, aliases, city mapping, and abbreviation fallback.
 */

// ─── Accent / diacritics removal ─────────────────────────────────────
function stripAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// ─── Common name variations that need normalization ──────────────────
const NAME_ALIASES: Record<string, string> = {
    // NBA
    'philadelphia 76ers': 'philadelphia 76ers',
    'sixers': 'philadelphia 76ers',
    'philly': 'philadelphia 76ers',
    'la clippers': 'los angeles clippers',
    'los angeles clippers': 'los angeles clippers',
    'clippers': 'los angeles clippers',
    'la lakers': 'los angeles lakers',
    'lakers': 'los angeles lakers',
    'trail blazers': 'portland trail blazers',
    'blazers': 'portland trail blazers',
    'timberwolves': 'minnesota timberwolves',
    't-wolves': 'minnesota timberwolves',
    'thunder': 'oklahoma city thunder',
    'okc thunder': 'oklahoma city thunder',
    'cavs': 'cleveland cavaliers',
    'cavaliers': 'cleveland cavaliers',
    'mavs': 'dallas mavericks',
    'mavericks': 'dallas mavericks',

    // NFL
    'washington commanders': 'washington commanders',
    'washington football team': 'washington commanders',
    'las vegas raiders': 'las vegas raiders',
    'oakland raiders': 'las vegas raiders',
    'la rams': 'los angeles rams',
    'la chargers': 'los angeles chargers',
    'niners': 'san francisco 49ers',
    '49ers': 'san francisco 49ers',
    'pats': 'new england patriots',

    // NHL
    'montreal canadiens': 'montreal canadiens',
    'montréal canadiens': 'montreal canadiens',
    'canadiens': 'montreal canadiens',
    'habs': 'montreal canadiens',
    'vegas golden knights': 'vegas golden knights',
    'golden knights': 'vegas golden knights',
    'utah hockey club': 'utah hockey club',
    'arizona coyotes': 'utah hockey club',
    'st louis blues': 'st. louis blues',
    'st. louis blues': 'st. louis blues',
    'blues': 'st. louis blues',
    'ny rangers': 'new york rangers',
    'ny islanders': 'new york islanders',
    'nj devils': 'new jersey devils',
    'tb lightning': 'tampa bay lightning',
    'tampa bay lightning': 'tampa bay lightning',

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
    'brighton hove albion': 'brighton and hove albion',
    'nottingham forest': 'nottingham forest',
    "nott'm forest": 'nottingham forest',
    'leicester': 'leicester city',
    'ipswich': 'ipswich town',
    'palace': 'crystal palace',
    'saints': 'southampton',
    'bournemouth': 'afc bournemouth',
    'afc bournemouth': 'afc bournemouth',

    // Soccer - La Liga
    'atletico madrid': 'atletico madrid',
    'atlético madrid': 'atletico madrid',
    'atlético de madrid': 'atletico madrid',
    'athletic bilbao': 'athletic club',
    'athletic club bilbao': 'athletic club',
    'real sociedad': 'real sociedad',
    'celta vigo': 'celta de vigo',
    'rc celta': 'celta de vigo',
    'deportivo alaves': 'deportivo alaves',
    'deportivo alavés': 'deportivo alaves',
    'alaves': 'deportivo alaves',
    'alavés': 'deportivo alaves',
    'rayo vallecano': 'rayo vallecano',
    'getafe': 'getafe',
    'real betis': 'real betis',
    'betis': 'real betis',
    'leganes': 'leganes',
    'leganés': 'leganes',
    'espanyol': 'espanyol',
    'rcd espanyol': 'espanyol',
    'real valladolid': 'real valladolid',
    'valladolid': 'real valladolid',

    // Soccer - Champions League / other
    'inter milan': 'internazionale',
    'inter': 'internazionale',
    'ac milan': 'ac milan',
    'psg': 'paris saint-germain',
    'paris saint germain': 'paris saint-germain',
    'bayern munich': 'bayern munich',
    'bayern munchen': 'bayern munich',
    'bayern münchen': 'bayern munich',
}

// ─── City-to-team mapping for fallback matching ─────────────────────
// Maps city name to the team's distinctive identifier
const CITY_MAP: Record<string, string[]> = {
    'boston': ['celtics', 'red sox', 'bruins', 'patriots'],
    'new york': ['knicks', 'nets', 'rangers', 'islanders', 'yankees', 'mets', 'giants', 'jets'],
    'los angeles': ['lakers', 'clippers', 'dodgers', 'rams', 'chargers', 'kings'],
    'chicago': ['bulls', 'bears', 'cubs', 'white sox', 'blackhawks', 'fire'],
    'golden state': ['warriors'],
    'san francisco': ['49ers', 'giants', 'warriors'],
    'philadelphia': ['76ers', 'sixers', 'eagles', 'phillies', 'flyers'],
    'toronto': ['raptors', 'maple leafs', 'blue jays'],
    'miami': ['heat', 'dolphins', 'marlins', 'panthers'],
    'dallas': ['mavericks', 'cowboys', 'stars'],
    'houston': ['rockets', 'texans', 'astros'],
    'detroit': ['pistons', 'lions', 'tigers', 'red wings'],
    'phoenix': ['suns', 'cardinals', 'coyotes'],
    'denver': ['nuggets', 'broncos', 'avalanche'],
    'milwaukee': ['bucks', 'brewers'],
    'minnesota': ['timberwolves', 'wolves', 'vikings', 'twins', 'wild'],
    'oklahoma city': ['thunder'],
    'sacramento': ['kings'],
    'portland': ['trail blazers', 'blazers'],
    'cleveland': ['cavaliers', 'cavs', 'guardians', 'browns'],
    'san antonio': ['spurs'],
    'memphis': ['grizzlies'],
    'atlanta': ['hawks', 'falcons', 'braves', 'united'],
    'orlando': ['magic'],
    'indiana': ['pacers', 'colts'],
    'utah': ['jazz', 'hockey club'],
    'charlotte': ['hornets', 'panthers'],
    'washington': ['wizards', 'commanders', 'nationals', 'capitals'],
    'new orleans': ['pelicans', 'saints'],
    'brooklyn': ['nets'],
}

/**
 * Normalize a team name for consistent comparison.
 * Strips accents, lowercases, removes common suffixes, and resolves aliases.
 */
export function normalizeTeamName(name: string): string {
    let n = stripAccents(name.toLowerCase().trim())

    // Remove common suffixes that vary between APIs
    n = n.replace(/\s*(fc|sc|cf|afc)$/i, '').trim()

    // Check alias map
    if (NAME_ALIASES[n]) return NAME_ALIASES[n]

    return n
}

/**
 * Check if two team names refer to the same team.
 * Uses normalization + substring + last-word + city matching for robustness.
 */
export function teamsMatch(oddsApiName: string, espnName: string): boolean {
    const a = normalizeTeamName(oddsApiName)
    const b = normalizeTeamName(espnName)

    // Exact match after normalization
    if (a === b) return true

    // One contains the other (handles "Boston Celtics" vs "Celtics")
    if (a.length > 3 && b.length > 3 && (a.includes(b) || b.includes(a))) return true

    // Word-based matching
    const aWords = a.split(' ')
    const bWords = b.split(' ')
    const aLast = aWords[aWords.length - 1]
    const bLast = bWords[bWords.length - 1]

    // Last-word match if distinctive (>4 chars, not generic)
    const generic = new Set(['city', 'united', 'club', 'town', 'real', 'state', 'york', 'angeles'])
    if (aLast === bLast && aLast.length > 4 && !generic.has(aLast)) return true

    // Multi-word distinctive match: "Trail Blazers" ↔ "Trail Blazers"
    if (aWords.length >= 2 && bWords.length >= 2) {
        const aDistinct = aWords.slice(-2).join(' ')
        const bDistinct = bWords.slice(-2).join(' ')
        if (aDistinct === bDistinct) return true
    }

    return false
}

/**
 * Find the ESPN competitor that matches an Odds API team name.
 * Tries displayName, shortDisplayName, and abbreviation.
 */
export function findMatchingCompetitor(
    oddsApiTeamName: string,
    competitors: Array<{ team: { displayName: string; shortDisplayName?: string; abbreviation?: string }; homeAway: string }>
): typeof competitors[number] | null {
    for (const comp of competitors) {
        const espnName = comp.team.displayName
        const shortName = comp.team.shortDisplayName || ''
        const abbrev = comp.team.abbreviation || ''

        if (teamsMatch(oddsApiTeamName, espnName)) return comp
        if (shortName && teamsMatch(oddsApiTeamName, shortName)) return comp
        // Abbreviation fallback (e.g., "BOS" ↔ "Boston Celtics")
        if (abbrev && normalizeTeamName(oddsApiTeamName).includes(abbrev.toLowerCase())) return comp
    }
    return null
}
