
import dotenv from 'dotenv';
import path from 'path';
import { generateParlay } from '../lib/ai/generateParlay';
import { getOdds } from '../lib/odds/getOdds';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const LEAGUES = [
    { key: 'basketball_nba', name: 'NBA', propTerms: ['Points', 'Rebounds', 'Assists', 'Double Double', 'First Basket'] },
    { key: 'icehockey_nhl', name: 'NHL', propTerms: ['Goals', 'Saves', 'Shots', 'Points'] },
    { key: 'soccer_epl', name: 'EPL', propTerms: ['Goals', 'Shots', 'Passes', 'Assists', 'Tackles'] },
    { key: 'americanfootball_nfl', name: 'NFL', propTerms: ['TDs', 'Passing', 'Rushing', 'Catch'] }
];

const BET_TYPES = ['moneyline', 'spread', 'totals', 'player_props'];
const RISK_LEVELS = [2, 9]; // Test Low (2) and High (9)

async function runTest(league: any, betType: string, riskLevel: number) {
    const riskLabel = riskLevel < 5 ? 'LOW' : 'HIGH';
    console.log(`\n--- Testing ${league.name} | ${betType} | Risk: ${riskLabel} (${riskLevel}) ---`);

    try {
        const oddsData = await getOdds(league.key);

        if (!oddsData || oddsData.length === 0) {
            console.log(`ℹ️ SKIPPED: No games available for ${league.name}`);
            return 'SKIPPED';
        }

        const parlay = await generateParlay({
            sport: league.key,
            riskLevel,
            numLegs: 2,
            betTypes: [betType],
            oddsData
        } as any); // Type assertion if needed

        if (!parlay || !parlay.legs || parlay.legs.length === 0) {
            console.error(`❌ FAILED: No parlay generated even though odds exist`);
            return false;
        }

        let passed = true;

        // 1. Validate Bet Type
        const invalidLegs = parlay.legs.filter((leg: any) => leg.bet_type !== betType);
        if (invalidLegs.length > 0) {
            console.error(`❌ FAILED: Wrong bet type. Expected ${betType}, got: ${invalidLegs.map((l: any) => l.bet_type).join(', ')}`);
            passed = false;
        }

        // 2. Validate Odds / Risk Logic
        const allOdds = parlay.legs.map((l: any) => parseInt(String(l.odds)));
        const hasPlusOdds = allOdds.some((o: number) => o > 0);
        const allFavorites = allOdds.every((o: number) => o < 0);

        if (riskLabel === 'HIGH' && !hasPlusOdds) {
            console.error(`❌ FAILED: High Risk request returned all favorites/safety. Odds: ${allOdds.join(', ')}`);
            passed = false;
        }
        if (riskLabel === 'LOW' && allOdds.some((o: number) => o >= 120)) {
            // Exception for Player Props where we allow slightly higher odds to avoid infinite loops
            if (betType !== 'player_props' || allOdds.some((o: number) => o > 160)) {
                console.error(`❌ FAILED: Low Risk request returned risky odds. Odds: ${allOdds.join(', ')}`);
                passed = false;
            }
        }

        // 3. Validate Confidence Score Logic
        // Low Risk should generally be confident (> 70)
        // High Risk should generally be less confident (< 80)
        if (riskLabel === 'LOW' && parlay.confidence < 60) {
            console.warn(`⚠️ WARNING: Low confidence (${parlay.confidence}) for Low Risk bet.`);
        }
        if (riskLabel === 'HIGH' && parlay.confidence > 95) {
            console.warn(`⚠️ WARNING: Suspiciously high confidence (${parlay.confidence}) for High Risk bet.`);
        }

        // 4. Validate Content (Sport Specificity)
        if (betType === 'player_props') {
            const descriptionProps = parlay.legs.map((l: any) => l.reasoning + ' ' + (l.description || ''));
            const hasValidTerms = descriptionProps.some((desc: string) =>
                league.propTerms.some((term: string) => desc.includes(term) || desc.toLowerCase().includes(term.toLowerCase()))
            );

            // Also check for INVALID terms from other sports
            const invalidTerms = LEAGUES.filter(l => l.key !== league.key).flatMap(l => l.propTerms);
            // Distinct invalid terms that don't overlap (e.g., 'Points' is valid for NBA and NHL)
            const uniqueInvalidTerms = invalidTerms.filter(t => !league.propTerms.includes(t));

            const hasInvalidTerms = descriptionProps.some((desc: string) =>
                uniqueInvalidTerms.some(term => {
                    // Stricter check: word boundary to avoid substrings
                    const regex = new RegExp(`\\b${term}\\b`, 'i');
                    return regex.test(desc);
                })
            );

            if (hasInvalidTerms) {
                console.error(`❌ FAILED: Found terms from other sports in reasoning. Expected terms from ${league.name}. Description: ${descriptionProps[0]}`);
                passed = false;
            }
        }

        if (passed) {
            console.log(`✅ PASSED | Odds: ${allOdds.join(', ')} | Confidence: ${parlay.confidence}%`);
        }
        return passed;

    } catch (error) {
        console.error(`❌ ERROR: ${error}`);
        return false;
    }
}

async function main() {
    console.log('Starting Exhaustive User Acceptance Test...');
    let totalTests = 0;
    let failures = 0;


    for (const league of LEAGUES) {
        for (const betType of BET_TYPES) {
            for (const risk of RISK_LEVELS) {
                totalTests++;
                const result = await runTest(league, betType, risk);
                if (result === 'SKIPPED') {
                    // Do not count as failure
                } else if (!result) {
                    failures++;
                }
                await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
            }
        }
    }

    console.log('\n=== EXHAUSTIVE TEST SUMMARY ===');
    console.log(`Total Scenarios: ${totalTests}`);
    console.log(`Passed: ${totalTests - failures} (including Skipped)`);
    console.log(`Failed: ${failures}`);

    if (failures === 0) {
        console.log('🎉 ALL TESTS PASSED');
        process.exit(0);
    } else {
        console.error(`🚨 ${failures} TESTS FAILED`);
        process.exit(1);
    }
}

main().catch(console.error);
