import { getOdds } from '@/lib/odds/getOdds'
import { analyzePicks, ParlayRequest } from '@/lib/ai/analyzePicks'

export async function generateParlay(params: Omit<ParlayRequest, 'oddsData'> & { oddsData?: any[] }) {
    let oddsData = params.oddsData;

    // 1. Fetch Odds only if not provided
    const sports = Array.isArray(params.sport) ? params.sport : [params.sport];

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
            // Fail fast if no bet types remain (User only selected props)
            if (params.betTypes.length === 0) {
                return { error: `Player props are currently unavailable for this sport. Please select Moneyline or Spread.` };
            }
        }
    }

    if (!oddsData || oddsData.length === 0) {
        console.warn(`No odds data available for ${sports.join(', ')}. Skipping AI analysis.`);

        // Generate a specific helpful message based on the sport
        const sportNames = sports.map(s => {
            if (s.includes('nfl')) return 'NFL Football';
            if (s.includes('nba')) return 'NBA Basketball';
            if (s.includes('nhl')) return 'NHL Hockey';
            if (s.includes('la_liga')) return 'La Liga Soccer';
            if (s.includes('epl')) return 'EPL Soccer';
            if (s.includes('ncaab')) return 'NCAAB Basketball';
            if (s.includes('champs_league')) return 'Champions League';
            if (s.includes('soccer')) return 'Soccer';
            return 'Selected Sport';
        });

        const isNFL = sports.some(s => s.includes('nfl'));
        const isNBA = sports.some(s => s.includes('nba'));

        let message = `No games scheduled for ${sportNames.join(' & ')} today.`;

        if (isNFL) {
            message = "NFL is currently in the off-season. Please select another sport.";
        } else if (isNBA) {
            message = "No NBA games scheduled today (likely All-Star break or off-day). Try NHL or EPL!";
        } else {
            message = `No games available for ${sportNames.join(' & ')} at this time. Please try another sport.`;
        }

        return { error: message };
    }
    // 1.5 Shuffle oddsData to ensure variety across generations (CLONE FIRST)
    // We clone to avoid side-effects since oddsData is passed by reference
    let processedOdds = [...oddsData].sort(() => Math.random() - 0.5);

    // 1.6 Apply Risk-Based Filtering (Crucial for distinct Safe vs Risky picks)
    // If we only have standard markets (Moneyline/Spread), we MUST filter to force diversity.
    const isStandardOnly = !params.betTypes.some(t => t.includes('prop') || t.includes('player'));

    if (isStandardOnly) {
        if (params.riskLevel <= 4) {
            // SAFE/BALANCED: Prefer Favorites
            // Filter outcomes > +150 (Keep favorites/moderate dogs)
            processedOdds = filterOddsForRisk(processedOdds, -10000, 150);
            console.log(`[ParlayGen] Safe Filtering: Kept ${countTotalOutcomes(processedOdds)} outcomes < +150`);
        } else if (params.riskLevel >= 7) {
            // RISKY/LOTTO: Prefer Underdogs
            // Filter outcomes < +100 (Remove favorites)
            processedOdds = filterOddsForRisk(processedOdds, 100, 10000);
            console.log(`[ParlayGen] Risky Filtering: Kept ${countTotalOutcomes(processedOdds)} outcomes > +100`);
        }
    }

    // 2. AI Analysis with retry for leg count
    let attempts = 0;
    const maxAttempts = 3;
    let aiResult;

    while (attempts < maxAttempts) {
        aiResult = await analyzePicks({
            ...params,
            sport: sports.join('+'), // Pass as string for logging
            oddsData: processedOdds // Pass the CLONED and SHUFFLED data
        })

        // If the AI returned an error (e.g., API unavailable, missing key), stop retrying
        if (aiResult.error) {
            console.warn(`[ParlayGen] AI returned error: ${aiResult.error}`);
            return aiResult;
        }

        // 3. Validate leg count
        if (aiResult.legs && aiResult.legs.length === params.numLegs) {
            // 3.1 VALIDATE DUPLICATE PICKS (Basic Check)
            // If we are generating multiple parlays, we rely on the shuffle.
            break; // Success
        }

        attempts++;
        console.warn(`AI returned ${aiResult.legs?.length || 0} legs instead of ${params.numLegs}. Attempt ${attempts}/${maxAttempts}`);

        if (attempts >= maxAttempts) {
            console.error(`Failed to generate ${params.numLegs}-leg parlay after ${maxAttempts} attempts`);
            return {
                ...aiResult,
                error: `Could not generate ${params.numLegs}-leg parlay. Try fewer legs or add more sports.`
            };
        }
    }

    return aiResult
}

// Helper: Filter odds outcomes based on price range
function filterOddsForRisk(games: any[], minPrice: number, maxPrice: number): any[] {
    return games.map(game => {
        // Deep clone game to avoid mutation
        const newGame = JSON.parse(JSON.stringify(game));

        if (newGame.bookmakers) {
            newGame.bookmakers = newGame.bookmakers.map((bookie: any) => {
                bookie.markets = bookie.markets.map((market: any) => {
                    market.outcomes = market.outcomes.filter((outcome: any) => {
                        const price = outcome.price;
                        // Check if price valid number
                        if (typeof price !== 'number') return false;
                        return price >= minPrice && price <= maxPrice;
                    });
                    return market;
                }).filter((market: any) => market.outcomes.length > 0); // Remove empty markets
                return bookie;
            }).filter((bookie: any) => bookie.markets.length > 0); // Remove empty bookies
        }

        // Also handle "props" style flat structure if present (though usually standard markets use bookmakers)
        // If our enrichment flattened it? getOdds returns raw structure usually.

        return newGame;
    }).filter(game => game.bookmakers && game.bookmakers.length > 0); // Remove games with no valid outcomes
}

function countTotalOutcomes(games: any[]): number {
    let count = 0;
    games.forEach(g => {
        g.bookmakers?.forEach((b: any) => {
            b.markets?.forEach((m: any) => {
                count += m.outcomes?.length || 0;
            });
        });
    });
    return count;
}
