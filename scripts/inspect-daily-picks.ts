
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('Inspecting Daily Picks...');

    // Get daily picks for today (or recent)
    const picks = await prisma.dailyPick.findMany({
        orderBy: { post_date: 'desc' },
        take: 5,
        include: {
            parlay: {
                include: {
                    legs: true
                }
            }
        }
    });

    if (picks.length === 0) {
        console.log('No Daily Picks found.');
        return;
    }

    picks.forEach(p => {
        console.log(`\nDaily Pick [${p.post_date.toISOString()}] (Parlay ID: ${p.parlay_id})`);
        if (!p.parlay) {
            console.log('  No Parlay linked.');
            return;
        }
        console.log(`  Type: ${p.parlay.parlay_type}, Risk: ${p.parlay.risk_level}`);
        p.parlay.legs.forEach((leg: any, i: number) => {
            console.log(`    Leg ${i + 1}:`);
            console.log(`      Team: ${leg.team}`);
            console.log(`      Bet Type: '${leg.bet_type}'`);
            console.log(`      Line: '${leg.line}'`);
            console.log(`      Odds: ${leg.odds}`);
            console.log(`      Reasoning: '${leg.ai_reasoning}'`);
            console.log(`        (Reasoning length: ${leg.ai_reasoning?.length})`);
        });
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
