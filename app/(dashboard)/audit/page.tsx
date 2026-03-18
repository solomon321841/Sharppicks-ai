import { AuditDashboard } from '@/components/dashboard/AuditDashboard'

export const metadata = {
    title: 'Performance Audit | SharpPicks AI',
}

export default function AuditPage() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-white">Performance Audit</h1>
                <p className="text-sm text-zinc-500 mt-1">Track your AI parlay performance across all sports, risk levels, and bet types.</p>
            </div>
            <AuditDashboard />
        </div>
    )
}
