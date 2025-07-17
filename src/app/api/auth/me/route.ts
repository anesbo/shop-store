// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL; // Use NEXT_PUBLIC_API_BASE_URL for consistency if it's also used client-side

  if (!apiBaseUrl) {
    console.error('API_BASE_URL is not defined in environment variables.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    // Get the Cookie header from the incoming request from the client
    const cookieHeader = req.headers.get('Cookie');

    // Prepare headers for the backend request
    const backendHeaders: HeadersInit = {};
    if (cookieHeader) {
      backendHeaders['Cookie'] = cookieHeader; // Explicitly forward the Cookie header
    }

    // Forward the request to your Flask backend's /auth/me endpoint
    const backendResponse = await fetch(`${apiBaseUrl}/auth/me`, {
      method: 'GET',
      headers: backendHeaders, // Use the prepared headers
      credentials: 'include', // This is crucial for *receiving* Set-Cookie from backend, but less about sending existing cookies
    });

    // If the backend response is not OK (e.g., 401 Unauthorized, 403 Forbidden)
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      // Forward the backend's status and message directly to the frontend
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    // Get the JSON data from the backend response
    const data = await backendResponse.json();

    // Create new headers to forward from the backend response to the client
    const headersToClient = new Headers();

    // IMPORTANT: Forward the 'Set-Cookie' header from the backend to the client.
    // This ensures the browser updates/maintains the session cookie.
    const setCookieHeader = backendResponse.headers.get('Set-Cookie');
    if (setCookieHeader) {
      // If there are multiple Set-Cookie headers, they should be handled as an array.
      // fetch API's .get('Set-Cookie') only returns the first one.
      // To get all, you'd typically use backendResponse.headers.raw()['set-cookie']
      // For simplicity, we'll assume one for now, or the most important one.
      headersToClient.set('Set-Cookie', setCookieHeader);
    }

    // Send the backend's JSON data to the frontend with appropriate headers
    return NextResponse.json(data, { status: 200, headers: headersToClient });

  } catch (error) {
    console.error('Error during proxy /api/auth/me request:', error);
    return NextResponse.json({ message: 'Internal server error during authentication check.' }, { status: 500 });
  }
}
