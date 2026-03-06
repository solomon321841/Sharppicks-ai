import { prisma } from './lib/prisma';

async function main() {
    // find daily picks from today
    const now = new Date()
    const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
    let targetDate = new Date(estNow)
    targetDate.setHours(0, 0, 0, 0)

    const existing = await prisma.dailyPick.findMany({
        where: { post_date: targetDate },
        include: { parlay: true }
    });

    console.log(`Found ${existing.length} existing daily picks`);

    for (const p of existing) {
        if (p.parlay_id) {
            await prisma.parlayLeg.deleteMany({ where: { parlay_id: p.parlay_id } });
            await prisma.parlay.delete({ where: { id: p.parlay_id } });
        }
        await prisma.dailyPick.delete({ where: { id: p.id } });
    }
    console.log('Cleaned up');
}

main().catch(console.error);
