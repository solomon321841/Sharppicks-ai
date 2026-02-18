"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function ManageSubscriptionButton() {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

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
        <Button variant="outline" onClick={handlePortal} disabled={loading}>
            {loading ? 'Loading...' : 'Manage Subscription'}
        </Button>
    )
}
