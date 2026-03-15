/**
 * Stats Module — Public API
 *
 * Fetches real team stats and injury data from ESPN's free API.
 * Caches in Vercel KV. Returns null on any failure (never throws).
 *
 * Usage:
 *   const contexts = await getBulkGameContext('basketball_nba', oddsGames)
 *   // Returns a map of game contexts keyed by Odds API game ID
 */

import { kv } from '@vercel/kv'
import { getScoreboard, getInjuries, getScoreboardForDate, getESPNMapping } from './espnClient'
import { parseScoreboard, parseInjuries, extractTeamsFromScoreboard, ParsedGame } from './parsers'
import { teamsMatch } from './teamNameMap'
import type { InjuryEntry, GameContext, KeyPlayer } from './types'

// Cache TTLs (seconds)
const SCOREBOARD_TTL = 2 * 60 * 60   // 2 hours
const INJURIES_TTL = 1 * 60 * 60     // 1 hour
const YESTERDAY_SB_TTL = 6 * 60 * 60 // 6 hours (yesterday's games don't change)

function hasKV(): boolean {
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function kvGet<T>(key: string): Promise<T | null> {
    if (!hasKV()) return null
    try {
        return await kv.get<T>(key)
    } catch {
        return null
    }
}

async function kvSet(key: string, value: any, ttl: number): Promise<void> {
    if (!hasKV()) return
    try {
        await kv.set(key, value, { ex: ttl })
    } catch (e) {
        console.warn(`[Stats KV] Failed to set ${key}:`, e)
    }
}

// ─── Core: Get game context for ALL games in a sport ─────────────────

/**
 * Get team stats + injuries for a batch of Odds API games.
 * Returns a Map<oddsGameId, GameContext>.
 * Games that can't be matched to ESPN data are omitted (AI proceeds without).
 */
export async function getBulkGameContext(
    sportKey: string,
    oddsGames: Array<{ id: string; home_team: string; away_team: string }>
): Promise<Map<string, GameContext>> {
    const result = new Map<string, GameContext>()

    // Check if this sport is supported by ESPN
    if (!getESPNMapping(sportKey)) {
        console.log(`[Stats] Sport ${sportKey} not supported by ESPN, skipping`)
        return result
    }

    // Fetch scoreboard, injuries, and yesterday's scoreboard in parallel
    const [scoreboardData, injuriesData, yesterdayData] = await Promise.all([
        getCachedScoreboard(sportKey),
        getCachedInjuries(sportKey),
        getCachedYesterdayScoreboard(sportKey)
    ])

    if (!scoreboardData) {
        console.log(`[Stats] No scoreboard data for ${sportKey}`)
        return result
    }

    // Parse responses
    const scoreboardMap = parseScoreboard(scoreboardData)
    const allInjuries = injuriesData ? parseInjuries(injuriesData) : []
    const yesterdayTeams = yesterdayData ? extractTeamsFromScoreboard(yesterdayData) : new Set<string>()

    console.log(`[Stats] ${sportKey}: ${scoreboardMap.size} ESPN games, ${allInjuries.length} injuries, ${yesterdayTeams.size} teams played yesterday`)

    // Match each Odds API game to ESPN data
    for (const game of oddsGames) {
        const context = matchGameToESPN(game, scoreboardMap, allInjuries, yesterdayTeams)
        if (context) {
            result.set(game.id, context)
        }
    }

    console.log(`[Stats] Matched ${result.size}/${oddsGames.length} games for ${sportKey}`)
    return result
}

// ─── Cached ESPN Fetchers ────────────────────────────────────────────

async function getCachedScoreboard(sportKey: string): Promise<any | null> {
    const cacheKey = `stats:scoreboard:${sportKey}`
    const cached = await kvGet<any>(cacheKey)
    if (cached) {
        console.log(`[Stats] Scoreboard cache hit: ${sportKey}`)
        return cached
    }

    const data = await getScoreboard(sportKey)
    if (data) {
        await kvSet(cacheKey, data, SCOREBOARD_TTL)
    }
    return data
}

async function getCachedInjuries(sportKey: string): Promise<any | null> {
    const cacheKey = `stats:injuries:${sportKey}`
    const cached = await kvGet<any>(cacheKey)
    if (cached) {
        console.log(`[Stats] Injuries cache hit: ${sportKey}`)
        return cached
    }

    const data = await getInjuries(sportKey)
    if (data) {
        await kvSet(cacheKey, data, INJURIES_TTL)
    }
    return data
}

async function getCachedYesterdayScoreboard(sportKey: string): Promise<any | null> {
    const cacheKey = `stats:yesterday:${sportKey}`
    const cached = await kvGet<any>(cacheKey)
    if (cached) return cached

    // Calculate yesterday's date in YYYYMMDD format
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '')

    const data = await getScoreboardForDate(sportKey, dateStr)
    if (data) {
        await kvSet(cacheKey, data, YESTERDAY_SB_TTL)
    }
    return data
}

// ─── Game Matching ───────────────────────────────────────────────────

/**
 * Match an Odds API game to ESPN scoreboard data.
 * Uses fuzzy team name matching via teamNameMap.
 */
function matchGameToESPN(
    oddsGame: { id: string; home_team: string; away_team: string },
    scoreboardMap: Map<string, ParsedGame>,
    allInjuries: InjuryEntry[],
    yesterdayTeams: Set<string>
): GameContext | null {
    // Try to find a matching ESPN game
    const entries = Array.from(scoreboardMap.values())
    for (let i = 0; i < entries.length; i++) {
        const espnGame = entries[i]

        // Need both teams to match (could be swapped home/away between APIs)
        const bothTeamsPresent =
            (teamsMatch(oddsGame.home_team, espnGame.home.name) && teamsMatch(oddsGame.away_team, espnGame.away.name)) ||
            (teamsMatch(oddsGame.home_team, espnGame.away.name) && teamsMatch(oddsGame.away_team, espnGame.home.name))

        if (!bothTeamsPresent) continue

        // Determine correct home/away mapping
        const homeIsHome = teamsMatch(oddsGame.home_team, espnGame.home.name)

        const homeTeam = homeIsHome ? espnGame.home : espnGame.away
        const awayTeam = homeIsHome ? espnGame.away : espnGame.home
        const homeKeyPlayers: KeyPlayer[] = homeIsHome ? espnGame.homeKeyPlayers : espnGame.awayKeyPlayers
        const awayKeyPlayers: KeyPlayer[] = homeIsHome ? espnGame.awayKeyPlayers : espnGame.homeKeyPlayers

        // Filter injuries relevant to this game
        const gameInjuries = allInjuries.filter(inj => {
            const desc = inj.description.toLowerCase()
            return (
                desc.includes(homeTeam.name.toLowerCase()) ||
                desc.includes(awayTeam.name.toLowerCase()) ||
                teamsMatch(homeTeam.name, inj.description) ||
                teamsMatch(awayTeam.name, inj.description)
            )
        })

        // Calculate rest days (null = unknown, 0 = back-to-back)
        const homePlayedYesterday = teamInSet(homeTeam.name, yesterdayTeams)
        const awayPlayedYesterday = teamInSet(awayTeam.name, yesterdayTeams)

        const restDays = (yesterdayTeams.size > 0) ? {
            home: homePlayedYesterday ? 0 : null,
            away: awayPlayedYesterday ? 0 : null,
        } : undefined

        return {
            homeTeam,
            awayTeam,
            injuries: gameInjuries,
            homeKeyPlayers: homeKeyPlayers.length > 0 ? homeKeyPlayers : undefined,
            awayKeyPlayers: awayKeyPlayers.length > 0 ? awayKeyPlayers : undefined,
            restDays,
        }
    }

    return null
}

/**
 * Check if a team name appears in a Set of ESPN team names (fuzzy match).
 */
function teamInSet(teamName: string, teamSet: Set<string>): boolean {
    const names = Array.from(teamSet)
    for (const name of names) {
        if (teamsMatch(teamName, name)) return true
    }
    return false
}

/**
 * Get bulk context for multiple sports at once.
 * Merges results from all sports into a single map.
 */
export async function getMultiSportContext(
    sportKeys: string[],
    oddsGames: Array<{ id: string; home_team: string; away_team: string; sport_key?: string }>
): Promise<Map<string, GameContext>> {
    const allContexts = new Map<string, GameContext>()

    // Group games by sport
    const gamesBySport = new Map<string, typeof oddsGames>()
    for (const game of oddsGames) {
        const sport = game.sport_key || sportKeys[0] || ''
        if (!gamesBySport.has(sport)) gamesBySport.set(sport, [])
        gamesBySport.get(sport)!.push(game)
    }

    // Fetch all sports in parallel
    const promises = Array.from(gamesBySport.entries()).map(
        async ([sport, games]) => {
            const contexts = await getBulkGameContext(sport, games)
            Array.from(contexts.entries()).forEach(([id, ctx]) => {
                allContexts.set(id, ctx)
            })
        }
    )

    await Promise.all(promises)
    return allContexts
}
