
import { generateDailyParlays, getSystemUser } from '../lib/daily-picks/generateDailyParlays';

async function main() {
    console.log("Starting reproduction...");
    try {
        const user = await getSystemUser();
        console.log("System User:", user.id);
        const results = await generateDailyParlays(new Date(), user.id);
        console.log("Results:", results);
    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

main();
