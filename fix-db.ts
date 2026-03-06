import { prisma } from './lib/prisma';
import { generateDailyParlays, getSystemUser } from './lib/daily-picks/generateDailyParlays';

async function main() {
    console.log("Cleaning up old daily picks for today...");
    const targetDate = new Date('2026-03-05T00:00:00Z');

    // Find bad daily picks
    const existing = await prisma.dailyPick.findMany({
        where: { post_date: targetDate }
    });

    for (const p of existing) {
        if (p.parlay_id) {
            await prisma.parlayLeg.deleteMany({ where: { parlay_id: p.parlay_id } });
            await prisma.parlay.delete({ where: { id: p.parlay_id } });
        }
        await prisma.dailyPick.delete({ where: { id: p.id } });
    }

    console.log("Generating fresh daily picks...");
    const systemUser = await getSystemUser();
    const results = await generateDailyParlays(targetDate, systemUser.id);
    console.log(results);

    const verify = await prisma.dailyPick.findMany({
        where: { post_date: targetDate },
        include: { parlay: true }
    });
    console.log(`Verified ${verify.length} daily picks`);
}

main().catch(console.error);
