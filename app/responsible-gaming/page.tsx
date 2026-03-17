import { LegalPageLayout } from "@/components/landing/LegalPageLayout"
import { ShieldAlert, Phone, Globe, AlertTriangle, Info, Scale } from "lucide-react"

export default function ResponsibleGamingPage() {
    return (
        <LegalPageLayout
            title="Responsible Gaming"
            subtitle="Play smart. Stay within your limits."
        >
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                <div className="flex gap-4 items-start relative z-10">
                    <div className="shrink-0 w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <ShieldAlert className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic mb-3">Our Commitment</h2>
                        <p className="text-zinc-400 leading-relaxed font-medium">
                            Sharp Picks AI is committed to promoting responsible sports entertainment. We believe that sports analytics should enhance the fan experience, not lead to financial distress or personal harm.
                        </p>
                    </div>
                </div>
            </div>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Info className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">1. Analytics vs. Gambling</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium">
                    Sharp Picks AI is an <strong className="text-white font-bold bg-white/5 px-2 py-0.5 rounded">information-only</strong> platform. We do not accept wagers and we are not a sportsbook. Our goal is to provide data-driven insights to help users make more informed decisions when choosing to participate in legal sports wagering.
                </p>
            </section>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">2. Warning Signs</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium mb-6">
                    It is important to recognize the signs of problem gambling:
                </p>
                <div className="grid gap-3">
                    {[
                        "Spending more time or money on betting than intended.",
                        "Feeling the need to bet with larger amounts of money to get the same excitement.",
                        "Borrowing money or selling assets to fund betting.",
                        "Neglecting personal, family, or work responsibilities.",
                        "Feeling irritable or restless when attempting to cut down on betting."
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                                <Scale className="w-4 h-4 text-yellow-500" />
                            </div>
                            <span className="text-zinc-300 font-medium leading-relaxed">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">3. Resources & Help</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium mb-8">
                    If you or someone you know is struggling with gambling, professional help is available:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col group hover:border-emerald-500/30 transition-colors">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <Phone className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2 uppercase italic tracking-wide">National Hotline</h3>
                        <p className="text-sm text-zinc-400 mb-6 flex-1 font-medium leading-relaxed">Confidential support available 24/7/365.</p>
                        <a href="tel:1-800-GAMBLER" className="inline-flex items-center justify-center w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-sm py-3 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                            1-800-GAMBLER
                        </a>
                    </div>

                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex flex-col group hover:border-blue-500/30 transition-colors">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2 uppercase italic tracking-wide">NCPG</h3>
                        <p className="text-sm text-zinc-400 mb-6 flex-1 font-medium leading-relaxed">National Council on Problem Gambling resources.</p>
                        <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-wider text-sm py-3 rounded-xl transition-all border border-white/10 hover:border-white/20">
                            ncpgambling.org
                        </a>
                    </div>
                </div>
            </section>

            <section className="mt-12 text-center pb-8">
                <div className="inline-block px-6 py-3 bg-zinc-900/50 border border-white/5 rounded-full">
                    <p className="text-zinc-500 font-bold text-sm tracking-wide">
                        Sharp Picks AI is for users <span className="text-white font-black">21+ only</span> (or legal age in your jurisdiction). Please play responsibly.
                    </p>
                </div>
            </section>
        </LegalPageLayout>
    )
}
