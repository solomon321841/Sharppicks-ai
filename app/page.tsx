import Link from "next/link"
import { Hero } from "@/components/landing/Hero"
import { LeagueMarquee } from "@/components/landing/LeagueMarquee"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Pricing } from "@/components/landing/Pricing"
import { Testimonials } from "@/components/landing/Testimonials"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-emerald/30">
      <Header />
      <main className="flex-1">
        <Hero />
        <LeagueMarquee />
        <HowItWorks />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}
