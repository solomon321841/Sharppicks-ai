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
                parlay_credits: true,
                credits_reset_at: true 
            }
        })
        const tier = profile?.subscription_tier || 'free'

        if (!canAccessFeature(tier, 'build')) {
            return NextResponse.json({ error: 'Upgrade required to use Custom Parlay Builder' }, { status: 403 })
        }

        // 3. Monthly Replenishment Logic
        let currentCredits = profile?.parlay_credits ?? 3;
        let lastReset = profile?.credits_reset_at;

        if (tier === 'pro' || tier === 'whale') {
            const limit = getTierFeatures(tier).customBuilderLimit;
            // Replenish if it's their first time, OR the reset date has passed
            if (!lastReset || new Date() >= lastReset) {
                currentCredits = limit;
                const nextReset = new Date();
                nextReset.setMonth(nextReset.getMonth() + 1);
                lastReset = nextReset;

                await prisma.user.update({
                    where: { id: user.id },
                    data: { parlay_credits: currentCredits, credits_reset_at: nextReset }
                });
            }
        }

        // 4. Check Credit Limits
        if (currentCredits <= 0 && tier !== 'pro' && tier !== 'whale') {
            return NextResponse.json({ error: 'trial_limit_reached' }, { status: 403 })
        } else if (currentCredits <= 0) {
            return NextResponse.json({ error: 'trial_limit_reached' }, { status: 403 })
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

        // Successfully generated. Deduct 1 credit.
        await prisma.user.update({
            where: { id: user.id },
            data: {
                parlay_credits: { decrement: 1 }
            }
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Something went wrong generating your parlay. Please try again.' }, { status: 500 })
    }
}
