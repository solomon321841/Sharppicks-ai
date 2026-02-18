export type Tier = 'free' | 'starter' | 'pro' | 'whale';

// ...existing code...
// ...existing code...
export const TIERS: Record<Tier, {
    name: string;
    label: string;
    features: string[];
    canBuildParlay: boolean;
    canAccessDailyPicks: boolean;
    canTrackBets: boolean;
    parlayLimit: number;
    customBuilderLimit: number;
    stripePriceId: string; // Added for Checkout
}> = {
    free: {
        name: 'free',
        label: 'Free Trial',
        features: ['1 AI Parlay/Day', '2 Custom Builder Credits', 'Standard Odds'],
        canBuildParlay: true,
        canAccessDailyPicks: true,
        canTrackBets: false,
        parlayLimit: 1,
        customBuilderLimit: 2,
        stripePriceId: '' // Free tier has no price ID
    },
    starter: {
        name: 'starter',
        label: 'Starter',
        features: ['3 AI Parlays/Day', 'Standard Odds', 'Basic Tracking'],
        canBuildParlay: false,
        canAccessDailyPicks: true,
        canTrackBets: true,
        parlayLimit: 3,
        customBuilderLimit: 0,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || 'price_1PxyzStarterPlaceholder'
    },
    pro: {
        name: 'pro',
        label: 'Pro',
        features: ['Unlimited AI Parlays', 'Custom Builder', 'All Sports', 'Full Tracking'],
        canBuildParlay: true,
        canAccessDailyPicks: true,
        canTrackBets: true,
        parlayLimit: -1,
        customBuilderLimit: -1,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'price_1PxyzProPlaceholder'
    },
    whale: {
        name: 'whale',
        label: 'Whale',
        features: ['Everything in Pro', 'Real-time Alerts', 'High Confidence Picks'],
        canBuildParlay: true,
        canAccessDailyPicks: true,
        canTrackBets: true,
        parlayLimit: -1,
        customBuilderLimit: -1,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_WHALE || 'price_1PxyzWhalePlaceholder'
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
