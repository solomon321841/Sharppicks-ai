const apiKey = '769d4aa07e45781ffbcbc36503826b00';
const sport = 'soccer_spain_la_liga';

async function test(url: string) {
    console.log(`Testing URL: ${url.replace(apiKey, 'HIDDEN')}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status} ${res.statusText}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Success! Found ${Array.isArray(data) ? data.length : 'object'} results.`);
        } else {
            console.log(`Error body: ${await res.text()}`);
        }
    } catch (e: any) {
        console.log(`Fetch error: ${e.message}`);
    }
}

async function run() {
    console.log('--- Test 1: Standard /odds? ---');
    await test(`https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`);

    console.log('\n--- Test 2: Trailing slash /odds/? ---');
    await test(`https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${apiKey}&regions=us&markets=h2h&oddsFormat=american`);
}

run();
