import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email/resend'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL (validated to prevent open redirect)
    const rawNext = searchParams.get('next')
    const next = (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : null

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Determine redirect destination
            let redirectPath = next || '/dashboard'

            // If no explicit "next" param, check if this is a new user
            // New users (free tier, no subscription) should go to pricing
            if (!next) {
                try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                        // Ensure user exists in DB
                        const profile = await prisma.user.upsert({
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

                        // If user is on free tier with no active subscription, send to pricing
                        if (profile.subscription_tier === 'free' && profile.subscription_status !== 'active') {
                            redirectPath = '/#pricing'
                        }

                        // Send welcome email for brand new users (created_at within last 60 seconds)
                        const isNewUser = (Date.now() - new Date(profile.created_at).getTime()) < 60_000
                        if (isNewUser) {
                            sendWelcomeEmail(profile.email, profile.full_name || undefined).catch(() => {})
                        }
                    }
                } catch (err) {
                    console.error('Callback: Error checking user tier:', err)
                    // Fall back to dashboard on error
                    redirectPath = '/dashboard'
                }
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${redirectPath}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
            } else {
                return NextResponse.redirect(`${origin}${redirectPath}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
