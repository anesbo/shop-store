// pages/dashboard.tsx (assuming this is now your product add page,
// or that the dashboard page also includes the add product functionality)

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Crucial for App Router

export default function DashboardPage() {
  const router = useRouter();

  // State for product inputs
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>(''); // Keep as string for input, convert before API
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [result, setResult] = useState<string>(''); // For displaying success/error messages

  const handleGoToProducts = () => {
    router.push('/products'); // Redirects to the products page
  };

  const handleGoHome = () => {
    router.push('/'); // Redirects to the home page
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Always prevent default form submission

    setResult(''); // Clear previous results

    // Basic validation (optional but recommended)
    if (!name || !price || !purchasePrice || !stock) {
      setResult('❌ All fields are required.');
      return;
    }

    // Convert string inputs to numbers for the API
    const parsedPrice = parseFloat(price);
    const parsedPurchasePrice = parseFloat(purchasePrice);
    const parsedStock = parseInt(stock, 10);

    // More robust validation for numbers
    if (isNaN(parsedPrice) || isNaN(parsedPurchasePrice) || isNaN(parsedStock)) {
        setResult('❌ Price, Purchase Price, and Stock must be valid numbers.');
        return;
    }


    try {
      const response = await fetch('https://shoppica-backend.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // this is REQUIRED to handle sessions
        body: JSON.stringify({
          name,
          price: parsedPrice, // Send as number
          purchasePrice: parsedPurchasePrice, // Send as number
          stock: parsedStock, // Send as number
        }),
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        const errorData = contentType?.includes('application/json')
          ? await response.json()
          : { error: 'Adding product failed' }; // Updated message
        throw new Error(errorData.error || `Status ${response.status}`);
      }

      const data = await response.json();
      setResult(`✅ Product added successfully:\n${JSON.stringify(data, null, 2)}`); // Updated message

      // Optional: Clear form fields after successful submission
      setName('');
      setPrice('');
      setPurchasePrice('');
      setStock('');

      // Optional: Redirect to products page after successful addition
      router.push('/products');


    } catch (error: any) {
      setResult(`❌ Add product error: ${error.message}`); // Updated message
      console.error("Product add error:", error);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '600px', margin: '50px auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Add New Product</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}> {/* Wrap inputs in a form */}
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number" // Use type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number" // Use type="number"
          placeholder="Purchase Price"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number" // Use type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          style={inputStyle}
        />
        <button type='submit' style={buttonStyle}>Add Product</button> {/* Use type="submit" */}
      </form>

      {result && ( // Display the result message
        <pre style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: result.startsWith('✅') ? '#e6ffe6' : '#ffe6e6',
          border: `1px solid ${result.startsWith('✅') ? '#66cc66' : '#ff6666'}`,
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {result}
        </pre>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={handleGoHome} style={{...buttonStyle, backgroundColor: '#6c757d'}}>Go to Home</button>
        <button onClick={handleGoToProducts} style={{...buttonStyle, backgroundColor: '#28a745'}}>Go to Products List</button>
      </div>
    </div>
  );
}

// Simple inline styles for better presentation
const inputStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '16px',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '16px',
  transition: 'background-color 0.2s ease',
};