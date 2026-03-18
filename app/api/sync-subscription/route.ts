import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { prisma } from '@/lib/prisma'
import { getTierByPriceId, TIERS } from '@/lib/config/tiers'

export async function POST() {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                stripe_subscription_id: true,
                stripe_customer_id: true,
                subscription_tier: true,
                subscription_status: true,
            }
        })

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({
                tier: profile?.subscription_tier || 'free',
                status: profile?.subscription_status || null,
                synced: false
            })
        }

        // Find the subscription — use stored ID if available, otherwise look up by customer
        let sub
        if (profile.stripe_subscription_id) {
            sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
        } else {
            // Webhook never set the subscription ID — look it up via the customer
            const subs = await stripe.subscriptions.list({
                customer: profile.stripe_customer_id,
                status: 'all',
                limit: 1,
            })
            sub = subs.data[0]
        }

        if (!sub) {
            return NextResponse.json({
                tier: profile.subscription_tier,
                status: profile.subscription_status,
                synced: false
            })
        }

        const priceId = sub.items.data[0]?.price?.id
        if (!priceId) {
            return NextResponse.json({
                tier: profile.subscription_tier,
                status: profile.subscription_status,
                synced: false
            })
        }

        const tierName = getTierByPriceId(priceId)
        const currentStatus = sub.status

        const updateData: Record<string, any> = {
            subscription_status: currentStatus,
            stripe_subscription_id: sub.id, // Always persist the subscription ID
        }

        if (tierName && tierName !== profile.subscription_tier) {
            updateData.subscription_tier = tierName
            updateData.parlay_credits = TIERS[tierName]?.customBuilderLimit || 0
            const nextReset = new Date()
            nextReset.setMonth(nextReset.getMonth() + 1)
            updateData.credits_reset_at = nextReset
        }

        // If tier matches but status changed from trialing to active, refresh credits
        if (
            tierName &&
            tierName === profile.subscription_tier &&
            profile.subscription_status === 'trialing' &&
            currentStatus === 'active'
        ) {
            updateData.parlay_credits = TIERS[tierName]?.customBuilderLimit || 0
            const nextReset = new Date()
            nextReset.setMonth(nextReset.getMonth() + 1)
            updateData.credits_reset_at = nextReset
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        })

        return NextResponse.json({
            tier: updateData.subscription_tier || profile.subscription_tier,
            status: currentStatus,
            synced: true
        })
    } catch (error: any) {
        console.error('Sync subscription error:', error)
        return NextResponse.json({ error: 'Failed to sync subscription' }, { status: 500 })
    }
}
