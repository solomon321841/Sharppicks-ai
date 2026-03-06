import { prisma } from './lib/prisma';
async function main() {
  const picks = await prisma.dailyPick.findMany({ include: { parlay: true } });
  console.log(picks.map(p => ({
    id: p.id,
    date: p.post_date,
    type: p.parlay?.parlay_type
  })));
}
main();
