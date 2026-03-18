import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // Only allow in development or with valid CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isDev = process.env.NODE_ENV === 'development'
    const isAuthed = !!(cronSecret && authHeader === `Bearer ${cronSecret}`)

    if (!isDev && !isAuthed) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const apiKey = process.env.ODDS_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const sports = [
        'americanfootball_nfl',
        'americanfootball_nfl_super_bowl',
        'americanfootball_nfl_preseason',
        'basketball_nba',
        'icehockey_nhl',
        'soccer_epl'
    ];

    try {
        const results = await Promise.all(
            sports.map(async (sport) => {
                try {
                    const response = await fetch(
                        `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${apiKey}&regions=us&markets=h2h`
                    );
                    const data = await response.json();
                    return {
                        sport,
                        gamesFound: Array.isArray(data) ? data.length : 0,
                        error: data.message || null,
                        status: response.ok ? 'available' : 'error'
                    };
                } catch (err: any) {
                    return {
                        sport,
                        gamesFound: 0,
                        error: err.message,
                        status: 'error'
                    };
                }
            })
        );

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
