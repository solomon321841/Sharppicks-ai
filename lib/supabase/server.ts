import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
    const cookieStore = cookies()

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmqpfgnzxmfrmzboisju.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcXBmZ256eG1mcm16Ym9pc2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDkxODgsImV4cCI6MjA4NjQyNTE4OH0.1aKLb_mgigmnoJcnKfWnLXw_1sMoeTSwzomJ-ez2qQw'

    // Fallback for static build when env vars are missing
    if (!url || !key) {
        return {
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            },
            from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
        } as any
    }

    try {
        return createServerClient(
            url,
            key,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )
    } catch (error) {
        // Double safety fallback
        return {
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            },
            from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
        } as any
    }
}
