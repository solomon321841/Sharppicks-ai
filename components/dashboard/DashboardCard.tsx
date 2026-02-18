'use client'

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ReactNode, useRef } from "react"

interface DashboardCardProps {
    children: ReactNode
    className?: string
    contentClassName?: string
    glowColor?: 'emerald' | 'blue' | 'purple' | 'gold' | 'zinc' | 'red' | 'amber'
    delay?: number
}

const colorMap = {
    emerald: 'from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 group-hover:border-emerald-500/40',
    blue: 'from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20 group-hover:border-blue-500/40',
    purple: 'from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20 group-hover:border-purple-500/40',
    gold: 'from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20 group-hover:border-yellow-500/40',
    zinc: 'from-zinc-500/10 via-zinc-500/5 to-transparent border-zinc-500/20 group-hover:border-zinc-500/40',
    red: 'from-red-500/10 via-red-500/5 to-transparent border-red-500/20 group-hover:border-red-500/40',
    amber: 'from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20 group-hover:border-amber-500/40',
}

const glowMap = {
    emerald: 'bg-emerald-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    gold: 'bg-yellow-500/20',
    zinc: 'bg-zinc-500/20',
    red: 'bg-red-500/20',
    amber: 'bg-amber-500/20',
}

export function DashboardCard({ children, className = "", contentClassName = "p-6 md:p-8", glowColor = 'zinc', delay = 0 }: DashboardCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 })
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 })

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        const mouseXLocal = event.clientX - rect.left
        const mouseYLocal = event.clientY - rect.top

        x.set(mouseXLocal / width - 0.5)
        y.set(mouseYLocal / height - 0.5)

        mouseX.set(mouseXLocal)
        mouseY.set(mouseYLocal)
    }

    function onMouseLeave() {
        x.set(0)
        y.set(0)
    }

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`group relative rounded-[2rem] border bg-zinc-950/40 backdrop-blur-3xl transition-colors duration-500 hover:bg-zinc-900/40 overflow-hidden ${colorMap[glowColor]} ${className}`}
        >
            {/* Reactive Mouse Glow */}
            <motion.div
                className={`absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0`}
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([xValue, yValue]) => `radial-gradient(600px circle at ${xValue}px ${yValue}px, ${glowMap[glowColor].replace('bg-', '').replace('/20', '/10')}, transparent 40%)`
                    )
                }}
            />

            {/* Static Ambient Glows */}
            <div className={`absolute -top-32 -right-32 w-80 h-80 ${glowMap[glowColor]} blur-[100px] rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none`} />

            {/* Premium Inner Highlight Border */}
            <div className="absolute inset-[1px] rounded-[1.95rem] bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none z-20" />

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.01] to-white/[0.03] pointer-events-none" />

            {/* Content Container */}
            <div className={`relative z-10 h-full ${contentClassName}`} style={{ transform: "translateZ(30px)" }}>
                {children}
            </div>
        </motion.div>
    )
}
