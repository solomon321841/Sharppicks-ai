/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per key (usually user ID) within a sliding window.
 */

const requests = new Map<string, number[]>()

// Clean up old entries every 5 minutes
setInterval(() => {
    const cutoff = Date.now() - 120_000
    requests.forEach((timestamps, key) => {
        const valid = timestamps.filter(t => t > cutoff)
        if (valid.length === 0) requests.delete(key)
        else requests.set(key, valid)
    })
}, 300_000)

/**
 * Check if a request should be rate limited.
 * @param key - Unique identifier (user ID, IP, etc.)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const windowStart = now - windowMs

    const timestamps = requests.get(key) || []
    const recent = timestamps.filter(t => t > windowStart)

    if (recent.length >= maxRequests) {
        return false // Rate limited
    }

    recent.push(now)
    requests.set(key, recent)
    return true // Allowed
}
