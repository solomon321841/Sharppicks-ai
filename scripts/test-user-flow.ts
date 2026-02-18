
import dotenv from 'dotenv';
import path from 'path';
import { generateParlay } from '../lib/ai/generateParlay';
import { getOdds } from '../lib/odds/getOdds';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const LEAGUES = [
    { key: 'basketball_nba', name: 'NBA' },
    { key: 'icehockey_nhl', name: 'NHL' },
    { key: 'soccer_epl', name: 'EPL' }
];

const BET_TYPES = [
    'moneyline',
    'spread',
    'totals',
    'player_props'
];

async function runTest(league: { key: string, name: string }, betType: string) {
    console.log(`\n--- Testing ${league.name} | ${betType} ---`);
    try {
        const oddsData = await getOdds([league.key]);
        // Default to Low Risk (1) just to verify the bet type logic works
        const parlay = await generateParlay({
            sport: league.key,
            riskLevel: 1,
            numLegs: 2,
            betTypes: [betType],
            oddsData
        });

        if (!parlay || !parlay.legs || parlay.legs.length === 0) {
            console.error(`❌ FAILED: No parlay generated for ${league.name} ${betType}`);
            return false;
        }

        // Validate Bet Types
        const invalidLegs = parlay.legs.filter((leg: any) => leg.bet_type !== betType);
        if (invalidLegs.length > 0) {
            console.error(`❌ FAILED: Found invalid bet types. Expected ${betType}, got:`, invalidLegs.map((l: any) => l.bet_type));
            return false;
        }

        console.log(`✅ PASSED: All legs are ${betType}`);
        console.log(`   Legs: ${JSON.stringify(parlay.legs.map((l: any) => ({ team: l.team, type: l.bet_type, odds: l.odds })))}`);
        return true;

    } catch (error) {
        console.error(`❌ ERROR: ${error}`);
        return false;
    }
}

async function main() {
    console.log('Starting User Acceptance Test Sequence...');
    let failures = 0;

    for (const league of LEAGUES) {
        for (const betType of BET_TYPES) {
            // Skip player props for EPL if we suspect it might not be fully supported yet, but for now we test it.
            // Actually, based on previous steps, we believe mock data supports it.
            const passed = await runTest(league, betType);
            if (!passed) failures++;
            // Brief pause to avoid rate limits if using real API
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n=== UAT SUMMARY ===');
    if (failures === 0) {
        console.log('🎉 ALL TESTS PASSED');
        process.exit(0);
    } else {
        console.error(`🚨 ${failures} TESTS FAILED`);
        process.exit(1);
    }
}

main().catch(console.error);
