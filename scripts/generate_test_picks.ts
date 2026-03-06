import { generateDailyParlays, getSystemUser } from '../lib/daily-picks/generateDailyParlays';
import { prisma } from '../lib/prisma';

async function main() {
    console.log("Forcing Daily Pick Generation...");
    const systemUser = await getSystemUser();

    // Use target date
    const now = new Date();
    const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const estNow = new Date(estString);
    let today = new Date(Date.UTC(estNow.getFullYear(), estNow.getMonth(), estNow.getDate()));
    if (estNow.getHours() < 9) {
        today.setUTCDate(today.getUTCDate() - 1);
    }

    console.log("Wiping existing picks for today...");
    await prisma.dailyPick.deleteMany({});
    await prisma.parlay.deleteMany({ where: { is_daily: true } });

    console.log("Generating 4 new Daily Picks (Safe, Balanced, Risky, Lotto)...");
    const results = await generateDailyParlays(today, systemUser.id);

    console.log("Results:");
    console.log(JSON.stringify(results, null, 2));

    const check = await prisma.dailyPick.findMany({
        include: { parlay: { include: { legs: true } } }
    });
    console.log(`\nGenerated ${check.length} picks in DB.`);
    check.forEach(p => {
        console.log(`- ${p.parlay?.parlay_type}: ${p.parlay?.total_odds} (${p.parlay?.legs.length} legs)`);
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
