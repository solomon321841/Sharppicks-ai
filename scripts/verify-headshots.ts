
import { getPlayerHeadshot } from '../lib/data/playerHeadshots';

const testNames = [
    'Cedric Bakambu',
    'Alexander Sorloth',
    'Gorka Guruzeta',
    'Inaki Williams',
    'LeBron James',
    'Patrick Mahomes',
    ' Karl Etta ', // Test trim/whitespace
    'Mbappe', // Test partial
];

console.log("--- Verifying Headshot Resolution ---");

testNames.forEach(name => {
    const url = getPlayerHeadshot(name.trim()); // The component should probably trim too or the logic handles it?
    // My logic handles .includes() so trimming might happen implicitly via partial match?
    // But let's check exactly how the function behaves.
    console.log(`Name: "${name}" -> URL: ${url ? 'FOUND' : 'MISSING'} (${url || ''})`);
});
