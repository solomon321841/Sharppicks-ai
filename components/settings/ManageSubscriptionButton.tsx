"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Loader2 } from "lucide-react"

export function ManageSubscriptionButton() {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handlePortal = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST'
            })
            const data = await response.json()

            if (!response.ok) throw new Error(data.error || 'Failed to open portal')

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button 
            onClick={handlePortal} 
            disabled={loading}
            className={`
                w-full sm:w-auto h-11 px-6 bg-zinc-900 border border-white/10 text-white font-bold uppercase tracking-widest relative overflow-hidden group transition-all duration-300
                hover:border-emerald-500/30 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)] hover:-translate-y-0.5
            `}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Loading...</span>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="group-hover:text-white transition-colors">Manage Subscription</span>
                </div>
            )}
            
            {/* Shimmer Effect on hover */}
            {!loading && <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-0" />}
        </Button>
    )
}
