import { prisma } from './lib/prisma';
async function main() {
    const p = await prisma.dailyPick.create({
        data: {
            post_date: new Date(),
            sport_focus: "Mixed",
            result: "pending"
        }
    });
    console.log("Created:", p);
    const found = await prisma.dailyPick.findUnique({ where: { id: p.id } });
    console.log("Found:", found);
}
main().catch(console.error);
