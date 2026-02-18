
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Explicitly load .env.local to ensure DATABASE_URL is set
const envPath = path.join(process.cwd(), '.env.local')
try {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
        const [key, ...values] = line.split('=')
        if (key && values.length > 0) {
            const value = values.join('=').trim()
            if (value && !value.startsWith('#')) {
                process.env[key.trim()] = value
            }
        }
    })
} catch (error) {
    console.error('Error loading .env.local:', error)
}

const prisma = new PrismaClient()

async function main() {
    console.log('--- UPGRADING USER VIA PRISMA ---')

    try {
        // 1. Get the most recent user
        const users = await prisma.user.findMany({
            orderBy: {
                created_at: 'desc'
            },
            take: 1
        })

        if (!users || users.length === 0) {
            console.error('No users found in database.')
            return
        }

        const user = users[0]
        console.log(`Found User: ${user.email} (${user.id})`)
        console.log(`Current Tier: ${user.subscription_tier}`)

        // 2. Update user tier
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { subscription_tier: 'pro' }
        })

        console.log(`✅ User ${updatedUser.email} upgraded to Pro Tier!`)

    } catch (error) {
        console.error('Error during upgrade:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
