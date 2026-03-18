
// Ensure required env vars are set
if (!process.env.ODDS_API_KEY) {
    console.error('❌ ODDS_API_KEY not set. Export it or add to .env.local');
    process.exit(1);
}

import { getSchedule } from '../lib/odds/getSchedule';

async function main() {
    console.log('Fetching Schedule...');
    const schedule = await getSchedule(['soccer_spain_la_liga']);

    if (schedule.length > 0 && schedule[0].matchups.length > 0) {
        const game = schedule[0].matchups[0];
        console.log('First Game:', game);
        if (game.id && game.h2h) {
            console.log('✅ Data structure valid: ID and H2H present.');
        } else {
            console.log('❌ Missing ID or H2H data.');
        }
    } else {
        console.log('No games found to test.');
    }
}

main().catch(console.error);
