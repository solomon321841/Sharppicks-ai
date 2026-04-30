import Anthropic from '@anthropic-ai/sdk'
import {
    calculateCombinedParlayMetrics,
    enforceLegCount,
    enforceBetTypes,
    checkCorrelation,
    getUnitSize,
    validateRiskLevel,
    getTargetRange
} from './parlayMath'

export type ParlayRequest = {
    sports: string | string[]
    riskLevel: number // 1-10
    numLegs: number
    betTypes: string[] // ['moneyline', 'spread', 'totals', 'player_props']
    oddsData: any[]
    statsContext?: Map<string, any>   // ESPN team stats + injuries per game
    shoppingData?: Map<string, any>   // Line shopping data per game
    sportFocus?: string               // AI hint for which sports to prioritize
    _varietyRetried?: boolean          // Internal: tracks if variety nudge was already attempted
    fastMode?: boolean                // Skip retries + use shorter timeout (for cron jobs)
}

// ─── Bet type normalization ────────────────────────────────────────────
function normalizeBetType(raw: string): string {
    const t = raw.toLowerCase().trim()
    if (t === 'h2h' || t === 'money_line' || t === 'ml') return 'moneyline'
    if (t === 'spreads') return 'spread'
    if (t === 'total' || t === 'over/under') return 'totals'
    if (t === 'prop' || t === 'player_prop' || t === 'props' || t.startsWith('player_')) return 'player_props'
    return t
}

// ─── Build the AI prompt ───────────────────────────────────────────────
function buildPrompt(request: ParlayRequest, games: any[], retryFeedback?: string): string {
    const riskLevel = request.riskLevel
    const numLegs = request.numLegs
    const betTypesStr = request.betTypes.join(', ')
    const sportString = Array.isArray(request.sports) ? request.sports.join(', ') : request.sports

    // Risk personality — this is the KEY. Tell the AI what KIND of picks to make.
    const riskPersonality = getRiskPersonality(riskLevel)

    const hasProps = request.betTypes.includes('player_props')

    return `You are the SharpPicks AI parlay engine. You build professional-quality sports parlay recommendations using ONLY the real-time odds data provided below.

## YOUR IDENTITY
You are an elite sports bettor. Every pick must have a clear statistical or situational edge. You never pick randomly. You think like a sharp.

## ABSOLUTE RULES (ZERO EXCEPTIONS)
1. You ONLY use odds, teams, players, and games from the data below. NEVER invent data.
2. Every "odds" value must come EXACTLY from the data. Do not modify odds values.
3. Every "game_id" must match an ID in the data.
4. ALWAYS return a parlay. The ONLY reason to return an error is if the data below has literally zero games or zero matching bet types. If data exists, YOU MUST build a parlay — never refuse because of risk level or odds constraints. If you must error, respond with: {"error": "No games with the selected bet types are available right now."}

## BET TYPE RESTRICTION (MANDATORY)
You may ONLY use these bet types: [${betTypesStr}]
${request.betTypes.length === 1 ? `\nEvery single leg MUST be "${request.betTypes[0]}". If the data has ANY "${request.betTypes[0]}" options, use them.` : `\nYou can use any mix of the allowed types, but NEVER use a type not in this list.`}

## RISK LEVEL: ${riskLevel}/10 — ${riskPersonality.label}

These are GUIDELINES for pick style, not hard rules. Always build the parlay even if picks don't perfectly match the risk description.

${riskPersonality.instructions}

## LEG COUNT (NON-NEGOTIABLE)
You MUST return EXACTLY ${numLegs} legs. Not ${numLegs - 1}, not ${numLegs + 1}. EXACTLY ${numLegs}.
This is the user's explicit choice — returning a different count is a hard failure.

Your combined parlay odds MUST also fall within the target range for this risk level and leg count. Pick individual legs with odds that will combine to hit this target:
${(() => { const [lo, hi] = getTargetRange(riskLevel, numLegs); return `- Target combined odds: ${lo > 0 ? '+' : ''}${lo} to +${hi}`; })()}
If you cannot fit ${numLegs} legs in this range, pick SAFER individual legs (heavier favorites, lower prop lines) — DO NOT reduce the leg count.

## CORRELATION RULES
- Player props from the SAME game but DIFFERENT players are always allowed at any risk level.
${riskLevel <= 5 ? '- For non-prop bets (moneyline, spread, totals): each leg must be from a different matchup.' : ''}
${riskLevel >= 6 && riskLevel <= 7 ? '- Same-game legs are allowed, but NEVER combine Moneyline/Spread with Over/Under from the same game.' : ''}
${riskLevel >= 8 ? '- Same-game parlays are fully allowed. Flag correlated legs.' : ''}

## VARIETY RULES
- Spread legs across different games. If 3+ games are available, use at least 2 different games.
- If 5+ games are available, use at least 3 different games.
${hasProps ? `- PROP VARIETY: When picking 2+ player props, STRONGLY PREFER mixing different stat categories. For NBA: mix Points, Rebounds, Assists, Threes, Blocks, Steals. For soccer: mix Goals, Shots, Shots on Target, Assists. Same-category props are okay if there's a compelling statistical edge, but default to variety. A parlay with 3 different prop types is more interesting than 3 of the same.` : ''}
- For mixed bet types: vary bet types across legs. Don't make them all the same type.

## REQUEST PARAMETERS
- Sport(s): ${sportString}
- Risk Level: ${riskLevel}/10
- Number of Legs: ${numLegs}
- Allowed Bet Types: ${betTypesStr}
${request.sportFocus ? `
## SPORT PRIORITY
${request.sportFocus}
` : ''}
${hasProps ? `## PLAYER PROPS FORMAT
When a leg is a player prop:
- Set bet_type to "player_props"
- Set prop_market to the stat category: "Points", "Rebounds", "Assists", "Threes", "Goals", "Shots", "Saves", etc.
- Set player to the player name
- Set line to "Over X.5" or "Under X.5" (the exact threshold from the data)
- CRITICAL: Set "team" to the CORRECT team the player plays for. Use the "keyPlayers" data under home/away stats to determine which team the player belongs to. The player's team must be either "home_team" or "away_team" from the game data. NEVER guess — if you cannot confirm which team the player is on from the data, do not pick that player.
` : ''}

## REAL STATISTICS (ESPN)
Some games include a "stats" block with REAL team data from ESPN. When available:
- USE actual team records to assess strength (e.g., 50-18 team is elite, 22-46 is tanking).
- USE PPG (points per game) and PAPG (points allowed per game) to inform Over/Under and spread picks.
- USE home/away records — a team with 30-8 home record is much stronger at home.
- USE injury data — if a star is OUT or DOUBTFUL, factor that into your analysis. Mention specific injuries in reasoning.
- USE "keyPlayers" — these are REAL season averages from ESPN (e.g., "Jalen Brunson: 26.3 PPG"). For player props, compare the prop line to the player's ACTUAL season average. If Over 24.5 and the player averages 26.3, that's a strong Over play.
- USE "backToBack: true" — this means the team played YESTERDAY. Back-to-back games cause fatigue, especially for older/high-minute players. This is a significant factor for: totals (tired teams score less on defense), player props (stars may rest or underperform), and spreads (rested team has an edge).
- If no stats are available for a game, use your general knowledge but note that stats were unavailable.

## LINE SHOPPING DATA
Some games include a "sharpEdges" block showing where one sportsbook offers significantly better odds than the market consensus (3%+ edge). When available:
- PREFER picking legs that have sharp value — this means the sportsbook is offering a mispriced line.
- Mention the edge in your reasoning (e.g., "DraftKings offering +150 vs market consensus +130 — 4.2% edge").
- The "bestBook" tells you which sportsbook has the best line — use this.

## AVAILABLE GAMES & ODDS DATA
${JSON.stringify(games, null, 1)}

## OUTPUT FORMAT
Return ONLY valid JSON matching this exact schema:
{
  "legs": [
    {
      "game_id": "exact_id_from_data",
      "team": "Team Name",
      "player": "Player Name (for props only, omit for non-props)",
      "prop_market": "Points (REQUIRED for props, omit for non-props)",
      "opponent": "Opponent Name",
      "bet_type": "must be one of: ${betTypesStr}",
      "line": "Over 27.5 or -3.5 or exact team name for ML",
      "odds": "-115 (exact American odds from data)",
      "reasoning": "2-3 sentences of sharp analysis explaining the statistical edge."
    }
  ],
  "strategy": "1-2 sentence summary of the overall parlay thesis."
}

${retryFeedback ? `\n## PREVIOUS ATTEMPT FAILED\n${retryFeedback}\nFix the issue and try again. Follow the rules above exactly.\n` : ''}

Return ONLY the JSON. No markdown, no explanation, no wrapping.`
}

// ─── Risk personality definitions ──────────────────────────────────────
function getRiskPersonality(risk: number): { label: string, instructions: string } {
    if (risk <= 3) {
        return {
            label: 'SAFE — Lock It In',
            instructions: `PICK SELECTION STRATEGY:
- Pick HEAVY FAVORITES only. Moneyline favorites at -200 or better.
- For spreads: pick favorites covering small spreads (-1.5 to -4.5).
- For player props: pick the LOWEST, most achievable lines. Stars hitting their floor.
  Example: LeBron Over 15.5 Points (he averages 27), Mbappe Over 0.5 Shots (he averages 5).
- For totals: pick the most obvious Over/Under based on team scoring trends.
- Every pick should feel like "of course this will hit." These are chalk plays.
- DO NOT pick any underdogs. DO NOT pick risky props with high lines.`
        }
    }
    if (risk <= 4) {
        return {
            label: 'CONSERVATIVE — Calculated Value',
            instructions: `PICK SELECTION STRATEGY:
- Lean toward favorites but look for VALUE. Slight favorites (-110 to -180) are ideal.
- For spreads: moderate spreads (-2.5 to -6.5) where the team has a clear edge.
- For player props: pick lines near or slightly below the player's recent average.
  Example: Jayson Tatum Over 24.5 Points (he averages 27), Haaland Over 0.5 Goals (he scores every other game).
- One leg can be a slight underdog (+100 to +150) if there's a clear edge.
- Think: high-percentage plays with a slightly better payout.`
        }
    }
    if (risk <= 6) {
        return {
            label: 'BALANCED — Sharp Money',
            instructions: `PICK SELECTION STRATEGY:
- Mix favorites and pick-em situations. No heavy favorites required.
- For spreads: moderate to large spreads are okay if justified.
- For player props: pick lines right at or slightly above the player's average. These require a good game but are very achievable.
  Example: Luka Over 28.5 Points (he averages 29), Salah Over 1.5 Shots on Target (he averages 2.1).
- You can include 1-2 slight underdogs (+110 to +200) if the edge is real.
- This is the "everyday sharp bettor" zone. Smart picks, decent payout.`
        }
    }
    if (risk <= 8) {
        return {
            label: 'AGGRESSIVE — Big Swing',
            instructions: `PICK SELECTION STRATEGY:
- Target underdogs, high-line props, and bold predictions.
- For player props: pick lines ABOVE the player's average. They need a big game to hit.
  Example: Anthony Edwards Over 32.5 Points (he averages 26), Mbappe Over 3.5 Shots (he averages 4.2 but this requires volume).
- Underdogs (+150 to +300) are great here if there's a matchup edge.
- You're looking for games where the underdog has a real path to victory.
- More legs, more variance, more payout. This is a "this could really pop" parlay.`
        }
    }
    // Risk 9-10
    return {
        label: 'MOONSHOT — Lottery Ticket',
        instructions: `PICK SELECTION STRATEGY:
- Go for the home runs. Heavy underdogs, extreme player props, long-shot outcomes.
- For player props: pick lines WELL ABOVE average. These need career-night performances.
  Example: Role player to score 20+ points, backup goalie to make 35+ saves, underdog QB to throw 3+ TDs.
- Target moderate underdogs (+150 to +350 per leg).
- Same-game parlays and correlated legs are encouraged for multiplied variance.
- This is a "buy a lottery ticket" play. Low probability, massive payout.
- Think about narratives: upset games, rivalry matches, contract-year players.`
    }
}

// ─── Main analysis function ────────────────────────────────────────────
export async function analyzePicks(request: ParlayRequest) {
    request.numLegs = enforceLegCount(request.riskLevel, request.numLegs)
    request.betTypes = enforceBetTypes(request.riskLevel, request.betTypes)

    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('Missing ANTHROPIC_API_KEY')
        return buildErrorResponse(request, 'AI service is not configured. Please contact support.')
    }

    // ── Minify game data for the AI ──────────────────────────────────
    const simplifiedGames = minifyGames(request)

    if (simplifiedGames.length === 0) {
        return buildErrorResponse(request, `No games with matching bet types found for the selected sports. Try enabling more bet types or selecting different sports.`)
    }

    // Check: if user wants only props but no props exist in data
    if (request.betTypes.length === 1 && request.betTypes[0] === 'player_props') {
        const hasAnyProps = simplifiedGames.some(g =>
            g.markets.some((m: any) => m.type.startsWith('player'))
        )
        if (!hasAnyProps) {
            return buildErrorResponse(request, 'Player props are not available for the selected games right now. Try selecting Moneyline or Spread, or check back closer to game time.')
        }
    }

    // Check: enough games for the requested legs (no-correlation check)
    // Player props from the same game are NOT correlated, so the per-game cap
    // only applies when the parlay is built from non-prop bet types.
    const hasPropsInRequest = request.betTypes.includes('player_props')
    if (request.riskLevel <= 5 && !hasPropsInRequest && simplifiedGames.length < request.numLegs) {
        if (simplifiedGames.length < 2) {
            return buildErrorResponse(request, `Only ${simplifiedGames.length} game(s) available. Need at least 2 games to build a safe parlay. Try selecting more sports.`)
        }
        request.numLegs = simplifiedGames.length
    }

    console.log(`[AI] ${simplifiedGames.length} games prepared | Risk ${request.riskLevel} | ${request.numLegs} legs | Types: ${request.betTypes.join(',')}`)

    // ── Call AI with retry loop ──────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    let lastError = ''
    const maxAttempts = request.fastMode ? 1 : 2

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`[AI] Attempt ${attempt}/${maxAttempts}...`)

            const prompt = buildPrompt(
                request,
                simplifiedGames,
                attempt > 1 ? lastError : undefined
            )

            const timeoutMs = request.fastMode ? 20000 : 40000
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
            })

            const aiPromise = anthropic.messages.create({
                model: request.fastMode ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                temperature: 0.3,
                messages: [{ role: 'user', content: prompt }],
            })

            const msg = await Promise.race([aiPromise, timeoutPromise]) as Anthropic.Messages.Message
            const text = (msg.content[0] as any).text

            // Extract JSON
            const firstBrace = text.indexOf('{')
            const lastBrace = text.lastIndexOf('}')
            if (firstBrace === -1 || lastBrace === -1) {
                lastError = 'AI did not return valid JSON. Return ONLY a JSON object.'
                continue
            }

            const result = JSON.parse(text.substring(firstBrace, lastBrace + 1))

            // Check if AI returned an error (it was told to do this when it can't build a parlay)
            if (result.error) {
                return buildErrorResponse(request, result.error)
            }

            if (!result.legs || !Array.isArray(result.legs) || result.legs.length === 0) {
                lastError = 'Response has no legs array. Return a valid parlay JSON.'
                continue
            }

            // ── Validate the result ──────────────────────────────────
            const validation = validateResult(result, request)
            if (!validation.valid) {
                lastError = validation.error!
                console.warn(`[AI Validation Fail ${attempt}]: ${lastError}`)
                continue
            }

            // ── All checks passed — finalize ─────────────────────────
            return finalizeResult(result, request)

        } catch (error: any) {
            if (error.status === 429 || error.code === 'rate_limit_error') {
                console.warn('Rate limit hit, waiting 5s...')
                await new Promise(resolve => setTimeout(resolve, 5000))
                lastError = 'Rate limited. Try again.'
            } else if (error.status === 400 && error.error?.message?.includes('credit balance')) {
                return buildErrorResponse(request, 'AI service credits depleted. Please contact support.')
            } else if (error.status === 529 || (error.status >= 500 && error.status < 600)) {
                console.warn(`AI server error (${error.status}), waiting 3s before retry...`)
                await new Promise(resolve => setTimeout(resolve, 3000))
                lastError = 'AI server overloaded. Retrying.'
            } else if (error instanceof SyntaxError) {
                lastError = 'Invalid JSON returned. Output ONLY clean JSON, no markdown.'
            } else {
                lastError = error.message || 'Unknown error'
            }
            console.warn(`[AI Error ${attempt}]: ${lastError}`)
        }
    }

    // All attempts failed — include raw error in response for debugging
    console.error(`[AI] All ${maxAttempts} attempts failed. Last: ${lastError}`)
    const response = buildErrorResponse(request, lastError)
    response._rawError = lastError
    return response
}

// ─── Minify games for AI context ───────────────────────────────────────
function minifyGames(request: ParlayRequest): any[] {
    // Cap at 20 games to give the AI enough material for multi-leg + prop parlays
    return request.oddsData.slice(0, 20).map(g => {
        const requiredMarkets: string[] = []
        if (request.betTypes.includes('moneyline')) requiredMarkets.push('h2h')
        if (request.betTypes.includes('spread')) requiredMarkets.push('spreads')
        if (request.betTypes.includes('totals')) requiredMarkets.push('totals')
        if (request.betTypes.includes('player_props')) requiredMarkets.push('player')

        // Find a top-tier bookmaker with relevant markets
        const validBookmakers = (g.bookmakers || []).filter((b: any) =>
            requiredMarkets.some(req =>
                b.markets.some((m: any) => m.key.startsWith(req))
            )
        )

        if (validBookmakers.length === 0) return null

        const bookmaker = validBookmakers.find((b: any) =>
            ['draftkings', 'fanduel', 'betmgm', 'bovada'].includes(b.key)
        ) || validBookmakers[0]

        // Filter to only requested markets
        const relevantMarkets = bookmaker.markets.filter((m: any) => {
            if (m.key === 'h2h' && request.betTypes.includes('moneyline')) return true
            if (m.key === 'spreads' && request.betTypes.includes('spread')) return true
            if (m.key === 'totals' && request.betTypes.includes('totals')) return true
            if (m.key.startsWith('player_') && request.betTypes.includes('player_props')) return true
            return false
        })

        if (relevantMarkets.length === 0) return null

        const gameData: any = {
            id: g.id,
            home_team: g.home_team,
            away_team: g.away_team,
            matchup: `${g.away_team} @ ${g.home_team}`,
            start: g.commence_time,
            book: bookmaker.key,
            markets: relevantMarkets.map((m: any) => ({
                type: m.key,
                options: m.outcomes.map((o: any) => ({
                    name: o.description || o.name,
                    odds: o.price,
                    line: o.point,
                    difficulty: o.lineDifficulty,
                    role: o.playerImportance
                }))
            }))
        }

        // ── Inject ESPN stats (if available) ──────────────────────
        const stats = request.statsContext?.get(g.id)
        if (stats) {
            gameData.stats = {
                home: {
                    record: stats.homeTeam.record || undefined,
                    homeRecord: stats.homeTeam.homeRecord || undefined,
                    ppg: stats.homeTeam.pointsPerGame || undefined,
                    papg: stats.homeTeam.pointsAllowed || undefined,
                    last5: stats.homeTeam.last5 || undefined,
                },
                away: {
                    record: stats.awayTeam.record || undefined,
                    awayRecord: stats.awayTeam.awayRecord || undefined,
                    ppg: stats.awayTeam.pointsPerGame || undefined,
                    papg: stats.awayTeam.pointsAllowed || undefined,
                    last5: stats.awayTeam.last5 || undefined,
                },
                injuries: stats.injuries
                    ?.filter((inj: any) => inj.status === 'OUT' || inj.status === 'DOUBTFUL' || inj.status === 'QUESTIONABLE')
                    .slice(0, 8) // Limit to most impactful injuries to save tokens
                    .map((inj: any) => `${inj.playerName} (${inj.status}: ${inj.description})`) || []
            }

            // Add key player season averages (from ESPN scoreboard leaders)
            if (stats.homeKeyPlayers?.length) {
                gameData.stats.home.keyPlayers = stats.homeKeyPlayers.slice(0, 3).map((p: any) => p.display ? `${p.name}: ${p.display}` : `${p.name}: ${p.value} ${p.category}`)
            }
            if (stats.awayKeyPlayers?.length) {
                gameData.stats.away.keyPlayers = stats.awayKeyPlayers.slice(0, 3).map((p: any) => p.display ? `${p.name}: ${p.display}` : `${p.name}: ${p.value} ${p.category}`)
            }

            // Add rest day / back-to-back info
            if (stats.restDays) {
                if (stats.restDays.home === 0) gameData.stats.home.backToBack = true
                if (stats.restDays.away === 0) gameData.stats.away.backToBack = true
            }

            // Strip undefined values to save tokens
            for (const side of ['home', 'away'] as const) {
                Object.keys(gameData.stats[side]).forEach(k => {
                    if (gameData.stats[side][k] === undefined) delete gameData.stats[side][k]
                })
            }
            if (gameData.stats.injuries.length === 0) delete gameData.stats.injuries
        }

        // ── Inject line shopping data (if available) ──────────────
        const shopping = request.shoppingData?.get(g.id)
        if (shopping) {
            // Only include sharp value lines to save tokens
            const sharpLines = shopping.lines
                .filter((l: any) => l.sharpValue && l.bookCount >= 3)
                .slice(0, 6)
                .map((l: any) => ({
                    market: l.outcome.marketKey,
                    name: l.outcome.name,
                    line: l.outcome.point,
                    bestOdds: l.bestOdds,
                    bestBook: l.bestBook,
                    consensus: l.consensusOdds,
                    edge: `${l.edgePercent}%`
                }))

            if (sharpLines.length > 0) {
                gameData.sharpEdges = sharpLines
            }
        }

        return gameData
    }).filter(Boolean)
}

// ─── Validate AI result ────────────────────────────────────────────────
function validateResult(result: any, request: ParlayRequest): { valid: boolean, error?: string } {
    const legs = result.legs

    // 1. Normalize and validate bet types
    for (const leg of legs) {
        leg.bet_type = normalizeBetType(leg.bet_type || '')

        // Normalize odds format
        if (leg.odds === undefined && leg.price !== undefined) leg.odds = leg.price
        let oddsStr = String(leg.odds)
        if (!oddsStr.startsWith('-') && !oddsStr.startsWith('+') && parseInt(oddsStr) > 0) {
            oddsStr = '+' + oddsStr
        }
        leg.odds = oddsStr

        if (!request.betTypes.includes(leg.bet_type)) {
            return {
                valid: false,
                error: `WRONG BET TYPE: Got "${leg.bet_type}" but only allowed: [${request.betTypes.join(', ')}]. Every leg must use ONLY the allowed bet types.`
            }
        }
    }

    // 2. Validate odds are real numbers
    for (const leg of legs) {
        if (!leg.odds || isNaN(parseInt(String(leg.odds)))) {
            return { valid: false, error: `Invalid odds "${leg.odds}". Must be American format like -110 or +150.` }
        }
    }

    // 3. Validate reasoning exists
    if (legs.some((l: any) => !l.reasoning || l.reasoning.length < 15)) {
        return { valid: false, error: 'Each leg needs substantive reasoning (at least 15 chars). Explain the statistical edge.' }
    }

    // 4. Validate leg count — must be EXACTLY numLegs (the user picked it)
    if (legs.length !== request.numLegs) {
        return {
            valid: false,
            error: `Wrong leg count: returned ${legs.length} legs but the user requested EXACTLY ${request.numLegs}. Return exactly ${request.numLegs} legs.`
        }
    }

    if (legs.length < 2) {
        return { valid: false, error: 'A parlay needs at least 2 legs.' }
    }

    // 5. Validate game IDs exist in source data
    const validGameIds = new Set(request.oddsData.map(g => g.id))
    for (const leg of legs) {
        if (!validGameIds.has(leg.game_id)) {
            return { valid: false, error: `Invalid game_id "${leg.game_id}". Use only IDs from the provided data.` }
        }
    }

    // 6. Validate teams match game
    for (const leg of legs) {
        const game = request.oddsData.find(g => g.id === leg.game_id)
        if (!game) continue

        if (leg.bet_type === 'player_props' && leg.player) {
            // For player props: resolve the correct team from ESPN keyPlayers data
            const stats = request.statsContext?.get(leg.game_id)
            const playerName = leg.player.toLowerCase()
            let resolvedTeam: string | null = null

            if (stats) {
                const homeMatch = (stats.homeKeyPlayers || []).some((p: any) =>
                    (p.name || '').toLowerCase().includes(playerName) || playerName.includes((p.name || '').toLowerCase())
                )
                const awayMatch = (stats.awayKeyPlayers || []).some((p: any) =>
                    (p.name || '').toLowerCase().includes(playerName) || playerName.includes((p.name || '').toLowerCase())
                )

                if (homeMatch && !awayMatch) resolvedTeam = game.home_team
                else if (awayMatch && !homeMatch) resolvedTeam = game.away_team
            }

            if (resolvedTeam) {
                // Use the verified team from ESPN data
                leg.team = resolvedTeam
            } else {
                // Fallback: ensure the AI's team at least matches one of the game's teams
                const teamMatch = matchesTeam(leg.team, game.home_team, game.away_team, leg.bet_type)
                if (!teamMatch) {
                    // Can't determine team — default to home team (player prop is in this game's market)
                    leg.team = game.home_team
                }
            }

            // Set opponent based on resolved/validated team
            const isHomeTeam = leg.team === game.home_team ||
                game.home_team.toLowerCase().includes(leg.team.toLowerCase()) ||
                leg.team.toLowerCase().includes(game.home_team.toLowerCase())
            leg.opponent = isHomeTeam ? game.away_team : game.home_team
        } else {
            const teamMatch = matchesTeam(leg.team, game.home_team, game.away_team, leg.bet_type)
            if (!teamMatch) {
                return {
                    valid: false,
                    error: `Team "${leg.team}" not in game ${leg.game_id}. Valid teams: ${game.home_team} vs ${game.away_team}.`
                }
            }
        }

        // Auto-fill opponent
        if (!leg.opponent) {
            leg.opponent = leg.team === game.home_team ? game.away_team : game.home_team
        }
    }

    // 7. Check for duplicate legs
    const sigs = new Set<string>()
    for (const leg of legs) {
        const sig = `${leg.game_id}|${leg.bet_type}|${leg.player || leg.team}|${leg.line}`
        if (sigs.has(sig)) {
            return { valid: false, error: `Duplicate leg: ${sig}. Each leg must be unique.` }
        }
        sigs.add(sig)
    }

    // 8. Player prop variety — soft warning only, don't waste a retry on this
    const propLegs = legs.filter((l: any) => l.bet_type === 'player_props' && l.prop_market)
    if (propLegs.length >= 3) {
        const normalizeMarket = (m: string) => m.toLowerCase().replace(/[_\s]+/g, ' ').trim()
        const uniqueMarkets = new Set(propLegs.map((l: any) => normalizeMarket(l.prop_market)))
        if (uniqueMarkets.size === 1) {
            const market = Array.from(uniqueMarkets)[0]
            console.warn(`[AI Variety] All ${propLegs.length} prop legs are "${market}" — allowing but noting low variety`)
        }
    }

    // 9. Correlation check
    const correlationInput = legs.map((l: any) => ({
        game_id: l.game_id,
        bet_type: l.bet_type,
        odds: parseInt(String(l.odds).replace('+', ''))
    }))

    const corrCheck = checkCorrelation(correlationInput, request.riskLevel)
    if (!corrCheck.valid) {
        return { valid: false, error: `Correlation violation: ${corrCheck.reason}. ${request.riskLevel <= 5 ? 'At Risk 1-5, each leg must be from a DIFFERENT game.' : ''}` }
    }

    // 10. Calculate combined odds and enforce risk-level ranges
    const mathLegs = legs.map((l: any) => ({
        odds: parseInt(String(l.odds).replace('+', ''))
    }))

    const mathCalc = calculateCombinedParlayMetrics(mathLegs)
    const calcOdds = mathCalc.combinedAmericanOdds

    result.totalOdds = calcOdds > 0 ? `+${calcOdds}` : `${calcOdds}`
    result.true_implied_prob = mathCalc.combinedFairProb

    // Enforce risk-level odds ranges — reject if combined odds are too aggressive
    // Pass numLegs so the range scales for multi-leg parlays (safe picks still compound)
    if (!validateRiskLevel(request.riskLevel, calcOdds, request.numLegs)) {
        const [rangeLo, rangeHi] = getTargetRange(request.riskLevel, request.numLegs)
        const direction = calcOdds > rangeHi ? 'too aggressive' : 'too conservative'

        return {
            valid: false,
            error: `Combined odds ${result.totalOdds} are ${direction} for Risk ${request.riskLevel} with ${request.numLegs} legs. Target range: ${rangeLo > 0 ? '+' : ''}${rangeLo} to +${rangeHi}. ${
                calcOdds > rangeHi
                    ? 'Pick SAFER legs: heavier favorites, lower prop lines, more likely outcomes.'
                    : 'Pick slightly riskier legs to get a better payout.'
            }`
        }
    }

    return { valid: true }
}

// ─── Finalize a valid result ───────────────────────────────────────────
function finalizeResult(result: any, request: ParlayRequest) {
    result.unit_size = getUnitSize(request.riskLevel)

    // Data-driven confidence (replaces random range)
    result.confidence = calculateDataDrivenConfidence(result.legs, request)

    // Enrich legs with sport key, game time, sportsbook, shopping data, and consensus odds
    result.legs = result.legs.map((leg: any) => {
        const game = request.oddsData.find(g => g.id === leg.game_id)

        // Find matching line from shopping data for this specific leg
        let bestBook = ''
        let consensusOdds = ''
        const shopping = request.shoppingData?.get(leg.game_id)
        if (shopping) {
            const legName = (leg.player || leg.team || '').toLowerCase()
            const legLine = leg.line ? String(leg.line) : ''

            // Try to match by name + line for precise consensus odds
            for (const line of shopping.lines) {
                const outcomeName = (line.outcome.name || '').toLowerCase()
                const outcomePoint = line.outcome.point !== undefined ? String(line.outcome.point) : ''

                const nameMatch = outcomeName.includes(legName) || legName.includes(outcomeName)
                const lineMatch = !legLine || !outcomePoint || legLine.includes(outcomePoint)

                if (nameMatch && lineMatch) {
                    consensusOdds = String(line.consensusOdds > 0 ? `+${line.consensusOdds}` : line.consensusOdds)
                    if (line.sharpValue) bestBook = line.bestBook
                    break
                }
            }
        }

        // Find the sportsbook name from the source data
        let sportsbook = bestBook || leg.sportsbook || ''
        if (!sportsbook && game?.bookmakers?.length > 0) {
            const preferred = game.bookmakers.find((b: any) =>
                ['draftkings', 'fanduel', 'betmgm', 'bovada'].includes(b.key)
            )
            const book = preferred || game.bookmakers[0]
            sportsbook = book.title || book.key?.replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/^./, (s: string) => s.toUpperCase()) || ''
        }

        return {
            ...leg,
            sports: game?.sport_key || 'Mixed',
            game_time: game?.commence_time || null,
            betType: leg.bet_type,
            sportsbook,
            bestBook: bestBook || undefined,
            consensus_odds: consensusOdds || undefined
        }
    })

    console.log(`[AI] Success: Risk ${request.riskLevel} | ${result.legs.length} legs | ${result.totalOdds} | Confidence ${result.confidence}%`)
    return result
}

// ─── Data-driven confidence calculation ─────────────────────────────────
function calculateDataDrivenConfidence(legs: any[], request: ParlayRequest): number {
    // Base confidence from mathematical implied probability
    // Lower risk = higher base, higher risk = lower base
    const baseByRisk: Record<number, number> = {
        1: 82, 2: 75, 3: 65, 4: 55, 5: 45,
        6: 38, 7: 30, 8: 22, 9: 15, 10: 8
    }
    const base = baseByRisk[request.riskLevel] || 45

    // Collect per-leg modifiers
    let totalModifier = 0
    let modifierLegs = 0

    for (const leg of legs) {
        let legMod = 0

        // 1. Sharp edge bonus: if line shopping found an edge on this leg (+0 to +6)
        const shopping = request.shoppingData?.get(leg.game_id)
        if (shopping) {
            const legName = (leg.player || leg.team || '').toLowerCase()
            const sharpMatch = shopping.lines.find((l: any) =>
                l.sharpValue && (l.outcome.name || '').toLowerCase().includes(legName)
            )
            if (sharpMatch) {
                legMod += Math.min(sharpMatch.edgePercent * 1.5, 6) // Cap at +6
            }
        }

        // 2. Stats alignment: team records, key players, back-to-back
        const stats = request.statsContext?.get(leg.game_id)
        if (stats) {
            // Parse win percentages from records
            const homeWinPct = parseWinPct(stats.homeTeam?.record)
            const awayWinPct = parseWinPct(stats.awayTeam?.record)

            if (homeWinPct !== null && awayWinPct !== null) {
                const pickedTeam = (leg.team || '').toLowerCase()
                const homeTeamName = (stats.homeTeam?.name || '').toLowerCase()

                const isPickingHome = homeTeamName.includes(pickedTeam) || pickedTeam.includes(homeTeamName)
                const pickedWinPct = isPickingHome ? homeWinPct : awayWinPct
                const oppWinPct = isPickingHome ? awayWinPct : homeWinPct

                // Picking a significantly stronger team = confidence boost
                const strengthDiff = pickedWinPct - oppWinPct
                if (strengthDiff > 0.15) legMod += 3       // Strong favorite by record
                else if (strengthDiff > 0.05) legMod += 1  // Slight edge
                else if (strengthDiff < -0.15) legMod -= 3 // Picking significant underdog
                else if (strengthDiff < -0.05) legMod -= 1 // Slight disadvantage
            }

            // Back-to-back penalty for the team we're picking
            if (stats.restDays) {
                const pickedTeam = (leg.team || '').toLowerCase()
                const homeTeamName = (stats.homeTeam?.name || '').toLowerCase()
                const isPickingHome = homeTeamName.includes(pickedTeam) || pickedTeam.includes(homeTeamName)

                if (isPickingHome && stats.restDays.home === 0) legMod -= 3
                if (!isPickingHome && stats.restDays.away === 0) legMod -= 3
                // Bonus if opponent is on B2B but we're not
                if (isPickingHome && stats.restDays.away === 0 && stats.restDays.home !== 0) legMod += 2
                if (!isPickingHome && stats.restDays.home === 0 && stats.restDays.away !== 0) legMod += 2
            }

            // Key player prop alignment: compare prop line to actual season average
            if (leg.bet_type === 'player_props' && leg.player) {
                const playerName = leg.player.toLowerCase()
                const allPlayers = [
                    ...(stats.homeKeyPlayers || []),
                    ...(stats.awayKeyPlayers || [])
                ]
                const playerMatch = allPlayers.find((p: any) =>
                    (p.name || '').toLowerCase().includes(playerName) || playerName.includes((p.name || '').toLowerCase())
                )
                if (playerMatch && leg.line) {
                    const lineMatch = String(leg.line).match(/(over|under)\s*([0-9.]+)/i)
                    if (lineMatch) {
                        const direction = lineMatch[1].toLowerCase()
                        const threshold = parseFloat(lineMatch[2])
                        const avg = playerMatch.value

                        if (direction === 'over') {
                            // Over: if avg is well above threshold, high confidence
                            const margin = (avg - threshold) / threshold
                            if (margin > 0.1) legMod += 4      // Avg 10%+ above line
                            else if (margin > 0) legMod += 1    // Avg slightly above
                            else if (margin < -0.1) legMod -= 4 // Avg 10%+ below line
                            else legMod -= 1
                        } else {
                            // Under: if avg is well below threshold, high confidence
                            const margin = (threshold - avg) / threshold
                            if (margin > 0.1) legMod += 4
                            else if (margin > 0) legMod += 1
                            else if (margin < -0.1) legMod -= 4
                            else legMod -= 1
                        }
                    }
                }
            }
        }

        totalModifier += legMod
        modifierLegs++
    }

    // Average the modifiers across legs and apply to base
    const avgModifier = modifierLegs > 0 ? totalModifier / modifierLegs : 0
    const confidence = Math.round(base + avgModifier)

    // Clamp to [3, 95]
    return Math.max(3, Math.min(95, confidence))
}

/**
 * Parse a win-loss record string (e.g., "45-22") into win percentage.
 */
function parseWinPct(record: string | undefined): number | null {
    if (!record) return null
    const match = record.match(/(\d+)\s*-\s*(\d+)/)
    if (!match) return null
    const wins = parseInt(match[1])
    const losses = parseInt(match[2])
    const total = wins + losses
    if (total === 0) return null
    return wins / total
}

// ─── Helper: fuzzy team match ──────────────────────────────────────────
function matchesTeam(picked: string, home: string, away: string, betType?: string): boolean {
    if (!picked) return false
    const p = picked.toLowerCase()
    // "Draw" is valid for soccer 3-way moneylines
    if (p === 'draw') return true
    // "Over"/"Under" are valid for totals bets
    if ((p === 'over' || p === 'under') && betType === 'totals') return true
    return (
        p === home.toLowerCase() ||
        p === away.toLowerCase() ||
        home.toLowerCase().includes(p) ||
        away.toLowerCase().includes(p) ||
        p.includes(home.toLowerCase()) ||
        p.includes(away.toLowerCase())
    )
}

// ─── Build error response ──────────────────────────────────────────────
function buildErrorResponse(request: ParlayRequest, rawError: string): any {
    let message: string

    const err = rawError.toLowerCase()

    if (err.includes('no qualifying') || err.includes('no games') || err.includes('not available')) {
        message = rawError
    } else if (err.includes('combined odds') || err.includes('risk') || err.includes('outside')) {
        message = `Couldn't build a parlay matching Risk Level ${request.riskLevel} with the current games. Try adjusting the risk slider or selecting more sports.`
    } else if (err.includes('wrong bet type') || err.includes('bet type')) {
        message = `Not enough ${request.betTypes.join('/')} bets available for the selected sports. Try enabling more bet types.`
    } else if (err.includes('too many legs') || err.includes('at least 2 legs')) {
        message = `Not enough qualifying bets to build a ${request.numLegs}-leg parlay for the selected sports. Try fewer legs or enable more bet types.`
    } else if (err.includes('substantive reasoning')) {
        message = 'AI returned an incomplete parlay. Please try again.'
    } else if (err.includes('duplicate')) {
        message = `Not enough unique bets to build a ${request.numLegs}-leg parlay. Try reducing legs or selecting more sports.`
    } else if (err.includes('correlation')) {
        message = `Can't build a safe parlay with only ${new Set(request.oddsData.map(g => g.id)).size} game(s). Select more sports for more games.`
    } else if (err.includes('credit') || err.includes('billing')) {
        message = 'AI service is temporarily unavailable. Please try again later or contact support.'
    } else if (err.includes('server') || err.includes('overload') || err.includes('timeout') || err.includes('timed out')) {
        message = 'AI servers are temporarily busy. Please try again in a moment.'
    } else if (err.includes('json') || err.includes('no legs') || err.includes('syntax')) {
        message = 'AI returned an invalid response. Please try again.'
    } else if (err.includes('game_id') || err.includes('invalid') || err.includes('team') || err.includes('not in game')) {
        message = 'AI picked data that doesn\'t match live odds. Please try again — results vary each attempt.'
    } else if (err.includes('rate limit') || err.includes('rate_limit')) {
        message = 'Too many requests to the AI. Please wait a moment and try again.'
    } else {
        console.error(`[ParlayGen] Unhandled error: "${rawError}"`)
        // Surface a short tail of the raw error so users (and logs) can see what's actually failing
        const tail = rawError.length > 140 ? rawError.slice(0, 140) + '…' : rawError
        message = `Couldn't generate a valid parlay (${tail}). Please try again — the AI may return different results on retry.`
    }

    return {
        error: message,
        legs: [],
        totalOdds: '+0',
        confidence: 0
    }
}
