
import { PrismaClient } from '@prisma/client'

// 1. Test Odds API Key
async function testOdds() {
    console.log('Testing Odds API Key...')
    const apiKey = '5a09e10850e12620758a1b6f4504d87f' // The one we hardcoded
    const url = `https://api.the-odds-api.com/v4/sports/basketball_nba/odds?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`

    try {
        const res = await fetch(url)
        if (!res.ok) {
            console.error(`❌ Odds API Failed: ${res.status} ${res.statusText}`)
            const body = await res.text()
            console.error('Body:', body)
            return false
        }
        const data = await res.json()
        console.log(`✅ Odds API Success! Found ${data.length} NBA games.`)
        // Check quota headers if available
        console.log('Remaining Requests:', res.headers.get('x-requests-remaining'))
        return true
    } catch (e: any) {
        console.error('❌ Odds API Error:', e.message)
        return false
    }
}

// 2. Test DB Connection
async function testDB() {
    console.log('\nTesting Database Connection...')
    const connectionString = 'postgresql://postgres.qmqpfgnzxmfrmzboisju:9B%40i8mil!!!@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true'

    const client = new PrismaClient({
        datasourceUrl: connectionString,
        log: ['error']
    })

    try {
        await client.$connect()
        const count = await client.user.count()
        console.log(`✅ Database Success! User count: ${count}`)
        await client.$disconnect()
        return true
    } catch (e: any) {
        console.error('❌ Database Failed:', e.message)
        await client.$disconnect()
        return false
    }
}

async function main() {
    await testOdds()
    await testDB()
}

main()
