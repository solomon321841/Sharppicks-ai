import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { prisma } from '@/lib/prisma'
import { getTierByPriceId, TIERS } from '@/lib/config/tiers'
import { sendSubscriptionConfirmation, sendPaymentFailedEmail, sendSubscriptionCanceledEmail } from '@/lib/email/resend'
import Stripe from 'stripe'

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
        console.error(`Webhook signature verification failed: ${error.message}`)
        return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
    }

    try {
        switch (event.type) {
            // ─── NEW SUBSCRIPTION CREATED ────────────────────────────
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                const userId = session.metadata?.userId
                if (!userId) {
                    console.error('Webhook checkout.session.completed: Missing userId in metadata')
                    break
                }

                const subId = session.subscription as string
                if (!subId) {
                    console.error('Webhook checkout.session.completed: Missing subscription ID')
                    break
                }

                // Retrieve the full subscription to get price details
                const sub = await stripe.subscriptions.retrieve(subId)
                const planId = sub.items.data[0]?.price?.id

                if (!planId) {
                    console.error('Webhook checkout.session.completed: Could not determine price ID')
                    break
                }

                // Lookup the tier from price ID
                const tierName = getTierByPriceId(planId)
                if (!tierName) {
                    console.error(`Webhook checkout.session.completed: Unknown price ID "${planId}". Falling back to session metadata.`)
                }

                // Use the tier from price lookup, or fall back to session metadata
                const finalTier = tierName || session.metadata?.tier || 'starter'

                const nextReset = new Date()
                nextReset.setMonth(nextReset.getMonth() + 1)

                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subId,
                        subscription_tier: finalTier,
                        subscription_status: sub.status,
                        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
                        parlay_credits: TIERS[finalTier as keyof typeof TIERS]?.customBuilderLimit || 0,
                        credits_reset_at: nextReset
                    }
                })

                console.log(`Checkout completed: User ${userId} → tier "${finalTier}", status "${sub.status}"`)

                // Send subscription confirmation email
                const checkoutUser = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
                if (checkoutUser?.email) {
                    sendSubscriptionConfirmation(checkoutUser.email, finalTier).catch(() => {})
                }
                break
            }

            // ─── RECURRING PAYMENT SUCCEEDED ─────────────────────────
            case 'invoice.payment_succeeded': {
                // Extract subscription ID from the invoice event data
                const invoiceData = event.data.object as Record<string, any>
                const subId = typeof invoiceData.subscription === 'string'
                    ? invoiceData.subscription
                    : invoiceData.subscription?.id

                if (!subId) break

                const user = await prisma.user.findFirst({
                    where: { stripe_subscription_id: subId }
                })

                if (user) {
                    const updateData: Record<string, any> = { subscription_status: 'active' }

                    // If user was trialing, refresh credits to their tier's full allocation
                    if (user.subscription_status === 'trialing' && user.subscription_tier) {
                        const tierConfig = TIERS[user.subscription_tier as keyof typeof TIERS]
                        if (tierConfig) {
                            updateData.parlay_credits = tierConfig.customBuilderLimit
                            const nextReset = new Date()
                            nextReset.setMonth(nextReset.getMonth() + 1)
                            updateData.credits_reset_at = nextReset
                        }
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: updateData
                    })
                    console.log(`Payment succeeded: User ${user.id} → status "active"${user.subscription_status === 'trialing' ? ` (trial ended, credits refreshed to ${updateData.parlay_credits})` : ''}`)
                }
                break
            }

            // ─── PAYMENT FAILED ──────────────────────────────────────
            case 'invoice.payment_failed': {
                const failedInvoiceData = event.data.object as Record<string, any>
                const subId = typeof failedInvoiceData.subscription === 'string'
                    ? failedInvoiceData.subscription
                    : failedInvoiceData.subscription?.id

                if (!subId) break

                const user = await prisma.user.findFirst({
                    where: { stripe_subscription_id: subId }
                })

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { subscription_status: 'past_due' }
                    })
                    console.log(`Payment failed: User ${user.id} → status "past_due"`)
                    sendPaymentFailedEmail(user.email).catch(() => {})
                }
                break
            }

            // ─── SUBSCRIPTION UPDATED (upgrade/downgrade via portal) ─
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const subId = subscription.id
                const planId = subscription.items.data[0]?.price?.id

                if (!planId) break

                const user = await prisma.user.findFirst({
                    where: { stripe_subscription_id: subId }
                })

                if (user) {
                    const tierName = getTierByPriceId(planId)

                    const updateData: any = {
                        subscription_status: subscription.status,
                    }

                    // Only update tier if we can map the price ID
                    if (tierName) {
                        updateData.subscription_tier = tierName

                        // If the tier actually changed, reset credits based on the new tier limits
                        if (tierName !== user.subscription_tier) {
                            const nextReset = new Date()
                            nextReset.setMonth(nextReset.getMonth() + 1)
                            updateData.parlay_credits = TIERS[tierName as keyof typeof TIERS]?.customBuilderLimit || 0
                            updateData.credits_reset_at = nextReset
                        }

                        // If trial just ended (trialing → active), refresh credits to full allocation
                        if (
                            user.subscription_status === 'trialing' &&
                            subscription.status === 'active'
                        ) {
                            const nextReset = new Date()
                            nextReset.setMonth(nextReset.getMonth() + 1)
                            updateData.parlay_credits = TIERS[tierName as keyof typeof TIERS]?.customBuilderLimit || 0
                            updateData.credits_reset_at = nextReset
                        }
                    }

                    if (subscription.trial_end) {
                        updateData.trial_ends_at = new Date(subscription.trial_end * 1000)
                    }

                    await prisma.user.update({
                        where: { id: user.id },
                        data: updateData
                    })
                    console.log(`Subscription updated: User ${user.id} → tier "${tierName || 'unchanged'}", status "${subscription.status}"`)
                }
                break
            }

            // ─── SUBSCRIPTION CANCELED/EXPIRED ───────────────────────
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const subId = subscription.id

                const user = await prisma.user.findFirst({
                    where: { stripe_subscription_id: subId }
                })

                if (user) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            subscription_status: 'canceled',
                            subscription_tier: 'free'
                        }
                    })
                    console.log(`Subscription deleted: User ${user.id} → downgraded to "free"`)
                    sendSubscriptionCanceledEmail(user.email).catch(() => {})
                }
                break
            }

            // ─── ACKNOWLEDGED BUT UNHANDLED ──────────────────────────
            case 'payment_intent.succeeded':
            case 'payment_intent.created':
            case 'charge.succeeded':
            case 'charge.updated':
                // These are normal payment flow events, just acknowledge
                break

            default:
                console.log(`Unhandled Stripe event: ${event.type}`)
        }
    } catch (error: any) {
        console.error(`Webhook handler error for ${event.type}:`, error)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
}
