'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './Sidebar'

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="lg:hidden">
            {/* Sticky Header */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-card px-4 py-3 shadow-sm">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-white/10">
                        <span className="text-white text-xs font-black tracking-[-0.08em]">PP</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-black tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">ProfitPicks</span>
                    </div>
                </Link>

                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </header>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-card shadow-2xl"
                        >
                            <div className="absolute right-4 top-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Reuse Sidebar with close function */}
                            <div className="h-full pt-4 overflow-y-auto">
                                <Sidebar onNavigate={() => setIsOpen(false)} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
