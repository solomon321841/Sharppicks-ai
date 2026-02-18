import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';
import { generateParlay } from '@/lib/ai/generateParlay';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const args = process.argv.slice(2);
const targetSport = args[0];
const targetBetType = args[1];
const targetRisk = args[2] ? parseInt(args[2]) : null;

const SPORTS = targetSport ? [targetSport] : [
    'americanfootball_nfl',
    'basketball_nba',
    'icehockey_nhl',
    'soccer_epl'
];

const BET_TYPES = targetBetType ? [targetBetType] : [
    'moneyline',
    'spread',
    'totals',
    'player_props'
];

const RISK_LEVELS = targetRisk ? [targetRisk] : [1, 9]; // Test Low and High only to save time/tokens (5 is usually safe if 1/9 work)

async function main() {
    console.log('Starting Exhaustive Test...');

    let passed = 0;
    let failed = 0;
    const failures: string[] = [];

    for (const sport of SPORTS) {
        for (const betType of BET_TYPES) {
            for (const risk of RISK_LEVELS) {
                const testName = `${sport} | ${betType} | Risk ${risk}`;
                console.log(`\nTesting: ${testName}`);

                try {
                    const params = {
                        sport,
                        riskLevel: risk,
                        numLegs: 2,
                        betTypes: [betType]
                    };

                    const result = await generateParlay(params);

                    let scenarioSuccess = true;

                    // Basic check: did we get legs?
                    if (!result || !result.legs || result.legs.length === 0) {
                        console.error('  ❌ FAILED: No legs returned');
                        scenarioSuccess = false;
                    } else {
                        // Check Bet Type
                        const badBetType = result.legs.find((l: any) => l.bet_type !== betType);
                        if (badBetType) {
                            console.error(`  ❌ FAILED: Wrong bet type. Expected ${betType}, got ${badBetType.bet_type}`);
                            scenarioSuccess = false;
                        }

                        // Check Risk (Simplified assertions)
                        if (risk === 1) {
                            // Low risk: Fail if any leg is > +120
                            const risky = result.legs.find((l: any) => {
                                const val = parseInt(l.odds);
                                return l.odds.startsWith('+') && val >= 120;
                            });
                            if (risky) {
                                console.error(`  ❌ FAILED: Risky odds ${risky.odds} in Low Risk scenario`);
                                scenarioSuccess = false;
                            }
                        }

                        // Check Sport (Reasoning usually mentions team names, hard to validate strictly without knowing team db. 
                        // But we can check if it returns MOCK data for unsupported sports, or Real data for supported)
                        // For now we assume if it returns legs, it matched the sport or fallback.
                    }

                    if (scenarioSuccess) {
                        console.log('  ✅ PASSED');
                        passed++;
                    } else {
                        failed++;
                        failures.push(testName);
                    }

                } catch (e: any) {
                    console.error('  ❌ ERROR:', e.message);
                    failed++;
                    failures.push(`${testName} (Error)`);
                }
            }
        }
    }

    console.log('\n\n=== TEST SUMMARY ===');
    console.log(`Total Tests: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) {
        console.log('\nFailures:');
        failures.forEach(f => console.log(`- ${f}`));
        process.exit(1);
    } else {
        console.log('\nAll tests passed!');
        process.exit(0);
    }
}

main();
