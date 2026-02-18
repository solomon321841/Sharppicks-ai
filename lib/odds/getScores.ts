const BASE_URL = 'https://api.the-odds-api.com/v4/sports'

export interface GameScore {
    id: string
    sport_key: string
    sport_title: string
    commence_time: string
    completed: boolean
    home_team: string
    away_team: string
    scores: { name: string; score: string }[] | null
    last_update: string | null
}

/**
 * Fetch completed game scores from The Odds API.
 * Uses the /scores endpoint with daysFrom=3 to get results from the last 3 days.
 */
export async function getScores(sportKey: string): Promise<GameScore[]> {
    const apiKey = process.env.ODDS_API_KEY
    if (!apiKey) {
        throw new Error('Missing ODDS_API_KEY')
    }

    const url = `${BASE_URL}/${sportKey}/scores?apiKey=${apiKey}&daysFrom=3`
    console.log(`[Scores] Fetching scores for ${sportKey}...`)

    const response = await fetch(url, { next: { revalidate: 0 } }) // No cache for scores

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        if (errorBody.error_code === 'OUT_OF_USAGE_CREDITS') {
            throw new Error('Odds API credits exhausted.')
        }
        console.warn(`[Scores] Failed for ${sportKey}: ${response.status} ${response.statusText}`)
        return []
    }

    const data: GameScore[] = await response.json()

    // Only return completed games with valid scores
    const completed = data.filter(g => g.completed && g.scores && g.scores.length === 2)
    console.log(`[Scores] ${sportKey}: ${completed.length} completed games (of ${data.length} total)`)

    return completed
}

/**
 * Determines the winner of a completed game.
 * Returns the team name that won, or null for a draw.
 */
export function getWinner(game: GameScore): string | null {
    if (!game.scores || game.scores.length !== 2) return null
    const [team1, team2] = game.scores
    const s1 = parseInt(team1.score)
    const s2 = parseInt(team2.score)
    if (isNaN(s1) || isNaN(s2)) return null
    if (s1 > s2) return team1.name
    if (s2 > s1) return team2.name
    return null // Draw
}

/**
 * Gets the total combined score of a completed game.
 */
export function getTotalScore(game: GameScore): number | null {
    if (!game.scores || game.scores.length !== 2) return null
    const s1 = parseInt(game.scores[0].score)
    const s2 = parseInt(game.scores[1].score)
    if (isNaN(s1) || isNaN(s2)) return null
    return s1 + s2
}

/**
 * Gets the score for a specific team in a game.
 */
export function getTeamScore(game: GameScore, teamName: string): number | null {
    if (!game.scores) return null
    const team = game.scores.find(s =>
        normalizeTeam(s.name) === normalizeTeam(teamName)
    )
    return team ? parseInt(team.score) : null
}

/**
 * Normalize team name for fuzzy matching.
 * e.g., "Los Angeles Lakers" → "lakers", "LA Lakers" → "lakers"
 */
export function normalizeTeam(name: string): string {
    return name
        .toLowerCase()
        .replace(/^(the|los|san|new|las|st\.?|golden|oklahoma|portland|minnesota|milwaukee|sacramento|charlotte|cleveland|indiana|memphis|orlando|detroit|toronto|washington|phoenix|utah|denver|atlanta|brooklyn|dallas|houston|chicago|miami|boston|philadelphia)\s+/gi, '')
        .replace(/\s*(city|state|trail|thunder)\s*/gi, ' ')
        .trim()
        .replace(/\s+/g, ' ')
}

/**
 * Finds a completed game that matches a bet leg.
 * Matches by team name (fuzzy) and sport.
 */
export function findMatchingGame(
    scores: GameScore[],
    team: string,
    opponent: string | null
): GameScore | null {
    const normalizedTeam = normalizeTeam(team)
    const normalizedOpponent = opponent ? normalizeTeam(opponent) : null

    for (const game of scores) {
        const home = normalizeTeam(game.home_team)
        const away = normalizeTeam(game.away_team)

        // Match: team is either home or away
        const teamMatch = home.includes(normalizedTeam) || away.includes(normalizedTeam) ||
            normalizedTeam.includes(home) || normalizedTeam.includes(away)

        if (!teamMatch) continue

        // If we have an opponent, verify it too
        if (normalizedOpponent) {
            const oppMatch = home.includes(normalizedOpponent) || away.includes(normalizedOpponent) ||
                normalizedOpponent.includes(home) || normalizedOpponent.includes(away)
            if (oppMatch) return game
        }

        return game
    }

    return null
}
