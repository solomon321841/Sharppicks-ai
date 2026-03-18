
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Only allow proxying images from these domains
const ALLOWED_HOSTS = [
    'a.espncdn.com',
    'cdn.espn.com',
    's.espncdn.com',
    'logos-world.net',
    'www.logos-world.net',
]

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return new NextResponse('Missing URL', { status: 400 });
    }

    // Validate URL and restrict to allowed domains
    let parsed: URL
    try {
        parsed = new URL(targetUrl)
    } catch {
        return new NextResponse('Invalid URL', { status: 400 })
    }

    if (!ALLOWED_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host))) {
        return new NextResponse('Domain not allowed', { status: 403 })
    }

    if (parsed.protocol !== 'https:') {
        return new NextResponse('Only HTTPS URLs allowed', { status: 400 })
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.espn.com/'
            }
        });

        if (!response.ok) {
            return new NextResponse('Failed to fetch image', { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400'
            }
        });

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
