
const urls = [
    { name: 'NFL', url: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png' },
    { name: 'NBA', url: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png' },
    { name: 'NHL', url: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png' },
    { name: 'EPL', url: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png' },
    { name: 'La Liga (87)', url: 'https://a.espncdn.com/i/leaguelogos/soccer/500/87.png' },
    { name: 'La Liga (15)', url: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png' },
    { name: 'La Liga (1)', url: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1.png' }
];

async function check() {
    for (const item of urls) {
        try {
            const res = await fetch(item.url, { method: 'HEAD' });
            console.log(`${item.name}: ${res.status} ${res.statusText}`);
        } catch (e) {
            console.error(`${item.name}: Error ${(e as any).message}`);
        }
    }
}
check();
