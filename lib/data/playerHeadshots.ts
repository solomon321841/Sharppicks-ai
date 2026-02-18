// Comprehensive map of star players to their ESPN headshot URLs
// This ensures that even if the AI doesn't return a URL, we can resolve it locally.

export const PLAYER_HEADSHOTS: Record<string, string> = {
    // SOCCER
    'Cedric Bakambu': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/148418.png&w=350&h=254',
    'Alexander Sorloth': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/186588.png&w=350&h=254',
    'Alexander Sørloth': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/186588.png&w=350&h=254',
    'Gorka Guruzeta': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/245224.png&w=350&h=254',
    'Inaki Williams': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/210952.png&w=350&h=254',
    'Iñaki Williams': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/210952.png&w=350&h=254',
    'Antoine Griezmann': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/45843.png&w=350&h=254',
    'Alvaro Morata': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/107755.png&w=350&h=254',
    'Robert Lewandowski': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/45723.png&w=350&h=254',
    'Jude Bellingham': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/258908.png&w=350&h=254',
    'Vinicius Jr': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/246333.png&w=350&h=254',
    'Vinícius Júnior': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/246333.png&w=350&h=254',
    'Kylian Mbappe': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/239335.png&w=350&h=254',
    'Kylian Mbappé': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/239335.png&w=350&h=254',
    'Erling Haaland': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/239872.png&w=350&h=254',
    'Harry Kane': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/147175.png&w=350&h=254',
    'Mohamed Salah': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/132808.png&w=350&h=254',
    'Bukayo Saka': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/263567.png&w=350&h=254',
    'Son Heung-Min': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/101487.png&w=350&h=254',
    'Karl Etta': 'https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/178553.png&w=350&h=254', // Karl Toko Ekambi as fallback

    // NBA
    'LeBron James': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/1966.png&w=350&h=254',
    'Stephen Curry': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3975.png&w=350&h=254',
    'Giannis Antetokounmpo': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3032977.png&w=350&h=254',
    'Luka Doncic': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3945274.png&w=350&h=254',
    'Nikola Jokic': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3112335.png&w=350&h=254',
    'Kevin Durant': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3202.png&w=350&h=254',
    'Jayson Tatum': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4065648.png&w=350&h=254',
    'Joel Embiid': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/3059318.png&w=350&h=254',

    // NFL
    'Patrick Mahomes': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3139477.png&w=350&h=254',
    'Lamar Jackson': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3916387.png&w=350&h=254',
    'Christian McCaffrey': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3117251.png&w=350&h=254',
    'Tyreek Hill': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3116406.png&w=350&h=254',
    'Josh Allen': 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/3918298.png&w=350&h=254',
};

// Helper to proxy URL
export const getPlayerHeadshot = (name: string): string | null => {
    const cleanName = name.trim();

    const getProxiedUrl = (url: string) => {
        // Use Google's open proxy to bypass hotlink protection
        return `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(url)}`;
    }

    // 1. Direct match
    if (PLAYER_HEADSHOTS[cleanName]) return getProxiedUrl(PLAYER_HEADSHOTS[cleanName]);

    // 2. Case insensitive match
    const lowerName = cleanName.toLowerCase();
    const key = Object.keys(PLAYER_HEADSHOTS).find(k => k.toLowerCase() === lowerName);
    if (key) return getProxiedUrl(PLAYER_HEADSHOTS[key]);

    // 3. Partial match
    const partialKey = Object.keys(PLAYER_HEADSHOTS).find(k => k.toLowerCase().includes(lowerName) || lowerName.includes(k.toLowerCase()));
    if (partialKey) return getProxiedUrl(PLAYER_HEADSHOTS[partialKey]);

    return null;
}
