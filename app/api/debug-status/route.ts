
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOdds } from '@/lib/odds/getOdds'

export const dynamic = 'force-dynamic'

export async function GET() {
    const status: any = {
        database: { status: 'unknown', error: null },
        oddsApi: { status: 'unknown', error: null },
        env: {
            // Masked values to confirm presence
            DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing (using fallback)',
            ODDS_API_KEY: process.env.ODDS_API_KEY ? 'set' : 'missing (using fallback)',
        }
    }

    // 1. Check Database Connection
    try {
        await prisma.$connect()
        // Try a simple query
        const userCount = await prisma.user.count()
        status.database = { status: 'connected', userCount }
    } catch (e: any) {
        status.database = { status: 'failed', error: e.message }
    }

    // 2. Check Odds API
    try {
        // Fetch 1 sport to test key
        const odds = await getOdds(['basketball_nba'], 'us', 'h2h', true)
        status.oddsApi = { status: 'connected', gamesFound: odds.length }
    } catch (e: any) {
        status.oddsApi = { status: 'failed', error: e.message }
    }

    return NextResponse.json(status)
}
