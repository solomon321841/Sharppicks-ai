
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // 1. Try to get picks for today's cycle (9 AM EST logic)
        const now = new Date();
        const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
        const estNow = new Date(estString);

        const year = estNow.getFullYear();
        const month = estNow.getMonth();
        const day = estNow.getDate();
        let targetDate = new Date(Date.UTC(year, month, day));

        // If before 9 AM EST, use yesterday's cycle
        if (estNow.getHours() < 9) {
            targetDate.setUTCDate(targetDate.getUTCDate() - 1);
        }

        console.log(`[Daily Picks API] Target cycle: ${targetDate.toISOString()}`);

        let picks = await prisma.dailyPick.findMany({
            where: { post_date: targetDate },
            include: { parlay: { include: { legs: true } } },
            orderBy: { parlay: { risk_level: 'asc' } }
        });

        // 2. FALLBACK: If no picks for exact date, get the most recent daily picks
        if (picks.length === 0) {
            console.log(`[Daily Picks API] No picks for target date, falling back to most recent picks`);
            picks = await prisma.dailyPick.findMany({
                include: { parlay: { include: { legs: true } } },
                orderBy: { created_at: 'desc' },
                take: 3
            });
        }

        // 3. Return whatever we have (never try to auto-generate in API route)
        return NextResponse.json(picks.map(pick => pick.parlay).filter(Boolean));

    } catch (error: any) {
        console.error('Daily Pick API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
