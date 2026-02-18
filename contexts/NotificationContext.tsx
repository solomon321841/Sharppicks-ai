'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NotificationContextType {
    hasNewBet: boolean
    triggerNewBetNotification: () => void
    clearNewBetNotification: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [hasNewBet, setHasNewBet] = useState(false)

    const triggerNewBetNotification = () => setHasNewBet(true)
    const clearNewBetNotification = () => setHasNewBet(false)

    return (
        <NotificationContext.Provider value={{ hasNewBet, triggerNewBetNotification, clearNewBetNotification }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}
