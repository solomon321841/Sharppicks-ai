import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getScores, GameScore } from '@/lib/odds/getScores'
import { gradeBatch, type LegToGrade } from '@/lib/audit/grader'
import { calculatePayout } from '@/lib/audit/calculator'
import { calculateLegCLV } from '@/lib/audit/clv'
import { sendBetResultEmail } from '@/lib/email/resend'

export const maxDuration = 60

/**
 * GET /api/cron/check-results
 *
 * Vercel Cron Job route. Called daily at 9am UTC.
 * Directly runs the result checker (no self-fetch).
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[Cron] Starting result check...')

        // 1. Fetch all pending bet legs where game_time has passed
        const now = new Date()
        const pendingLegs = await prisma.parlayLeg.findMany({
            where: {
                result: 'pending',
                game_time: {
                    lt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
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
            console.log('[Cron] No pending legs to resolve.')
            return NextResponse.json({ resolved: 0, message: 'No pending bets to check' })
        }

        console.log(`[Cron] Found ${pendingLegs.length} pending legs to check.`)

        // 2. Get unique sports and fetch scores
        const uniqueSports = Array.from(new Set(pendingLegs.map(l => l.sport).filter(Boolean)))
        const scoresBySport: Record<string, GameScore[]> = {}
        for (const sport of uniqueSports) {
            try {
                scoresBySport[sport] = await getScores(sport)
            } catch (err) {
                console.error(`[Cron] Failed to get scores for ${sport}:`, err)
                scoresBySport[sport] = []
            }
        }

        // 3. Grade legs
        let resolved = 0
        let won = 0
        let lost = 0

        for (const sport of uniqueSports) {
            const sportLegs = pendingLegs.filter(l => l.sport === sport)
            const scores = scoresBySport[sport] || []

            if (scores.length === 0 && !sportLegs.some(l => l.bet_type?.includes('prop'))) continue

            const legsToGrade: LegToGrade[] = sportLegs.map(l => ({
                id: l.id,
                sport: l.sport,
                team: l.team,
                opponent: l.opponent,
                bet_type: l.bet_type,
                line: l.line,
                player: l.player,
                prop_market: l.prop_market
            }))

            const gradeResults = await gradeBatch(legsToGrade, scores)

            for (const [legId, grade] of Array.from(gradeResults.entries())) {
                if (grade.result === 'pending') continue

                const leg = sportLegs.find(l => l.id === legId)
                const clv = leg ? calculateLegCLV(leg.odds, leg.consensus_odds) : null

                await prisma.parlayLeg.update({
                    where: { id: legId },
                    data: {
                        result: grade.result,
                        actual_value: grade.actualValue ?? null,
                        graded_at: grade.gradedAt ?? new Date(),
                        clv: clv ?? null
                    }
                })

                resolved++
                if (grade.result === 'won') won++
                else if (grade.result === 'lost') lost++
            }
        }

        // 4. Resolve full parlays and calculate payouts
        const affectedParlayIds = Array.from(new Set(pendingLegs.map(l => l.parlay_id)))

        for (const parlayId of affectedParlayIds) {
            const allLegs = await prisma.parlayLeg.findMany({
                where: { parlay_id: parlayId }
            })

            const stillPending = allLegs.some(l => l.result === 'pending')
            if (stillPending) continue

            const anyLost = allLegs.some(l => l.result === 'lost')
            const parlayResult = anyLost ? 'lost' : 'won'

            const parlay = await prisma.parlay.findUnique({
                where: { id: parlayId },
                select: { total_odds: true }
            })

            const betHistories = await prisma.betHistory.findMany({
                where: { parlay_id: parlayId, result: 'pending' }
            })

            for (const bet of betHistories) {
                const stake = bet.stake_amount ? Number(bet.stake_amount) : 0
                const payout = parlayResult === 'won'
                    ? calculatePayout(stake, parlay?.total_odds || '+100')
                    : 0
                const profit = parlayResult === 'won' ? payout - stake : -stake

                await prisma.betHistory.update({
                    where: { id: bet.id },
                    data: {
                        result: parlayResult,
                        payout: parlayResult === 'won' ? payout : null,
                        profit,
                        graded_at: new Date()
                    }
                })
            }

            // Email users who bet on this parlay
            for (const bet of betHistories) {
                try {
                    const betUser = await prisma.user.findUnique({ where: { id: bet.user_id }, select: { email: true } })
                    if (betUser?.email) {
                        sendBetResultEmail(betUser.email, parlayResult as 'won' | 'lost', {
                            legs: allLegs.length,
                            odds: parlay?.total_odds || '+100',
                            payout: parlayResult === 'won' && bet.payout ? Number(bet.payout) : undefined,
                        }).catch(() => {})
                    }
                } catch { /* don't let email failures break the cron */ }
            }

            console.log(`[Cron] Parlay ${parlayId.slice(0, 8)}: ${parlayResult.toUpperCase()}`)
        }

        const summary = { resolved, won, lost, checked: pendingLegs.length }
        console.log('[Cron] Done.', summary)

        return NextResponse.json(summary)

    } catch (error) {
        console.error('[Cron] Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Cron job failed' },
            { status: 500 }
        )
    }
}
