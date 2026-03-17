"use client"

import React from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { FadeIn } from "./FadeIn"

interface LegalPageLayoutProps {
    title: string
    subtitle?: string
    children: React.ReactNode
}

export function LegalPageLayout({ title, subtitle, children }: LegalPageLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-emerald/30 overflow-x-hidden">
            <Header />

            <main className="flex-1 pt-32 pb-24">
                <div className="container px-4 md:px-6">
                    <FadeIn>
                        <div className="max-w-3xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-12">
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-4">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-lg md:text-xl font-bold text-zinc-400">
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="space-y-8">
                                {children}
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </main>

            <Footer />
        </div>
    )
}
