import { getOdds } from '../lib/odds/getOdds'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testAPIs() {
    console.log('Testing APIs...')

    // 1. Test The Odds API
    console.log('\n--- Testing The Odds API ---')
    if (!process.env.ODDS_API_KEY) {
        console.error('❌ ODDS_API_KEY is missing')
    } else {
        try {
            const odds = await getOdds(['americanfootball_nfl'], 'us', 'h2h')
            if (Array.isArray(odds) && odds.length > 0) {
                console.log('✅ The Odds API connection successful')
                console.log(`Fetched ${odds.length} games. First game: ${odds[0].home_team} vs ${odds[0].away_team}`)
            } else {
                console.warn('⚠️ The Odds API returned no data (or mock data if keys invalid)')
                console.log(odds)
            }
        } catch (error) {
            console.error('❌ The Odds API failed:', error)
        }
    }

    // 2. Test Anthropic API
    console.log('\n--- Testing Anthropic API ---')
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY is missing')
    } else {
        try {
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
            const msg = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 100,
                messages: [{ role: 'user', content: 'Say "Antigravity Connection Successful" if you can hear me.' }],
            })
            console.log('✅ Anthropic API connection successful')
            console.log('Response:', (msg.content[0] as any).text)
        } catch (error) {
            console.error('❌ Anthropic API failed:', error)
        }
    }
}

testAPIs()
