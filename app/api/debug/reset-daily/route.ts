
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const apiKey = process.env.ODDS_API_KEY

        const now = new Date()
        const recent = new Date(now)
        recent.setDate(now.getDate() - 1)

        await prisma.dailyPick.deleteMany({
            where: {
                post_date: {
                    gte: recent
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Recent picks deleted',
            keyStart: apiKey?.substring(0, 4)
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
