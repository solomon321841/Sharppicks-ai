
import { prisma } from '../lib/prisma';

async function main() {
    console.log("Checking Daily Picks Status...");

    const now = new Date();
    const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const cycleDate = new Date(estNow);
    cycleDate.setHours(9, 0, 0, 0);

    // If before 9 AM, check yesterday's cycle
    if (estNow < cycleDate) {
        cycleDate.setDate(cycleDate.getDate() - 1);
    }

    console.log(`Target Cycle Date: ${cycleDate.toISOString()}`);

    const verifyPicks = await prisma.dailyPick.findMany({
        where: {
            post_date: cycleDate
        },
        include: {
            parlay: {
                include: { legs: true }
            }
        }
    });

    console.log(`Found ${verifyPicks.length} picks for this cycle.`);
    verifyPicks.forEach((p, i) => {
        console.log(`Pick ${i + 1}: ID=${p.id} Logic=${p.parlay?.ai_confidence}% Legs=${p.parlay?.legs.length}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
