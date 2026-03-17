import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { TIERS, Tier } from '@/lib/config/tiers'
import { prisma } from '@/lib/prisma'

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
            // Handle unique constraint failure if an account with this email was created before with a different provider
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

        // 5. Create checkout session
        const headersList = request.headers
        const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const appUrl = origin.replace(/\/$/, '') // Remove trailing slash if present
        
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

        if (tier === 'pro' && !skipTrial) {
            sessionConfig.subscription_data.trial_period_days = 3
            // Allow them to start trial without a credit card
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

        // Provide user-friendly error messages
        if (error.type === 'StripeInvalidRequestError') {
            return NextResponse.json(
                { error: `Payment configuration error: ${error.message}` },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: `Something went wrong: ${error.message || error}` },
            { status: 500 }
        )
    }
}
