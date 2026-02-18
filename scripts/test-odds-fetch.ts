
import { getOdds } from "../lib/odds/getOdds"

async function main() {
    console.log("Testing Odds Fetching with Timeout...")
    const start = Date.now()

    try {
        // Test props fetching (complex path)
        const sports = ['basketball_nba', 'icehockey_nhl']
        const odds = await getOdds(sports, 'us', 'player_points')
        console.log(`Fetch successful! Found ${odds.length} games.`)
    } catch (error) {
        console.error("Fetch failed:", error)
    } finally {
        const duration = (Date.now() - start) / 1000
        console.log(`Duration: ${duration.toFixed(2)}s`)
    }
}

main()
