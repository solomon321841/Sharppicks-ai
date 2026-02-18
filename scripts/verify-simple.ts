
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
    console.log('Generating Simple La Liga Parlay (1 Leg)...');

    try {
        const result = await generateParlay({
            sport: ['soccer_spain_la_liga'],
            numLegs: 1,
            riskLevel: 5,
            betTypes: ['player_props'] // Just test props
        });

        if (result.error) {
            console.error('Error:', result.error);
            return;
        }

        console.log('\n--- Generated Single Leg ---');
        const leg = result.legs[0];
        console.log(`Player: ${leg.player}`);
        console.log(`Team: ${leg.team}`);
        console.log(`Opponent: ${leg.opponent}`);
        console.log(`Line: ${leg.line}`);
        console.log(`Odds: ${leg.odds}`);
        console.log(`Sportsbook: ${leg.sportsbook}`);

    } catch (error) {
        console.error('Generation failed:', error);
    }
}

main();
