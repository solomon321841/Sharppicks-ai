
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { parlayId, stake, sportsbook, legs, totalOdds } = body

        // 1. Validate User
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'User not authenticated. Please log in.' }, { status: 401 })
        }

        // 1.5 Ensure User Exists in DB (Sync with Supabase Auth)
        await prisma.user.upsert({
            where: { id: user.id },
            update: {}, // No fields to update, just ensure existence
            create: {
                id: user.id,
                email: user.email!,
                subscription_tier: 'free'
            }
        })

        // 2. Create Parlay Record if needed
        // Ideally we link to an existing parlay from the generator, but for custom builds we might need to create it on the fly
        // For simplicity in this demo, we'll assume we construct a new parlay record to house this bet

        // Derive unique sports from legs
        // Derive unique sports from legs
        const uniqueSports = Array.from(new Set(legs.map((l: any) => l.sport || 'Mixed'))) as string[];

        const newParlay = await prisma.parlay.create({
            data: {
                user_id: user.id,
                parlay_type: 'custom',
                total_odds: totalOdds,
                sports: uniqueSports,
                is_daily: false,
                bet_types: legs.map((l: any) => l.bet_type || 'moneyline'),
                num_legs: legs.length,
                risk_level: body.riskLevel || 5,
                ai_confidence: body.confidence,
                legs: {
                    create: legs.map((l: any) => ({
                        sport: l.sport || 'Mixed',
                        team: l.team,
                        bet_type: l.bet_type || 'moneyline',
                        line: l.line || null,
                        odds: l.odds,
                        opponent: l.opponent,
                        game_time: l.game_time ? new Date(l.game_time) : null,
                        player: l.player || null,
                        result: 'pending'
                    }))
                }
            }
        })

        // 3. Create Bet History Record
        const bet = await prisma.betHistory.create({
            data: {
                user_id: user.id,
                parlay_id: newParlay.id,
                stake_amount: stake,
                sportsbook: sportsbook,
                result: 'pending'
            }
        })

        return NextResponse.json(bet)

    } catch (error) {
        console.error('Track Bet Error:', error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to track bet' }, { status: 500 })
    }
}
