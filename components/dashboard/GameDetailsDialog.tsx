
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { TeamLogo } from "./TeamLogo"
import { CalendarDays, Clock, MapPin, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"

type GameData = {
    id: string
    home: string
    away: string
    time: string
    h2h?: { name: string, price: number }[]
}

interface GameDetailsDialogProps {
    game: GameData | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function GameDetailsDialog({ game, open, onOpenChange }: GameDetailsDialogProps) {
    if (!game) return null

    const gameDate = new Date(game.time)
    const formattedDate = gameDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    const formattedTime = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

    const homeOdds = game.h2h?.find(o => o.name === game.home)?.price
    const awayOdds = game.h2h?.find(o => o.name === game.away)?.price

    const formatOdds = (odds?: number) => {
        if (!odds) return 'N/A'
        return odds > 0 ? `+${odds}` : odds.toString()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold flex flex-col gap-1">
                        Matchup Details
                        <span className="text-xs font-normal text-muted-foreground uppercase tracking-widest">{formattedDate} • {formattedTime}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Matchup Header */}
                    <div className="flex items-center justify-between px-4">
                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="relative w-16 h-16 transform transition-transform hover:scale-110">
                                <TeamLogo name={game.away} className="w-16 h-16" />
                            </div>
                            <span className="text-sm font-bold text-center leading-tight">{game.away}</span>
                            <Badge variant="outline" className="mt-1 border-white/10 bg-white/5 font-mono">
                                {formatOdds(awayOdds)}
                            </Badge>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-1">
                            <span className="text-2xl font-black italic text-muted-foreground/30">VS</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 w-1/3">
                            <div className="relative w-16 h-16 transform transition-transform hover:scale-110">
                                <TeamLogo name={game.home} className="w-16 h-16" />
                            </div>
                            <span className="text-sm font-bold text-center leading-tight">{game.home}</span>
                            <Badge variant="outline" className="mt-1 border-white/10 bg-white/5 font-mono">
                                {formatOdds(homeOdds)}
                            </Badge>
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Stats / Lineups Placeholder */}
                    <div className="space-y-4">
                        <div className="rounded-lg border border-dashed border-white/10 bg-white/5 p-4 flex flex-col items-center justify-center gap-2 text-center">
                            <Users className="w-8 h-8 text-muted-foreground/50" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">Starting Lineups</p>
                                <p className="text-xs text-muted-foreground">Lineup data is not yet available for this match.</p>
                            </div>
                            <Badge variant="secondary" className="mt-2 text-[10px] bg-emerald/10 text-emerald hover:bg-emerald/20 border-emerald/20">
                                COMING SOON
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2 p-3 rounded-md bg-white/5 border border-white/5">
                                <Clock className="w-4 h-4 text-emerald" />
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Kickoff</span>
                                    <span className="font-medium">{formattedTime}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 rounded-md bg-white/5 border border-white/5">
                                <MapPin className="w-4 h-4 text-emerald" />
                                <div className="flex flex-col">
                                    <span className="text-muted-foreground">Venue</span>
                                    <span className="font-medium">TBD Stadium</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
