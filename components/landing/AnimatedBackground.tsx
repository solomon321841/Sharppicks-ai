'use client'

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedGridPattern = () => {
    const [mounted, setMounted] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Optimized spring physics for zero lag
    // Mass 0.1 makes it extremely lightweight/responsive
    const springConfig = { damping: 20, stiffness: 300, mass: 0.1 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const gridX = useTransform(springX, [-1, 1], [-10, 10]);
    const gridY = useTransform(springY, [-1, 1], [-10, 10]);

    // Spotlight position
    const spotXPixel = useTransform(springX, [-1, 1], [0, typeof window !== 'undefined' ? window.innerWidth : 1200]);
    const spotYPixel = useTransform(springY, [-1, 1], [0, typeof window !== 'undefined' ? window.innerHeight : 800]);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth) * 2 - 1;
            const y = (e.clientY / innerHeight) * 2 - 1;
            mouseX.set(x);
            mouseY.set(y);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">

            {/* 1. Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-black" />

            {/* 2. Grid with Bottom Fade Mask */}
            <motion.div
                className="absolute inset-[-100px] z-0 opacity-[0.08]"
                style={{
                    x: gridX,
                    y: gridY,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    // Fade out at the bottom to blend with next section
                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
                }}
            />

            {/* 3. Floating Orbs (Reduced blur radius for performance) */}
            <motion.div
                animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[80px]"
            />

            {/* 4. Mouse Spotlight (Clipped to prevent overflow issues) */}
            <motion.div
                className="fixed top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"
                style={{
                    x: spotXPixel,
                    y: spotYPixel,
                    translateX: '-50%',
                    translateY: '-50%'
                }}
            />
        </div>
    );
};
