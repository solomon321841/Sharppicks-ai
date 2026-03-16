/**
 * Full Matrix Test — Tests ALL parlay builder configurations.
 * Validates: output structure, odds ranges, bet type compliance, confidence, CLV fields.
 *
 * Usage: TESTS=nba npx tsx scripts/test-full-matrix.ts
 *   TESTS=nba         — NBA tests only
 *   TESTS=nhl         — NHL tests only
 *   TESTS=soccer      — Soccer tests only
 *   TESTS=multi       — Multi-sport tests
 *   TESTS=edge        — Edge case tests
 *   (no env)          — Runs ALL tests
 */

process.env.ODDS_API_KEY = process.env.ODDS_API_KEY || 'ff4ef13bb0192313085f97891f5b058d';
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-api03-placeholder';

import fs from 'fs';
import path from 'path';
import { generateParlay } from '../lib/ai/generateParlay';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
        const eq = line.indexOf('=');
        if (eq > 0) {
            process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
        }
    });
}

// ─── Test Definitions ────────────────────────────────────────────────

interface TestCase {
    name: string
    group: string
    params: {
        sports: string[]
        numLegs: number
        riskLevel: number
        betTypes: string[]
    }
    expect: {
        shouldSucceed: boolean
        minLegs?: number
        maxLegs?: number
        allowedBetTypes?: string[]
        oddsRange?: [number, number]
    }
}

const ODDS_RANGES: Record<number, [number, number]> = {
    1: [-200, 500], 2: [-200, 500], 3: [200, 700], 4: [200, 700],
    5: [400, 1500], 6: [400, 1500], 7: [1000, 5000], 8: [1000, 5000],
    9: [3000, 50000], 10: [3000, 50000]
}

const tests: TestCase[] = [
    // ── NBA Tests ─────────────────────────────────────────────
    {
        name: 'NBA Risk 1 ML Only (safest)',
        group: 'nba',
        params: { sports: ['basketball_nba'], numLegs: 2, riskLevel: 1, betTypes: ['moneyline'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 3, allowedBetTypes: ['moneyline'], oddsRange: ODDS_RANGES[1] }
    },
    {
        name: 'NBA Risk 3 Spread + Totals',
        group: 'nba',
        params: { sports: ['basketball_nba'], numLegs: 3, riskLevel: 3, betTypes: ['spread', 'totals'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 4, allowedBetTypes: ['spread', 'totals'], oddsRange: ODDS_RANGES[3] }
    },
    {
        name: 'NBA Risk 5 Mixed (all types)',
        group: 'nba',
        params: { sports: ['basketball_nba'], numLegs: 3, riskLevel: 5, betTypes: ['moneyline', 'spread', 'player_props'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 5, allowedBetTypes: ['moneyline', 'spread', 'player_props'], oddsRange: ODDS_RANGES[5] }
    },
    {
        name: 'NBA Risk 5 Props Only',
        group: 'nba',
        params: { sports: ['basketball_nba'], numLegs: 2, riskLevel: 5, betTypes: ['player_props'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 5, allowedBetTypes: ['player_props'], oddsRange: ODDS_RANGES[5] }
    },
    {
        name: 'NBA Risk 8 Aggressive',
        group: 'nba',
        params: { sports: ['basketball_nba'], numLegs: 4, riskLevel: 8, betTypes: ['moneyline', 'spread', 'player_props'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 6, allowedBetTypes: ['moneyline', 'spread', 'player_props'], oddsRange: ODDS_RANGES[8] }
    },
    {
        name: 'NBA Risk 10 Moonshot',
        group: 'nba',
        params: { sports: ['basketball_nba'], numLegs: 5, riskLevel: 10, betTypes: ['moneyline', 'spread', 'totals', 'player_props'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 10, allowedBetTypes: ['moneyline', 'spread', 'totals', 'player_props'], oddsRange: ODDS_RANGES[10] }
    },

    // ── NHL Tests ─────────────────────────────────────────────
    {
        name: 'NHL Risk 3 ML + Spread',
        group: 'nhl',
        params: { sports: ['icehockey_nhl'], numLegs: 2, riskLevel: 3, betTypes: ['moneyline', 'spread'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 4, allowedBetTypes: ['moneyline', 'spread'], oddsRange: ODDS_RANGES[3] }
    },
    {
        name: 'NHL Risk 6 All Types',
        group: 'nhl',
        params: { sports: ['icehockey_nhl'], numLegs: 3, riskLevel: 6, betTypes: ['moneyline', 'spread', 'totals', 'player_props'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 5, allowedBetTypes: ['moneyline', 'spread', 'totals', 'player_props'], oddsRange: ODDS_RANGES[6] }
    },

    // ── Soccer Tests ──────────────────────────────────────────
    // Note: Soccer may have very few games depending on the day.
    // These tests combine with NBA to ensure enough games are available.
    {
        name: 'EPL + NBA Risk 4 ML Only',
        group: 'soccer',
        params: { sports: ['soccer_epl', 'basketball_nba'], numLegs: 2, riskLevel: 4, betTypes: ['moneyline'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 4, allowedBetTypes: ['moneyline'], oddsRange: ODDS_RANGES[4] }
    },
    {
        name: 'La Liga + NBA Risk 7 ML + Spread',
        group: 'soccer',
        params: { sports: ['soccer_spain_la_liga', 'basketball_nba'], numLegs: 3, riskLevel: 7, betTypes: ['moneyline', 'spread'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 6, allowedBetTypes: ['moneyline', 'spread'], oddsRange: ODDS_RANGES[7] }
    },

    // ── Multi-Sport Tests ─────────────────────────────────────
    {
        name: 'NBA + NHL Risk 5 Mixed',
        group: 'multi',
        params: { sports: ['basketball_nba', 'icehockey_nhl'], numLegs: 3, riskLevel: 5, betTypes: ['moneyline', 'spread'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 5, allowedBetTypes: ['moneyline', 'spread'], oddsRange: ODDS_RANGES[5] }
    },
    {
        name: 'NBA + EPL Risk 3',
        group: 'multi',
        params: { sports: ['basketball_nba', 'soccer_epl'], numLegs: 2, riskLevel: 3, betTypes: ['moneyline'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 4, allowedBetTypes: ['moneyline'], oddsRange: ODDS_RANGES[3] }
    },

    // ── Edge Cases ────────────────────────────────────────────
    {
        name: 'Edge: Totals only Risk 2',
        group: 'edge',
        params: { sports: ['basketball_nba'], numLegs: 2, riskLevel: 2, betTypes: ['totals'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 3, allowedBetTypes: ['totals'], oddsRange: ODDS_RANGES[2] }
    },
    {
        name: 'Edge: 1 leg request (should enforce 2+)',
        group: 'edge',
        params: { sports: ['basketball_nba'], numLegs: 1, riskLevel: 3, betTypes: ['moneyline', 'spread'] },
        expect: { shouldSucceed: true, minLegs: 2, maxLegs: 4, allowedBetTypes: ['moneyline', 'spread'], oddsRange: ODDS_RANGES[3] }
    },
    {
        name: 'Edge: Unsupported sport',
        group: 'edge',
        params: { sports: ['cricket_ipl'], numLegs: 2, riskLevel: 5, betTypes: ['moneyline'] },
        expect: { shouldSucceed: false }
    },
]

// ─── Test Runner ─────────────────────────────────────────────────────

interface TestResult {
    name: string
    passed: boolean
    errors: string[]
    duration: number
    details?: {
        totalOdds?: string
        confidence?: number
        legs?: number
        strategy?: string
        consensusOddsPopulated?: number
    }
}

async function runTest(test: TestCase): Promise<TestResult> {
    const start = Date.now()
    const errors: string[] = []

    try {
        console.log(`\n  [RUN] ${test.name}...`)
        const result = await generateParlay(test.params)
        const duration = Date.now() - start

        // Check: should it have succeeded?
        if (test.expect.shouldSucceed && result.error) {
            errors.push(`Expected success but got error: ${result.error}`)
            return { name: test.name, passed: false, errors, duration }
        }

        if (!test.expect.shouldSucceed) {
            if (!result.error) {
                errors.push(`Expected failure but got success with ${result.legs?.length} legs`)
            }
            return { name: test.name, passed: errors.length === 0, errors, duration }
        }

        // Validate legs array
        if (!result.legs || !Array.isArray(result.legs)) {
            errors.push('No legs array in result')
            return { name: test.name, passed: false, errors, duration }
        }

        // Validate leg count
        if (test.expect.minLegs && result.legs.length < test.expect.minLegs) {
            errors.push(`Too few legs: ${result.legs.length} < ${test.expect.minLegs}`)
        }
        if (test.expect.maxLegs && result.legs.length > test.expect.maxLegs) {
            errors.push(`Too many legs: ${result.legs.length} > ${test.expect.maxLegs}`)
        }

        // Validate bet types
        if (test.expect.allowedBetTypes) {
            for (const leg of result.legs) {
                if (!test.expect.allowedBetTypes.includes(leg.bet_type)) {
                    errors.push(`Wrong bet type: "${leg.bet_type}" not in [${test.expect.allowedBetTypes}]`)
                }
            }
        }

        // Validate odds range
        if (test.expect.oddsRange && result.totalOdds) {
            const odds = parseInt(String(result.totalOdds).replace('+', ''))
            const [lo, hi] = test.expect.oddsRange
            if (odds < lo || odds > hi) {
                errors.push(`Odds ${result.totalOdds} outside range [${lo > 0 ? '+' : ''}${lo}, +${hi}]`)
            }
        }

        // Validate each leg has required fields
        for (let i = 0; i < result.legs.length; i++) {
            const leg = result.legs[i]
            if (!leg.team && !leg.player) errors.push(`Leg ${i}: missing team/player`)
            if (!leg.odds) errors.push(`Leg ${i}: missing odds`)
            if (!leg.reasoning || leg.reasoning.length < 10) errors.push(`Leg ${i}: weak reasoning`)
            if (!leg.bet_type) errors.push(`Leg ${i}: missing bet_type`)
            if (!leg.sports) errors.push(`Leg ${i}: missing sports key`)

            // Player props must have player + prop_market
            if (leg.bet_type === 'player_props') {
                if (!leg.player) errors.push(`Leg ${i}: player_props missing player name`)
                if (!leg.prop_market) errors.push(`Leg ${i}: player_props missing prop_market`)
            }
        }

        // Validate confidence is a reasonable number
        if (typeof result.confidence !== 'number' || result.confidence < 1 || result.confidence > 99) {
            errors.push(`Invalid confidence: ${result.confidence}`)
        }

        // Validate totalOdds exists
        if (!result.totalOdds) {
            errors.push('Missing totalOdds')
        }

        // Check consensus_odds population
        const legsWithConsensus = result.legs.filter((l: any) => l.consensus_odds).length

        const details = {
            totalOdds: result.totalOdds,
            confidence: result.confidence,
            legs: result.legs.length,
            strategy: result.strategy?.slice(0, 80),
            consensusOddsPopulated: legsWithConsensus
        }

        const passed = errors.length === 0
        if (passed) {
            console.log(`  [PASS] ${test.name} (${duration}ms) — ${result.legs.length} legs, ${result.totalOdds}, ${result.confidence}% conf`)
        } else {
            console.log(`  [FAIL] ${test.name} (${duration}ms)`)
            errors.forEach(e => console.log(`         ❌ ${e}`))
        }

        return { name: test.name, passed, errors, duration, details }

    } catch (error: any) {
        const duration = Date.now() - start
        errors.push(`Exception: ${error.message}`)
        console.log(`  [FAIL] ${test.name} (${duration}ms) — EXCEPTION: ${error.message}`)
        return { name: test.name, passed: false, errors, duration }
    }
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
    const filter = (process.env.TESTS || '').toLowerCase()
    const testsToRun = filter
        ? tests.filter(t => t.group === filter)
        : tests

    console.log(`\n${'='.repeat(60)}`)
    console.log(`  PARLAY BUILDER FULL MATRIX TEST`)
    console.log(`  Running ${testsToRun.length} tests${filter ? ` (filter: ${filter})` : ''}`)
    console.log(`${'='.repeat(60)}`)

    const results: TestResult[] = []

    for (const test of testsToRun) {
        const result = await runTest(test)
        results.push(result)
    }

    // ── Summary ──────────────────────────────────────────────
    console.log(`\n${'='.repeat(60)}`)
    console.log(`  TEST RESULTS SUMMARY`)
    console.log(`${'='.repeat(60)}`)

    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length

    for (const r of results) {
        const icon = r.passed ? '✅' : '❌'
        const time = `${(r.duration / 1000).toFixed(1)}s`
        console.log(`  ${icon} ${r.name} (${time})`)
        if (!r.passed) {
            r.errors.forEach(e => console.log(`      → ${e}`))
        }
        if (r.details) {
            console.log(`      Odds: ${r.details.totalOdds} | Conf: ${r.details.confidence}% | Legs: ${r.details.legs} | ConsensusOdds: ${r.details.consensusOddsPopulated}/${r.details.legs}`)
        }
    }

    console.log(`\n  TOTAL: ${passed} passed, ${failed} failed out of ${results.length}`)
    console.log(`${'='.repeat(60)}\n`)

    // Exit with error code if any failed
    if (failed > 0) process.exit(1)
}

main()
