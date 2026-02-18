
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeHistory() {
    try {
        console.log('🗑️  Starting bet history wipe...');

        // Delete all bet history records
        const deletedHistory = await prisma.betHistory.deleteMany({});
        console.log(`✅ Deleted ${deletedHistory.count} bet history entries.`);

        // Delete all parlay legs (cascade might handle this but safer to be explicit)
        const deletedLegs = await prisma.parlayLeg.deleteMany({});
        console.log(`✅ Deleted ${deletedLegs.count} parlay legs.`);

        // Delete all parlays
        const deletedParlays = await prisma.parlay.deleteMany({});
        console.log(`✅ Deleted ${deletedParlays.count} parlays.`);

        console.log('✨ Database clean! Ready for fresh testing.');
    } catch (error) {
        console.error('❌ Wipe failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

wipeHistory();
