// src/app/api/auth/route.ts

export const runtime = 'nodejs'; // Force Node.js runtime to support cookies

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Fallback to hardcoded /api version
  const apiBaseUrl = process.env.API_BASE_URL || 'https://shoppica-backend.onrender.com/api';

  try {
    const backendResponse = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!backendResponse.ok) {
      let errorData = { message: 'Unknown error from backend' };
      try {
        errorData = await backendResponse.json();
      } catch (_) {}
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();

    const responseHeaders = new Headers();
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        responseHeaders.append('Set-Cookie', value);
      } else {
        responseHeaders.set(key, value);
      }
    });

    return NextResponse.json(data, { status: 200, headers: responseHeaders });

  } catch (error) {
    console.error('Error during proxy login request:', error);
    return NextResponse.json({ message: 'Internal server error during login proxy.' }, { status: 500 });
  }
}
