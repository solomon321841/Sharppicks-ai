import { motion } from "framer-motion"
import { Activity } from "lucide-react"

interface RecentLogItemProps {
    bet: any;
    delay: number;
}

export function RecentLogItem({ bet, delay }: RecentLogItemProps) {
    const isWin = bet?.result === 'won';
    const isLoss = bet?.result === 'lost';
    const isPending = bet?.result === 'pending';
    const legsCount = bet?.parlay?.legs?.length || 1;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-white/5 hover:bg-zinc-900/40 transition-colors group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isWin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    isLoss ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        'bg-zinc-900 border-white/10 text-zinc-500'
                    }`}>
                    <Activity className="w-4 h-4" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white uppercase italic tracking-wider">
                            {legsCount} Leg Sequence
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isWin ? 'bg-emerald-500/10 text-emerald-400' :
                            isLoss ? 'bg-red-500/10 text-red-400' :
                                'bg-zinc-800 text-zinc-400'
                            }`}>
                            {(bet?.result || 'UNKNOWN').toUpperCase()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-zinc-500 font-bold">{new Date(bet?.created_at || Date.now()).toLocaleDateString()}</span>
                        <span className="text-[9px] text-zinc-600">•</span>
                        <span className="text-[9px] text-zinc-500 font-bold">{bet?.sportsbook || 'Unknown'}</span>
                    </div>
                </div>
            </div>

            <div className="text-right">
                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Return</div>
                <div className={`text-sm font-black italic tracking-tighter ${isWin ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                    ${isWin ? ((bet?.stake_amount || 0) * 3.4).toFixed(2) : '0.00'}
                </div>
            </div>
        </motion.div>
    )
}
