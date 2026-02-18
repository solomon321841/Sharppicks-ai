// Multi-Sport Risk Logic Verification Test
// Tests that the AI applies consistent risk philosophy across all sports

import { generateParlay } from '../lib/ai/generateParlay';

console.log('🧪 Multi-Sport Risk Logic Test\n');
console.log('Testing AI risk consistency across different sports...\n');

const testCases = [
    {
        sport: 'soccer_spain_la_liga',
        sportName: '⚽ Soccer (La Liga)',
        riskLevel: 1,
        expectedBehavior: 'Very safe picks - stars with low thresholds (e.g., Mbappe Over 0.5 Shots)'
    },
    {
        sport: 'basketball_nba',
        sportName: '🏀 Basketball (NBA)',
        riskLevel: 1,
        expectedBehavior: 'Very safe picks - stars with low thresholds (e.g., LeBron Over 15.5 Points)'
    },
    {
        sport: 'americanfootball_nfl',
        sportName: '🏈 Football (NFL)',
        riskLevel: 1,
        expectedBehavior: 'Very safe picks - stars with low thresholds (e.g., Mahomes Over 225.5 Passing Yards)'
    },
    {
        sport: 'soccer_spain_la_liga',
        sportName: '⚽ Soccer (La Liga)',
        riskLevel: 10,
        expectedBehavior: 'High-risk picks - stars with high thresholds OR bench players (e.g., Mbappe Over 5.5 Shots)'
    },
    {
        sport: 'basketball_nba',
        sportName: '🏀 Basketball (NBA)',
        riskLevel: 10,
        expectedBehavior: 'High-risk picks - stars with high thresholds OR bench players (e.g., LeBron Over 35.5 Points)'
    }
];

async function runTest(testCase: typeof testCases[0]) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${testCase.sportName} - Risk Level ${testCase.riskLevel}`);
    console.log(`Expected: ${testCase.expectedBehavior}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
        const result = await generateParlay({
            sport: [testCase.sport],
            numLegs: 3,
            betTypes: ['player_props'],
            riskLevel: testCase.riskLevel
        });

        if (result.success && result.parlay) {
            console.log(`✅ SUCCESS - Generated ${result.parlay.legs.length} legs\n`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result.parlay.legs.forEach((leg: any, idx: number) => {
                console.log(`Leg ${idx + 1}:`);
                console.log(`  Player: ${leg.description}`);
                console.log(`  Line: ${leg.line}`);
                console.log(`  Odds: ${leg.odds}`);
                console.log(`  Reasoning: ${leg.reasoning}`);
                console.log();
            });

            // Analyze if picks match risk level
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const avgOdds = result.parlay.legs.reduce((sum: number, leg: any) => {
                const odds = typeof leg.odds === 'string' ? parseInt(leg.odds) : leg.odds;
                return sum + odds;
            }, 0) / result.parlay.legs.length;

            console.log(`Average Odds: ${avgOdds.toFixed(0)}`);

            if (testCase.riskLevel <= 3) {
                if (avgOdds > -200) {
                    console.log('⚠️  WARNING: Risk 1-3 should have heavy favorite odds (< -200)');
                } else {
                    console.log('✅ Odds align with Risk 1-3 philosophy');
                }
            } else if (testCase.riskLevel >= 8) {
                if (avgOdds < 0) {
                    console.log('⚠️  WARNING: Risk 8-10 should have underdog/long-shot odds (> 0)');
                } else {
                    console.log('✅ Odds align with Risk 8-10 philosophy');
                }
            }
        } else {
            console.log(`❌ FAILED: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`❌ ERROR: ${error}`);
    }
}

async function runAllTests() {
    for (const testCase of testCases) {
        await runTest(testCase);
        // Wait 2 seconds between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Multi-Sport Risk Logic Test Complete!');
    console.log('='.repeat(80));
}

runAllTests().catch(console.error);
