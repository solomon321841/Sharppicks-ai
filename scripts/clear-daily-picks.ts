
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Clearing all Daily Picks...')
    // Delete all DailyPick entries
    // This will cascade delete linked Parlays if configured, or just leave them orphaned (which is fine for dev)
    // Actually, let's just delete DailyPick entries to force the API to regenerate
    const { count } = await prisma.dailyPick.deleteMany({})
    console.log(`Deleted ${count} Daily Picks.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
