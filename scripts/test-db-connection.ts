
import { PrismaClient } from '@prisma/client'

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not set. Export it or add to .env.local');
        process.exit(1);
    }

    console.log('🔍 Testing database connection...');

    const client = new PrismaClient({
        datasourceUrl: process.env.DATABASE_URL,
        log: []
    });

    try {
        await client.$connect();
        const count = await client.user.count();
        console.log(`✅ Connected successfully! Users in DB: ${count}`);
        await client.$disconnect();
    } catch (error: any) {
        console.error(`❌ Connection failed: ${error.message.split('\n')[0]}`);
        await client.$disconnect();
        process.exit(1);
    }
}

main();
