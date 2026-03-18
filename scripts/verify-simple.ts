
import fs from 'fs';
import path from 'path';
import { generateParlay } from '../lib/ai/generateParlay';

// Load env from .env.local if available
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
        }
    });
}

if (!process.env.ODDS_API_KEY) {
    console.error('❌ ODDS_API_KEY not set. Export it or add to .env.local');
    process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not set. Export it or add to .env.local');
    process.exit(1);
}

async function main() {
    console.log('Generating NBA Mixed Parlay (3 Legs, Risk 5)...');

    try {
        const result = await generateParlay({
            sports: ['basketball_nba'],
            numLegs: 3,
            riskLevel: 5,
            betTypes: ['moneyline', 'spread', 'player_props']
        });

        if (result.error) {
            console.error('Error:', result.error);
            return;
        }

        console.log('\n--- AI ANALYSIS STRATEGY ---');
        console.log(`Strategy: ${result.strategy}`);

        console.log(`\nTotal Odds: ${result.totalOdds}`);
        console.log(`Confidence: ${result.confidence}%`);
        console.log(`\n--- Generated Legs ---`);
        for (const leg of result.legs) {
            console.log(`\n  ${leg.player || leg.team} vs ${leg.opponent}`);
            console.log(`  Type: ${leg.bet_type} | Line: ${leg.line} | Odds: ${leg.odds}`);
            console.log(`  Book: ${leg.sportsbook}${leg.bestBook ? ` (Best: ${leg.bestBook})` : ''}`);
            console.log(`  Reasoning: ${leg.reasoning}`);
        }

    } catch (error) {
        console.error('Generation failed:', error);
    }
}

main();
