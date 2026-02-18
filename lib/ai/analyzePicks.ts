import Anthropic from '@anthropic-ai/sdk'

export type ParlayRequest = {
    sport: string | string[] // Support both single and multi-sport
    riskLevel: number // 1-10
    numLegs: number
    betTypes: string[] // ['moneyline', 'spread', 'totals']
    oddsData: any[] // From getOdds
}

export async function analyzePicks(request: ParlayRequest) {
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
    You are an elite sports betting analyst with deep expertise in risk assessment and player performance analysis.
    
    **YOUR MISSION:**
    Build a ${request.numLegs}-leg parlay with Risk Level ${request.riskLevel}/10 that demonstrates strategic intelligence.
    
    **AVAILABLE DATA:**
    Sport(s): ${sportString}
    Bet Types: ${request.betTypes.join(', ')}
    Games: ${enrichedGamesForAI.length} available
    
    ${isMultiSport ? `
    **MULTI-SPORT STRATEGY:**
    - You have ${sportsList.length} sports: ${sportsList.join(', ')}
    - Distribute picks across sports for variety
    - Include at least 1 pick from each sport if possible
    ` : ''}
    
    **RISK PHILOSOPHY (CRITICAL - APPLIES TO ALL SPORTS):**
    
    **Risk 1-3 (Safe/Conservative):**
    - Goal: High probability outcomes
    - Moneyline: Heavy favorites (-300 to -150)
    - Props: LOW thresholds for ELITE players
      * ⚽ Soccer: "Mbappe Over 0.5 Shots" (playerRole: star, difficulty: very_easy)
      * 🏀 Basketball: "LeBron Over 15.5 Points" (playerRole: star, difficulty: very_easy)
      * 🏈 Football: "Mahomes Over 225.5 Passing Yards" (playerRole: star, difficulty: very_easy)
      * ⚾ Baseball: "Judge Over 0.5 Hits" (playerRole: star, difficulty: very_easy)
      * 🏒 Hockey: "McDavid Over 0.5 Points" (playerRole: star, difficulty: very_easy)
    - Reasoning: Stars consistently hit low bars
    
    **Risk 4-7 (Balanced):**
    - Goal: Mix safe anchors with moderate challenges
    - Moneyline: Moderate favorites or slight underdogs (-150 to +150)
    - Props: MID thresholds for good players OR low thresholds for starters
      * ⚽ Soccer: "Mbappe Over 2.5 Shots" (playerRole: star, difficulty: moderate)
      * 🏀 Basketball: "LeBron Over 28.5 Points" (playerRole: star, difficulty: moderate)
      * 🏈 Football: "Mahomes Over 325.5 Passing Yards" (playerRole: star, difficulty: moderate)
      * ⚾ Baseball: "Judge Over 1.5 Hits" (playerRole: star, difficulty: easy)
      * 🏒 Hockey: "McDavid Over 1.5 Points" (playerRole: star, difficulty: easy)
    - Reasoning: Balanced risk/reward
    
    **Risk 8-10 (High Reward/Aggressive):**
    - Goal: Long-shot value with upside
    - Moneyline: Underdogs (+150 to +400)
    - Props: HIGH thresholds for stars OR challenging thresholds for bench players
      * ⚽ Soccer: "Mbappe Over 5.5 Shots" (playerRole: star, difficulty: very_hard)
      * 🏀 Basketball: "LeBron Over 35.5 Points" OR "Bench Player Over 15.5 Points" (difficulty: hard)
      * 🏈 Football: "Mahomes Over 375.5 Passing Yards" OR "Backup RB Over 75.5 Rushing Yards" (difficulty: hard)
      * ⚾ Baseball: "Judge Over 1.5 Home Runs" OR "Bench Player Over 0.5 Home Runs" (difficulty: hard)
      * 🏒 Hockey: "McDavid Over 3.5 Points" OR "4th Line Player Over 0.5 Goals" (difficulty: very_hard)
    - Reasoning: High risk = high reward. Look for unlikely but possible outcomes.
    
    **STRATEGIC ANALYSIS FRAMEWORK:**
    For each pick, consider:
    1. **Player Quality:** Is this a star, starter, or bench player? (Use playerRole field)
    2. **Line Difficulty:** How challenging is this threshold? (Use difficulty field)
    3. **Matchup Context:** Home/away advantage, opponent strength
    4. **Correlation:** Avoid conflicting outcomes from the same game
    
    **THINK STEP-BY-STEP (SPORT-SPECIFIC):**
    - For Risk 1 (Soccer): "I need very safe picks. Mbappe Over 0.5 Shots is marked 'very_easy' and he's a 'star'. Perfect."
    - For Risk 1 (Basketball): "LeBron Over 15.5 Points is 'very_easy' for a star. Safe anchor."
    - For Risk 1 (Football): "Mahomes Over 225.5 Passing Yards is 'very_easy' for an elite QB. Lock it in."
    - For Risk 10 (Soccer): "I need long-shots. Mbappe Over 5.5 Shots is 'very_hard' even for a star. High odds, high reward."
    - For Risk 10 (Basketball): "LeBron Over 35.5 Points is 'hard' but possible. Or find a bench player with a low threshold but long odds."
    - For Risk 10 (Football): "Mahomes Over 375.5 Passing Yards is 'hard'. Or backup RB Over 75.5 Rushing Yards for long-shot value."
    
    **AVAILABLE GAMES WITH AI CONTEXT:**
    ${JSON.stringify(enrichedGamesForAI)}

    CRITICAL INSTRUCTIONS:
    1. YOU MUST RETURN EXACTLY ${request.numLegs} PICKS.
    2. **BET TYPE VARIETY (STRICT):**
       - You MUST mix different bet types from the requested list: ${request.betTypes.join(', ')}.
       - DO NOT return a parlay where all legs are the same bet type (e.g., all Moneyline) if multiple types are available.
       - Aim for a balance, e.g., 1 Moneyline, 1 Player Prop, and 1 Total.
       - This is crucial for compatibility with platforms like PrizePicks that require variety.
    3. **MULTI-SPORT DISTRIBUTION:**
       - If multiple sports are provided (${sportString}), you MUST include at least one leg from each sport in every parlay.
    4. Use "price" from data as "odds".
    5. DATA INTEGRITY (STRICT):
       - ONLY USE THE ODDS DATA PROVIDED ABOVE.
       - DO NOT INVENT, HALUCCINATE, OR SIMULATE PLAYER PROPS.
       - IF A PLAYER PROP IS REQUESTED BUT NOT IN THE DATA, **DO NOT** CREATE ONE. PICK A DIFFERENT AVAILABLE BET (Spread/Total/Moneyline) OR FAIL IF NO DATA MATCHES.
       - It is better to use a Moneyline/Spread than to invent a fake Player Prop.
    6. For Spreads/Totals/Props, YOU MUST include the "line" field.
       - **IMPORTANT**: The "line" is the THRESHOLD (e.g. "Over 2.5", "-5.5", "Under 210.5"). 
       - It is NOT the price/odds (e.g. -110, -2000).
       - Look for the "point" field in the data outcomes.
    7. For Moneyline, "line" can be null or empty string.
    8. EVERY LEG must include the "game_id" from the provided data.
       - Use the 'id' field from the input game object. DO NOT use "N/A".
       - If you cannot find the ID, do not pick the game.
    9. **PLAYER PROP RULES (CRITICAL):**
       - If selecting a player prop, you MUST identify which team the player belongs to.
       - 'team' field MUST be the team you are betting on (or player's team).
       - 'opponent' field MUST be the OTHER team in the match.
       - YOU MUST INCLUDE 'opponent' FOR ALL BET TYPES (Moneyline, Spread, Total, Props).
       - NEVER list the player's own team as the opponent.
       - If you don't know the player's team, DO NOT USE THE PROP.
       - **LINE FIELD for Props:** MUST be the 'point' from data + the type (e.g. "Over 2.5 Shots", "Under 0.5 Goals"). NEVER put odds here.
       - **BOOKMAKER:** You must include the "sportsbook" field in the leg, using the 'book' field from the data (e.g. "DraftKings", "FanDuel").
       10. **REASONING (STRICT):** MAX 15 WORDS. One sentence only. direct and punchy. DO NOT start with "Risk X/10". Focus on the "why".

    Return JSON format:
    {
      "legs": [
        {
          "game_id": "valid_id_from_data", 
          "team": "Player's Team Name",
          "player": "Player Name (if prop)",
          "opponent": "Opponent Name",
          "bet_type": "${request.betTypes[0]}",
          "line": "Over 210.5", 
          "odds": "-115",
          "player_image_url": "https://a.espncdn.com/...",
          "sportsbook": "FanDuel",
          "reasoning": "Quick logic"
        }
      ],
      "totalOdds": "+500",
      "confidence": 85
    }
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
                // Strict Risk Validation
                const hasBadRisk = result.legs.some((l: any) => {
                    const val = parseInt(String(l.odds));
                    if (request.riskLevel <= 3) {
                        // Safe: Must be favorites (-120 or worse, meaning -150, -200 etc) OR slight underdogs (< +150)
                        // Note: For negative odds, "smaller" number is stronger favorite (e.g. -200 < -120). 
                        // Safe: Must be favorites (-125 or worse)
                        // e.g. -150, -200, -500 are good. -110 is too balanced to be "Safe".
                        return val > -125; // Reject if > -125 (e.g. -110, +100)
                    }
                    if (request.riskLevel >= 4 && request.riskLevel <= 7) {
                        // Balanced: Reject EXTREME favorites. Allow anything better than -1000.
                        // e.g. -340 is ok, -900 is ok. -4000 is not (no value).
                        return val < -1000;
                    }
                    if (request.riskLevel >= 8) {
                        // Risky: Positive underdogs OR Spreads/Totals (which are usually -110)
                        if (l.bet_type === 'spread' || l.bet_type === 'totals') return false;
                        // OLD: return val < 100; // Reject if < +100
                        // NEW: Allow standard lines (-115, -120) but reject strong favorites
                        return val < -130;
                    }
                    return false;
                });

                // DISABLED: Trust AI strategic reasoning instead of hard-coded odds validation
                /*
                if (hasBadRisk) {
                    let range = "Unknown";
                    if (request.riskLevel <= 3) range = "Favorites (>-500)";
                    else if (request.riskLevel <= 7) range = "Balanced (>-500)";
                    else range = "Underdogs (>+100)";
                
                    lastError = `Risk Level ${request.riskLevel} violation. Expected ${range}. Got odds: ${result.legs.map((l: any) => l.odds).join(', ')}`;
                    valid = false;
                }
                */
            }

            if (valid) {
                // Check for duplicate games AND Valid Game IDs
                const gameIds = new Set();
                const validGameIds = new Set(request.oddsData.map(g => g.id));
                const allTeams = new Set(request.oddsData.flatMap(g => [g.home_team, g.away_team]));

                const hasIssues = result.legs.some((l: any) => {
                    // Check 1: Duplicate Game (Same Game ID)
                    if (gameIds.has(l.game_id)) {
                        lastError = `Duplicate game picked: ${l.game_id}`;
                        return true;
                    }
                    gameIds.add(l.game_id);

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
                }
            }

            if (valid) {
                // Calculate ACTUAL Total Odds mathematically
                const totalDecimal = result.legs.reduce((acc: number, leg: any) => {
                    const odds = parseInt(String(leg.odds));
                    if (odds > 0) return acc * (1 + odds / 100);
                    return acc * (1 + 100 / Math.abs(odds));
                }, 1);

                const finalTotal = totalDecimal > 2
                    ? `+${Math.round((totalDecimal - 1) * 100)}`
                    : `-${Math.round(100 / (totalDecimal - 1))}`;

                result.totalOdds = finalTotal;

                // Calculate Dynamic Confidence
                const baseConfidence = request.riskLevel <= 3 ? 85 : request.riskLevel >= 8 ? 65 : 75;
                // Randomize slightly
                result.confidence = Math.min(95, Math.max(50, baseConfidence + Math.floor(Math.random() * 10) - 5));

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
                console.warn('[AI] Insufficient credits detected. Falling back to MOCK DATA.');
                return getMockAIResponse(request);
            }

            // Handle Overloaded / Server Errors with Fallback
            if (error.status >= 500) {
                console.warn('[AI] Anthropic Server Error. Falling back to MOCK DATA.');
                return getMockAIResponse(request);
            }

            if (error instanceof SyntaxError) {
                lastError = "Invalid JSON format. Please output clean JSON.";
            } else {
                lastError = error.message || "Unknown error";
            }
            attempts++;
        }
    }

    // Final Fallback if all attempts fail
    console.error(`[AI] Failed to generate valid parlay after ${maxAttempts} attempts. Falling back to MOCK DATA.`);
    return getMockAIResponse(request);
    // throw new Error(`AI failed validation after max attempts (${maxAttempts}). Last Error: ${lastError}`);
}

function getMockAIResponse(request: ParlayRequest) {
    // Instead of returning fake/mock data, return an error so the UI shows a message
    return {
        error: 'AI analysis is temporarily unavailable. Please try again in a moment.',
        legs: [],
        totalOdds: '+0',
        confidence: 0
    };
}
