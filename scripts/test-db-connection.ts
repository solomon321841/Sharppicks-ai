
import { PrismaClient } from '@prisma/client'

const REGIONS = [
    'aws-0-us-east-1',
    'aws-0-us-east-2',
    'aws-0-us-west-1',
    'aws-0-us-west-2',
    'aws-0-ca-central-1',
    'aws-0-eu-west-1',
    'aws-0-eu-west-2',
    'aws-0-eu-west-3',
    'aws-0-eu-central-1',
    'aws-0-eu-north-1',
    'aws-0-ap-southeast-1',
    'aws-0-ap-southeast-2',
    'aws-0-ap-northeast-1',
    'aws-0-ap-northeast-2',
    'aws-0-ap-south-1',
    'aws-0-sa-east-1'
]

const PROJECT_REF = 'qmqpfgnzxmfrmzboisju' // Verified from env
const RAW_PASSWORD = '9Bai8mil!!!'
const ENCODED_PASSWORD = encodeURIComponent(RAW_PASSWORD)

async function testConnection(region: string, encoded: boolean) {
    const pwd = encoded ? ENCODED_PASSWORD : RAW_PASSWORD
    // Note: If using encoded, we don't need to re-encode special chars? 
    // Wait, Prisma might double encode?
    // Connection string format: postgres://user:password@host...
    // If password has !, it should just work in URI?
    // Let's try both.

    const connectionString = `postgres://postgres.${PROJECT_REF}:${pwd}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`

    // Log masked
    console.log(`Testing ${region} (${encoded ? 'Encoded' : 'Raw'})...`)

    const client = new PrismaClient({
        datasourceUrl: connectionString,
        // Set lower timeout
        log: []
    })

    try {
        await client.$connect()
        // If connect works, try a query
        await client.user.count()
        console.log(`✅ SUCCESS! Region: ${region}, Encoded: ${encoded}`)
        console.log(connectionString)
        await client.$disconnect()
        return connectionString
    } catch (error: any) {
        // console.log(`❌ ${region}: ${error.message.split('\n')[0]}`)
        await client.$disconnect()
        return null
    }
}

async function main() {
    console.log('🔍 Comprehensive Brute-force for Supabase Pooler...')
    console.log(`Project: ${PROJECT_REF}`)
    console.log(`Password (Masked): ${RAW_PASSWORD.substring(0, 3)}...`)

    const promises = []

    for (const region of REGIONS) {
        promises.push(testConnection(region, false)) // Raw
        promises.push(testConnection(region, true))  // Encoded (URI)
    }

    const results = await Promise.all(promises)
    const success = results.find(r => r !== null)

    if (success) {
        console.log('\n🎉 FOUND IT!')
        console.log(success)
        process.exit(0)
    } else {
        console.log('\n❌ Failed to connect to any region.')
        process.exit(1)
    }
}

main()
