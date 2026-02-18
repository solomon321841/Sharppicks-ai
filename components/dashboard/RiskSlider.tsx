import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

export function RiskSlider({ value, onChange }: { value: number, onChange: (val: number) => void }) {
    const [width, setWidth] = React.useState(0)
    const ref = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (ref.current) {
            setWidth(ref.current.offsetWidth)
        }
    }, [])

    const getRiskLabel = (val: number) => {
        if (val <= 3) return { label: 'Safe', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
        if (val <= 7) return { label: 'Balanced', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }
        return { label: 'High Reward', color: 'text-red-400 border-red-500/30 bg-red-500/10' }
    }

    const { label, color } = getRiskLabel(value)

    return (
        <div className="space-y-4 select-none">
            <div className="flex items-center justify-between">
                <div>
                    <label className="text-sm font-black leading-none text-white tracking-wide">RISK LEVEL</label>
                    <p className="text-[10px] text-zinc-400 mt-1 font-bold tracking-wider">ADJUST AI AGGRESSION</p>
                </div>
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 shadow-lg",
                    color
                )}>
                    <span className="text-sm font-black tracking-tighter">{value}</span>
                    <span className="text-[8px] font-bold opacity-60">/ 10</span>
                    <span className="w-px h-3 bg-white/10 mx-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </div>
            </div>

            <div className="relative py-4 group" ref={ref}>
                <SliderPrimitive.Root
                    min={1}
                    max={10}
                    step={1}
                    value={[value]}
                    onValueChange={(vals) => onChange(vals[0])}
                    className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer z-10"
                >
                    {/* Track Background (Recessed Dark) */}
                    <SliderPrimitive.Track className="bg-zinc-950/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] border border-white/5 relative grow rounded-full h-2 overflow-hidden">
                        {/* Gradient Reveal Layer */}
                        <SliderPrimitive.Range className="absolute h-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-90"
                                style={{ width: width ? `${width}px` : '100%' }}
                            />
                        </SliderPrimitive.Range>
                    </SliderPrimitive.Track>

                    {/* Premium Platinum Knob */}
                    <SliderPrimitive.Thumb
                        className="block w-6 h-6 rounded-full bg-white border-[3px] border-zinc-900 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] focus:outline-none transition-all duration-200 cursor-grab active:cursor-grabbing"
                    />
                </SliderPrimitive.Root>
            </div>

            <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-1">
                <span className="flex items-center gap-1.5 transition-colors duration-300 hover:text-emerald-400 cursor-help group/safe">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover/safe:scale-125 transition-transform" />
                    Safe (Favorites)
                </span>
                <span className="flex items-center gap-1.5 transition-colors duration-300 hover:text-red-400 cursor-help group/risky">
                    High Risk (Underdogs)
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover/risky:scale-125 transition-transform" />
                </span>
            </div>
        </div>
    )
}
