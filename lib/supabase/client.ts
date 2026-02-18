import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmqpfgnzxmfrmzboisju.supabase.co'
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtcXBmZ256eG1mcm16Ym9pc2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDkxODgsImV4cCI6MjA4NjQyNTE4OH0.1aKLb_mgigmnoJcnKfWnLXw_1sMoeTSwzomJ-ez2qQw'

    // Fallback for static build when env vars are missing
    if (!url || !key) {
        console.error('Supabase Client: Missing Environment Variables!', { url: !!url, key: !!key });
        return {
            auth: {
                getUser: () => Promise.resolve({ data: { user: null }, error: null }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signUp: () => Promise.reject(new Error('Supabase client: Missing environment variables!')),
                signInWithPassword: () => Promise.reject(new Error('Supabase client: Missing environment variables!')),
                signInWithOAuth: () => Promise.reject(new Error('Supabase client: Missing environment variables!')),
                signOut: () => Promise.resolve({ error: null }),
            },
            from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) }),
        } as any
    }

    return createBrowserClient(url, key)
}
