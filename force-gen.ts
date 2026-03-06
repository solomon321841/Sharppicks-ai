import { prisma } from './lib/prisma';
import { generateDailyParlays, getSystemUser } from './lib/daily-picks/generateDailyParlays';

async function main() {
  console.log("Starting forced generation...");

  const now = new Date();
  // Use the logic used in the actual API route exactly:
  const estNow = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }))
  let targetDate = new Date(estNow)
  targetDate.setHours(0, 0, 0, 0)
  if (estNow.getHours() < 9) {
    targetDate.setDate(targetDate.getDate() - 1)
  }

  console.log("Target Post Date:", targetDate.toISOString());

  const existing = await prisma.dailyPick.findMany({ where: { post_date: targetDate }, include: { parlay: true } });
  console.log("Existing daily picks BEFORE start:", existing.length);
  if (existing.length >= 3) {
    console.log("Already exist!");
  } else {
    const systemUser = await getSystemUser();
    const results = await generateDailyParlays(targetDate, systemUser.id);
    console.log("Results from generator:", results);

    const check = await prisma.dailyPick.findMany({ where: { post_date: targetDate } });
    console.log("Daily picks AFTER gen:", check.length);
  }
}

main().then(() => {
  console.log("Disconnecting DB...");
  return prisma.$disconnect();
}).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
