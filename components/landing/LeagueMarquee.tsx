"use client"

import { motion } from "framer-motion"
import Image from "next/image"

const leagues = [
    { name: "NBA", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png" },
    { name: "NHL", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/nhl.png" },
    { name: "NCAAB", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/NCAA_logo.svg/1024px-NCAA_logo.svg.png" },
    { name: "EPL", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/23.png" },
    { name: "Champions League", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/2.png" },
    { name: "La Liga", logo: "https://a.espncdn.com/i/leaguelogos/soccer/500/15.png" },
]

export function LeagueMarquee() {
    // Duplicate the list for seamless looping
    const displayLeagues = [...leagues, ...leagues, ...leagues]

    return (
        <div className="w-full bg-black/50 py-12 border-y border-white/5 relative overflow-hidden isolate">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />

            <div className="container px-4 mx-auto mb-8 relative z-20">
                <p className="text-center text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">
                    Trusted data from professional leagues
                </p>
            </div>

            <div className="flex overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, -100 * leagues.length],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30, // Faster marquee
                            ease: "linear",
                        },
                    }}
                    className="flex gap-16 md:gap-24 items-center whitespace-nowrap px-12"
                >
                    {displayLeagues.map((league, i) => {
                        const isSoccerLeague = ["EPL", "Champions League", "La Liga"].includes(league.name);
                        return (
                            <div key={i} className="flex items-center gap-4 group grayscale hover:grayscale-0 transition-all duration-300 opacity-40 hover:opacity-100">
                                <div className={`relative w-10 h-10 md:w-12 md:h-12 ${isSoccerLeague ? 'brightness-[3] contrast-[1.2] scale-110' : ''}`}>
                                    <Image
                                        src={league.logo}
                                        alt={league.name}
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <span className="text-zinc-400 font-black text-xl md:text-2xl tracking-tighter group-hover:text-white transition-colors">
                                    {league.name}
                                </span>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    )
}
