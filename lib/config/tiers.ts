export type Tier = 'free' | 'starter' | 'pro' | 'whale';

export const TIERS: Record<Tier, {
    name: string;
    label: string;
    features: string[];
    canBuildParlay: boolean;
    canAccessDailyPicks: boolean;
    canTrackBets: boolean;
    parlayLimit: number; // -1 for unlimited
}> = {
    free: {
        name: 'free',
        label: 'Free Trial',
        features: ['1 AI Parlay/Day', 'Standard Odds'],
        canBuildParlay: false,
        canAccessDailyPicks: true,
        canTrackBets: false,
        parlayLimit: 1
    },
    starter: {
        name: 'starter',
        label: 'Starter',
        features: ['3 AI Parlays/Day', 'Standard Odds', 'Basic Tracking'],
        canBuildParlay: false,
        canAccessDailyPicks: true,
        canTrackBets: true,
        parlayLimit: 3
    },
    pro: {
        name: 'pro',
        label: 'Pro',
        features: ['Unlimited AI Parlays', 'Custom Builder', 'All Sports', 'Full Tracking'],
        canBuildParlay: true,
        canAccessDailyPicks: true,
        canTrackBets: true,
        parlayLimit: -1
    },
    whale: {
        name: 'whale',
        label: 'Whale',
        features: ['Everything in Pro', 'Real-time Alerts', 'High Confidence Picks'],
        canBuildParlay: true,
        canAccessDailyPicks: true,
        canTrackBets: true,
        parlayLimit: -1
    }
};

export function getTierFeatures(tier: string) {
    return TIERS[tier as Tier] || TIERS.free;
}

export function canAccessFeature(tier: string, feature: 'build' | 'track' | 'daily') {
    const t = getTierFeatures(tier);
    switch (feature) {
        case 'build': return t.canBuildParlay;
        case 'track': return t.canTrackBets;
        case 'daily': return t.canAccessDailyPicks;
        default: return false;
    }
}
