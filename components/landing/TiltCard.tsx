'use client'

import React, { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

const ROTATION_RANGE = 12; // Reduced for stability
const HALF_ROTATION_RANGE = 6;

export const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Gradient position
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Ultra-responsive spring physics
    // High stiffness + lower damping = fast snap without oscillation
    const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const transform = useMotionTemplate`perspective(1000px) rotateX(${xSpring}deg) rotateY(${ySpring}deg) scale3d(1, 1, 1)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Calculate mouse position relative to card center
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // Convert to rotation values
        // Using simple linear mapping: center = 0 deg
        const rX = ((relativeY / height) - 0.5) * -ROTATION_RANGE;
        const rY = ((relativeX / width) - 0.5) * ROTATION_RANGE;

        // Clamp values to prevent edge-case flipping
        const clampedX = Math.max(-ROTATION_RANGE, Math.min(ROTATION_RANGE, rX));
        const clampedY = Math.max(-ROTATION_RANGE, Math.min(ROTATION_RANGE, rY));

        x.set(clampedX);
        y.set(clampedY);

        mouseX.set(relativeX);
        mouseY.set(relativeY);
    };

    const handleMouseLeave = () => {
        // Smoothly return to center
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform }}
            className={className}
            whileHover={{
                scale: 1.01, // Gentler scale
            }}
        >
            {children}

            {/* Dynamic Sheen Effect - Fix: Ensure pointer-events-none prevents blocking */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl z-50 mix-blend-soft-light"
                style={{
                    background: useMotionTemplate`radial-gradient(
                    600px circle at ${mouseX}px ${mouseY}px, 
                    rgba(255,255,255,0.15), 
                    transparent 40%
                )`
                }}
            />
        </motion.div>
    );
};
