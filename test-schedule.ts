
import { getSchedule } from './lib/odds/getSchedule.js';
import dotenv from 'dotenv';
dotenv.config();

const SUPPORTED_SPORTS = [
    'basketball_nba',
    'basketball_ncaab',
    'icehockey_nhl',
    'soccer_epl',
    'soccer_spain_la_liga',
    'soccer_uefa_champions_league'
];

async function test() {
    console.log('Testing getSchedule (Strict Leagues)...');
    try {
        const schedule = await getSchedule(SUPPORTED_SPORTS);
        console.log('Schedule result:', JSON.stringify(schedule, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test();
