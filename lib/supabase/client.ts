import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback for static build when env vars are missing
    if (!url || !key) {
        return {
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            },
            from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
        } as any
    }

    return createBrowserClient(url, key)
}
