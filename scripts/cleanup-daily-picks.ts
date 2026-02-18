
import { prisma } from '../lib/prisma'

async function main() {
    console.log('--- CLEANING UP DAILY PICKS ---')

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
        const deleted = await prisma.dailyPick.deleteMany({})

        console.log(`Deleted ${deleted.count} daily picks for today (${today.toISOString()}).`)

    } catch (error) {
        console.error('Error cleaning up:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
