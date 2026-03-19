'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <html>
            <body style={{ fontFamily: 'system-ui, sans-serif', background: '#000', color: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2 style={{ color: '#f9fafb', marginBottom: '16px' }}>Something went wrong</h2>
                    <p style={{ color: '#9ca3af', marginBottom: '24px' }}>An unexpected error occurred. Our team has been notified.</p>
                    <button
                        onClick={() => reset()}
                        style={{ background: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    )
}
