'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Activity } from 'lucide-react'

export default function CheckoutRedirectPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const tier = params.tier as string

    useEffect(() => {
        if (!tier) return

        let mounted = true

        const initiateCheckout = async () => {
            try {
                const response = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        tier,
                        returnUrl: window.location.origin + '/#pricing'
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Checkout failed')
                }

                if (data.url && mounted) {
                    window.location.href = data.url
                }
            } catch (err: any) {
                console.error('Checkout redirect error:', err)
                if (mounted) {
                    setError(err.message)
                    toast({
                        title: "Checkout Error",
                        description: err.message,
                        variant: "destructive"
                    })
                    // Fallback to pricing if it fails
                    setTimeout(() => {
                        router.push('/#pricing')
                    }, 3000)
                }
            }
        }

        initiateCheckout()

        return () => {
            mounted = false
        }
    }, [tier, router, toast])

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
                {error ? (
                    <div className="text-red-400 text-center space-y-2">
                        <p className="font-bold">Error starting checkout</p>
                        <p className="text-sm text-zinc-500">Redirecting back to pricing...</p>
                    </div>
                ) : (
                    <>
                        <div className="relative">
                            <div className="absolute -inset-4 opacity-50 blur-xl bg-emerald-500/20 rounded-full animate-pulse" />
                            <Activity className="h-10 w-10 text-emerald-400 animate-bounce relative z-10" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">
                            Securing your checkout...
                        </h2>
                        <p className="text-sm text-zinc-500">
                            Transferring you to Stripe securely
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
