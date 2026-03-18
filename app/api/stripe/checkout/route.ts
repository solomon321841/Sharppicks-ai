import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { TIERS, Tier } from '@/lib/config/tiers'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const VALID_PAID_TIERS: Tier[] = ['starter', 'pro', 'whale']

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { tier, returnUrl, skipTrial } = body

        // 1. Validate tier
        if (!tier || !VALID_PAID_TIERS.includes(tier as Tier)) {
            return NextResponse.json(
                { error: `Invalid tier: "${tier}". Valid options: ${VALID_PAID_TIERS.join(', ')}` },
                { status: 400 }
            )
        }

        const targetTier = TIERS[tier as Tier]
        const priceId = targetTier.stripePriceId

        if (!priceId) {
            console.error(`No Stripe price ID configured for tier: ${tier}`)
            return NextResponse.json(
                { error: 'This plan is not available for purchase. Please contact support.' },
                { status: 400 }
            )
        }

        // 2. Validate user
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Rate limit: max 3 checkout attempts per minute per user
        if (!rateLimit(user.id, 3, 60_000)) {
            return NextResponse.json({ error: 'Too many checkout attempts. Please wait a moment.' }, { status: 429 })
        }

        // 3. Ensure user exists in DB (sync from Supabase)
        let profile;
        try {
            profile = await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: {
                    id: user.id,
                    email: user.email!,
                    full_name: user.user_metadata?.full_name || null,
                    avatar_url: user.user_metadata?.avatar_url || null,
                    subscription_tier: 'free'
                }
            })
        } catch (e: any) {
            if (e.code === 'P2002') {
                profile = await prisma.user.update({
                    where: { email: user.email! },
                    data: { id: user.id }
                }).catch(() => null);

                if (!profile) {
                    return NextResponse.json(
                        { error: 'An account with this email already exists under a different login method. Please log in with that original method.' },
                        { status: 400 }
                    )
                }
            } else {
                throw e;
            }
        }

        // 4. Get or create Stripe customer
        let stripeCustomerId = profile.stripe_customer_id

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                metadata: { userId: user.id }
            })
            stripeCustomerId = customer.id

            await prisma.user.update({
                where: { id: user.id },
                data: { stripe_customer_id: stripeCustomerId }
            })
        }

        // 5. Cancel ALL existing subscriptions before creating a new one
        const isExistingSubscriber = profile.subscription_tier !== 'free' || profile.stripe_subscription_id
        if (stripeCustomerId) {
            try {
                const allSubs = await stripe.subscriptions.list({
                    customer: stripeCustomerId,
                    limit: 100,
                })
                for (const sub of allSubs.data) {
                    if (sub.status === 'active' || sub.status === 'trialing' || sub.status === 'past_due') {
                        await stripe.subscriptions.cancel(sub.id)
                        console.log(`Canceled old subscription ${sub.id} for customer ${stripeCustomerId}`)
                    }
                }
            } catch (e: any) {
                console.warn(`Error canceling old subscriptions: ${e.message}`)
            }

            // Clear the old subscription ID from DB
            await prisma.user.update({
                where: { id: user.id },
                data: { stripe_subscription_id: null }
            })
        }

        // 6. Create a new checkout session for the target tier
        const headersList = request.headers
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const appUrl = origin.replace(/\/$/, '')

        let cancelUrl = `${appUrl}/#pricing`
        if (returnUrl) {
            cancelUrl = returnUrl
        } else {
            const referer = headersList.get('referer')
            if (referer) {
                cancelUrl = referer
            }
        }

        const sessionConfig: any = {
            customer: stripeCustomerId,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${appUrl}/dashboard?success=true`,
            cancel_url: cancelUrl,
            metadata: {
                userId: user.id,
                tier: tier
            },
            allow_promotion_codes: true,
            subscription_data: {
                metadata: {
                    userId: user.id,
                    tier: tier
                }
            }
        }

        // Only offer trial for Pro if user has never had a subscription
        if (tier === 'pro' && !skipTrial && !isExistingSubscriber) {
            sessionConfig.subscription_data.trial_period_days = 3
            sessionConfig.payment_method_collection = 'if_required'
            sessionConfig.subscription_data.trial_settings = {
                end_behavior: {
                    missing_payment_method: 'cancel'
                }
            }
        }

        const session = await stripe.checkout.sessions.create(sessionConfig)

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)

        const message = error?.message || 'Unknown error'
        const stripeCode = error?.code || error?.type || ''

        return NextResponse.json(
            { error: `Checkout failed: ${message}${stripeCode ? ` (${stripeCode})` : ''}` },
            { status: 500 }
        )
    }
}
