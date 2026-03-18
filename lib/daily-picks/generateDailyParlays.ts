/**
 * Daily Picks Generation
 * Generates 4 parlays (safe/balanced/risky/lotto) daily at 9 AM EST.
 * Favors NBA and soccer games, with other sports as fallback.
 */

import { prisma } from '@/lib/prisma';
import { generateParlay } from '@/lib/ai/generateParlay';

// ─── Sport priority: NBA + Soccer first, others as fallback ──────────
const PRIMARY_SPORTS = ['basketball_nba', 'soccer_epl', 'soccer_spain_la_liga'];
const SECONDARY_SPORTS = ['soccer_uefa_champs_league', 'icehockey_nhl', 'basketball_ncaab'];
const ALL_SPORTS = [...PRIMARY_SPORTS, ...SECONDARY_SPORTS];

// ─── Parlay configurations ───────────────────────────────────────────
export interface DailyParlayConfig {
    type: 'safe' | 'balanced' | 'risky' | 'lotto';
    risk: number;
    numLegs: number;
    betTypes: string[];
    sportFocus: string;
    description: string;
}

const DAILY_PARLAY_CONFIGS: DailyParlayConfig[] = [
    {
        type: 'safe',
        risk: 2,
        numLegs: 3,
        betTypes: ['moneyline', 'spread'],
        sportFocus: 'Prioritize NBA and Soccer (EPL, La Liga) games. Pick ONLY heavy favorites from well-known leagues. Only use NHL or NCAAB if NBA/soccer games are insufficient.',
        description: 'Heavy favorites - high probability outcomes'
    },
    {
        type: 'balanced',
        risk: 5,
        numLegs: 3,
        betTypes: ['moneyline', 'spread', 'totals'],
        sportFocus: 'Prioritize NBA and Soccer (EPL, La Liga) games. Look for value plays with statistical edges. Only use other sports if needed.',
        description: 'Value-driven picks with moderate risk'
    },
    {
        type: 'risky',
        risk: 7,
        numLegs: 4,
        betTypes: ['moneyline', 'spread', 'totals', 'player_props'],
        sportFocus: 'Use NBA and Soccer games as your base, but include any sport where you see a strong underdog or high-value prop.',
        description: 'Underdogs and bold predictions with real upside'
    },
    {
        type: 'lotto',
        risk: 10,
        numLegs: 4,
        betTypes: ['moneyline', 'spread', 'totals', 'player_props'],
        sportFocus: 'Spread across all available sports for maximum variance. NBA and Soccer should still be represented but mix in NHL, NCAAB, Champions League for diversity.',
        description: 'Moonshot picks for massive potential payouts'
    }
];

interface ParlayResult {
    type: string;
    success: boolean;
    parlayId?: string;
    error?: string;
}

interface ParlayLeg {
    sport?: string;
    sports?: string;
    team?: string;
    betType?: string;
    bet_type?: string;
    odds?: number;
    opponent?: string;
    player?: string;
    line?: number;
    reasoning?: string;
    game_time?: string;
    game_id?: string;
    sportsbook?: string;
    bestBook?: string;
    consensus_odds?: string;
    prop_market?: string;
}

/**
 * Sort odds data so primary sports (NBA, soccer) appear first.
 * The AI sees games in order and naturally favors earlier entries.
 */
function sortByPriority(oddsData: any[]): any[] {
    const primarySet = new Set(PRIMARY_SPORTS);
    return [...oddsData].sort((a, b) => {
        const aIsPrimary = primarySet.has(a.sport_key) ? 0 : 1;
        const bIsPrimary = primarySet.has(b.sport_key) ? 0 : 1;
        return aIsPrimary - bIsPrimary;
    });
}

/**
 * Generate a single parlay with retry logic.
 */
async function generateSingleParlay(
    config: DailyParlayConfig,
    oddsData: any[],
    date: Date,
    userId: string
): Promise<ParlayResult> {
    console.log(`[Daily Picks] Generating ${config.type} parlay (Risk ${config.risk}, ${config.numLegs} legs)...`);

    let generated: any = null;
    let lastError = '';

    // Try up to 2 times
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            generated = await generateParlay({
                sports: ALL_SPORTS,
                riskLevel: config.risk,
                numLegs: config.numLegs,
                betTypes: config.betTypes,
                oddsData,
                sportFocus: config.sportFocus
            });

            if (generated && !generated.error && generated.legs?.length > 0) {
                break;
            }

            lastError = generated?.error || 'No legs returned';
            console.warn(`[Daily Picks] ${config.type} attempt ${attempt} failed: ${lastError}`);
            generated = null;
        } catch (err: any) {
            lastError = err.message || 'Unknown error';
            console.error(`[Daily Picks] ${config.type} attempt ${attempt} crashed: ${lastError}`);
            generated = null;
        }

        if (attempt < 2) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (!generated || generated.error || !generated.legs) {
        console.error(`[Daily Picks] Failed ${config.type}: ${lastError}`);
        return { type: config.type, success: false, error: lastError };
    }

    // Save to database
    try {
        const newParlay = await prisma.parlay.create({
            data: {
                user_id: userId,
                parlay_type: config.type,
                total_odds: generated.totalOdds,
                sports: ['Mixed'],
                is_daily: true,
                bet_types: generated.legs.map((l: ParlayLeg) => l.betType || l.bet_type || 'moneyline'),
                num_legs: generated.legs.length,
                risk_level: config.risk,
                ai_confidence: parseInt(generated.confidence) || 50,
                legs: {
                    create: generated.legs.map((l: ParlayLeg) => ({
                        sport: l.sport || l.sports || 'Mixed',
                        team: l.team || '',
                        bet_type: l.bet_type || l.betType || 'moneyline',
                        odds: l.odds != null ? String(l.odds) : null,
                        opponent: l.opponent || null,
                        player: l.player || null,
                        line: (l.line !== undefined && l.line !== null) ? String(l.line) : null,
                        ai_reasoning: l.reasoning || null,
                        game_time: l.game_time ? new Date(l.game_time) : null,
                        prop_market: l.prop_market || null,
                        best_book: l.bestBook || null,
                        consensus_odds: l.consensus_odds || null,
                        result: 'pending'
                    }))
                }
            }
        });

        await prisma.dailyPick.create({
            data: {
                parlay_id: newParlay.id,
                post_date: date,
                sport_focus: 'Mixed'
            }
        });

        console.log(`[Daily Picks] ${config.type} saved (ID: ${newParlay.id}, Odds: ${generated.totalOdds}, Legs: ${generated.legs.length})`);
        return { type: config.type, success: true, parlayId: newParlay.id };
    } catch (dbError: any) {
        console.error(`[Daily Picks] DB save failed for ${config.type}:`, dbError);
        return { type: config.type, success: false, error: dbError.message };
    }
}

/**
 * Generate all 4 daily parlays for a given date.
 * Runs in 2 parallel batches of 2 to balance speed vs rate limits.
 */
export async function generateDailyParlays(date: Date, userId: string): Promise<ParlayResult[]> {
    // ── 1. Centralized odds fetch (one call for all sports) ──────────
    console.log(`[Daily Picks] Fetching odds for ${ALL_SPORTS.length} sports...`);

    const baseMarkets = 'h2h,spreads,totals';
    const propMarkets = [
        'player_points', 'player_rebounds', 'player_assists', 'player_threes',
        'player_goals', 'player_shots_on_goal',
        'player_goal_scorer_anytime', 'player_shots'
    ].join(',');

    const { getOdds } = await import('@/lib/odds/getOdds');
    let oddsData = await getOdds(ALL_SPORTS, 'us', `${baseMarkets},${propMarkets}`);

    if (!oddsData || oddsData.length === 0) {
        console.warn(`[Daily Picks] Rich fetch empty. Retrying standard markets only.`);
        oddsData = await getOdds(ALL_SPORTS, 'us', baseMarkets);
    }

    if (!oddsData || oddsData.length === 0) {
        console.error(`[Daily Picks] No odds data available. All parlays will fail.`);
        return DAILY_PARLAY_CONFIGS.map(c => ({ type: c.type, success: false, error: 'No odds data available' }));
    }

    // Sort so NBA/soccer games appear first
    oddsData = sortByPriority(oddsData);

    const primaryCount = oddsData.filter((g: any) => new Set(PRIMARY_SPORTS).has(g.sport_key)).length;
    console.log(`[Daily Picks] ${oddsData.length} games fetched (${primaryCount} NBA/soccer).`);

    // ── 2. Generate all 4 parlays in parallel ──────────────────────────
    console.log(`[Daily Picks] Generating all 4 parlays in parallel...`);
    const results = await Promise.all(
        DAILY_PARLAY_CONFIGS.map(config => generateSingleParlay(config, oddsData!, date, userId))
    );

    return results;
}

/**
 * Get or create system user for daily picks
 */
export async function getSystemUser() {
    let systemUser = await prisma.user.findUnique({
        where: { email: 'admin@sharppicks.ai' }
    });

    if (!systemUser) {
        systemUser = await prisma.user.create({
            data: {
                email: 'admin@sharppicks.ai',
                full_name: 'SharpPicks AI',
                subscription_tier: 'whale'
            }
        });
    }

    return systemUser;
}
