import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserAuditSummary } from '@/lib/audit/calculator'

export const dynamic = 'force-dynamic'

/**
 * GET /api/audit
 * Returns audit/performance data for the authenticated user.
 * Query params:
 *   - period: 'all' | '7d' | '30d' | '90d' (default: 'all')
 */
export async function GET(request: Request) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || 'all'

        const daysBack = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : undefined

        const summary = await getUserAuditSummary(user.id, daysBack)

        return NextResponse.json(summary)
    } catch (error) {
        console.error('[Audit API] Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch audit data. Please try again.' },
            { status: 500 }
        )
    }
}
