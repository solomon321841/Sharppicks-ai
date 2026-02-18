import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Fetch upcoming La Liga games with moneyline odds
 */
export async function GET() {
    try {
        const apiKey = process.env.ODDS_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
        }

        // Fetch La Liga games directly
        const url = `https://api.the-odds-api.com/v4/sports/soccer_spain_la_liga/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`

        const response = await fetch(url, { cache: 'no-store' })

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch games: ${response.statusText}` }, { status: response.status })
        }

        const allGames = await response.json()

        if (!Array.isArray(allGames) || allGames.length === 0) {
            return NextResponse.json([])
        }

        // Transform to simple format with time until game and moneyline odds
        const games = allGames.slice(0, 10).map((game: any) => {
            const homeTeam = game.home_team
            const awayTeam = game.away_team
            const gameTime = new Date(game.commence_time)
            const now = new Date()

            // Calculate hours until game
            const hoursUntil = Math.round((gameTime.getTime() - now.getTime()) / (1000 * 60 * 60))
            const timeText = hoursUntil <= 0 ? 'Live' : hoursUntil === 1 ? '1h' : `${hoursUntil}h`

            // Get moneyline odds from first bookmaker
            const bookmaker = game.bookmakers?.[0]
            const h2hMarket = bookmaker?.markets?.find((m: any) => m.key === 'h2h')

            const homeOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === homeTeam)
            const awayOutcome = h2hMarket?.outcomes?.find((o: any) => o.name === awayTeam)

            const homeOdds = homeOutcome?.price
            const awayOdds = awayOutcome?.price

            return {
                team: homeTeam,
                opponent: awayTeam,
                time: timeText,
                odds: homeOdds ? (homeOdds > 0 ? `+${homeOdds}` : `${homeOdds}`) : '-',
                awayOdds: awayOdds ? (awayOdds > 0 ? `+${awayOdds}` : `${awayOdds}`) : '-',
                book: bookmaker?.title || 'Live',
                color: 'bg-yellow-600'
            }
        })

        return NextResponse.json(games)

    } catch (error: any) {
        console.error('Live games API error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
