
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.dailyPick.count()
    console.log(`Total Daily Picks: ${count}`)

    if (count > 0) {
        const recent = await prisma.dailyPick.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { parlay: true }
        })
        console.log('Recent Picks:', JSON.stringify(recent, null, 2))
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
