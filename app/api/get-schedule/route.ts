import { NextResponse } from 'next/server'
import { getSchedule } from '@/lib/odds/getSchedule'

// List of sports we support in the scraper/app
// Strictly following requested leagues for March Madness season
const SUPPORTED_SPORTS = [
    'basketball_nba',
    'basketball_ncaab',
    'icehockey_nhl',
    'soccer_epl',
    'soccer_spain_la_liga',
    'soccer_uefa_champs_league'
]

export const revalidate = 3600 // Cache at edge for 1 hour too

export async function GET() {
    try {
        const schedule = await getSchedule(SUPPORTED_SPORTS)
        return NextResponse.json(schedule)
    } catch (error) {
        console.error('Schedule API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
    }
}
