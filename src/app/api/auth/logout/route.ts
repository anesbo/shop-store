// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    console.error('API_BASE_URL is not defined in server-side environment variables.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const backendResponse = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Send existing cookies to backend
    });

    const data = await backendResponse.json();

    const response = new NextResponse(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { 'Content-Type': 'application/json' },
    });

    // *** CRITICAL: Forward the Set-Cookie header to clear session ***
    const setCookieHeader = backendResponse.headers.get('Set-Cookie');
    if (setCookieHeader) {
      response.headers.set('Set-Cookie', setCookieHeader);
    }

    return response;

  } catch (error) {
    console.error('Error during proxy logout request:', error);
    return NextResponse.json({ message: 'Internal server error during logout proxy.' }, { status: 500 });
  }
}
