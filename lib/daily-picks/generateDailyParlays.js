"use strict";
/* eslint-disable */
/**
 * Daily Picks Generation Helper
 * Generates 4 different 3-leg parlays at varying risk levels
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyParlays = generateDailyParlays;
exports.getSystemUser = getSystemUser;
var prisma_1 = require("@/lib/prisma");
var generateParlay_1 = require("@/lib/ai/generateParlay");
var DAILY_PARLAY_CONFIGS = [
    {
        type: 'safe',
        risk: 2,
        betTypes: ['moneyline', 'spread', 'totals'],
        description: 'Heavy favorites - high probability outcomes'
    },
    {
        type: 'balanced',
        risk: 5,
        betTypes: ['moneyline', 'spread', 'totals', 'player_props'],
        description: 'Mix of safe anchors and moderate market challenges'
    },
    {
        type: 'risky',
        risk: 8,
        betTypes: ['moneyline', 'player_props', 'totals'],
        description: 'Underdogs and high-reward player performance props'
    }
];
/**
 * Generate all 4 daily parlays for a given date
 */
function generateDailyParlays(date, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var results, sports, baseMarkets, propMarkets, getOdds, oddsData;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = [];
                    sports = ['basketball_nba', 'icehockey_nhl', 'soccer_epl', 'soccer_spain_la_liga', 'basketball_ncaab', 'soccer_uefa_champs_league'];
                    // 0. Centralized Odds Fetching (Optimization to prevent 429 Rate Limits)
                    // We fetch ONCE for all sports/markets instead of 4x inside the loop.
                    console.log("[Daily Picks] Fetching odds for ".concat(sports.length, " sports..."));
                    baseMarkets = 'h2h,spreads,totals';
                    propMarkets = [
                        'player_points', 'player_rebounds', 'player_assists', 'player_threes', // NBA
                        'player_goals', 'player_shots_on_goal', // NHL
                        'player_goal_scorer_anytime', 'player_shots' // Soccer
                    ].join(',');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@/lib/odds/getOdds'); })];
                case 1:
                    getOdds = (_a.sent()).getOdds;
                    return [4 /*yield*/, getOdds(sports, 'us', "".concat(baseMarkets, ",").concat(propMarkets))];
                case 2:
                    oddsData = _a.sent();
                    if (!(!oddsData || oddsData.length === 0)) return [3 /*break*/, 4];
                    console.warn("[Daily Picks] Rich fetch returned empty/failed. Retrying with standard markets only.");
                    return [4 /*yield*/, getOdds(sports, 'us', baseMarkets)];
                case 3:
                    oddsData = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!oddsData || oddsData.length === 0) {
                        console.error("[Daily Picks] Critical: No odds data available for any sport. Generation will likely fail.");
                    }
                    else {
                        console.log("[Daily Picks] Successfully fetched ".concat(oddsData.length, " games with odds data."));
                    }
                    // Use Promise.all to generate in parallel
                    return [4 /*yield*/, Promise.all(DAILY_PARLAY_CONFIGS.map(function (config) { return __awaiter(_this, void 0, void 0, function () {
                            var safeBetTypes, isPropsOnly, generated, newParlay, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("[Daily Picks] Generating ".concat(config.type, " parlay (Risk ").concat(config.risk, ")..."));
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 5, , 6]);
                                        safeBetTypes = config.betTypes;
                                        isPropsOnly = config.betTypes.every(function (t) { return t.includes('prop'); });
                                        return [4 /*yield*/, (0, generateParlay_1.generateParlay)({
                                                sports: sports,
                                                riskLevel: config.risk,
                                                numLegs: 3,
                                                betTypes: safeBetTypes,
                                                oddsData: oddsData // Pass pre-fetched data
                                            })];
                                    case 2:
                                        generated = _a.sent();
                                        if (!generated || generated.error || !generated.legs) {
                                            console.error("[Daily Picks] Failed to generate ".concat(config.type, " parlay:"), generated.error);
                                            results.push({ type: config.type, success: false, error: generated.error });
                                            return [2 /*return*/]; // Skip if failed
                                        }
                                        return [4 /*yield*/, prisma_1.prisma.parlay.create({
                                                data: {
                                                    user_id: userId,
                                                    parlay_type: config.type,
                                                    total_odds: generated.totalOdds,
                                                    sports: ['Mixed'],
                                                    is_daily: true,
                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                    bet_types: generated.legs.map(function (l) { return l.betType || l.bet_type || 'moneyline'; }),
                                                    num_legs: generated.legs.length,
                                                    risk_level: config.risk,
                                                    ai_confidence: parseInt(generated.confidence) || 85,
                                                    legs: {
                                                        create: generated.legs.map(function (l) { return ({
                                                            sports: l.sport || 'Mixed',
                                                            team: l.team,
                                                            bet_type: l.betType || l.bet_type || 'moneyline',
                                                            odds: l.odds,
                                                            opponent: l.opponent,
                                                            player: l.player || null,
                                                            line: (l.line !== undefined && l.line !== null) ? String(l.line) : null,
                                                            ai_reasoning: l.reasoning || null,
                                                            result: 'pending'
                                                        }); })
                                                    }
                                                }
                                            })];
                                    case 3:
                                        newParlay = _a.sent();
                                        // Link to DailyPick
                                        return [4 /*yield*/, prisma_1.prisma.dailyPick.create({
                                                data: {
                                                    parlay_id: newParlay.id,
                                                    post_date: date,
                                                    sport_focus: 'Mixed'
                                                }
                                            })];
                                    case 4:
                                        // Link to DailyPick
                                        _a.sent();
                                        console.log("[Daily Picks] \u2705 Generated ".concat(config.type, " parlay (ID: ").concat(newParlay.id, ")"));
                                        results.push({ type: config.type, success: true, parlayId: newParlay.id });
                                        return [3 /*break*/, 6];
                                    case 5:
                                        error_1 = _a.sent();
                                        console.error("[Daily Picks] Error generating ".concat(config.type, " parlay:"), error_1);
                                        results.push({ type: config.type, success: false, error: error_1.message });
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    // Use Promise.all to generate in parallel
                    _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
/**
 * Get or create system user for daily picks
 */
function getSystemUser() {
    return __awaiter(this, void 0, void 0, function () {
        var systemUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.prisma.user.findUnique({
                        where: { email: 'admin@sharppicks.ai' }
                    })];
                case 1:
                    systemUser = _a.sent();
                    if (!!systemUser) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma_1.prisma.user.create({
                            data: {
                                email: 'admin@sharppicks.ai',
                                full_name: 'SharpPicks AI',
                                subscription_tier: 'whale'
                            }
                        })];
                case 2:
                    systemUser = _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, systemUser];
            }
        });
    });
}
