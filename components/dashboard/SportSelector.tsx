'use client'

import Image from 'next/image'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Check, Trophy } from "lucide-react"

const sports: { id: string; name: string; logo?: string; icon?: 'basketball'; darkLogo?: boolean }[] = [
    { id: 'americanfootball_nfl', name: 'NFL Football', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nfl.png' },
    { id: 'basketball_nba', name: 'NBA Basketball', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png' },
    { id: 'icehockey_nhl', name: 'NHL Hockey', logo: 'https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png' },
    { id: 'soccer_epl', name: 'EPL Soccer', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/23.png', darkLogo: true },
    { id: 'soccer_spain_la_liga', name: 'La Liga', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/15.png' },
    { id: 'basketball_ncaab', name: 'NCAAB', icon: 'basketball' },
    { id: 'soccer_uefa_champs_league', name: 'UCL', logo: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png', darkLogo: true },
]

function BasketballIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2C12 12 12 12 12 22" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4.5 4.5C8 7.5 8 16.5 4.5 19.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19.5 4.5C16 7.5 16 16.5 19.5 19.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    )
}

export function SportSelector({ value, onChange, schedule }: {
    value: string[],
    onChange: (val: string[]) => void,
    schedule?: { sport: string, gamesCount: number }[]
}) {

    // Helper to toggle a sport
    const toggleSport = (id: string) => {
        if (!hasGames(id)) return // Block selection of unavailable sports
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id))
        } else {
            onChange([...value, id])
        }
    }

    // Helper to select all (only available)
    const selectAll = () => {
        const availableSports = sports.filter(s => {
            if (!schedule) return true
            const data = schedule.find(sched => sched.sport === s.id)
            return data ? data.gamesCount > 0 : true
        })

        if (value.length === availableSports.length && value.length > 0) {
            onChange([])
        } else {
            onChange(availableSports.map(s => s.id))
        }
    }

    // Check if a specific sport has games
    const hasGames = (sportId: string) => {
        if (!schedule) return true // Schedule not loaded yet, assume yes
        const data = schedule.find(s => s.sport === sportId)
        return data ? data.gamesCount > 0 : false // Default false if not in schedule
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sports</label>
                <button
                    onClick={selectAll}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-1 group uppercase tracking-wider"
                >
                    All
                    <Check className="w-3 h-3 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {sports.map((sport) => {
                    const isSelected = value.includes(sport.id)
                    const available = hasGames(sport.id)

                    return (
                        <div
                            key={sport.id}
                            onClick={() => toggleSport(sport.id)}
                            className={`
                                relative flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all duration-500 group overflow-hidden
                                w-[calc(33.33%-5px)] sm:w-[calc(14.28%-5px)]
                                ${!available
                                    ? 'opacity-40 grayscale cursor-not-allowed border-zinc-800/50'
                                    : 'cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.03]'}
                                ${isSelected && available
                                    ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/50 shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)]'
                                    : available ? 'border-white/5 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30' : 'border-zinc-800/50 bg-zinc-900/30'}
                            `}
                        >
                            {/* Active Indicator Line */}
                            {isSelected && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80" />
                            )}

                            <div className={`
                                w-14 h-14 sm:w-12 sm:h-12 mb-1.5 rounded-full flex items-center justify-center relative transition-transform duration-500
                                ${available ? 'group-hover:scale-110 group-hover:rotate-3' : ''}
                                ${isSelected && available
                                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/30'
                                    : 'bg-zinc-800/50 ring-1 ring-white/5'}
                            `}>
                                {sport.icon === 'basketball' ? (
                                    <BasketballIcon className={`w-7 h-7 ${isSelected && available ? 'text-emerald-400' : 'text-zinc-400'}`} />
                                ) : (
                                    <Image
                                        src={sport.logo!}
                                        alt={sport.name}
                                        fill
                                        className={`object-contain p-2 drop-shadow-lg ${sport.darkLogo ? 'brightness-[1.8]' : ''}`}
                                        unoptimized
                                    />
                                )}
                            </div>

                            <div className="space-y-0.5 text-center z-10">
                                <p className={`text-[10px] font-black tracking-widest uppercase transition-colors duration-300 ${isSelected && available ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                    {sport.name.split(' ')[0]}
                                </p>
                                {!available && (
                                    <p className="text-[8px] font-semibold text-zinc-600 uppercase tracking-wider">No Games</p>
                                )}
                            </div>

                            {/* Background Glow */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-emerald-500/5 blur-xl -z-10" />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
