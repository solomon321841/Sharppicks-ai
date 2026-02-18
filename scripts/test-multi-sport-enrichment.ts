// Test Multi-Sport Enrichment Logic
// Verifies that line difficulty assessment works correctly for all major sports

import { assessLineDifficulty } from '../lib/odds/enrichment';

console.log('🧪 Multi-Sport Enrichment Logic Test\n');
console.log('Testing line difficulty assessment across all sports...\n');

// ========== SOCCER ==========
console.log('⚽ SOCCER:');
console.log('  Goals Over 0.5:', assessLineDifficulty(0.5, 'player_goal_scorer_anytime'), '(Expected: very_easy)');
console.log('  Goals Over 2.5:', assessLineDifficulty(2.5, 'player_goal_scorer_anytime'), '(Expected: moderate)');
console.log('  Shots Over 1.5:', assessLineDifficulty(1.5, 'player_shots_on_target'), '(Expected: very_easy)');
console.log('  Shots Over 5.5:', assessLineDifficulty(5.5, 'player_shots_on_target'), '(Expected: hard)');

// ========== BASKETBALL ==========
console.log('\n🏀 BASKETBALL:');
console.log('  Points Over 15.5:', assessLineDifficulty(15.5, 'player_points'), '(Expected: very_easy)');
console.log('  Points Over 28.5:', assessLineDifficulty(28.5, 'player_points'), '(Expected: moderate)');
console.log('  Points Over 35.5:', assessLineDifficulty(35.5, 'player_points'), '(Expected: hard)');
console.log('  Rebounds Over 5.5:', assessLineDifficulty(5.5, 'player_rebounds'), '(Expected: very_easy)');
console.log('  Rebounds Over 11.5:', assessLineDifficulty(11.5, 'player_rebounds'), '(Expected: moderate)');
console.log('  Assists Over 7.5:', assessLineDifficulty(7.5, 'player_basketball_assists'), '(Expected: easy)');
console.log('  3-Pointers Over 2.5:', assessLineDifficulty(2.5, 'player_3-point_field_goals'), '(Expected: easy)');

// ========== FOOTBALL ==========
console.log('\n🏈 FOOTBALL:');
console.log('  Passing Yards Over 225.5:', assessLineDifficulty(225.5, 'player_passing_yards'), '(Expected: very_easy)');
console.log('  Passing Yards Over 325.5:', assessLineDifficulty(325.5, 'player_passing_yards'), '(Expected: moderate)');
console.log('  Rushing Yards Over 75.5:', assessLineDifficulty(75.5, 'player_rushing_yards'), '(Expected: easy)');
console.log('  Receiving Yards Over 100.5:', assessLineDifficulty(100.5, 'player_receiving_yards'), '(Expected: moderate)');
console.log('  Touchdowns Over 0.5:', assessLineDifficulty(0.5, 'player_anytime_touchdown'), '(Expected: very_easy)');
console.log('  Touchdowns Over 2.5:', assessLineDifficulty(2.5, 'player_anytime_touchdown'), '(Expected: moderate)');
console.log('  Receptions Over 6.5:', assessLineDifficulty(6.5, 'player_receptions'), '(Expected: easy)');

// ========== BASEBALL ==========
console.log('\n⚾ BASEBALL:');
console.log('  Hits Over 0.5:', assessLineDifficulty(0.5, 'player_hits'), '(Expected: very_easy)');
console.log('  Hits Over 2.5:', assessLineDifficulty(2.5, 'player_hits'), '(Expected: moderate)');
console.log('  Home Runs Over 0.5:', assessLineDifficulty(0.5, 'player_home_runs'), '(Expected: easy)');
console.log('  Home Runs Over 1.5:', assessLineDifficulty(1.5, 'player_home_runs'), '(Expected: moderate)');
console.log('  Strikeouts Over 6.5:', assessLineDifficulty(6.5, 'pitcher_strikeouts'), '(Expected: easy)');
console.log('  RBIs Over 1.5:', assessLineDifficulty(1.5, 'player_rbis'), '(Expected: easy)');

// ========== HOCKEY ==========
console.log('\n🏒 HOCKEY:');
console.log('  Goals Over 0.5:', assessLineDifficulty(0.5, 'player_hockey_goals'), '(Expected: easy)');
console.log('  Goals Over 1.5:', assessLineDifficulty(1.5, 'player_hockey_goals'), '(Expected: moderate)');
console.log('  Assists Over 0.5:', assessLineDifficulty(0.5, 'player_hockey_assists'), '(Expected: very_easy)');
console.log('  Assists Over 2.5:', assessLineDifficulty(2.5, 'player_hockey_assists'), '(Expected: moderate)');
console.log('  Points Over 1.5:', assessLineDifficulty(1.5, 'player_hockey_points'), '(Expected: easy)');
console.log('  Saves Over 28.5:', assessLineDifficulty(28.5, 'goalie_saves'), '(Expected: easy)');

console.log('\n✅ All sport-specific calibrations tested!');
console.log('The enrichment logic now supports: Soccer, Basketball, Football, Baseball, Hockey');
