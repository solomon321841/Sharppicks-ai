
// Mock process.env
process.env.ODDS_API_KEY = 'ff4ef13bb0192313085f97891f5b058d';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-placeholder';

import fs from 'fs';
import path from 'path';
import { generateParlay } from '../lib/ai/generateParlay';

// Helper to load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
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
