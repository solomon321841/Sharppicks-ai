import { prisma } from './lib/prisma';
async function main() {
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    const picks = await prisma.dailyPick.findMany({
        where: { post_date: targetDate },
        include: { parlay: true }
    });
    console.log(picks.map(p => ({
        id: p.id,
        date: p.post_date,
        type: p.parlay?.parlay_type
    })));
}
main();
