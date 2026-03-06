import {
    americanToImpliedProb,
    decimalToAmerican,
    calculateCombinedParlayMetrics,
    validateRiskLevel,
    enforceLegCount,
    enforceBetTypes,
    checkCorrelation
} from './parlayMath';

// Simple lightweight test suite
function runTests() {
    console.log("Running Parlay Math Validation Test Suite...\n");

    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, testName: string) => {
        if (condition) {
            console.log(`✅ PASS: ${testName}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${testName}`);
            failed++;
        }
    };

    // Test A: Risk 1 generates odds between +150 to +250
    assert(validateRiskLevel(1, 200) === true, "Test A1: Risk 1 allows +200");
    assert(validateRiskLevel(1, 300) === false, "Test A2: Risk 1 rejects +300");
    assert(validateRiskLevel(4, 600) === true, "Test A3: Risk 4 allows +600");

    // Test B: Risk 1 rejects player props
    const typesRisk1 = enforceBetTypes(1, ['moneyline', 'player_props']);
    assert(typesRisk1.includes('moneyline') && !typesRisk1.includes('player_props'), "Test B: Risk 1 rejects player props");

    const typesRisk6 = enforceBetTypes(6, ['moneyline', 'player_props']);
    assert(typesRisk6.includes('player_props'), "Test B2: Risk 6 allows player props");

    // Test C: Risk 7 allows up to 6 legs
    assert(enforceLegCount(7, 8) === 6, "Test C1: Risk 7 caps at 6 legs");
    assert(enforceLegCount(10, 15) === 10, "Test C2: Risk 10 caps at 10 legs");
    assert(enforceLegCount(1, 5) === 3, "Test C3: Risk 1 caps at 3 legs");

    // Test D: Math engine calculates fair probability
    // standard -110 has 52.38% implied. Fair is ~50.1%.
    const metrics = calculateCombinedParlayMetrics([{ odds: -110 }, { odds: -110 }]);
    // 52.38 / 1.045 = ~50.12%. Combined = 25.12%. American = +298
    assert(metrics.combinedAmericanOdds > +280 && metrics.combinedAmericanOdds < +310, `Test D: Math engine removes vig correctly (Calc: +${metrics.combinedAmericanOdds})`);

    // Test E: Correlation
    const legs = [
        { game_id: 'game1', bet_type: 'moneyline' },
        { game_id: 'game1', bet_type: 'totals' }
    ];
    const corrCheck1 = checkCorrelation(legs, 5);
    assert(corrCheck1.valid === false, "Test E1: Risk 5 rejects same-game parlays");

    const corrCheck2 = checkCorrelation(legs, 7);
    assert(corrCheck2.valid === false, "Test E2: Risk 7 rejects ML + Total in same game");

    const corrCheck3 = checkCorrelation(legs, 8);
    assert(corrCheck3.valid === true, "Test E3: Risk 8 allows ML + Total in same game");

    console.log(`\nTests Complete: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runTests();
