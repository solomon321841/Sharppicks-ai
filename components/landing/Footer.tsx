import Link from "next/link"

export function Footer() {
    return (
        <footer className="py-12 w-full border-t border-white/5 bg-black relative overflow-hidden">
            {/* Subtle Mesh Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black pointer-events-none" />

            <div className="container relative z-10 px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">

                {/* Brand */}
                <Link href="/" className="flex flex-col items-center md:items-start gap-3 hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                            <span className="text-[10px] font-black text-emerald-500">PP</span>
                        </div>
                        <span className="font-bold text-lg text-white tracking-tight">ProfitPicks</span>
                    </div>
                    <p className="text-xs text-zinc-500 max-w-xs text-center md:text-left leading-relaxed">
                        Advanced sports analytics leveraging machine learning for +EV parlay generation.
                        <br /><span className="opacity-50">Not a gambling site. 21+ Only.</span>
                    </p>
                    <p className="text-[10px] text-zinc-600 font-mono mt-1">© 2024 ProfitPicks AI. All rights reserved.</p>
                </Link>

                {/* Links */}
                <nav className="flex gap-8">
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
            </div>
        </footer>
    )
}
