'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for App Router

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const router = useRouter(); // Initialize router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('https://shoppica-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // this is REQUIRED to handle sessions
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        const errorData = contentType?.includes('application/json')
          ? await response.json()
          : { error: 'Login failed' };
        throw new Error(errorData.error || `Status ${response.status}`);
      }

      const data = await response.json();
      setResult(`✅ Login successful:\n${JSON.stringify(data, null, 2)}`);

      // Redirect to the dashboard page after successful login
      router.push('/products'); // Change '/dashboard' to your desired destination

    } catch (error: any) {
      setResult(`❌ Login error: ${error.message}`);
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <pre>{result}</pre>
    </main>
  );
}