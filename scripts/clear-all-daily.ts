
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Clearing all Daily Picks and Daily Parlays...')

    // 1. Delete DailyPick entries
    const { count: pickCount } = await prisma.dailyPick.deleteMany({})
    console.log(`Deleted ${pickCount} Daily Picks.`)

    // 2. Delete Parlays marked as is_daily = true
    // This ensures we don't accidentally reuse old generated parlays if logic changed
    const { count: parlayCount } = await prisma.parlay.deleteMany({
        where: {
            is_daily: true
        }
    })
    console.log(`Deleted ${parlayCount} Daily Parlays.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
