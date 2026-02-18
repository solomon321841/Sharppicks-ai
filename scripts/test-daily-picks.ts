// Quick test script to verify daily picks generation
import { generateDailyParlays, getSystemUser } from '../lib/daily-picks/generateDailyParlays';

async function test() {
    console.log('Testing daily picks generation...\n');

    const systemUser = await getSystemUser();
    console.log(`System user: ${systemUser.email} (ID: ${systemUser.id})\n`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await generateDailyParlays(today, systemUser.id);

    console.log('\n=== RESULTS ===');
    results.forEach(r => {
        if (r.success) {
            console.log(`✅ ${r.type}: SUCCESS (Parlay ID: ${r.parlayId})`);
        } else {
            console.log(`❌ ${r.type}: FAILED - ${r.error}`);
        }
    });
}

test().catch(console.error);
