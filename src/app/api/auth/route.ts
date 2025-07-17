// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json(); // App Router uses req.json() to parse body

  const apiBaseUrl = process.env.API_BASE_URL;

  if (!apiBaseUrl) {
    console.error('API_BASE_URL is not defined in server-side environment variables.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const backendResponse = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    // --- DEBUGGING LOG: Inspect backend response headers ---
    console.log('Backend Response Status:', backendResponse.status);
    console.log('Backend Response Headers (from shoppica-backend):');
    for (const [key, value] of backendResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    // --- END DEBUGGING LOG ---

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      // Forward the exact status and JSON from the backend error
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    // Get the JSON data from the backend response
    const data = await backendResponse.json();

    // Create a new Headers object for the NextResponse
    const responseHeaders = new Headers();
    
    // Iterate over all headers from the backend response and append them
    // This is crucial for handling multiple 'Set-Cookie' headers correctly.
    backendResponse.headers.forEach((value, key) => {
      // Specifically handle 'set-cookie' as it can appear multiple times
      if (key.toLowerCase() === 'set-cookie') {
        // Append each 'Set-Cookie' header individually
        responseHeaders.append('Set-Cookie', value);
        console.log('Appended Set-Cookie header:', value); // Debugging log
      } else {
        // For other headers, just set them (assuming single value per key for simplicity)
        responseHeaders.set(key, value);
      }
    });

    // Send the backend's JSON data to the frontend with forwarded headers
    return NextResponse.json(data, { status: 200, headers: responseHeaders });

  } catch (error) {
    console.error('Error during proxy login request:', error);
    return NextResponse.json({ message: 'Internal server error during login proxy.' }, { status: 500 });
  }
}
