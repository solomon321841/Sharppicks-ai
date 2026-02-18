
import { prisma } from "../lib/prisma"
import { generateDailyParlays, getSystemUser } from "../lib/daily-picks/generateDailyParlays"
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Testing Daily Picks Logic...")

    const now = new Date()
    // Simulate 9 AM EST logic
    const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
    const cycleDate = new Date(estNow)
    cycleDate.setHours(9, 0, 0, 0)

    if (estNow < cycleDate) {
        cycleDate.setDate(cycleDate.getDate() - 1)
    }

    console.log(`Current Time (Local/UTC): ${now.toISOString()}`)
    console.log(`Calculated Cycle Date: ${cycleDate.toISOString()}`)

    const systemUser = await getSystemUser()
    console.log(`System User ID: ${systemUser.id}`)

    console.log("Starting generation...")
    const start = Date.now()

    // Call the function directly
    const results = await generateDailyParlays(cycleDate, systemUser.id)

    const duration = (Date.now() - start) / 1000
    console.log(`Generation complete in ${duration.toFixed(2)}s`)
    console.log("Results:", JSON.stringify(results, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
