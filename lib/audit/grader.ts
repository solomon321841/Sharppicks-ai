/**
 * Bet Grading Engine
 *
 * Grades individual parlay legs against real game results.
 * Supports: moneyline, spread, totals, and player props.
 * Player props use ESPN box score data for resolution.
 */

import { getScores, findMatchingGame, getWinner, getTotalScore, getTeamScore, GameScore } from '@/lib/odds/getScores'
import { getScoreboard, getEventSummary, getESPNMapping } from '@/lib/stats/espnClient'
import { teamsMatch } from '@/lib/stats/teamNameMap'

export interface GradeResult {
    result: 'won' | 'lost' | 'push' | 'pending'
    actualValue?: number     // For props: the actual stat value
    gradedAt?: Date
}

// ─── Grade a single leg ──────────────────────────────────────────────

/**
 * Grade a moneyline leg. Returns 'won' if picked team won.
 */
export function gradeMoneylineLeg(game: GameScore, pickedTeam: string): GradeResult {
    const winner = getWinner(game)
    if (!winner) return { result: 'pending' } // Draw or incomplete

    const pickedNorm = pickedTeam.toLowerCase()
    const winnerNorm = winner.toLowerCase()

    const isWin = winnerNorm.includes(pickedNorm) || pickedNorm.includes(winnerNorm)
    return {
        result: isWin ? 'won' : 'lost',
        gradedAt: new Date()
    }
}

/**
 * Grade a spread leg. Returns 'won' if team covers the spread.
 */
export function gradeSpreadLeg(game: GameScore, pickedTeam: string, line: string): GradeResult {
    const spread = parseFloat(line)
    if (isNaN(spread)) return { result: 'pending' }

    const teamScore = getTeamScore(game, pickedTeam)
    const oppScore = getOpponentScore(game, pickedTeam)

    if (teamScore === null || oppScore === null) return { result: 'pending' }

    const adjustedScore = teamScore + spread
    if (adjustedScore === oppScore) return { result: 'push', gradedAt: new Date() }

    return {
        result: adjustedScore > oppScore ? 'won' : 'lost',
        actualValue: teamScore - oppScore,
        gradedAt: new Date()
    }
}

/**
 * Grade a totals (over/under) leg.
 */
export function gradeTotalsLeg(game: GameScore, line: string): GradeResult {
    const isOver = line.toLowerCase().includes('over')
    const lineValue = parseFloat(line.replace(/[^0-9.]/g, ''))
    const total = getTotalScore(game)

    if (total === null || isNaN(lineValue)) return { result: 'pending' }

    if (total === lineValue) return { result: 'push', actualValue: total, gradedAt: new Date() }

    const result = isOver ? (total > lineValue ? 'won' : 'lost') : (total < lineValue ? 'won' : 'lost')
    return { result, actualValue: total, gradedAt: new Date() }
}

/**
 * Grade a player prop leg using ESPN box score data.
 * This is the key improvement — props no longer stay permanently "pending".
 */
export async function gradePlayerPropLeg(
    sportKey: string,
    playerName: string,
    propMarket: string | null,
    line: string,
    team: string,
    opponent: string | null
): Promise<GradeResult> {
    if (!propMarket || !line) return { result: 'pending' }

    // Parse the line: "Over 27.5" → { direction: 'over', value: 27.5 }
    const parsed = parsePropLine(line)
    if (!parsed) return { result: 'pending' }

    // Try to get the actual stat value from ESPN
    const actualValue = await getPlayerActualStat(sportKey, playerName, propMarket, team, opponent)

    if (actualValue === null) {
        console.log(`[Grader] Could not resolve prop: ${playerName} ${propMarket} ${line}`)
        return { result: 'pending' }
    }

    if (actualValue === parsed.value) {
        return { result: 'push', actualValue, gradedAt: new Date() }
    }

    const hit = parsed.direction === 'over'
        ? actualValue > parsed.value
        : actualValue < parsed.value

    return {
        result: hit ? 'won' : 'lost',
        actualValue,
        gradedAt: new Date()
    }
}

/**
 * Cached version of gradePlayerPropLeg — shares ESPN fetches across props in the same game.
 */
async function gradePlayerPropLegCached(
    sportKey: string,
    playerName: string,
    propMarket: string | null,
    line: string,
    team: string,
    opponent: string | null,
    scoreboardCache: Map<string, any>,
    summaryCache: Map<string, any>
): Promise<GradeResult> {
    if (!propMarket || !line) return { result: 'pending' }

    const parsed = parsePropLine(line)
    if (!parsed) return { result: 'pending' }

    const actualValue = await getPlayerActualStatCached(
        sportKey, playerName, propMarket, team, opponent,
        scoreboardCache, summaryCache
    )

    if (actualValue === null) {
        console.log(`[Grader] Could not resolve prop: ${playerName} ${propMarket} ${line}`)
        return { result: 'pending' }
    }

    if (actualValue === parsed.value) {
        return { result: 'push', actualValue, gradedAt: new Date() }
    }

    const hit = parsed.direction === 'over'
        ? actualValue > parsed.value
        : actualValue < parsed.value

    return {
        result: hit ? 'won' : 'lost',
        actualValue,
        gradedAt: new Date()
    }
}

/**
 * Cached version of getPlayerActualStat — avoids redundant ESPN fetches.
 */
async function getPlayerActualStatCached(
    sportKey: string,
    playerName: string,
    propMarket: string,
    team: string,
    opponent: string | null,
    scoreboardCache: Map<string, any>,
    summaryCache: Map<string, any>
): Promise<number | null> {
    const mapping = getESPNMapping(sportKey)
    if (!mapping) return null

    // Cache scoreboard per sport
    if (!scoreboardCache.has(sportKey)) {
        scoreboardCache.set(sportKey, await getScoreboard(sportKey))
    }
    const scoreboard = scoreboardCache.get(sportKey)
    if (!scoreboard?.events) return null

    const event = findESPNEvent(scoreboard.events, team, opponent)
    if (!event) return null

    const status = event.status?.type?.name || ''
    if (status !== 'STATUS_FINAL' && status !== 'STATUS_FULL_TIME') return null

    // Cache event summary per event ID
    const eventId = event.id
    if (!summaryCache.has(eventId)) {
        summaryCache.set(eventId, await getEventSummary(sportKey, eventId))
    }
    const summary = summaryCache.get(eventId)
    if (!summary) return null

    return extractPlayerStat(summary, playerName, propMarket, sportKey)
}

// ─── ESPN Box Score Resolution ───────────────────────────────────────

/**
 * Get a player's actual stat from ESPN event data.
 * Searches completed games in the sport's scoreboard.
 */
async function getPlayerActualStat(
    sportKey: string,
    playerName: string,
    propMarket: string,
    team: string,
    opponent: string | null
): Promise<number | null> {
    const mapping = getESPNMapping(sportKey)
    if (!mapping) return null

    // Get today's scoreboard to find the event ID
    const scoreboard = await getScoreboard(sportKey)
    if (!scoreboard?.events) return null

    // Find the matching event
    const event = findESPNEvent(scoreboard.events, team, opponent)
    if (!event) return null

    // Check if game is completed
    const status = event.status?.type?.name || ''
    if (status !== 'STATUS_FINAL' && status !== 'STATUS_FULL_TIME') return null

    // Fetch full event summary for box score
    const summary = await getEventSummary(sportKey, event.id)
    if (!summary) return null

    // Search for the player in box score data
    return extractPlayerStat(summary, playerName, propMarket, sportKey)
}

/**
 * Find an ESPN event matching a team + opponent.
 */
function findESPNEvent(events: any[], team: string, opponent: string | null): any | null {
    for (const event of events) {
        const competition = event.competitions?.[0]
        if (!competition) continue

        const competitors = competition.competitors || []
        const teamNames = competitors.map((c: any) => c.team?.displayName || '')

        const teamMatch = teamNames.some((n: string) => teamsMatch(team, n))
        if (!teamMatch) continue

        if (opponent) {
            const oppMatch = teamNames.some((n: string) => teamsMatch(opponent, n))
            if (oppMatch) return event
        }

        return event
    }
    return null
}

/**
 * Extract a player's stat from ESPN event summary.
 * Handles NBA, NFL, NHL, Soccer stat formats.
 */
function extractPlayerStat(summary: any, playerName: string, propMarket: string, sportKey: string): number | null {
    const normalizedPlayer = playerName.toLowerCase().trim()
    const market = propMarket.toLowerCase()

    // ESPN summary has boxscore.players[] → statistics[] → athletes[]
    const boxScore = summary.boxscore
    if (!boxScore?.players) return null

    for (const teamStats of boxScore.players) {
        for (const statGroup of teamStats.statistics || []) {
            const headers = (statGroup.labels || statGroup.names || []).map((h: string) => h.toLowerCase())
            const statIndex = findStatIndex(headers, market, sportKey)
            if (statIndex === -1) continue

            for (const athlete of statGroup.athletes || []) {
                const athleteName = (athlete.athlete?.displayName || '').toLowerCase()
                if (!athleteName.includes(normalizedPlayer) && !normalizedPlayer.includes(athleteName)) continue

                const stats = athlete.stats || []
                if (statIndex < stats.length) {
                    const val = parseFloat(stats[statIndex])
                    if (!isNaN(val)) return val
                }
            }
        }
    }

    return null
}

/**
 * Map a prop market name to the corresponding ESPN stat column index.
 */
function findStatIndex(headers: string[], market: string, sportKey: string): number {
    // NBA stat headers: MIN, FG, 3PT, FT, OREB, DREB, REB, AST, STL, BLK, TO, PF, PTS
    // NFL stat headers vary by position group
    // NHL stat headers: G, A, PTS, +/-, PIM, SOG, etc.

    const marketMappings: Record<string, string[]> = {
        'points': ['pts', 'points'],
        'rebounds': ['reb', 'rebounds'],
        'assists': ['ast', 'assists'],
        'threes': ['3pt', '3pm', 'three'],
        'steals': ['stl', 'steals'],
        'blocks': ['blk', 'blocks'],
        'goals': ['g', 'goals'],
        'shots': ['sog', 'shots on goal', 'sh', 'shots'],
        'shots on goal': ['sog', 'shots on goal'],
        'saves': ['sv', 'saves'],
        'pass_tds': ['td', 'passing td'],
        'pass_yds': ['yds', 'passing yds'],
        'rush_yds': ['yds', 'rushing yds'],
        'reception_yds': ['yds', 'receiving yds'],
        'receptions': ['rec', 'receptions'],
    }

    const searchTerms = marketMappings[market] || [market]

    for (let i = 0; i < headers.length; i++) {
        for (const term of searchTerms) {
            if (headers[i] === term || headers[i].includes(term)) return i
        }
    }

    return -1
}

// ─── Helpers ─────────────────────────────────────────────────────────

function parsePropLine(line: string): { direction: 'over' | 'under'; value: number } | null {
    const lower = line.toLowerCase()
    const direction = lower.includes('over') ? 'over' : lower.includes('under') ? 'under' : null
    if (!direction) return null

    const value = parseFloat(line.replace(/[^0-9.]/g, ''))
    if (isNaN(value)) return null

    return { direction, value }
}

function getOpponentScore(game: GameScore, teamName: string): number | null {
    if (!game.scores || game.scores.length !== 2) return null
    const teamScore = game.scores.find(s =>
        s.name.toLowerCase().includes(teamName.toLowerCase()) ||
        teamName.toLowerCase().includes(s.name.toLowerCase())
    )
    const oppScore = game.scores.find(s => s !== teamScore)
    return oppScore ? parseInt(oppScore.score) : null
}

// ─── Batch Grading ───────────────────────────────────────────────────

export interface LegToGrade {
    id: string
    sport: string
    team: string
    opponent: string | null
    bet_type: string
    line: string | null
    player: string | null
    prop_market: string | null
}

/**
 * Grade a batch of legs for a given sport.
 * Returns a map of leg ID → GradeResult.
 * Player props are graded in parallel with shared ESPN caches.
 */
export async function gradeBatch(
    legs: LegToGrade[],
    scores: GameScore[]
): Promise<Map<string, GradeResult>> {
    const results = new Map<string, GradeResult>()

    // Separate standard bets (sync) from props (async)
    const propLegs: LegToGrade[] = []

    for (const leg of legs) {
        const betType = (leg.bet_type || 'moneyline').toLowerCase()

        if (betType.includes('prop') || betType.includes('player')) {
            propLegs.push(leg)
        } else {
            const game = findMatchingGame(scores, leg.team, leg.opponent)
            if (!game) continue

            let grade: GradeResult
            if (betType === 'moneyline' || betType === 'h2h') {
                grade = gradeMoneylineLeg(game, leg.team)
            } else if (betType === 'spread' || betType === 'spreads') {
                grade = gradeSpreadLeg(game, leg.team, leg.line || '')
            } else if (betType === 'totals' || betType === 'total') {
                grade = gradeTotalsLeg(game, leg.line || '')
            } else {
                continue
            }

            results.set(leg.id, grade)
        }
    }

    // Grade all player props in parallel with shared ESPN caches
    if (propLegs.length > 0) {
        const scoreboardCache = new Map<string, any>()
        const summaryCache = new Map<string, any>()

        const propResults = await Promise.allSettled(
            propLegs.map(leg =>
                gradePlayerPropLegCached(
                    leg.sport,
                    leg.player || leg.team,
                    leg.prop_market,
                    leg.line || '',
                    leg.team,
                    leg.opponent,
                    scoreboardCache,
                    summaryCache
                ).then(grade => ({ id: leg.id, grade }))
            )
        )

        for (const result of propResults) {
            if (result.status === 'fulfilled') {
                results.set(result.value.id, result.value.grade)
            }
        }
    }

    return results
}
