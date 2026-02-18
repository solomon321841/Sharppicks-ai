import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { prisma } from '@/lib/prisma'
import { TIERS } from '@/lib/config/tiers'
import Stripe from 'stripe'

// Force dynamic to prevent static optimization
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const body = await request.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error(`Webhook Error: ${error.message}`)
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const subscription = event.data.object as Stripe.Subscription

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                // User just paid/subscribed
                if (!session.metadata?.userId) {
                    console.error('Webhook: Missing userId in metadata')
                    break
                }

                // Retrieve subscription details to get the status
                const subId = session.subscription as string
                const sub = await stripe.subscriptions.retrieve(subId)

                // Find which tier matches this price
                const planId = sub.items.data[0].price.id
                // Reverse lookup tier from Price ID
                const tierName = Object.values(TIERS).find(t => t.stripePriceId === planId)?.name || 'pro' // Default to pro if mapping fails, or handle error

                await prisma.user.update({
                    where: { id: session.metadata.userId },
                    data: {
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subId,
                        subscription_tier: tierName,
                        subscription_status: sub.status,
                        // trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000) : null
                    }
                })
                break
            }

            case 'invoice.payment_succeeded': {
                // Recurring payment successful - keep them active
                const subId = subscription.id || (event.data.object as any).subscription
                if (!subId) break

                // We need to find the user by subscription ID since invoice doesn't always have metadata
                const user = await prisma.user.findFirst({
                    where: { stripe_subscription_id: subId }
                })

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            subscription_status: 'active'
                        }
                    })
                }
                break
            }

            case 'customer.subscription.deleted': {
                // Subscription canceled/expired
                const subId = subscription.id
                const user = await prisma.user.findFirst({
                    where: { stripe_subscription_id: subId }
                })

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            subscription_status: 'canceled',
                            subscription_tier: 'free' // Downgrade to free
                        }
                    })
                }
                break
            }

            case 'item.created' as any:
                return NextResponse.json({ received: true })

            case 'payment_intent.succeeded':
                return NextResponse.json({ received: true })

            default:
                console.log(`Unhandled event type ${event.type}`)
        }
    } catch (error: any) {
        console.error('Webhook handler failed:', error)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
