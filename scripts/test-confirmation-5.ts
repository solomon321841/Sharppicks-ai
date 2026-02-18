import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const BASE_URL = 'http://localhost:3000';

interface TestConfig {
    name: string;
    sports: string[];
    numLegs: number;
    riskLevel: number;
    betTypes: string[];
    expected: string;
}

const CONFIRMATION_TESTS: TestConfig[] = [
    {
        name: 'Test A: NBA + NHL, 6 legs, Risk 7, Moneyline',
        sports: ['basketball_nba', 'icehockey_nhl'],
        numLegs: 6,
        riskLevel: 7,
        betTypes: ['moneyline'],
        expected: '6 picks, mix of NBA and NHL, mostly underdogs (positive odds)'
    },
    {
        name: 'Test B: NBA, 8 legs, Risk 3, Spread',
        sports: ['basketball_nba'],
        numLegs: 8,
        riskLevel: 3,
        betTypes: ['spread'],
        expected: '8 picks, all NBA spreads, all favorites'
    },
    {
        name: 'Test C: NBA + EPL, 4 legs, Risk 5, Moneyline + Totals',
        sports: ['basketball_nba', 'soccer_epl'],
        numLegs: 4,
        riskLevel: 5,
        betTypes: ['moneyline', 'totals'],
        expected: '4 picks, mix of NBA and EPL, mix of ML and totals'
    },
    {
        name: 'Test D: NHL, 3 legs, Risk 10, Moneyline',
        sports: ['icehockey_nhl'],
        numLegs: 3,
        riskLevel: 10,
        betTypes: ['moneyline'],
        expected: '3 picks, all NHL, all heavy underdogs (+200 or higher)'
    },
    {
        name: 'Test E: NBA + NHL, 4 legs, Risk 5, ALL types',
        sports: ['basketball_nba', 'icehockey_nhl'],
        numLegs: 4,
        riskLevel: 5,
        betTypes: ['moneyline', 'spread', 'totals'],
        expected: '4 picks, multiple sports, variety of bet types'
    }
];

async function runConfirmationTest(test: TestConfig) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Config: Sports=${test.sports.join('+')} | Legs=${test.numLegs} | Risk=${test.riskLevel} | Types=${test.betTypes.join('+')}`);
    console.log(`Expected: ${test.expected}`);
    console.log(`\nGenerating parlay...`);

    const startTime = Date.now();

    try {
        const response = await fetch(`${BASE_URL}/api/generate-parlay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sports: test.sports,
                numLegs: test.numLegs,
                riskLevel: test.riskLevel,
                betTypes: test.betTypes
            })
        });

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        if (!response.ok) {
            console.error(`❌ FAILED: HTTP ${response.status}`);
            const error = await response.text();
            console.error(`Error: ${error}`);
            return { passed: false, duration };
        }

        const result = await response.json();

        if (result.error) {
            console.error(`❌ FAILED: ${result.error}`);
            return { passed: false, duration };
        }

        console.log(`\n✅ SUCCESS - Generated in ${duration}s`);
        console.log(`\nPICKS RETURNED (${result.legs?.length || 0} legs):`);
        console.log(`${'─'.repeat(80)}`);

        if (result.legs && Array.isArray(result.legs)) {
            result.legs.forEach((leg: any, index: number) => {
                const team = leg.team || 'Unknown';
                const opponent = leg.opponent || 'Unknown';
                const odds = leg.odds || leg.price || 'N/A';
                const betType = leg.bet_type || 'Unknown';
                const line = leg.line || leg.point;

                console.log(`\n${index + 1}. ${team} vs ${opponent}`);
                console.log(`   Bet Type: ${betType}`);
                console.log(`   Odds: ${odds}`);
                if (line) console.log(`   Line: ${line}`);
                if (leg.reasoning) console.log(`   Reasoning: ${leg.reasoning}`);
            });
        }

        console.log(`\n${'─'.repeat(80)}`);
        console.log(`Total Odds: ${result.totalOdds || 'N/A'}`);
        console.log(`Confidence: ${result.confidence || 'N/A'}%`);

        // Validation
        const legCount = result.legs?.length || 0;
        const passed = legCount === test.numLegs;

        if (!passed) {
            console.error(`\n❌ VALIDATION FAILED: Expected ${test.numLegs} legs, got ${legCount}`);
        } else {
            console.log(`\n✅ VALIDATION PASSED: Correct number of legs`);
        }

        // Additional checks
        if (test.riskLevel >= 8) {
            const hasPositiveOdds = result.legs?.some((l: any) => {
                const oddsStr = String(l.odds || l.price);
                return oddsStr.startsWith('+') || parseInt(oddsStr) > 0;
            });
            if (!hasPositiveOdds) {
                console.warn(`⚠️  WARNING: High risk (${test.riskLevel}) but no positive odds found`);
            }
        }

        return { passed, duration, result };

    } catch (error: any) {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.error(`❌ FAILED: ${error.message}`);
        return { passed: false, duration, error: error.message };
    }
}

async function runAllTests() {
    console.log('\n🏈 SHARPPICKS AI - CONFIRMATION TESTS\n');
    console.log('Testing backend API directly...\n');

    const results = [];

    for (const test of CONFIRMATION_TESTS) {
        const result = await runConfirmationTest(test);
        results.push({ test: test.name, ...result });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 FINAL RESULTS');
    console.log(`${'='.repeat(80)}\n`);

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    results.forEach((r, i) => {
        const status = r.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${i + 1}. ${status} - ${r.test} (${r.duration}s)`);
    });

    console.log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

    if (passed === results.length) {
        console.log('\n🎉 ALL TESTS PASSED - PRODUCTION READY!\n');
    } else {
        console.log('\n⚠️  Some tests failed. Review details above.\n');
    }
}

runAllTests();
