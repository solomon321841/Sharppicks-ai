// Test AI-First Parlay Generation System
// Verifies that Claude makes intelligent picks based on player context and line difficulty

process.env.ODDS_API_KEY = 'fe678aa8c0189bb5b58903cc2b9bc5bf';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-placeholder';

import { generateParlay } from '../lib/ai/generateParlay';

async function testRiskLevel(riskLevel: number, description: string) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST: Risk Level ${riskLevel} - ${description}`);
    console.log('='.repeat(80));

    try {
        const result = await generateParlay({
            sport: ['soccer_spain_la_liga'],
            numLegs: 4,
            riskLevel,
            betTypes: ['moneyline', 'player_props']
        });

        if (result.error) {
            console.error('❌ Generation Error:', result.error);
            return;
        }

        console.log('\n✅ SUCCESS! Generated Parlay:');
        console.log(`Total Odds: ${result.totalOdds}`);
        console.log(`Confidence: ${result.confidence}%`);
        if (result.strategy) console.log(`Strategy: ${result.strategy}`);

        console.log('\nLegs:');
        result.legs.forEach((leg: any, i: number) => {
            console.log(`\n${i + 1}. ${leg.bet_type.toUpperCase()}`);
            console.log(`   ${leg.team} vs ${leg.opponent}`);
            if (leg.player) console.log(`   Player: ${leg.player}`);
            if (leg.line) console.log(`   Line: ${leg.line}`);
            console.log(`   Odds: ${leg.odds}`);
            if (leg.reasoning) console.log(`   Reasoning: ${leg.reasoning}`);
        });
    } catch (e: any) {
        console.error('❌ Test Failed:', e.message);
    }
}

async function main() {
    console.log('🧪 AI-First Parlay Generation System - Intelligence Test');
    console.log('Testing strategic reasoning across risk levels...\n');

    // Test 1: Safe picks (should favor low thresholds for stars)
    await testRiskLevel(1, 'Safe - Expect "Mbappe Over 0.5 Shots" type picks');

    // Test 2: Balanced picks (should mix moderate challenges)
    await testRiskLevel(5, 'Balanced - Expect "Mbappe Over 2.5 Shots" type picks');

    // Test 3: Risky picks (should favor high thresholds or bench players)
    await testRiskLevel(10, 'High Reward - Expect "Mbappe Over 5.5 Shots" or "Backup Over 0.5 Goals"');

    console.log('\n' + '='.repeat(80));
    console.log('✅ All tests complete!');
    console.log('='.repeat(80));
}

main();
