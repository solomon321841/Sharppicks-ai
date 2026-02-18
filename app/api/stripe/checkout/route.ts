import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { TIERS } from '@/lib/config/tiers'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { tier, priceId } = body

        // 1. Validate User
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Resolve Price ID
        const targetTier = Object.values(TIERS).find(t => t.name === tier)
        const effectivePriceId = priceId || targetTier?.stripePriceId

        if (!effectivePriceId) {
            return NextResponse.json({ error: 'Invalid tier or configuration' }, { status: 400 })
        }

        // 3. Get or Create Stripe Customer
        let stripeCustomerId = null

        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { stripe_customer_id: true, email: true }
        })

        if (userProfile?.stripe_customer_id) {
            stripeCustomerId = userProfile.stripe_customer_id
        } else {
            // Create new customer in Stripe
            const customer = await stripe.customers.create({
                email: userProfile?.email || user.email!,
                metadata: {
                    userId: user.id
                }
            })
            stripeCustomerId = customer.id

            // Save to DB immediately
            await prisma.user.update({
                where: { id: user.id },
                data: { stripe_customer_id: stripeCustomerId }
            })
        }

        // 4. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            line_items: [
                {
                    price: effectivePriceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
                tier: tier
            },
            allow_promotion_codes: true,
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
