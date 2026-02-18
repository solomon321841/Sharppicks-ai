import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

const betTypes = [
    { id: 'moneyline', label: 'Moneyline', desc: 'Winner' },
    { id: 'spread', label: 'Spread', desc: 'Points' },
    { id: 'totals', label: 'Totals', desc: 'Over/Under' },
    { id: 'player_props', label: 'Props', desc: 'Players' },
]

export function BetTypeSelector({ value, onChange, disabledTypes = [] }: {
    value: string[],
    onChange: (val: string[]) => void,
    disabledTypes?: string[]
}) {

    const handleToggle = (id: string) => {
        if (disabledTypes.includes(id)) return;

        if (value.includes(id)) {
            onChange(value.filter(v => v !== id))
        } else {
            onChange([...value, id])
        }
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bet Types</label>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
                {betTypes.map((type) => {
                    const isSelected = value.includes(type.id);
                    const isDisabled = disabledTypes.includes(type.id);

                    return (
                        <div
                            key={type.id}
                            onClick={() => handleToggle(type.id)}
                            className={`
                                relative flex items-center justify-center py-4 px-3 rounded-xl border transition-all duration-500 group overflow-hidden hover:shadow-lg hover:shadow-emerald-500/5
                                ${isDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-zinc-900/40 grayscale border-zinc-800'
                                    : 'cursor-pointer hover:border-emerald-500/30 hover:bg-white/[0.03]'}
                                ${isSelected && !isDisabled
                                    ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/40 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20'
                                    : 'border-white/5 bg-gradient-to-br from-zinc-900/60 to-zinc-900/40'}
                            `}
                        >
                            <div className="flex flex-col items-center gap-1 z-10">
                                <span className={`text-sm font-black tracking-tight transition-colors duration-300 ${isSelected && !isDisabled ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]' : 'text-zinc-300 group-hover:text-white'}`}>
                                    {type.label}
                                </span>
                                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isSelected && !isDisabled ? 'text-emerald-500/90' : 'text-zinc-600 group-hover:text-zinc-500'}`}>
                                    {type.desc}
                                </span>
                            </div>

                            {/* Corner Accent */}
                            {isSelected && !isDisabled && (
                                <>
                                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-emerald-500/20 to-transparent -mr-2 -mt-2 blur-md" />
                                    <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-emerald-500/20 to-transparent -ml-2 -mb-2 blur-md" />
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
