
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // 1. Validate User
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            console.log('[API] Bet History - No User')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[API] Fetching history for user:', user.id)

        // 2. Fetch Bet History with Relations
        const bets = await prisma.betHistory.findMany({
            where: {
                user_id: user.id
            },
            include: {
                parlay: {
                    include: {
                        legs: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        console.log('[API] Found bets:', bets.length)

        return NextResponse.json(bets)

    } catch (error) {
        console.error('Bet History Error:', error)
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
