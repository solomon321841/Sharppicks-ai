import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ManageSubscriptionButton } from "@/components/settings/ManageSubscriptionButton"
import Link from "next/link"

export default async function SettingsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let tier = 'free'
    let status = 'inactive'

    if (user) {
        const profile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { subscription_tier: true, subscription_status: true }
        })
        tier = profile?.subscription_tier || 'free'
        status = profile?.subscription_status || 'inactive'
    }

    return (
        <div className="space-y-8 max-w-2xl px-4 lg:px-0">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled />
                    </div>
                    {/* <div className="space-y-1">
                        <Label>Display Name</Label>
                        <Input placeholder="Your Name" />
                    </div>
                    <Button>Save Changes</Button> */}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your plan and billing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-medium">Current Plan: <span className="capitalize">{tier}</span></p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                Status: <span className={`capitalize ${status === 'active' ? 'text-green-500' : 'text-zinc-500'}`}>{status}</span>
                            </p>
                        </div>
                        {tier === 'free' ? (
                            <Link href="/#pricing">
                                <Button>Upgrade Plan</Button>
                            </Link>
                        ) : (
                            <ManageSubscriptionButton />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
