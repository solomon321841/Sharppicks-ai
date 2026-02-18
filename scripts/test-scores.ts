
import { getScores } from '../lib/odds/getScores';

async function test() {
    try {
        console.log('Testing getScores for basketball_ncaab...');
        const scores = await getScores('basketball_ncaab');
        console.log('Scores:', JSON.stringify(scores.slice(0, 2), null, 2));

        if (scores.length > 0) {
            console.log('✅ getScores working!');
        } else {
            console.log('⚠️ No recent completed games found (could be normal if no games in last 3 days)');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

test();
