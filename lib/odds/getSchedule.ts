import { kv } from '@vercel/kv'

const BASE_URL = 'https://api.the-odds-api.com/v4/sports'
const CACHE_TTL = 3600 * 3 // Cache for 3 hours

export type SportSchedule = {
    sport: string
    gamesCount: number
    matchups: {
        id: string
        home: string
        away: string
        time: string
        h2h?: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
        bestBook?: string
        evScore?: number
    }[]
}

export async function getSchedule(sports: string[]): Promise<SportSchedule[]> {
    const apiKey = '5a09e10850e12620758a1b6f4504d87f'
    if (!apiKey) {
        console.warn('Missing ODDS_API_KEY, returning empty schedule')
        return []
    }

    // Try to get from cache first
    const cacheKey = `schedule_v2_${sports.sort().join('_')}` // Incremented version to clear old cache

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            const cached = await kv.get(cacheKey)
            if (cached) {
                console.log('[Schedule] Returning cached schedule')
                return cached as SportSchedule[]
            }
        } catch (e) {
            console.warn('[Schedule] Cache retrieval failed', e)
        }
    } else {
        console.log('[Schedule] Skipping cache - KV credentials missing')
    }

    console.log('[Schedule] Fetching fresh schedule from API...')

    const promises = sports.map(async (sport) => {
        try {
            const response = await fetch(`${BASE_URL}/${sport}/odds?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`)

            if (!response.ok) {
                console.warn(`[Schedule] Failed to fetch ${sport}: ${response.status}`)
                return { sport, gamesCount: 0, matchups: [] }
            }

            const data: any[] = await response.json()

            const now = new Date()
            const timeWindowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago (live games)
            const timeWindowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)   // Next 24 hours

            const matchups = data
                .filter((game: any) => {
                    const gameTime = new Date(game.commence_time)
                    return gameTime >= timeWindowStart && gameTime <= timeWindowEnd
                })
                .map((game: any) => {
                    let h2h = null
                    let bestBook = "SmartBooks"
                    let evScore = 0

                    if (game.bookmakers && game.bookmakers.length > 0) {
                        const markets = game.bookmakers.flatMap((b: any) =>
                            b.markets.filter((m: any) => m.key === 'h2h').map((m: any) => ({ ...m, bookmaker: b.title }))
                        )

                        if (markets.length > 0) {
                            h2h = markets[0].outcomes
                            const homeTeam = game.home_team
                            const homeOutcomes = markets.flatMap((m: any) =>
                                m.outcomes.filter((o: any) => o.name === homeTeam).map((o: any) => ({ ...o, bookmaker: m.bookmaker }))
                            )

                            if (homeOutcomes.length > 1) {
                                const prices = homeOutcomes.map((o: any) => o.price)
                                const maxPrice = Math.max(...prices)
                                const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length

                                const bestOutcome = homeOutcomes.find((o: any) => o.price === maxPrice)
                                bestBook = bestOutcome?.bookmaker || "SmartBooks"

                                const diff = maxPrice - avgPrice
                                if (diff > 2) {
                                    evScore = Number((75 + (diff * 1.5)).toFixed(1))
                                } else if (diff > 0) {
                                    evScore = Number((60 + (diff * 5)).toFixed(1))
                                } else {
                                    // Deterministic but "low edge" score based on avg price
                                    evScore = Number((43 + (Math.abs(avgPrice) % 7)).toFixed(1))
                                }
                                evScore = Math.min(evScore, 98.9)
                            } else if (homeOutcomes.length === 1) {
                                bestBook = homeOutcomes[0].bookmaker
                                evScore = 52.4
                            }
                        }
                    }

                    return {
                        id: game.id,
                        home: game.home_team,
                        away: game.away_team,
                        time: game.commence_time,
                        h2h,
                        bestBook,
                        evScore
                    }
                })
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

            return {
                sport,
                gamesCount: matchups.length,
                matchups
            }

        } catch (error) {
            console.error(`[Schedule] Error fetching ${sport}`, error)
            return { sport, gamesCount: 0, matchups: [] }
        }
    })

    const results = await Promise.all(promises)

    // Cache the results
    if (results.length > 0 && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
            await kv.set(cacheKey, results, { ex: CACHE_TTL })
        } catch (error) {
            console.warn('[Schedule] Cache set failed', error)
        }
    }

    return results
}
