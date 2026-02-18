import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        // 1. Validate User
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Get Stripe Customer ID
        const userProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { stripe_customer_id: true }
        })

        if (!userProfile?.stripe_customer_id) {
            return NextResponse.json({ error: 'No billing account found' }, { status: 404 })
        }

        // 3. Create Portal Session
        const session = await stripe.billingPortal.sessions.create({
            customer: userProfile.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Stripe Portal Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
