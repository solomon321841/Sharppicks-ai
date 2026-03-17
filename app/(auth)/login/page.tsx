'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GoogleSSOButton } from '@/components/auth/GoogleSSOButton'
import { AppleSSOButton } from '@/components/auth/AppleSSOButton'
import { useToast } from '@/hooks/use-toast'

function AuthForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { toast } = useToast()
    const supabase = createClient()

    const tier = searchParams.get('tier')

    const getRedirectUrl = () => {
        const baseUrl = `${location.origin}/callback`
        if (tier) {
            return `${baseUrl}?next=/checkout/${tier}`
        }
        return baseUrl
    }

    const handleEmailAuth = async (isSignUp: boolean) => {
        setLoading(true)
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: getRedirectUrl(),
                    },
                })
                if (error) throw error

                // If Supabase has email confirmations turned off, session will be present immediately
                if (data.session) {
                    toast({ title: 'Account created', description: 'Welcome to SharpPicks AI!' })
                    
                    if (tier) {
                        router.push(`/checkout/${tier}`)
                        return
                    }
                    
                    router.push('/dashboard')
                } else {
                    toast({ title: 'Check your email', description: 'We sent you a confirmation link. After verifying, you\'ll be taken to choose a plan.' })
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                // Check intent tier
                if (tier) {
                    router.push(`/checkout/${tier}`)
                    return
                }

                // Check if user has a paid subscription
                if (data.user) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('subscription_tier, subscription_status')
                        .eq('id', data.user.id)
                        .single()

                    router.refresh()
                    // Free users go to pricing, paid users go to dashboard
                    if (!profile || (profile.subscription_tier === 'free' && profile.subscription_status !== 'active')) {
                        router.push('/#pricing')
                    } else {
                        router.push('/dashboard')
                    }
                } else {
                    router.refresh()
                    router.push('/dashboard')
                }
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle>Welcome to SharpPicks AI</CardTitle>
                <CardDescription>
                    {tier ? "Create an account to continue to checkout." : "Sign in to access AI-powered sports betting parlays."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="signup" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="signin">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <GoogleSSOButton intentUrl={tier ? `/checkout/${tier}` : undefined} />
                            <AppleSSOButton intentUrl={tier ? `/checkout/${tier}` : undefined} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground">OR</span>
                            <Separator className="flex-1" />
                        </div>

                        <TabsContent value="signin">
                            <form onSubmit={(e) => { e.preventDefault(); handleEmailAuth(false); }} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-emerald hover:bg-emerald/90">
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={(e) => { e.preventDefault(); handleEmailAuth(true); }} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email-signup">Email</Label>
                                    <Input id="email-signup" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password-signup">Password</Label>
                                    <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-emerald hover:bg-emerald/90">
                                    {loading ? (tier ? 'Proceeding to checkout...' : 'Creating account...') : 'Create Account'}
                                </Button>
                            </form>
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <Suspense fallback={
                <Card className="w-full max-w-md p-8 flex items-center justify-center">
                    <p className="text-zinc-500 animate-pulse">Loading...</p>
                </Card>
            }>
                <AuthForm />
            </Suspense>
        </div>
    )
}
