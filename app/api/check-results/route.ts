import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getScores, findMatchingGame, getWinner, getTotalScore, getTeamScore, GameScore } from '@/lib/odds/getScores'

/**
 * POST /api/check-results
 * 
 * Checks all pending bets and resolves them against completed game scores.
 * This can be called by:
 * 1. A cron job (every 30 min)
 * 2. When the dashboard loads (for fresh data)
 * 3. Manually via the bet history page
 */
export async function POST(request: Request) {
    try {
        // Optional: Verify cron secret for automated calls
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET
        const isCron = authHeader === `Bearer ${cronSecret}`

        // For non-cron calls, we could add user auth here if needed
        // For now, allow any call (the dashboard will call this on load)

        console.log(`[CheckResults] Starting result check (cron: ${isCron})...`)

        // 1. Fetch all pending bet legs where game_time has passed
        const now = new Date()
        const pendingLegs = await prisma.parlayLeg.findMany({
            where: {
                result: 'pending',
                game_time: {
                    lt: new Date(now.getTime() - 3 * 60 * 60 * 1000) // Game started 3+ hours ago (should be done)
                }
            },
            include: {
                parlay: {
                    include: {
                        bet_history: true
                    }
                }
            }
        })

        if (pendingLegs.length === 0) {
            console.log('[CheckResults] No pending legs to resolve.')
            return NextResponse.json({ resolved: 0, message: 'No pending bets to check' })
        }

        console.log(`[CheckResults] Found ${pendingLegs.length} pending legs to check.`)

        // 2. Get unique sports from pending legs
        const uniqueSports = Array.from(new Set(pendingLegs.map(l => l.sport).filter(Boolean)))
        console.log(`[CheckResults] Sports to check: ${uniqueSports.join(', ')}`)

        // 3. Fetch scores for each sport
        const scoresByPort: Record<string, GameScore[]> = {}
        for (const sport of uniqueSports) {
            try {
                scoresByPort[sport] = await getScores(sport)
            } catch (err) {
                console.error(`[CheckResults] Failed to get scores for ${sport}:`, err)
                scoresByPort[sport] = []
            }
        }

        // 4. Resolve each pending leg
        let resolved = 0
        let won = 0
        let lost = 0

        for (const leg of pendingLegs) {
            const scores = scoresByPort[leg.sport] || []
            if (scores.length === 0) continue

            // Find the matching game
            const game = findMatchingGame(scores, leg.team, leg.opponent)
            if (!game) {
                console.log(`[CheckResults] No match found for: ${leg.team} vs ${leg.opponent} (${leg.sport})`)
                continue
            }

            console.log(`[CheckResults] Matched: ${leg.team} → ${game.home_team} vs ${game.away_team}`)

            // Determine result based on bet type
            let legResult: 'won' | 'lost' | null = null

            const betType = leg.bet_type?.toLowerCase() || 'moneyline'

            if (betType === 'moneyline' || betType === 'h2h') {
                // Moneyline: Did the picked team win?
                const winner = getWinner(game)
                if (winner) {
                    const pickedTeamNorm = leg.team.toLowerCase()
                    const winnerNorm = winner.toLowerCase()
                    legResult = winnerNorm.includes(pickedTeamNorm) || pickedTeamNorm.includes(winnerNorm)
                        ? 'won' : 'lost'
                }
            } else if (betType === 'spread' || betType === 'spreads') {
                // Spread: Did the team cover?
                if (leg.line) {
                    const spread = parseFloat(leg.line)
                    const teamScore = getTeamScore(game, leg.team)
                    const oppScore = leg.opponent ? getTeamScore(game, leg.opponent) : null

                    if (teamScore !== null && oppScore !== null && !isNaN(spread)) {
                        const adjustedScore = teamScore + spread
                        legResult = adjustedScore > oppScore ? 'won' : 'lost'
                    }
                }
            } else if (betType === 'totals' || betType === 'total') {
                // Totals: Was the combined score over/under the line?
                if (leg.line) {
                    const isOver = leg.line.toLowerCase().includes('over') ||
                        leg.team.toLowerCase().includes('over')
                    const lineValue = parseFloat(leg.line.replace(/[^0-9.]/g, ''))
                    const total = getTotalScore(game)

                    if (total !== null && !isNaN(lineValue)) {
                        if (isOver) {
                            legResult = total > lineValue ? 'won' : 'lost'
                        } else {
                            legResult = total < lineValue ? 'won' : 'lost'
                        }
                    }
                }
            } else if (betType.includes('prop') || betType.includes('player')) {
                // Props: Cannot auto-resolve with scores API (need player stats)
                console.log(`[CheckResults] Skipping prop bet (no auto-resolution): ${leg.team} - ${leg.bet_type}`)
                continue
            }

            if (!legResult) {
                console.log(`[CheckResults] Could not determine result for: ${leg.team} (${leg.bet_type})`)
                continue
            }

            // 5. Update the leg result
            await prisma.parlayLeg.update({
                where: { id: leg.id },
                data: { result: legResult }
            })

            resolved++
            if (legResult === 'won') won++
            else lost++

            console.log(`[CheckResults] ✅ ${leg.team} ${leg.bet_type}: ${legResult.toUpperCase()}`)
        }

        // 6. Now resolve full parlays — check if all legs are done
        const affectedParlayIds = Array.from(new Set(pendingLegs.map(l => l.parlay_id)))

        for (const parlayId of affectedParlayIds) {
            const allLegs = await prisma.parlayLeg.findMany({
                where: { parlay_id: parlayId }
            })

            const stillPending = allLegs.some(l => l.result === 'pending')
            if (stillPending) continue // Not all legs resolved yet

            const anyLost = allLegs.some(l => l.result === 'lost')
            const parlayResult = anyLost ? 'lost' : 'won'

            // Update BetHistory result
            await prisma.betHistory.updateMany({
                where: { parlay_id: parlayId },
                data: { result: parlayResult }
            })

            console.log(`[CheckResults] 🎯 Parlay ${parlayId.slice(0, 8)}: ${parlayResult.toUpperCase()}`)
        }

        const summary = { resolved, won, lost, checked: pendingLegs.length }
        console.log(`[CheckResults] Done.`, summary)

        return NextResponse.json(summary)

    } catch (error) {
        console.error('[CheckResults] Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to check results' },
            { status: 500 }
        )
    }
}
