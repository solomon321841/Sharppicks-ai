import { getOdds } from '../odds/getOdds'
import { analyzePicks } from './analyzePicks'
import { enforceLegCount, enforceBetTypes } from './parlayMath'
import { getMultiSportContext } from '../stats'
import { buildMarketConsensus } from '../odds/lineShopping'

export async function generateParlay(params: {
    sports: string[],
    riskLevel: number,
    numLegs: number,
    betTypes: string[],
    oddsData?: any[],
    sportFocus?: string
}) {
    let oddsData = params.oddsData
    const sports = params.sports

    // ── 1. Fetch live odds ──────────────────────────────────────────
    if (!oddsData) {
        let markets = 'h2h,spreads,totals'
        const hasProps = params.betTypes.some(t => t.includes('prop') || t.includes('player'))

        if (hasProps) {
            const propMarkets = getPropsMarketsForSports(sports)
            if (propMarkets.length > 0) {
                markets += `,${propMarkets.join(',')}`
            }
        }

        oddsData = await getOdds(sports, 'us', markets)

        // Validate props availability
        if (hasProps && oddsData && oddsData.length > 0) {
            const propsFound = oddsData.some((game: any) =>
                game.bookmakers?.some((b: any) =>
                    b.markets?.some((m: any) => m.key.startsWith('player'))
                )
            )

            if (!propsFound) {
                console.warn('[ParlayGen] Props requested but none returned from API.')
                params.betTypes = params.betTypes.filter(t => !t.includes('prop') && !t.includes('player'))

                if (params.betTypes.length === 0) {
                    return {
                        error: 'Player props are not available for the selected sports right now. Try selecting Moneyline or Spread instead.'
                    }
                }
            }
        }

        // Fallback: retry with standard markets if props fetch failed entirely
        if ((!oddsData || oddsData.length === 0) && hasProps) {
            console.warn('[ParlayGen] No data with props. Retrying standard markets...')
            markets = 'h2h,spreads,totals'
            oddsData = await getOdds(sports, 'us', markets)

            params.betTypes = params.betTypes.filter(t => !t.includes('prop') && !t.includes('player'))
            if (params.betTypes.length === 0) {
                return {
                    error: 'Player props are not available for the selected sports right now. Try selecting Moneyline or Spread instead.'
                }
            }
        }
    }

    // ── 2. Validate we have data ────────────────────────────────────
    if (!oddsData || oddsData.length === 0) {
        return {
            error: "No live games found for the selected sports. Sportsbooks may not have lines posted yet — check back closer to game time."
        }
    }

    // ── 3. Fetch real stats + line shopping (parallel, non-blocking) ─
    let statsContext: Map<string, any> = new Map()
    let shoppingData: Map<string, any> = new Map()

    try {
        const gamesForStats = oddsData.map((g: any) => ({
            id: g.id,
            home_team: g.home_team,
            away_team: g.away_team,
            sport_key: g.sport_key
        }))

        const [stats, shopping] = await Promise.all([
            getMultiSportContext(sports, gamesForStats).catch(e => {
                console.warn('[ParlayGen] Stats fetch failed (non-fatal):', e)
                return new Map()
            }),
            Promise.resolve(buildMarketConsensus(oddsData))
        ])

        statsContext = stats
        shoppingData = shopping
        console.log(`[ParlayGen] Stats: ${statsContext.size} games | Shopping: ${shoppingData.size} games`)
    } catch (e) {
        console.warn('[ParlayGen] Stats/Shopping enrichment failed (non-fatal):', e)
    }

    // ── 4. Enforce constraints ──────────────────────────────────────
    const targetLegs = enforceLegCount(params.riskLevel, params.numLegs)
    const allowedBetTypes = enforceBetTypes(params.riskLevel, params.betTypes)

    // Shuffle games for variety between generations
    const shuffledOdds = [...oddsData].sort(() => Math.random() - 0.5)

    // ── 5. Single AI call (analyzePicks handles its own retries) ────
    const result = await analyzePicks({
        sports: sports.join('+'),
        riskLevel: params.riskLevel,
        numLegs: targetLegs,
        betTypes: allowedBetTypes,
        oddsData: shuffledOdds,
        statsContext,
        shoppingData,
        sportFocus: params.sportFocus
    })

    return result
}

// ─── Sport-specific prop markets ───────────────────────────────────────
function getPropsMarketsForSports(sports: string[]): string[] {
    const propMarkets: string[] = []

    const isNBA = sports.some(s => s.includes('nba') || s.includes('basketball'))
    const isNFL = sports.some(s => s.includes('nfl') || s.includes('football'))
    const isNHL = sports.some(s => s.includes('nhl') || s.includes('hockey'))
    const isSoccer = sports.some(s =>
        s.includes('soccer') || s.includes('epl') || s.includes('la_liga') ||
        s.includes('mls') || s.includes('champs_league')
    )
    const isNCAAB = sports.some(s => s.includes('ncaab') || s.includes('ncaa'))

    if (isNBA || isNCAAB) propMarkets.push('player_points', 'player_rebounds', 'player_assists', 'player_threes')
    if (isNFL) propMarkets.push('player_pass_tds', 'player_pass_yds', 'player_rush_yds', 'player_reception_yds', 'player_anytime_td')
    if (isNHL) propMarkets.push('player_points', 'player_goals', 'player_assists', 'player_shots_on_goal')
    if (isSoccer) propMarkets.push('player_goal_scorer_anytime', 'player_goal_scorer_first', 'player_shots_on_goal', 'player_shots', 'player_assists')

    return propMarkets
}
