import dotenv from 'dotenv';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

// Load .env.local specifically
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyOddsAPI() {
    console.log('\n--- Verifying The Odds API ---');
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
        console.error('❌ ODDS_API_KEY is missing in environment variables.');
        return;
    }

    try {
        const response = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`);
        if (!response.ok) {
            console.error(`❌ Odds API failed with status: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`   Details: ${errorText}`);
        } else {
            const data = await response.json();
            console.log(`✅ Odds API connection successful! Found ${data.length} sports.`);
            const quota = response.headers.get('x-requests-remaining');
            console.log(`   Quota remaining: ${quota}`);
        }
    } catch (error) {
        console.error('❌ Network error connecting to Odds API:', error);
    }
}

async function verifyAnthropicAPI() {
    console.log('\n--- Verifying Anthropic API ---');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error('❌ ANTHROPIC_API_KEY is missing in environment variables.');
        return;
    }

    const anthropic = new Anthropic({ apiKey });

    try {
        const msg = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }],
        });
        console.log('✅ Anthropic API connection successful!');
        console.log(`   Response: ${(msg.content[0] as any).text}`);
    } catch (error: any) {
        console.error('❌ Anthropic API failed:', error.message);
        if (error.status) console.error(`   Status: ${error.status}`);
        if (error.type) console.error(`   Type: ${error.type}`);
    }
}

async function main() {
    console.log('Starting API Verification...');
    await verifyOddsAPI();
    await verifyAnthropicAPI();
    console.log('\nVerification complete.');
}

main();
