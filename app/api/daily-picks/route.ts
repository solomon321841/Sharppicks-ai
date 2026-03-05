
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDailyParlays, getSystemUser } from '@/lib/daily-picks/generateDailyParlays'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout for AI generation

export async function GET() {
    try {
        // 9 AM EST Logic to determine current "Daily Cycle"
        const now = new Date();
        const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
        const estNow = new Date(estString);

        // ALWAYS construct a Midnight UTC date representing the "Date" of the picks
        // This removes local server timezone shifts on Vercel
        let targetDate = new Date(Date.UTC(estNow.getFullYear(), estNow.getMonth(), estNow.getDate()));

        // If it's before 9 AM EST, the "current" cycle is yesterday's picks
        if (estNow.getHours() < 9) {
            targetDate.setUTCDate(targetDate.getUTCDate() - 1);
        }

        console.log(`[Daily Picks API] Fetching for cycle: ${targetDate.toISOString()}`)

        // 1. Fetch picks for this cycle
        let existingPicks = await prisma.dailyPick.findMany({
            where: {
                post_date: targetDate
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

        // 2. Auto-generate if missing (failsafe for cron issues or local dev)
        if (existingPicks.length === 0) {
            console.log(`[Daily Picks API] No picks found for ${targetDate.toISOString()}. Auto-generating...`)
            const systemUser = await getSystemUser()
            // Generate parlays and save them with the targetDate identifier
            await generateDailyParlays(targetDate, systemUser.id)

            // Fetch them again after generation
            existingPicks = await prisma.dailyPick.findMany({
                where: {
                    post_date: targetDate
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
        }

        return NextResponse.json(existingPicks.map(pick => pick.parlay))

    } catch (error: any) {
        console.error('Daily Pick API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
