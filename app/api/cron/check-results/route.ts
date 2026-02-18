import { NextResponse } from 'next/server'

/**
 * GET /api/cron/check-results
 * 
 * Vercel Cron Job route. Called automatically every 30 minutes.
 * Triggers the result checker to resolve pending bets.
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Call the check-results endpoint internally
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000'

        const response = await fetch(`${baseUrl}/api/check-results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cronSecret || ''}`
            }
        })

        const result = await response.json()
        console.log('[Cron] Check results completed:', result)

        return NextResponse.json(result)

    } catch (error) {
        console.error('[Cron] Error:', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Cron job failed' },
            { status: 500 }
        )
    }
}
