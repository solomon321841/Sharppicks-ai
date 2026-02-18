// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { kv } from '@vercel/kv'

// const ODDS_API_KEY = process.env.ODDS_API_KEY
const BASE_URL = 'https://api.the-odds-api.com/v4/sports'

export async function getOdds(sports: string[], region: string = 'us', markets: string = 'h2h,spreads,totals', disableTimeFilter: boolean = false) {
    const apiKey = process.env.ODDS_API_KEY || '8b1fbf0dc1c1f546fb324f291eadb26e'
    if (!apiKey) {
        throw new Error('Missing ODDS_API_KEY. MOCK DATA IS DISABLED.')
    }

    const isProps = markets.includes('player') || markets.includes('prop');

    try {
        const fetchPromises = sports.map(async (sport) => {
            console.log(`[API] Fetching odds for ${sport} (Region: ${region})...`);

            // Time window for relevant games
            const now = new Date()
            const timeWindowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
            const timeWindowEnd = new Date(now.getTime() + 30 * 60 * 60 * 1000) // 30 hours future (Next day's games + buffer)

            try {
                // Strategy 1: Bulk Fetch (Standard)
                // If not props, or if we want to try bulk first (some props might work in bulk? No, safe to separate)
                // Actually, for efficacy, let's just use Event Fetch for props always to be safe.

                if (isProps) {
                    console.log(`[API] Props detected. Switching to Event-Based Fetch for ${sport}...`);

                    // 1. Fetch Schedule (H2H) to get IDs
                    const url = `${BASE_URL}/${sport}/odds?apiKey=${apiKey}&regions=${region}&markets=h2h&oddsFormat=american`;
                    // mask key for log
                    console.log(`[DEBUG] Fetching Schedule URL: ${url.replace(apiKey, 'HIDDEN_KEY')}`);
                    console.log(`[DEBUG] API Key Length: ${apiKey.length}, First 4: ${apiKey.substring(0, 4)}, Last 4: ${apiKey.substring(apiKey.length - 4)}`);

                    const scheduleResp = await fetchWithTimeout(url, { next: { revalidate: 300 }, timeout: 8000 });
                    if (!scheduleResp.ok) throw new Error(`Schedule fetch failed: ${scheduleResp.statusText}`);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let games: any[] = await scheduleResp.json();

                    if (!Array.isArray(games)) return [];

                    // Filter games FIRST to verify relevance and save API calls
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    games = games.filter((game: any) => {
                        if (disableTimeFilter) return true;
                        const gameTime = new Date(game.commence_time)
                        return gameTime >= timeWindowStart && gameTime <= timeWindowEnd
                    });

                    if (games.length === 0) {
                        console.log(`[API] No relevant games found for ${sport} in window.`);
                        return [];
                    }

                    console.log(`[API] Found ${games.length} games for ${sport}. Fetching props for each...`);

                    // 2. Fetch Props for each game individually
                    // 2. Fetch Props for each game individually (SEQUENTIAL to avoid 429)
                    // LIMIT to top 10 games to prevent execution timeout on busy days
                    const gamesToFetch = games.slice(0, 10);
                    if (games.length > 10) {
                        console.log(`[API] Limiting props fetch to top 10 games (out of ${games.length}) to avoid timeout.`);
                    }

                    const gamesWithProps = [];
                    for (const game of gamesToFetch) {
                        const eventUrl = `https://api.the-odds-api.com/v4/sports/${sport}/events/${game.id}/odds?apiKey=${apiKey}&regions=${region}&markets=${markets}&oddsFormat=american`;
                        try {
                            // Add 250ms delay between requests to be safe
                            await new Promise(resolve => setTimeout(resolve, 250));

                            const eventResp = await fetchWithTimeout(eventUrl, { next: { revalidate: 300 }, timeout: 5000 });
                            if (!eventResp.ok) {
                                const errorBody = await eventResp.json().catch(() => ({}));
                                if (errorBody.error_code === 'OUT_OF_USAGE_CREDITS') {
                                    throw new Error('The Odds API key has reached its usage limit (Credits Empty).');
                                }
                                console.warn(`[API] Failed to fetch props for game ${game.id}: ${eventResp.status}`);
                                continue;
                            }
                            const data = await eventResp.json();
                            gamesWithProps.push(data);
                        } catch (e) {
                            console.error(`[API] Error fetching game ${game.id}`, e);
                        }
                    }

                    return gamesWithProps;

                } else {
                    // Standard Bulk Fetch
                    const response = await fetchWithTimeout(`${BASE_URL}/${sport}/odds?apiKey=${apiKey}&regions=${region}&markets=${markets}&oddsFormat=american`, { next: { revalidate: 300 }, timeout: 8000 });

                    if (!response.ok) {
                        const errorBody = await response.json().catch(() => ({}));
                        if (errorBody.error_code === 'OUT_OF_USAGE_CREDITS') {
                            throw new Error('The Odds API key has reached its usage limit. Please upgrade your plan or provide a new key.');
                        }
                        // If 422, it might mean invalid market for bulk.
                        if (response.status === 422) {
                            console.warn(`[API] Bulk fetch 422. Market might require event-based fetch.`);
                        }
                        console.warn(`[API] Failed to fetch ${sport}: ${response.statusText} (${response.status}). Returning empty.`);
                        return [];
                    }
                    const data = await response.json();

                    if (Array.isArray(data)) {
                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                        return data.filter((game: any) => {
                            if (disableTimeFilter) return true;
                            const gameTime = new Date(game.commence_time)
                            return gameTime >= timeWindowStart && gameTime <= timeWindowEnd
                        })
                    }
                    return data;
                }
            } catch (err) {
                console.error(`[API] Error fetching ${sport}:`, err);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        const allGames = results.flat();

        if (allGames.length === 0) {
            console.warn(`No games available for any selected sports: ${sports.join(', ')}`);
            return [];
        }

        // Enrich all games with AI context (player names, line difficulty, etc.)
        const { enrichGameData } = await import('./enrichment');
        const enriched = allGames.map(enrichGameData);

        return enriched;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(`Failed to fetch odds from API. Status: ${error.message}`);
        throw error;
    }
}

interface RequestInitWithTimeout extends RequestInit {
    timeout?: number;
}

async function fetchWithTimeout(resource: RequestInfo, options: RequestInitWithTimeout = {}) {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { timeout: _, ...fetchOptions } = options;
        const response = await fetch(resource, {
            ...fetchOptions,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error(`Request timed out after ${timeout}ms`);
        }
        throw error;
    }
}
