
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDailyParlays, getSystemUser } from '@/lib/daily-picks/generateDailyParlays'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout for AI generation

export async function GET(request: Request) {
    try {
        // Secure Cron Job
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow manual testing in dev
            if (process.env.NODE_ENV !== 'development') {
                return new NextResponse('Unauthorized', { status: 401 })
            }
        }

        console.log('[Daily Picks Cron] Starting scheduled generation...')

        // 9 AM EST Logic
        const now = new Date()
        const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
        const cycleDate = new Date(estNow)
        cycleDate.setHours(9, 0, 0, 0)

        // If it's before 9 AM EST locally, we are arguably in "yesterday's" cycle if we want to display picks early?
        // But the requirement is "generates at 9am". 
        // If this runs at 9:05 AM, estNow >= cycleDate.
        // If this runs at 8:55 AM, estNow < cycleDate.
        // We probably want to generate for TODAY's cycle date.
        // If generated at 9 AM, it's for today.

        // Check if picks already exist for this cycle
        const existingPicks = await prisma.dailyPick.count({
            where: {
                post_date: cycleDate
            }
        })

        if (existingPicks >= 3) {
            console.log(`[Daily Picks Cron] Picks already exist for ${cycleDate.toISOString()}. Skipping.`)
            return NextResponse.json({ success: true, message: 'Picks already exist', date: cycleDate })
        }

        // Clean up partials if any
        await prisma.dailyPick.deleteMany({
            where: { post_date: cycleDate }
        })

        const systemUser = await getSystemUser()
        const results = await generateDailyParlays(cycleDate, systemUser.id)

        console.log('[Daily Picks Cron] Generation complete:', results)

        return NextResponse.json({ success: true, results })

    } catch (error: any) {
        console.error('[Daily Picks Cron] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
