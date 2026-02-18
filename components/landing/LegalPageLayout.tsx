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
        <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-emerald/30">
            <Header />

            <main className="flex-1 pt-32 pb-24">
                <div className="container px-4 md:px-6">
                    <FadeIn>
                        <div className="max-w-3xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-16">
                                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 underline decoration-emerald-500/30 underline-offset-8">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-xl text-zinc-400 font-medium">
                                        {subtitle}
                                    </p>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="prose prose-invert prose-emerald max-w-none 
                                prose-h2:text-2xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:mb-4 prose-h2:mt-12
                                prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:mb-6
                                prose-li:text-zinc-400 prose-li:leading-relaxed
                                prose-strong:text-zinc-100 prose-strong:font-bold
                            ">
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
