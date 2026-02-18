import { NextResponse } from 'next/server'
import { generateParlay } from '@/lib/ai/generateParlay'
import { createClient } from '@/lib/supabase/server'
import { canAccessFeature, getTierFeatures } from '@/lib/config/tiers'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60 // Allow longer timeout for AI generation

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { sports, riskLevel, numLegs, betTypes } = body

        // 1. Validate Session
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate Tier
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { subscription_tier: true }
        })
        const tier = profile?.subscription_tier || 'free'

        if (!canAccessFeature(tier, 'build')) {
            return NextResponse.json({ error: 'Upgrade required to use Custom Parlay Builder' }, { status: 403 })
        }

        // 3. Check Limits
        const { customBuilderLimit } = getTierFeatures(tier)
        if (customBuilderLimit !== -1) {
            const usageCount = await prisma.parlay.count({
                where: {
                    user_id: user.id,
                    parlay_type: 'custom'
                }
            })

            if (usageCount >= customBuilderLimit) {
                return NextResponse.json({
                    error: `You have used ${usageCount}/${customBuilderLimit} custom parlay credits. Upgrade for unlimited access.`
                }, { status: 403 })
            }
        }

        if ((!sports || sports.length === 0) || !riskLevel || !numLegs || !betTypes) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await generateParlay({
            sport: sports, // Now supports array of sports
            riskLevel,
            numLegs,
            betTypes
        })

        // Result now contains specific error messages if data is empty.
        // It won't be null anymore.

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
