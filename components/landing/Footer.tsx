import Link from "next/link"

export function Footer() {
    return (
        <footer className="py-12 w-full border-t border-white/5 bg-black relative overflow-hidden pb-safe">
            {/* Subtle Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                    {/* Brand */}
                    <Link href="/" className="flex flex-col items-center md:items-start gap-3 hover:opacity-80 transition-opacity">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                                <span className="text-[10px] font-black text-emerald-500">SP</span>
                            </div>
                            <span className="font-bold text-lg text-white tracking-tight">SharpPicks AI</span>
                        </div>
                        <p className="text-xs text-zinc-500 max-w-xs text-center md:text-left leading-relaxed">
                            AI-powered sports analytics for smarter parlay generation.
                        </p>
                        <p className="text-[10px] text-zinc-600 font-mono mt-1">&copy; {new Date().getFullYear()} SharpPicks AI. All rights reserved.</p>
                    </Link>

                    {/* Links */}
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <nav className="flex flex-wrap gap-4 md:gap-8">
                            {[
                                { name: "Terms", href: "/terms" },
                                { name: "Privacy", href: "/privacy" },
                                { name: "Responsible Gaming", href: "/responsible-gaming" }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    className="text-xs font-medium text-zinc-500 hover:text-emerald-400 transition-colors"
                                    href={item.href}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                        <a href="mailto:support@sharppicksai.com" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
                            support@sharppicksai.com
                        </a>
                    </div>
                </div>

                {/* Responsible Gambling Disclaimer */}
                <div className="border-t border-white/5 pt-6">
                    <p className="text-[11px] text-zinc-600 leading-relaxed text-center max-w-3xl mx-auto">
                        <span className="text-zinc-500 font-medium">21+ Only. Please gamble responsibly.</span> SharpPicks AI provides AI-generated analysis for entertainment and informational purposes only. We do not guarantee any outcomes. Sports betting involves risk and you may lose money. If you or someone you know has a gambling problem, call <a href="tel:1-800-522-4700" className="text-emerald-500/70 hover:text-emerald-400">1-800-522-4700</a> (National Council on Problem Gambling). Past performance does not guarantee future results.
                    </p>
                </div>
            </div>
        </footer>
    )
}
