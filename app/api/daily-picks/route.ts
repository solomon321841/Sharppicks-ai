
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDailyParlays, getSystemUser } from '@/lib/daily-picks/generateDailyParlays'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout for AI generation

export async function GET() {
    try {
        // 9 AM EST Logic to determine current "Daily Cycle"
        const now = new Date()
        const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
        let cycleDate = new Date(estNow)
        cycleDate.setHours(9, 0, 0, 0)

        // If it's before 9 AM EST locally, the "current" cycle started yesterday at 9 AM
        if (estNow < cycleDate) {
            cycleDate.setDate(cycleDate.getDate() - 1)
        }

        console.log(`[Daily Picks API] Fetching for cycle: ${cycleDate.toISOString()}`)

        // 1. Fetch picks for this cycle
        const existingPicks = await prisma.dailyPick.findMany({
            where: {
                post_date: cycleDate
            },
            include: {
                parlay: {
                    include: {
                        legs: true
                    }
                }
            },
            orderBy: {
                parlay: {
                    risk_level: 'asc'
                }
            }
        })

        if (existingPicks.length === 0) {
            // Optional: Fallback to previous day if today's haven't run yet?
            // Or just return empty and let UI show "Coming Soon"
            // Startups often prefer showing *something*. Let's try previous day if today is empty.
            const yesterday = new Date(cycleDate)
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayPicks = await prisma.dailyPick.findMany({
                where: { post_date: yesterday },
                include: { parlay: { include: { legs: true } } },
                orderBy: { parlay: { risk_level: 'asc' } }
            })

            if (yesterdayPicks.length > 0) {
                return NextResponse.json(yesterdayPicks.map(pick => ({ ...pick.parlay, is_yesterday: true })))
            }

            return NextResponse.json([])
        }

        return NextResponse.json(existingPicks.map(pick => pick.parlay))

    } catch (error: any) {
        console.error('Daily Pick API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
