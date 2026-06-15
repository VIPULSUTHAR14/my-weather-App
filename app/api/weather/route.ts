import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limiter';

function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return '127.0.0.1';
}

export async function GET(request: Request) {
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = rateLimiter.limit(ip);

    const rateLimitHeaders = {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(reset)
    };

    if (!success) {
        return NextResponse.json(
            { error: `Too many requests. Please try again in ${reset} second${reset === 1 ? '' : 's'}.` },
            { status: 429, headers: rateLimitHeaders }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const city = searchParams.get('q') || searchParams.get('city') || 'Udaipur';
        const aqi = searchParams.get('aqi') || 'yes';

        const apiKey = process.env.WeatherApiKey;
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=${aqi}`;

        const response = await fetch(url);

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch weather data: ${response.statusText}` },
                { status: response.status, headers: rateLimitHeaders }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { headers: rateLimitHeaders });
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500, headers: rateLimitHeaders }
        );
    }
}

