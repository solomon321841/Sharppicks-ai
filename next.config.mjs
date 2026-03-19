import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'a.espncdn.com',
            },
            {
                protocol: 'https',
                hostname: 'logos-world.net',
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default withSentryConfig(nextConfig, {
    // Suppresses source map upload logs during build
    silent: true,
    // Upload source maps for better stack traces (requires SENTRY_AUTH_TOKEN)
    widenClientFileUpload: true,
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    // Tree-shakes Sentry logger statements for smaller bundles
    disableLogger: true,
    // Automatically instruments API routes and server components
    autoInstrumentServerFunctions: true,
});
