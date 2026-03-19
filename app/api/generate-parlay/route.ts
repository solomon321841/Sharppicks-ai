import { NextResponse } from 'next/server'
import { generateParlay } from '@/lib/ai/generateParlay'
import { createClient } from '@/lib/supabase/server'
import { canAccessFeature, getTierFeatures } from '@/lib/config/tiers'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

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

        // Rate limit: max 5 parlay generations per minute per user
        if (!rateLimit(user.id, 5, 60_000)) {
            return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
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
        if (currentCredits <= 0) {
            return NextResponse.json({ error: 'trial_limit_reached' }, { status: 403 })
        }

        // 5. Validate input types and ranges
        if (!Array.isArray(sports) || sports.length === 0 || sports.some((s: any) => typeof s !== 'string')) {
            return NextResponse.json({ error: 'Invalid sports selection' }, { status: 400 })
        }
        if (typeof riskLevel !== 'number' || riskLevel < 1 || riskLevel > 10 || !Number.isInteger(riskLevel)) {
            return NextResponse.json({ error: 'Risk level must be an integer between 1 and 10' }, { status: 400 })
        }
        if (typeof numLegs !== 'number' || numLegs < 2 || numLegs > 10 || !Number.isInteger(numLegs)) {
            return NextResponse.json({ error: 'Number of legs must be between 2 and 10' }, { status: 400 })
        }
        const validBetTypes = ['moneyline', 'spread', 'totals', 'player_props']
        if (!Array.isArray(betTypes) || betTypes.length === 0 || betTypes.some((t: any) => !validBetTypes.includes(t))) {
            return NextResponse.json({ error: 'Invalid bet types' }, { status: 400 })
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

        // Successfully generated. Atomically deduct 1 credit (only if > 0 to prevent overdraw).
        const updated = await prisma.user.updateMany({
            where: { id: user.id, parlay_credits: { gt: 0 } },
            data: {
                parlay_credits: { decrement: 1 }
            }
        })

        if (updated.count === 0) {
            // Race condition: credits were exhausted between check and decrement
            return NextResponse.json({ error: 'trial_limit_reached' }, { status: 403 })
        }

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Something went wrong generating your parlay. Please try again.' }, { status: 500 })
    }
}
