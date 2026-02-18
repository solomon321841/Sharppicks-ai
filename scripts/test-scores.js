
const fs = require('fs');
const path = require('path');

// Load env vars manually
try {
    const envPath = path.join(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
} catch (e) {
    console.warn('Could not load .env.local');
}

const API_KEY = process.env.ODDS_API_KEY;
if (!API_KEY) {
    console.error('❌ Missing ODDS_API_KEY in .env.local');
    process.exit(1);
}

const BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const SPORT_KEY = 'basketball_ncaab';

async function test() {
    console.log(`Testing getScores for ${SPORT_KEY}...`);
    const url = `${BASE_URL}/${SPORT_KEY}/scores?apiKey=${API_KEY}&daysFrom=3`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Stats: Found ${data.length} games in last 3 days.`);

        const completed = data.filter(g => g.completed);
        console.log(`Completed: ${completed.length}`);

        if (completed.length > 0) {
            console.log('Sample Completed Game:', JSON.stringify(completed[0], null, 2));
            console.log('✅ API Connection and Data verified!');
        } else {
            console.log('⚠️ No completed games found (might be start of season or wrong sport key).');
            if (data.length > 0) {
                console.log('Sample Live/Upcoming Game:', JSON.stringify(data[0], null, 2));
            }
        }

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

test();
