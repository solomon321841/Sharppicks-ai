'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getPlayerHeadshot } from '@/lib/data/playerHeadshots'
import { User } from 'lucide-react'

interface PlayerAvatarProps {
    url?: string | null
    name: string
    team: string
    className?: string
}

const getTeamColor = (name: string) => {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export function PlayerAvatar({ url, name, team, className = "w-10 h-10" }: PlayerAvatarProps) {
    const [error, setError] = useState(false)
    // Try to get a valid URL: either passed in, or resolved from our local map
    const resolvedUrl = getPlayerHeadshot(name)
    const effectiveUrl = url || resolvedUrl

    // Reset state if name changes
    useEffect(() => {
        setError(false)
    }, [name, url])

    if (effectiveUrl && !error) {
        return (
            <div className={`relative ${className} rounded-full overflow-hidden bg-white/5 ring-1 ring-white/10`}>
                <img
                    src={effectiveUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        console.error(`[PlayerAvatar] Failed to load: ${effectiveUrl}`)
                        setError(true)
                    }}
                />
            </div>
        )
    }

    // Fallback: Initials with Team Color
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className={`relative ${className} rounded-full overflow-hidden flex items-center justify-center shadow-inner ${getTeamColor(team)} bg-opacity-20 ring-1 ring-white/10`}>
            <span className="font-bold text-white text-[10px] tracking-widest">{initials}</span>
        </div>
    )
}
