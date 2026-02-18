
import { generateParlay } from '../lib/ai/generateParlay'
import { prisma } from '../lib/prisma'

async function main() {
    console.log('--- DEBUGGING DAILY PICK GENERATION ---')

    // 1. Test System User
    console.log('1. Checking System User...')
    let systemUser = await prisma.user.findUnique({
        where: { email: 'admin@sharppicks.ai' }
    })
    console.log('System User:', systemUser ? 'Found' : 'Not Found')

    // 2. Test Generation
    console.log('2. Testing Parlay Generation...')
    const sports = ['basketball_nba', 'icehockey_nhl', 'soccer_epl', 'soccer_spain_la_liga']
    console.log('Target Sports:', sports)

    try {
        const generated = await generateParlay({
            sport: sports,
            riskLevel: 5,
            numLegs: 3,
            betTypes: ['moneyline', 'spread', 'totals']
        })

        if (!generated || generated.error) {
            console.error('❌ Generation Failed:', generated.error)
        } else {
            console.log('✅ Generation Success!')
            console.log('Total Odds:', generated.totalOdds)
            console.log('Legs:', generated.legs.length)
            generated.legs.forEach((leg: any) => {
                console.log(`- ${leg.sport || 'Mixed'}: ${leg.team} (${leg.bet_type || leg.betType}) @ ${leg.odds}`)
            })
        }

    } catch (error) {
        console.error('❌ CRITICAL ERROR:', error)
    }
}

main()
