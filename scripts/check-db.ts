
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

const prisma = new PrismaClient()

async function main() {
    console.log('--- DB DUMP ---')
    const users = await prisma.user.findMany()
    console.log(`Users: ${users.length}`)
    users.forEach(u => console.log(` - ${u.id}`))

    const bets = await prisma.betHistory.findMany()
    console.log(`Bets: ${bets.length}`);
    bets.forEach((bet) => {
        console.log(
            ` - User: ${bet.user_id}, ID: ${bet.id}, Created: ${bet.created_at}`
        );
    });

    const dailyPicks = await prisma.dailyPick.findMany({
        include: { parlay: true },
        orderBy: { post_date: 'desc' }
    });
    console.log(`Daily Picks: ${dailyPicks.length}`);
    dailyPicks.forEach((dp) => {
        console.log(
            ` - ID: ${dp.id}, Date: ${dp.post_date}, Parlay ID: ${dp.parlay_id}, Risk: ${dp.parlay?.risk_level}`
        );
    });

    const parlays = await prisma.parlay.findMany()
    console.log(`Parlays: ${parlays.length}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
