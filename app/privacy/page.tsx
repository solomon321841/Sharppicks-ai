import { LegalPageLayout } from "@/components/landing/LegalPageLayout"
import { ShieldCheck, Database, Lock, Cookie, Bell } from "lucide-react"

export default function PrivacyPage() {
    return (
        <LegalPageLayout
            title="Privacy Policy"
            subtitle="Your data security is our priority."
        >
            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">1. Information We Collect</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium">
                    We collect information you provide directly to us when you create an account, such as your name, email address, and payment information. We also collect anonymized usage data to dial in our proprietary models and improve your experience.
                </p>
            </section>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">2. How We Use Data</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium mb-6">
                    Your data acts as the fuel for your personalized intelligence suite:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        "Personalizing your analytics dashboard.",
                        "Processing subscription payments via our secure partners.",
                        "Improving our proprietary AI models and edge algorithms.",
                        "Sending crucial service updates and pick notifications."
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-black/40 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            <span className="text-zinc-300 font-medium leading-relaxed">{item}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Lock className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">3. Data Security</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium">
                    We implement industry-standard encryption protocols and security measures to protect your personal information. <strong className="text-white border-b border-emerald-500/30 pb-0.5">We do not sell your personal data to third parties.</strong> Our payment processing is securely handled by Stripe, ensuring your sensitive financial details never touch our local servers.
                </p>
            </section>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Cookie className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">4. Cookies and Tracking</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium">
                    Sharp Picks AI uses strategic cookies and similar technologies to track activity on our Service and store essential session state. You can command your browser to refuse all cookies, though some critical parts of the platform may not function correctly.
                </p>
            </section>

            <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase italic">5. Updates to This Policy</h2>
                </div>
                <p className="text-zinc-400 leading-relaxed font-medium">
                    We may patch or upgrade our Privacy Policy from time to time as our infrastructure evolves. We will notify you of any structural changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
            </section>
        </LegalPageLayout>
    )
}
