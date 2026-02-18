import { LegalPageLayout } from "@/components/landing/LegalPageLayout"
import { ShieldAlert, Phone, Globe, Heart } from "lucide-react"

export default function ResponsibleGamingPage() {
    return (
        <LegalPageLayout
            title="Responsible Gaming"
            subtitle="Play smart. Stay within your limits."
        >
            <section className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-8 mb-12">
                <div className="flex gap-4 items-start">
                    <ShieldAlert className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2 mt-0">Our Commitment</h2>
                        <p className="mb-0">
                            ProfitPicks AI is committed to promoting responsible sports entertainment. We believe that sports analytics should enhance the fan experience, not lead to financial distress or personal harm.
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2>1. Analytics vs. Gambling</h2>
                <p>
                    ProfitPicks AI is an <strong>information-only</strong> platform. We do not accept wagers and we are not a sportsbook. Our goal is to provide data-driven insights to help users make more informed decisions when choosing to participate in legal sports wagering.
                </p>
            </section>

            <section>
                <h2>2. Warning Signs</h2>
                <p>
                    It is important to recognize the signs of problem gambling:
                </p>
                <ul>
                    <li>Spending more time or money on betting than intended.</li>
                    <li>Feeling the need to bet with larger amounts of money to get the same excitement.</li>
                    <li>Borrowing money or selling assets to fund betting.</li>
                    <li>Neglecting personal, family, or work responsibilities.</li>
                    <li>Feeling irritable or restless when attempting to cut down on betting.</li>
                </ul>
            </section>

            <section>
                <h2>3. Resources & Help</h2>
                <p>
                    If you or someone you know is struggling with gambling, professional help is available:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-6 bg-zinc-900 border border-white/5 rounded-xl">
                        <Phone className="w-5 h-5 text-emerald-500 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">National Hotline</h3>
                        <p className="text-sm mb-4">Confidential support available 24/7/365.</p>
                        <span className="text-emerald-400 font-bold">1-800-GAMBLER</span>
                    </div>
                    <div className="p-6 bg-zinc-900 border border-white/5 rounded-xl">
                        <Globe className="w-5 h-5 text-emerald-400 mb-3" />
                        <h3 className="text-lg font-bold text-white mb-2">NCPG</h3>
                        <p className="text-sm mb-4">National Council on Problem Gambling resources.</p>
                        <a href="https://www.ncpgambling.org" target="_blank" className="text-emerald-400 font-bold hover:underline">ncpgambling.org</a>
                    </div>
                </div>
            </section>

            <section className="mt-16 pt-8 border-t border-white/5 text-center">
                <p className="text-zinc-500 italic">
                    ProfitPicks AI is for users 21+ only (or legal age in your jurisdiction). Please play responsibly.
                </p>
            </section>
        </LegalPageLayout>
    )
}
