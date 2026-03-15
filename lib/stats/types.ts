export interface PlayerStats {
    name: string
    team: string
    position?: string
    seasonAverages: Record<string, number> // e.g. { points: 27.3, rebounds: 7.8 }
    last5Games?: Record<string, number>
    status: 'HEALTHY' | 'QUESTIONABLE' | 'DOUBTFUL' | 'OUT' | 'DAY_TO_DAY' | 'UNKNOWN'
    injuryNote?: string
}

export interface TeamStats {
    name: string
    record: string           // "45-22"
    homeRecord?: string      // "28-8"
    awayRecord?: string      // "17-14"
    pointsPerGame?: number
    pointsAllowed?: number
    last5?: string
}

export interface InjuryEntry {
    playerName: string
    status: 'OUT' | 'DOUBTFUL' | 'QUESTIONABLE' | 'DAY_TO_DAY' | 'PROBABLE'
    description: string // "Knee", "Ankle - Day-To-Day"
}

export interface KeyPlayer {
    name: string
    category: string    // "pointsPerGame", "reboundsPerGame", "assistsPerGame", "goals", etc.
    value: number       // 26.3
    display: string     // "26.3 PPG"
}

export interface GameContext {
    homeTeam: TeamStats
    awayTeam: TeamStats
    injuries: InjuryEntry[]
    homeKeyPlayers?: KeyPlayer[]
    awayKeyPlayers?: KeyPlayer[]
    restDays?: { home: number | null; away: number | null }
}
