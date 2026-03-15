/**
 * ESPN Hidden API Client
 * Free, no auth required. Graceful fallback on all failures.
 */

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports'

// Map our sport keys to ESPN sport/league paths
export const SPORT_MAP: Record<string, { sport: string; league: string }> = {
    'basketball_nba': { sport: 'basketball', league: 'nba' },
    'basketball_ncaab': { sport: 'basketball', league: 'mens-college-basketball' },
    'icehockey_nhl': { sport: 'hockey', league: 'nhl' },
    'americanfootball_nfl': { sport: 'football', league: 'nfl' },
    'soccer_epl': { sport: 'soccer', league: 'eng.1' },
    'soccer_spain_la_liga': { sport: 'soccer', league: 'esp.1' },
    'soccer_uefa_champs_league': { sport: 'soccer', league: 'uefa.champions' },
}

/**
 * Fetch from ESPN with timeout and null-on-failure
 */
async function espnFetch<T>(url: string, timeoutMs = 6000): Promise<T | null> {
    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), timeoutMs)

        const res = await fetch(url, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 0 } // No Next.js caching, we cache in KV
        })

        clearTimeout(timer)

        if (!res.ok) {
            console.warn(`[ESPN] ${res.status} from ${url}`)
            return null
        }

        return await res.json() as T
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.warn(`[ESPN] Timeout: ${url}`)
        } else {
            console.warn(`[ESPN] Error: ${error.message}`)
        }
        return null
    }
}

/**
 * Get today's scoreboard for a sport (includes team records, game status)
 */
export async function getScoreboard(sportKey: string): Promise<any | null> {
    const mapping = SPORT_MAP[sportKey]
    if (!mapping) return null
    return espnFetch(`${ESPN_BASE}/${mapping.sport}/${mapping.league}/scoreboard`)
}

/**
 * Get team details including record and scoring averages
 */
export async function getTeamInfo(sportKey: string, teamId: string): Promise<any | null> {
    const mapping = SPORT_MAP[sportKey]
    if (!mapping) return null
    return espnFetch(`${ESPN_BASE}/${mapping.sport}/${mapping.league}/teams/${teamId}`)
}

/**
 * Get injury report for a sport
 */
export async function getInjuries(sportKey: string): Promise<any | null> {
    const mapping = SPORT_MAP[sportKey]
    if (!mapping) return null
    // Injuries endpoint works for NBA, NFL, NHL. For soccer it returns empty.
    return espnFetch(`${ESPN_BASE}/${mapping.sport}/${mapping.league}/injuries`)
}

/**
 * Get scoreboard for a specific date (for rest day detection)
 * @param date - YYYYMMDD format
 */
export async function getScoreboardForDate(sportKey: string, date: string): Promise<any | null> {
    const mapping = SPORT_MAP[sportKey]
    if (!mapping) return null
    return espnFetch(`${ESPN_BASE}/${mapping.sport}/${mapping.league}/scoreboard?dates=${date}`)
}

/**
 * Get full event summary with box score data (for grading player props)
 */
export async function getEventSummary(sportKey: string, espnEventId: string): Promise<any | null> {
    const mapping = SPORT_MAP[sportKey]
    if (!mapping) return null
    return espnFetch(`${ESPN_BASE}/${mapping.sport}/${mapping.league}/summary?event=${espnEventId}`, 8000)
}

/**
 * Resolve a sport key to ESPN format, returns null if unsupported
 */
export function getESPNMapping(sportKey: string) {
    return SPORT_MAP[sportKey] || null
}
