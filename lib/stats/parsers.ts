/**
 * ESPN JSON Response Parsers
 * Converts raw ESPN API responses into typed interfaces.
 * All parsers return null on malformed data — never throw.
 */

import { TeamStats, InjuryEntry, KeyPlayer } from './types'

// ─── Scoreboard Parsing ──────────────────────────────────────────────

/**
 * Parse a single ESPN competitor (from scoreboard) into TeamStats.
 */
export function parseCompetitorToTeamStats(competitor: any, sportKey: string): TeamStats | null {
    try {
        const team = competitor?.team
        if (!team) return null

        const name = team.displayName || team.shortDisplayName || team.name || ''
        if (!name) return null

        // Extract records
        let record = ''
        let homeRecord: string | undefined
        let awayRecord: string | undefined

        const records = competitor.records || []
        for (const rec of records) {
            const recName = (rec.name || rec.type || '').toLowerCase()
            if (recName === 'overall' || recName === 'total' || recName === 'ytd') {
                record = rec.summary || ''
            } else if (recName === 'home') {
                homeRecord = rec.summary || undefined
            } else if (recName === 'road' || recName === 'away') {
                awayRecord = rec.summary || undefined
            }
        }

        // If no labeled records, use first record as overall
        if (!record && records.length > 0) {
            record = records[0].summary || ''
        }

        // Extract scoring stats from team statistics if available
        let pointsPerGame: number | undefined
        let pointsAllowed: number | undefined

        const stats = competitor.statistics || []
        for (const stat of stats) {
            const statName = (stat.name || stat.abbreviation || '').toLowerCase()
            if (statName === 'avgpointsfor' || statName === 'ppg' || statName === 'pointspergame') {
                pointsPerGame = parseFloat(stat.displayValue || stat.value)
            }
            if (statName === 'avgpointsagainst' || statName === 'papg' || statName === 'oppointspergame') {
                pointsAllowed = parseFloat(stat.displayValue || stat.value)
            }
        }

        // For soccer, extract form/last 5
        let last5: string | undefined
        const form = competitor.form || team.form
        if (form) {
            last5 = form
        }

        return {
            name,
            record,
            homeRecord,
            awayRecord,
            pointsPerGame: pointsPerGame && !isNaN(pointsPerGame) ? pointsPerGame : undefined,
            pointsAllowed: pointsAllowed && !isNaN(pointsAllowed) ? pointsAllowed : undefined,
            last5,
        }
    } catch {
        return null
    }
}

/**
 * Parse the full scoreboard response, returning a map of matchups.
 * Key: "{homeTeam} vs {awayTeam}" (ESPN displayNames, lowercased)
 */
export interface ParsedGame {
    home: TeamStats
    away: TeamStats
    espnGameId?: string
    homeKeyPlayers: KeyPlayer[]
    awayKeyPlayers: KeyPlayer[]
}

export function parseScoreboard(data: any): Map<string, ParsedGame> {
    const result = new Map<string, ParsedGame>()

    try {
        const events = data?.events || []

        for (const event of events) {
            const competition = event.competitions?.[0]
            if (!competition) continue

            const competitors = competition.competitors || []
            let homeComp: any = null
            let awayComp: any = null

            for (const comp of competitors) {
                if (comp.homeAway === 'home') homeComp = comp
                else if (comp.homeAway === 'away') awayComp = comp
            }

            if (!homeComp || !awayComp) continue

            const sportKey = ''
            const homeStats = parseCompetitorToTeamStats(homeComp, sportKey)
            const awayStats = parseCompetitorToTeamStats(awayComp, sportKey)

            if (!homeStats || !awayStats) continue

            // Extract key player leaders (season averages for scheduled games)
            const gameStatus = competition.status?.type?.name || ''
            const isScheduled = gameStatus === 'STATUS_SCHEDULED' || gameStatus === 'STATUS_PREGAME'

            const key = `${homeStats.name.toLowerCase()}|${awayStats.name.toLowerCase()}`
            result.set(key, {
                home: homeStats,
                away: awayStats,
                espnGameId: event.id,
                homeKeyPlayers: parseLeaders(homeComp, isScheduled),
                awayKeyPlayers: parseLeaders(awayComp, isScheduled)
            })
        }
    } catch (e) {
        console.warn('[ESPN Parser] Failed to parse scoreboard:', e)
    }

    return result
}

/**
 * Parse team leaders from competitor data.
 * For scheduled games: season averages. For live/completed: game stats.
 */
function parseLeaders(competitor: any, isSeasonAverages: boolean): KeyPlayer[] {
    const leaders: KeyPlayer[] = []
    try {
        const leaderGroups = competitor.leaders || []
        for (const group of leaderGroups) {
            const category = group.name || group.abbreviation || ''
            // Skip the composite "rating" leader to avoid duplication
            if (category === 'rating') continue

            const topLeader = group.leaders?.[0]
            if (!topLeader) continue

            const name = topLeader.athlete?.displayName || ''
            const displayValue = topLeader.displayValue || ''
            const value = parseFloat(displayValue)

            if (!name || isNaN(value)) continue

            leaders.push({
                name,
                category,
                value,
                display: isSeasonAverages
                    ? `${displayValue} ${formatCategory(category)}`
                    : `${displayValue} ${formatCategory(category)} (this game)`
            })
        }
    } catch {
        // Silently fail
    }
    return leaders
}

function formatCategory(cat: string): string {
    const map: Record<string, string> = {
        'pointsPerGame': 'PPG',
        'reboundsPerGame': 'RPG',
        'assistsPerGame': 'APG',
        'points': 'PTS',
        'rebounds': 'REB',
        'assists': 'AST',
        'goals': 'G',
        'goalsAgainst': 'GA',
        'saves': 'SV',
        'passingYards': 'Pass YDS',
        'rushingYards': 'Rush YDS',
        'receivingYards': 'Rec YDS',
    }
    return map[cat] || cat.replace(/PerGame/g, '').toUpperCase()
}

/**
 * Extract all team names from a scoreboard (for rest day detection).
 */
export function extractTeamsFromScoreboard(data: any): Set<string> {
    const teams = new Set<string>()
    try {
        const events = data?.events || []
        for (const event of events) {
            const competitors = event.competitions?.[0]?.competitors || []
            for (const comp of competitors) {
                const name = comp.team?.displayName
                if (name) teams.add(name)
            }
        }
    } catch {
        // Silently fail
    }
    return teams
}

// ─── Injuries Parsing ────────────────────────────────────────────────

/**
 * Parse ESPN injuries response into flat list of InjuryEntry.
 */
export function parseInjuries(data: any): InjuryEntry[] {
    const entries: InjuryEntry[] = []

    try {
        // ESPN injuries format: array of team objects, each with injuries array
        const teams = data?.injuries || data || []
        if (!Array.isArray(teams)) return entries

        for (const teamData of teams) {
            const teamName = teamData.displayName || teamData.team?.displayName || ''
            const injuries = teamData.injuries || []

            for (const injury of injuries) {
                const playerName = injury.athlete?.displayName || injury.athlete?.fullName || ''
                if (!playerName) continue

                const rawStatus = (injury.status || injury.type?.description || '').toLowerCase().trim()
                const status = normalizeInjuryStatus(rawStatus)

                const description = [
                    injury.shortComment || injury.type?.description || '',
                    teamName ? `(${teamName})` : ''
                ].filter(Boolean).join(' ')

                entries.push({
                    playerName,
                    status,
                    description
                })
            }
        }
    } catch (e) {
        console.warn('[ESPN Parser] Failed to parse injuries:', e)
    }

    return entries
}

function normalizeInjuryStatus(raw: string): InjuryEntry['status'] {
    if (raw.includes('out')) return 'OUT'
    if (raw.includes('doubtful')) return 'DOUBTFUL'
    if (raw.includes('questionable')) return 'QUESTIONABLE'
    if (raw.includes('probable')) return 'PROBABLE'
    if (raw.includes('day-to-day') || raw.includes('day to day') || raw.includes('dtd')) return 'DAY_TO_DAY'
    return 'QUESTIONABLE' // Default to questionable for unknown statuses
}

// ─── Team Stats Parsing ──────────────────────────────────────────────

/**
 * Parse ESPN team detail response for scoring averages.
 * Returns partial TeamStats with PPG/points allowed filled in.
 */
export function parseTeamDetail(data: any): { pointsPerGame?: number; pointsAllowed?: number } | null {
    try {
        const team = data?.team
        if (!team) return null

        let pointsPerGame: number | undefined
        let pointsAllowed: number | undefined

        // Try record.items[].stats
        const recordItems = team.record?.items || []
        for (const item of recordItems) {
            const stats = item.stats || []
            for (const stat of stats) {
                const name = (stat.name || '').toLowerCase()
                if (name === 'pointsfor' || name === 'avgpointsfor') {
                    pointsPerGame = parseFloat(stat.value)
                }
                if (name === 'pointsagainst' || name === 'avgpointsagainst') {
                    pointsAllowed = parseFloat(stat.value)
                }
            }
        }

        if (pointsPerGame && isNaN(pointsPerGame)) pointsPerGame = undefined
        if (pointsAllowed && isNaN(pointsAllowed)) pointsAllowed = undefined

        return { pointsPerGame, pointsAllowed }
    } catch {
        return null
    }
}
