import dotenv from 'dotenv';
import path from 'path';

// Force load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
}

console.log('Loading environment from:', envPath);
console.log('ODDS_API_KEY:', process.env.ODDS_API_KEY ? 'Present' : 'MISSING');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'MISSING');
console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'Present' : 'MISSING');
console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'Present' : 'MISSING');
