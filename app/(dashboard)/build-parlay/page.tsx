'use client'

import { ParlayBuilder } from "@/components/dashboard/ParlayBuilder"
import { TierGate } from "@/components/dashboard/TierGate"

export default function BuildParlayPage() {
    return (
        <TierGate feature="build" featureName="Custom Parlay Builder">
            <div className="space-y-6 sm:space-y-8 min-w-0 overflow-hidden">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Build Custom Parlay</h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Configure your preferences and let our AI analyze live odds to find the best value plays.
                    </p>
                </div>

                <ParlayBuilder />
            </div>
        </TierGate>
    )
}
