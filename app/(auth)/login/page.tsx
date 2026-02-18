'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const handleEmailAuth = async (isSignUp: boolean) => {
        setLoading(true)
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                toast({ title: 'Check your email', description: 'We sent you a confirmation link.' })
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.refresh()
                router.push('/dashboard')
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
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>Welcome to SharpPicks AI</CardTitle>
                    <CardDescription>
                        Sign in to access AI-powered sports betting parlays.
                    </CardDescription>
                    {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
                        <div className="bg-red-500/10 text-red-500 text-xs p-2 rounded mt-2 border border-red-500/20">
                            <b>DEBUG:</b> Env Vars Missing in Browser!<br />
                            This means <code>NEXT_PUBLIC_SUPABASE_URL</code> is not set in Vercel.
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="signin" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <GoogleSSOButton />
                                <AppleSSOButton />
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
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
