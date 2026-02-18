import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { NotificationProvider } from '@/contexts/NotificationContext'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-background text-foreground">
                <MobileNav />
                <div className="hidden lg:flex">
                    <Sidebar />
                </div>
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </NotificationProvider>
    )
}
