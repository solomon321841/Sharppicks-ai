import { Sidebar } from '@/components/dashboard/Sidebar'
import { NotificationProvider } from '@/contexts/NotificationContext'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <NotificationProvider>
            <div className="flex h-screen overflow-hidden bg-background text-foreground">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </NotificationProvider>
    )
}
