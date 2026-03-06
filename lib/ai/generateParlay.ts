import { getOdds } from '../odds/getOdds';
import { analyzePicks } from './analyzePicks';
import { enforceLegCount, enforceBetTypes } from './parlayMath';

export async function generateParlay(params: {
    sports: string[],
    riskLevel: number,
    numLegs: number,
    betTypes: string[],
    oddsData?: any[] // Optional manual injection for tests
}) {
    let oddsData = params.oddsData;
    const sports = params.sports;

    // 1. Fetch live odds if not provided
    if (!oddsData) {
        // Determine markets to fetch based on user selection
        let markets = 'h2h,spreads,totals';
        const hasProps = params.betTypes.some(t => t.includes('prop') || t.includes('player'));

        if (hasProps) {
            // Add sport-specific prop markets
            const isNBA = sports.some(s => s.includes('nba') || s.includes('basketball'));
            const isNFL = sports.some(s => s.includes('nfl') || s.includes('football'));
            const isNHL = sports.some(s => s.includes('nhl') || s.includes('hockey'));
            const isSoccer = sports.some(s => s.includes('soccer') || s.includes('epl') || s.includes('la_liga') || s.includes('mls') || s.includes('champs_league'));

            const propMarkets = [];
            if (isNBA) propMarkets.push('player_points', 'player_rebounds', 'player_assists', 'player_threes');
            if (isNFL) propMarkets.push('player_pass_tds', 'player_pass_yds', 'player_rush_yds', 'player_reception_yds', 'player_anytime_td');
            if (isNHL) propMarkets.push('player_points', 'player_goals', 'player_assists', 'player_shots_on_goal');
            if (isSoccer) propMarkets.push('player_goal_scorer_anytime', 'player_goal_scorer_first', 'player_shots_on_goal', 'player_shots', 'player_assists');

            if (propMarkets.length > 0) {
                markets += `,${propMarkets.join(',')}`;
            }
        }

        oddsData = await getOdds(sports, 'us', markets)

        // Validate if we actually received props data
        if (hasProps && oddsData && oddsData.length > 0) {
            const propsFound = oddsData.some((game: any) =>
                game.bookmakers?.some((b: any) =>
                    b.markets?.some((m: any) => m.key.startsWith('player'))
                )
            );

            if (!propsFound) {
                console.warn('[ParlayGen] Requested props but API returned none. Falling back to standard.');
                params.betTypes = params.betTypes.filter(t => !t.includes('prop') && !t.includes('player'));

                if (params.betTypes.length === 0) {
                    return { error: `Player props are currently unavailable for this sport. Please select Moneyline or Spread.` };
                }
            }
        }

        // Fallback: If no odds found for props (due to API limits or no markets), try standard markets
        if ((!oddsData || oddsData.length === 0) && hasProps) {
            console.warn(`[ParlayGen] No props found for ${sports} (likely 429 or empty). Retrying with standard markets.`);
            markets = 'h2h,spreads,totals';
            // Retry with standard markets
            oddsData = await getOdds(sports, 'us', markets);

            if (oddsData && oddsData.length > 0) {
                // Remove prop bet types since they aren't available to prevent AI confusion
                params.betTypes = params.betTypes.filter(t => !t.includes('prop') && !t.includes('player'));

                // Fail fast if no bet types remain (User only selected props)
                if (params.betTypes.length === 0) {
                    return { error: `Player props are currently unavailable for this sport. Please select Moneyline or Spread.` };
                }
            }
        }
    }

    if (!oddsData || oddsData.length === 0) {
        return { error: "No live games found. Sportsbooks may not have lines up yet for today's games." };
    }

    // Shuffle games to ensure variety on each generate hit
    const processedOdds = [...oddsData].sort(() => Math.random() - 0.5);

    // 1. Enforce Leg Count and Bet Types
    let targetLegs = enforceLegCount(params.riskLevel, params.numLegs);
    const allowedBetTypes = enforceBetTypes(params.riskLevel, params.betTypes);

    // EXTRA PROTECTION: If we don't allow same-game parlays (Risk 1-5), 
    // we can't have more legs than unique games.
    if (params.riskLevel <= 5 && processedOdds.length > 0) {
        const numUniqueGames = processedOdds.length;
        if (targetLegs > numUniqueGames) {
            console.warn(`[ParlayGen] Reducing legs from ${targetLegs} to ${numUniqueGames} because only ${numUniqueGames} games match selection without correlation.`);
            targetLegs = numUniqueGames;
        }
    }

    // 2. AI Analysis with retry loop
    let attempts = 0;
    const maxAttempts = 5;
    let aiResult: any;

    while (attempts < maxAttempts) {
        aiResult = await analyzePicks({
            ...params,
            numLegs: targetLegs,
            betTypes: allowedBetTypes,
            sport: sports.join('+'),
            oddsData: processedOdds
        });

        // If the AI returned an error (e.g., API unavailable), stop retrying
        if (aiResult.error) {
            console.warn(`[ParlayGen] AI returned error: ${aiResult.error}`);
            return aiResult;
        }

        // If validation passed, return the result
        if (aiResult.legs && aiResult.legs.length >= 2) {
            console.log(`[ParlayGen] Success after ${attempts + 1} attempts`);
            return aiResult;
        }

        attempts++;
        console.warn(`[ParlayGen] Retry attempt ${attempts}/${maxAttempts}...`);
    }

    // If we've exhausted retries, return the last failure description
    return {
        error: "Constraints Too Strict",
        details: "Unable to find enough games matching your selected risk and bet types. Try selecting more sports or lower your risk."
    };
}
