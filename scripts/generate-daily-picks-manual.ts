
import { generateDailyParlays, getSystemUser } from '@/lib/daily-picks/generateDailyParlays'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting manual Daily Picks generation...')

    // 9 AM EST Logic (same as route.ts)
    const now = new Date()
    const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
    const cycleDate = new Date(estNow)
    cycleDate.setHours(9, 0, 0, 0)

    if (estNow < cycleDate) {
        cycleDate.setDate(cycleDate.getDate() - 1)
    }

    console.log(`Cycle Date: ${cycleDate.toISOString()}`)

    const systemUser = await getSystemUser()

    // Clean up partials if any
    await prisma.dailyPick.deleteMany({
        where: { post_date: cycleDate }
    })

    // Generate
    const results = await generateDailyParlays(cycleDate, systemUser.id)
    console.log('Generation Results:', JSON.stringify(results, null, 2))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
