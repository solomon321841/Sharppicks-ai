
import { HowToUseContent } from "@/components/shared/HowToUseContent"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"

export default function PublicHowToPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white selection:bg-emerald-500/30">
            <Header />
            <main className="flex-1 pt-24 pb-12">
                <div className="mx-auto max-w-6xl">
                    <HowToUseContent isPublic={true} />
                </div>
            </main>
            <Footer />
        </div>
    )
}
