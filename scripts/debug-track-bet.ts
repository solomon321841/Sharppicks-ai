
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Simple manual env loader
const loadEnv = (file: string) => {
    const envPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(envPath)) {
        console.log(`Loading ${file}...`)
        const envConfig = fs.readFileSync(envPath, 'utf8')
        envConfig.split('\n').forEach(line => {
            const parts = line.split('=')
            if (parts.length >= 2) {
                const key = parts[0].trim()
                let value = parts.slice(1).join('=').trim()
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
                process.env[key] = value // Force set
            }
        })
    }
}

loadEnv('.env')
loadEnv('.env.local')

console.log('Database URL exists:', !!process.env.DATABASE_URL)

const prisma = new PrismaClient()

async function main() {
    console.log('Testing track-bet logic directly with Prisma...')

    // 1. Mock User (We need a real user ID from the DB)
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error('No user found in DB. Cannot test.')
        return
    }
    console.log('Found user:', user.id)

    const mockLegs = [
        {
            team: 'Test Team A',
            opponent: 'Test Team B',
            odd: '+150',
            odds: '+150',
            bet_type: 'Moneyline',
            line: null,
            reasoning: 'AI reasoning text'
        },
        {
            team: 'Test Team C',
            opponent: 'Test Team D',
            odds: '-110',
            bet_type: 'Spread',
            line: '-5.5',
            reasoning: 'AI reasoning text 2'
        }
    ]

    try {
        const parlayData = {
            user_id: user.id,
            parlay_type: 'custom',
            total_odds: '+400',
            sports: ['Mixed'],
            is_daily: false,
            bet_types: mockLegs.map(l => l.bet_type || 'moneyline'),
            num_legs: mockLegs.length,
            risk_level: 5,
            ai_confidence: 85,
            legs: {
                create: mockLegs.map(l => ({
                    sport: 'Mixed',
                    team: l.team,
                    bet_type: l.bet_type || 'moneyline',
                    odds: l.odds,
                    opponent: l.opponent,
                    result: 'pending'
                }))
            }
        }

        console.log('Attempting to create parlay with data:', JSON.stringify(parlayData, null, 2));

        const newParlay = await prisma.parlay.create({
            data: parlayData
        })
        console.log('Successfully created parlay:', newParlay.id)

        const bet = await prisma.betHistory.create({
            data: {
                user_id: user.id,
                parlay_id: newParlay.id,
                stake_amount: 10,
                sportsbook: 'FanDuel',
                result: 'pending'
            }
        })
        console.log('Successfully created bet history:', bet.id)

    } catch (e) {
        console.error('Error creating parlay/bet:', e)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
