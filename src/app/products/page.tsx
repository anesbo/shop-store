// pages/dashboard.tsx (for TypeScript) or pages/dashboard.js (for JavaScript)

'use client'; // This directive is needed if you are using App Router in Next.js 13+

import React from 'react';
import { useRouter } from 'next/navigation'; // <-- This is crucial for App Router

export default function DashboardPage() {
  const router = useRouter();


  const handleGoToAddProducts = () => {
    router.push('/add-products'); // Redirects to the products page
  }

  const handleGoHome = () => {
    router.push('/'); // Redirects to the home page
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      maxWidth: '800px',
      margin: '50px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>Welcome to Your products</h1>
      <p style={{ color: '#666', lineHeight: '1.6' }}>
        This is a simple dashboard page. You've successfully logged in and been redirected here.
        You can add more content, widgets, charts, and user-specific information to this page.
      </p>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={handleGoHome}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#005bb5')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0070f3')}
        >
          Go to Home
        </button>
        <button 
        onClick={handleGoToAddProducts} > go to add products</button>
      </div>
    </div>
  );}