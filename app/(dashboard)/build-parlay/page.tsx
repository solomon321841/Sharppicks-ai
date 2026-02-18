import { ParlayBuilder } from "@/components/dashboard/ParlayBuilder"

export default function BuildParlayPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Build Custom Parlay</h2>
                <p className="text-muted-foreground">
                    Configure your preferences and let our AI analyze live odds to find the best value plays.
                </p>
            </div>

            <ParlayBuilder />
        </div>
    )
}
