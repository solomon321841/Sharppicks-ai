
// Standalone script to test Niche Props availability
// Run with: npx ts-node scripts/debug-props.ts

async function testProps() {
    const API_KEY = '5bb37f082ae8e21104694ff4ec57be10';
    const SPORT = 'soccer_spain_la_liga'; // Testing La Liga
    const REGION = 'us';

    // Markets to test based on user request
    const marketsToTest = [
        'player_shots_on_goal', // Shots on Target
        'player_shots', // Shots Attempted
        'player_assists', // Assists
        'player_keeper_saves', // Keeper Saves (guessing key, might be invalid)
        'player_passes', // Passes (guessing key)
        'player_tackles', // Tackles (guessing key)
        'player_card', // Cards
    ];

    console.log("=== TESTING ADVANCED PROPS ===");

    // 1. Get Event ID
    const sysUrl = `https://api.the-odds-api.com/v4/sports/${SPORT}/odds/?apiKey=${API_KEY}&regions=${REGION}&markets=h2h&oddsFormat=american`;
    // Note: 'region' variable case fix
    const sysUrlFixed = `https://api.the-odds-api.com/v4/sports/${SPORT}/odds/?apiKey=${API_KEY}&regions=${REGION}&markets=h2h&oddsFormat=american`;

    try {
        const sysRes = await fetch(sysUrlFixed);
        const sysData = await sysRes.json();

        if (!Array.isArray(sysData) || sysData.length === 0) {
            console.error("No games found to test with.");
            // Try EPL if La Liga empty?
            const eplUrl = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${API_KEY}&regions=${REGION}&markets=h2h&oddsFormat=american`;
            const eplRes = await fetch(eplUrl);
            const eplData = await eplRes.json();
            if (Array.isArray(eplData) && eplData.length > 0) {
                console.log("Switched to EPL for testing market validity.");
                await runTests(eplData[0], marketsToTest, 'soccer_epl', REGION, API_KEY);
            } else {
                return;
            }
        } else {
            const game = sysData[0];
            console.log(`Using Game: ${game.home_team} vs ${game.away_team} (ID: ${game.id})`);
            await runTests(game, marketsToTest, SPORT, REGION, API_KEY);
        }

    } catch (e) { console.error(e); }
}

async function runTests(game: any, markets: string[], sport: string, region: string, apiKey: string) {
    for (const market of markets) {
        await checkMarket(game.id, sport, market, region, apiKey);
    }
}

async function checkMarket(eventId: string, sport: string, market: string, region: string, apiKey: string) {
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds/?apiKey=${apiKey}&regions=${region}&markets=${market}&oddsFormat=american`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            if (res.status === 422) {
                console.log(`[${market}]: ❌ INVALID MARKET (422)`);
            } else {
                console.log(`[${market}]: ❌ HTTP ${res.status}`);
            }
        } else {
            const data = await res.json();
            if (data.bookmakers && data.bookmakers.length > 0) {
                console.log(`[${market}]: ✅ AVAILABLE (${data.bookmakers.length} books)`);
            } else {
                console.log(`[${market}]: ⚠️ VALID BUT EMPTY (0 books)`);
            }
        }
    } catch (e) {
        console.error(`[${market}]: EXCEPTION`, e);
    }
}

testProps();
