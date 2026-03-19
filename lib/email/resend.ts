import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

// Only initialize if we have a real API key (not placeholder)
const isConfigured = apiKey && apiKey !== 're_placeholder' && apiKey.startsWith('re_')

export const resend = isConfigured ? new Resend(apiKey) : null

const FROM_EMAIL = 'SharpPicks AI <picks@sharppicks.ai>'

type SendResult = { success: boolean; error?: string }

async function send(to: string, subject: string, html: string): Promise<SendResult> {
    if (!resend) {
        console.warn('[Email] Resend not configured — skipping email:', subject)
        return { success: false, error: 'Email not configured' }
    }

    try {
        await resend.emails.send({ from: FROM_EMAIL, to, subject, html })
        console.log(`[Email] Sent "${subject}" to ${to}`)
        return { success: true }
    } catch (error: any) {
        console.error(`[Email] Failed to send "${subject}" to ${to}:`, error?.message)
        return { success: false, error: error?.message }
    }
}

// ─── Email Templates ──────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name?: string) {
    const displayName = name || 'there'
    return send(to, 'Welcome to SharpPicks AI', `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e5e7eb;">
            <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SharpPicks AI</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">AI-Powered Sports Picks</p>
            </div>
            <h2 style="color: #f9fafb; margin: 0 0 16px;">Hey ${displayName},</h2>
            <p style="color: #9ca3af; line-height: 1.6;">Welcome to SharpPicks AI. You now have access to:</p>
            <ul style="color: #9ca3af; line-height: 2;">
                <li><strong style="color: #10b981;">Daily AI Picks</strong> — Fresh parlays generated every morning</li>
                <li><strong style="color: #10b981;">Custom Builder</strong> — 3 free credits to build your own parlays</li>
                <li><strong style="color: #10b981;">Line Shopping</strong> — Best odds across sportsbooks</li>
            </ul>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sharppicks.ai'}/dashboard" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Today's Picks</a>
            </div>
            <p style="color: #6b7280; font-size: 13px; border-top: 1px solid #374151; padding-top: 16px; margin-top: 32px;">
                SharpPicks AI — For entertainment purposes only. Please bet responsibly.
            </p>
        </div>
    `)
}

export async function sendSubscriptionConfirmation(to: string, tier: string) {
    const tierLabels: Record<string, string> = {
        starter: 'Starter ($9/mo)',
        pro: 'Pro ($24/mo)',
        whale: 'Whale ($49/mo)',
    }
    const label = tierLabels[tier] || tier

    return send(to, `You're now on ${label}`, `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e5e7eb;">
            <div style="background: linear-gradient(135deg, #059669, #0d9488); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SharpPicks AI</h1>
            </div>
            <h2 style="color: #f9fafb; margin: 0 0 16px;">Subscription Confirmed</h2>
            <p style="color: #9ca3af; line-height: 1.6;">You're now on the <strong style="color: #10b981;">${label}</strong> plan. Your upgraded features are active immediately.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sharppicks.ai'}/dashboard" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Go to Dashboard</a>
            </div>
            <p style="color: #6b7280; font-size: 13px; border-top: 1px solid #374151; padding-top: 16px; margin-top: 32px;">
                Manage your subscription anytime from Settings. SharpPicks AI — For entertainment purposes only.
            </p>
        </div>
    `)
}

export async function sendPaymentFailedEmail(to: string) {
    return send(to, 'Payment failed — action needed', `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e5e7eb;">
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Payment Failed</h1>
            </div>
            <p style="color: #9ca3af; line-height: 1.6;">Your latest payment didn't go through. Update your payment method to keep your subscription active.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sharppicks.ai'}/settings" style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Update Payment Method</a>
            </div>
            <p style="color: #6b7280; font-size: 13px; border-top: 1px solid #374151; padding-top: 16px; margin-top: 32px;">
                If you believe this is an error, contact support. SharpPicks AI — For entertainment purposes only.
            </p>
        </div>
    `)
}

export async function sendSubscriptionCanceledEmail(to: string) {
    return send(to, 'Your subscription has been canceled', `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e5e7eb;">
            <div style="background: linear-gradient(135deg, #374151, #4b5563); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SharpPicks AI</h1>
            </div>
            <h2 style="color: #f9fafb; margin: 0 0 16px;">We're sorry to see you go</h2>
            <p style="color: #9ca3af; line-height: 1.6;">Your subscription has been canceled. You've been moved to the Free plan.</p>
            <p style="color: #9ca3af; line-height: 1.6;">You can re-subscribe anytime to get your picks back.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sharppicks.ai'}/settings" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Resubscribe</a>
            </div>
            <p style="color: #6b7280; font-size: 13px; border-top: 1px solid #374151; padding-top: 16px; margin-top: 32px;">
                SharpPicks AI — For entertainment purposes only.
            </p>
        </div>
    `)
}

export async function sendBetResultEmail(to: string, result: 'won' | 'lost', parlayDetails: {
    legs: number
    odds: string
    payout?: number
}) {
    const isWin = result === 'won'
    const gradient = isWin ? '#059669, #0d9488' : '#dc2626, #ef4444'
    const emoji = isWin ? 'HIT' : 'MISS'
    const payoutLine = isWin && parlayDetails.payout
        ? `<p style="color: #10b981; font-size: 24px; font-weight: 700; text-align: center;">+$${parlayDetails.payout.toFixed(2)}</p>`
        : ''

    return send(to, `${emoji} — Your ${parlayDetails.legs}-leg parlay (${parlayDetails.odds})`, `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e5e7eb;">
            <div style="background: linear-gradient(135deg, ${gradient}); padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">${emoji}</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">${parlayDetails.legs}-Leg Parlay at ${parlayDetails.odds}</p>
            </div>
            ${payoutLine}
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sharppicks.ai'}/bet-history" style="background: #059669; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View Bet History</a>
            </div>
            <p style="color: #6b7280; font-size: 13px; border-top: 1px solid #374151; padding-top: 16px; margin-top: 32px;">
                SharpPicks AI — For entertainment purposes only. Please bet responsibly.
            </p>
        </div>
    `)
}
