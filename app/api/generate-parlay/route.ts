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
            select: { 
                subscription_tier: true,
                subscription_status: true,
                credits_used_today: true,
                last_credit_used_at: true 
            }
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

        // Stripe Pro Trial limit checking
        if (tier === 'pro' && profile?.subscription_status === 'trialing') {
            const now = new Date()
            let creditsUsed = profile.credits_used_today || 0
            if (profile.last_credit_used_at && new Date(profile.last_credit_used_at).toDateString() !== now.toDateString()) {
                creditsUsed = 0 // Reset for new day
            }
            if (creditsUsed >= 1) {
                return NextResponse.json({ error: 'trial_limit_reached' }, { status: 403 })
            }
        }

        if ((!sports || sports.length === 0) || !riskLevel || !numLegs || !betTypes) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await generateParlay({
            sports, // Corrected parameter name
            riskLevel,
            numLegs,
            betTypes
        })

        // Result now contains specific error messages if data is empty.
        // It won't be null anymore.

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 })
        }

        // Successfully generated. Increment usage if in Pro Trial.
        if (tier === 'pro' && profile?.subscription_status === 'trialing') {
            const now = new Date()
            let creditsUsed = profile.credits_used_today || 0
            if (profile.last_credit_used_at && new Date(profile.last_credit_used_at).toDateString() !== now.toDateString()) {
                creditsUsed = 0
            }
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    credits_used_today: creditsUsed + 1,
                    last_credit_used_at: now
                }
            })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
