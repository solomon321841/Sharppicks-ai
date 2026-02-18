/**
 * Cron Job: Generate Daily Picks
 * Runs daily at 9:00 AM EST to generate 4 parlays
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDailyParlays, getSystemUser } from '@/lib/daily-picks/generateDailyParlays';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // 1. Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret) {
            console.error('[Cron] CRON_SECRET not set in environment');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        if (authHeader !== `Bearer ${cronSecret}`) {
            console.error('[Cron] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Cron] Starting daily picks generation...');

        // 2. Get today's date (EST timezone)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 3. Delete existing picks for today (fresh start)
        const deleted = await prisma.dailyPick.deleteMany({
            where: { post_date: today }
        });

        console.log(`[Cron] Deleted ${deleted.count} existing picks for today`);

        // 4. Get system user
        const systemUser = await getSystemUser();

        // 5. Generate all 4 parlays
        const results = await generateDailyParlays(today, systemUser.id);

        // 6. Count successes
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        console.log(`[Cron] Generation complete: ${successCount} succeeded, ${failCount} failed`);

        return NextResponse.json({
            success: true,
            date: today.toISOString(),
            results,
            summary: {
                total: results.length,
                succeeded: successCount,
                failed: failCount
            }
        });

    } catch (error: any) {
        console.error('[Cron] Error generating daily picks:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
