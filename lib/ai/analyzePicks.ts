import Anthropic from '@anthropic-ai/sdk'
import {
    calculateCombinedParlayMetrics,
    validateRiskLevel,
    enforceLegCount,
    enforceBetTypes,
    checkCorrelation,
    getUnitSize
} from './parlayMath'

export type ParlayRequest = {
    sport: string | string[] // Support both single and multi-sport
    riskLevel: number // 1-10
    numLegs: number
    betTypes: string[] // ['moneyline', 'spread', 'totals']
    oddsData: any[] // From getOdds
}

export async function analyzePicks(request: ParlayRequest) {
    // 1. Enforce Spec Constraints dynamically before hitting AI
    request.numLegs = enforceLegCount(request.riskLevel, request.numLegs);
    request.betTypes = enforceBetTypes(request.riskLevel, request.betTypes);

    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('Missing ANTHROPIC_API_KEY, returning mock AI response')
        return getMockAIResponse(request)
    }

    // Log input data for debugging (first 3 games)
    console.log('[AI Input Data Sample]:', JSON.stringify(request.oddsData.slice(0, 3).map(g => ({
        home: g.home_team,
        away: g.away_team,
        bookmakers: g.bookmakers?.[0]?.markets?.map((m: any) => ({ key: m.key, outcomes: m.outcomes }))
    })), null, 2));

    // Normalize sport to string
    const sportString = Array.isArray(request.sport) ? request.sport.join('+') : request.sport;
    const isMultiSport = sportString.includes('+');
    const sportsList = sportString.split('+');


    // Minify Data to reduce tokens (Fix for 429 Rate Limit)
    // 1. Limit to 15 games max
    // 2. Extract only the most relevant bookmaker and markets
    const simplifiedGames = request.oddsData.slice(0, 15).map(g => {
        // Determine required markets based on request
        const requiredMarkets: string[] = [];
        if (request.betTypes.includes('moneyline')) requiredMarkets.push('h2h');
        if (request.betTypes.includes('spread')) requiredMarkets.push('spreads');
        if (request.betTypes.includes('totals')) requiredMarkets.push('totals');
        if (request.betTypes.some(t => t.includes('prop'))) requiredMarkets.push('player_'); // partial match

        // Helper to check if a bookmaker has ANY of the required markets
        const hasRequiredMarkets = (b: any) => {
            if (requiredMarkets.length === 0) return true;
            return requiredMarkets.some(req =>
                b.markets.some((m: any) => m.key.startsWith(req.replace('player_', 'player')))
            );
        };

        // 1. Filter bookmakers that have at least one valid market
        const validBookmakers = g.bookmakers?.filter(hasRequiredMarkets) || [];

        if (validBookmakers.length === 0) return null;

        // 2. Select best from valid ones
        const bookmaker = validBookmakers.find((b: any) =>
            ['draftkings', 'fanduel', 'betmgm', 'bovada'].includes(b.key)
        ) || validBookmakers[0];

        // Filter markets to only those requested
        const relevantMarkets = bookmaker.markets.filter((m: any) => {
            const isH2H = m.key === 'h2h' && request.betTypes.includes('moneyline');
            const isSpread = m.key === 'spreads' && request.betTypes.includes('spread');
            const isTotal = m.key === 'totals' && request.betTypes.includes('totals');
            const isProp = m.key.startsWith('player_') && request.betTypes.some(t => t.includes('prop') || t.includes('player'));

            return isH2H || isSpread || isTotal || isProp;
        });

        if (relevantMarkets.length === 0) return null;

        return {
            id: g.id,
            home: g.home_team,
            away: g.away_team,
            start: g.commence_time,
            book: bookmaker.key,
            markets: relevantMarkets.map((m: any) => ({
                key: m.key,
                outcomes: m.outcomes.map((o: any) => ({
                    name: o.description || o.name, // Use description (Player Name) if available, fallback to name (e.g. Over/Under)
                    price: o.price,
                    point: o.point // Explicitly ensure point is passed
                }))
            }))
        };
    }).filter(g => g !== null);

    console.log(`[AI Optimization] Reduced ${request.oddsData.length} games to ${simplifiedGames.length} minified inputs.`);

    // Format enriched data for AI analysis with player context
    const enrichedGamesForAI = simplifiedGames.map(g => ({
        id: g.id,
        matchup: `${g.away} @ ${g.home}`,
        start: g.start,
        markets: g.markets.map((m: any) => ({
            type: m.key,
            options: m.outcomes.map((o: any) => ({
                selection: o.name,
                odds: o.price,
                line: o.point,
                // AI Context from enrichment
                player: o.playerName,
                playerRole: o.playerImportance, // star/starter/bench
                lineThreshold: o.lineThreshold,
                difficulty: o.lineDifficulty // very_easy to very_hard
            }))
        }))
    }));

    const prompt = `
    You are the SharpPicks AI parlay engine. You generate sports betting parlay recommendations using ONLY verified data from The Odds API. You follow these rules with zero exceptions:

    DATA INTEGRITY:
    - You ONLY use odds, teams, and games that exist in the current API response.
    - You NEVER invent, estimate, or hallucinate any odds or game data.
    - If no games are available for the requested sport, return: "No games currently available for [sport]. Try again later."
    - If you cannot build a parlay within the risk range, return: "No qualifying parlays available at Risk [X] for [sport] with [bet type]. Try adjusting your settings."

    RISK CALIBRATION (NON-NEGOTIABLE):
    - Risk 1: Combined odds +120 to +300 | Max 3 legs | ML + Spreads only
    - Risk 2: Combined odds +180 to +480 | Max 3 legs | ML + Spreads only
    - Risk 3: Combined odds +300 to +720 | Max 3 legs | ML + Spreads only
    - Risk 4: Combined odds +450 to +960 | Max 4 legs | ML + Spreads + Totals
    - Risk 5: Combined odds +600 to +1500 | Max 4 legs | ML + Spreads + Totals
    - Risk 6: Combined odds +800 to +2200 | Max 5 legs | All bet types
    - Risk 7: Combined odds +1200 to +3000 | Max 5 legs | All bet types
    - Risk 8: Combined odds +1600 to +4800 | Max 6 legs | All bet types
    - Risk 9: Combined odds +2500 to +8000 | Max 7 legs | All bet types
    - Risk 10: Combined odds +4000 to +20000 | Max 7+ legs | All bet types

    ODDS CALCULATION PROCEDURE:
    1. For each potential leg, calculate implied probability from the American odds.
    2. Remove the vig by normalizing both sides of the market to sum to 100%.
    3. Multiply no-vig fair probabilities of all selected legs to get combined probability.
    4. Convert combined probability back to American odds.
    5. VERIFY the combined odds fall within the target range for the selected risk level.
    6. If out of range: swap legs, add/remove a leg, or return "no qualifying parlays."

    CORRELATION RULES:
    - At Risk 1–5: Do NOT combine legs from the same game.
    - At Risk 6+: Same-game legs are allowed but flag them as correlated in the output.
    - Never combine a team ML with an Over/Under from the same game at Risk 1–7.
    
    TARGET SPECS FOR THIS REQUEST:
    - Sport(s): ${sportString}
    - Risk Level: ${request.riskLevel}
    - Num Legs MAX: ${request.numLegs} (Minimum 2 required)
    - Allowed Bet Types: ${request.betTypes.join(', ')}

    AVAILABLE GAMES WITH API ODDS:
    ${JSON.stringify(enrichedGamesForAI)}

    OUTPUT FORMAT:
    You MUST output valid JSON ONLY matching exactly this schema:
    {
      "legs": [
        {
          "game_id": "valid_id_from_data", 
          "team": "Player's Team Name",
          "player": "Player Name (if prop)",
          "opponent": "Opponent Name",
          "bet_type": "type from requested list",
          "line": "Over 210.5", 
          "odds": "-115",
          "fair_prob": "53.2%",
          "sportsbook": "FanDuel",
          "reasoning": "Quick 2-sentence sharp logic"
        }
      ],
      "totalOdds": "+500",
      "combined_fair_prob": "16.7%",
      "risk_confirmation": "Risk 4/10 — VERIFIED: +500 is within +500 to +800"
    }

    WHAT YOU MUST NEVER DO:
    - Never generate a parlay with combined odds outside the risk level range.
    - Never include a game or odds not in the current API data.
    - Never include props at Risk 1-5.
    - Never say "approximately" or "around" for odds — use exact figures from the API.

    CRITICAL INSTRUCTIONS:
    1. YOU CAN RETURN UP TO ${request.numLegs} PICKS (Minimum 2). If you hit the target odds with fewer legs, that is perfectly fine.
    2. **BET TYPE VARIETY (STRICT):**
    `

    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    })

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = '';

    while (attempts < maxAttempts) {
        try {
            console.log(`[AI] Requesting analysis from Anthropic (Attempt ${attempts + 1}/${maxAttempts})...`);

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Anthropic request timed out after 45 seconds')), 45000);
            });

            const aiPromise = anthropic.messages.create({
                model: 'claude-3-haiku-20240307',
                max_tokens: 3000, // Increased slightly for safety
                temperature: 0.7,
                system: "You are a sharp sports bettor AI. Return only valid JSON. For numbers, do NOT use a plus sign (e.g. use 1.5 not +1.5 for lines, but DO use it for odds like +150).",
                messages: [{ role: 'user', content: prompt + (attempts > 0 ? `\n\nPREVIOUS ATTEMPT WAS INVALID. ERROR: ${lastError}\nPLEASE FIX.` : '') }],
            });

            // Race against timeout
            const msg = await Promise.race([aiPromise, timeoutPromise]) as Anthropic.Messages.Message;

            const text = (msg.content[0] as any).text
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            let jsonStr = text;
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonStr = text.substring(firstBrace, lastBrace + 1);
            }


            const result = JSON.parse(jsonStr)

            // Normalize Odds (Ensure + sign for positive)
            result.legs = result.legs.map((l: any) => {
                let odds = l.odds;
                if (!String(odds).startsWith('-') && !String(odds).startsWith('+')) {
                    if (parseInt(odds) > 0) odds = '+' + odds;
                }
                return { ...l, odds: String(odds) };
            });

            // Validate Result
            let valid = true;
            console.log(`Debug Attempt ${attempts + 1} | Risk: ${request.riskLevel} | Legs: ${JSON.stringify(result.legs.map((l: any) => l.odds))}`);

            if (request.betTypes.length > 0) {
                const hasWrongType = result.legs.some((l: any) => {
                    let actual = l.bet_type;
                    // Normalize AI output
                    if (actual === 'prop' || actual === 'player_prop') actual = 'player_props';
                    if (actual === 'total' || actual === 'over/under') actual = 'totals';
                    if (actual === 'spreads') actual = 'spread';

                    return !request.betTypes.includes(actual);
                });

                if (hasWrongType) {
                    lastError = `Wrong bet_type. Expected one of: ${request.betTypes.join(', ')}. Got: ${result.legs.map((l: any) => l.bet_type).join(', ')}`;
                    valid = false;
                }
            }
            if (valid) {
                const hasInvalidOdds = result.legs.some((l: any) => {
                    if (l.odds === undefined && l.price !== undefined) l.odds = l.price;
                    if (!l.odds) return true;
                    return isNaN(parseInt(String(l.odds)));
                });

                if (hasInvalidOdds) {
                    lastError = "Missing or invalid odds.";
                    valid = false;
                }

                const hasMissingReasoning = result.legs.some((l: any) => !l.reasoning || l.reasoning.length < 10);
                if (valid && hasMissingReasoning) {
                    lastError = "One or more legs are missing AI reasoning.";
                    valid = false;
                }
            }

            if (valid) {
                // Strict Risk Validation Module Checks
                const validLegs = result.legs.map((l: any) => ({
                    game_id: l.game_id,
                    bet_type: l.bet_type,
                    odds: parseInt(String(l.odds).replace('+', ''))
                }));

                // 1. Check Leg Limits again just in case
                if (validLegs.length > request.numLegs) {
                    lastError = `Generated too many legs (${validLegs.length}). Spec limit is ${request.numLegs} for Risk Level ${request.riskLevel}.`;
                    valid = false;
                }

                // 2. Correlation Detector (Spec Rule 6)
                if (valid) {
                    const correlationCheck = checkCorrelation(validLegs, request.riskLevel);
                    if (!correlationCheck.valid) {
                        lastError = `Correlation Violation: ${correlationCheck.reason}`;
                        valid = false;
                    }
                }

                // 3. Mathematical Odds Calculation (Spec Rule 3)
                if (valid) {
                    const mathCalc = calculateCombinedParlayMetrics(validLegs);
                    const calcAmerican = mathCalc.combinedAmericanOdds;

                    // 4. Strict Range Gate Check (Spec Rule 2 & 3.5)
                    const rangeValid = validateRiskLevel(request.riskLevel, calcAmerican);
                    if (!rangeValid) {
                        lastError = `Risk Level Boundary Violation. Expected Risk Level ${request.riskLevel} target range. Calculated true American odds are ${calcAmerican > 0 ? '+' + calcAmerican : calcAmerican}. This parlay was rejected by the engine.`;
                        valid = false;
                    } else {
                        // Trust math engine, not AI's estimation
                        result.totalOdds = calcAmerican > 0 ? `+${calcAmerican}` : `${calcAmerican}`;
                        result.true_implied_prob = mathCalc.combinedFairProb;
                        console.log(`[VALIDATION PASSED] Risk ${request.riskLevel}. Math Engine Output: ${result.totalOdds}`);
                    }
                }
            }

            if (valid) {
                const legSignatures = new Set();
                const validGameIds = new Set(request.oddsData.map(g => g.id));
                const allTeams = new Set(request.oddsData.flatMap(g => [g.home_team, g.away_team]));

                const hasIssues = result.legs.some((l: any) => {
                    // Check 1: Duplicate Leg (Same Game + Same Bet + Same Line/Player)
                    const sig = `${l.game_id}-${l.bet_type}-${l.player || l.team}-${l.line}`;
                    if (legSignatures.has(sig)) {
                        lastError = `Duplicate exact leg picked: ${sig}`;
                        return true;
                    }
                    legSignatures.add(sig);

                    // Check 2: Existence (Must be in provided data)
                    if (!validGameIds.has(l.game_id)) {
                        lastError = `Hallucinated Game ID: ${l.game_id}. Must use IDs from provided data.`;
                        return true;
                    }

                    // Check 3: Team Validation (Teams must match that Game ID)
                    const game = request.oddsData.find(g => g.id === l.game_id);
                    if (game) {
                        const isHome = (l.team === game.home_team) || (l.team && typeof l.team === 'string' && l.team.includes(game.home_team));
                        const isAway = (l.team === game.away_team) || (l.team && typeof l.team === 'string' && l.team.includes(game.away_team));

                        // Auto-fill opponent if missing and team is valid
                        if (!l.opponent) {
                            if (isHome) l.opponent = game.away_team;
                            else if (isAway) l.opponent = game.home_team;
                        }

                        // IMPROVED VALIDATION:
                        // 1. Team must be one of the two teams in the game
                        if (!isHome && !isAway) {
                            // Relaxed check for props if strict check fails, but still must be reasonable
                            // Try fuzzy match?
                            lastError = `Team mismatch for Game ${l.game_id}. Picked: ${l.team}, Valid: ${game.home_team} vs ${game.away_team}`;
                            return true;
                        }

                        // 2. Opponent must be the OTHER team
                        const isOpponentHome = (l.opponent === game.home_team) || (l.opponent && typeof l.opponent === 'string' && l.opponent.includes(game.home_team));
                        const isOpponentAway = (l.opponent === game.away_team) || (l.opponent && typeof l.opponent === 'string' && l.opponent.includes(game.away_team));

                        if (!isOpponentHome && !isOpponentAway) {
                            lastError = `Opponent mismatch for Game ${l.game_id}. Picked: ${l.opponent}. Valid: ${game.home_team} or ${game.away_team}`;
                            return true;
                        }

                        if (l.team === l.opponent) {
                            lastError = `Logic Error: Player/Team is playing against themselves! Team: ${l.team}, Opponent: ${l.opponent}`;
                            return true;
                        }
                    }

                    return false;
                });

                if (hasIssues) {
                    valid = false;
                    console.log(`[AI Validation Failure Attempt ${attempts + 1}]:`, lastError);
                } else if (!valid) {
                    // It was already invalid before the team/location check
                    console.log(`[AI Validation Failure Attempt ${attempts + 1}]:`, lastError);
                }
            }

            if (valid) {
                // Add unit sizing string
                result.unit_size = getUnitSize(request.riskLevel);

                // Calculate Dynamic Confidence based on true prob
                result.confidence = Math.min(99, Math.max(1, Math.round(result.true_implied_prob * 200))); // Scaled for display purposes

                // Final Polish: Entrich legs with Sport and normalize fields
                result.legs = result.legs.map((leg: any) => {
                    const game = request.oddsData.find(g => g.id === leg.game_id);
                    return {
                        ...leg,
                        sport: game?.sport_key || 'Mixed', // Inject sport key
                        game_time: game?.commence_time || null, // Inject game time for result tracking
                        betType: leg.bet_type, // Provide camelCase alias for compatibility
                        bet_type: leg.bet_type
                    };
                });

                return result;
            }
            attempts++;

        } catch (error: any) {
            console.error('AI Analysis failed:', error)

            // Handle Rate Limiting (429)
            if (error.status === 429 || error.code === 'rate_limit_error') {
                console.warn('Rate limit hit. Waiting 2 seconds before retry...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            // Handle Credit Balance / Billing Issues
            if (error.status === 400 && error.error?.type === 'invalid_request_error' && error.error?.message?.includes('credit balance')) {
                console.warn('[AI] Insufficient credits detected. Falling back to error state.');
                return getMockAIResponse(request, 'Insufficient credits');
            }

            // Handle Overloaded / Server Errors with Fallback
            if (error.status >= 500 || error.status === 529) {
                console.warn('[AI] Anthropic Server Error. Falling back to error state.');
                return getMockAIResponse(request, 'Server Error');
            }

            if (error instanceof SyntaxError) {
                lastError = "Invalid JSON format. Please output clean JSON.";
            } else {
                lastError = error.message || "Unknown error";
            }
            console.warn(`[AI Attempt ${attempts + 1} Failed]: ${lastError}`);
            attempts++;
        }
    }

    // Final Fallback if all attempts fail
    console.error(`[AI] Failed to generate valid parlay after ${maxAttempts} attempts. Last Error: ${lastError}`);
    return getMockAIResponse(request, lastError);
}

function getMockAIResponse(request: ParlayRequest, lastError?: string) {
    let errorMessage = 'AI analysis is temporarily unavailable. Please try again in a moment.';

    if (lastError) {
        if (lastError.includes('Risk Level')) {
            errorMessage = `Unable to find enough games matching Risk Level ${request.riskLevel}. Try adjusting the risk slider or selecting more sports.`;
        } else if (lastError.includes('Missing or invalid odds')) {
            errorMessage = 'Not enough odds data available for the selected sports right now. Try selecting different sports or bet types.';
        } else if (lastError.includes('Duplicate exact leg')) {
            errorMessage = `Not enough unique bets available to build a ${request.numLegs}-leg parlay with these settings. Please reduce the number of legs or select more sports.`;
        } else if (lastError.includes('Wrong bet_type')) {
            errorMessage = 'Couldn\'t find enough bets matching your selected bet types. Try enabling more bet types.';
        } else if (lastError.includes('Hallucinated Game ID') || lastError.includes('Team mismatch') || lastError.includes('Opponent mismatch')) {
            errorMessage = 'The AI struggled to find valid matchups. Try broadening your criteria by selecting more sports or bet types.';
        } else if (lastError.includes('Insufficient credits')) {
            errorMessage = 'The AI service is currently out of credits. Please try again later or contact support.';
        } else if (lastError.includes('Server Error')) {
            errorMessage = 'The AI analysis servers are currently overloaded. Please try again in a few moments.';
        } else {
            // Generic fallback but actionable
            errorMessage = `We couldn't generate a valid parlay with your exact criteria. Try adjusting your risk level, number of legs, or sports.`;
        }
    }

    // Instead of returning fake/mock data, return an error so the UI shows an actionable message
    return {
        error: errorMessage,
        legs: [],
        totalOdds: '+0',
        confidence: 0
    };
}
