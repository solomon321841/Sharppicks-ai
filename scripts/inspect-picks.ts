
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching recent Daily Picks...')
    const picks = await prisma.dailyPick.findMany({
        take: 4,
        orderBy: { created_at: 'desc' },
        include: {
            parlay: {
                include: { legs: true }
            }
        }
    })

    picks.forEach((p, i) => {
        console.log(`\n--- Pick ${i + 1} (${p.parlay?.parlay_type}) ---`)
        p.parlay?.legs.forEach((l, j) => {
            console.log(`Leg ${j + 1}: [${l.ai_reasoning?.length ?? 0} chars] "${l.ai_reasoning}"`)
        })
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
