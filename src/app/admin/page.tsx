'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminStatus } from '../utils/auth';
import LogoutButton from '../components/LogoutButton';

interface ApiError {
  message?: string;
  error?: string;
}

const AdminPage = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [purchase_price, setPurchase_price] = useState<string>('');
  const [stock_quantity, setStock_quantity] = useState<string>('');
  const [category_id, setCategory_id] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [is_active, setIs_active] = useState<boolean>(true);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      console.log('Verifying admin access');
      const { isAdmin, message } = await checkAdminStatus();
      if (!isAdmin) {
        console.log('Non-admin user, redirecting to /login:', message);
        router.push('/login');
      } else {
        console.log('Admin access granted');
        setAuthChecked(true);
      }
    };
    verifyAdmin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult('');
    setIsLoading(true);

    if (!name || !price || !purchase_price || !stock_quantity || !category_id || !description || !image) {
      setResult('❌ All required fields (name, price, purchase price, stock quantity, category ID, description, image) must be provided.');
      setIsLoading(false);
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedPurchasePrice = parseFloat(purchase_price);
    const parsedStock = parseInt(stock_quantity, 10);
    const parsedCategoryId = parseInt(category_id, 10);

    if (isNaN(parsedPrice) || isNaN(parsedPurchasePrice) || isNaN(parsedStock) || isNaN(parsedCategoryId)) {
      setResult('❌ Price, Purchase Price, Stock Quantity, and Category ID must be valid numbers.');
      setIsLoading(false);
      return;
    }

    if (parsedPrice <= 0 || parsedPurchasePrice <= 0 || parsedStock < 0 || parsedCategoryId <= 0) {
      setResult('❌ Price, Purchase Price, Stock Quantity, and Category ID must be positive.');
      setIsLoading(false);
      return;
    }

    if (name.length < 3) {
      setResult('❌ Product name must be at least 3 characters long.');
      setIsLoading(false);
      return;
    }

    if (description.length < 10) {
      setResult('❌ Description must be at least 10 characters long.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', parsedPrice.toFixed(2));
    formData.append('purchase_price', parsedPurchasePrice.toFixed(2));
    formData.append('stock_quantity', parsedStock.toString());
    formData.append('category_id', parsedCategoryId.toString());
    formData.append('description', description);
    formData.append('image', image);
    formData.append('is_active', is_active ? '1' : '0');

    console.log('FormData payload:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://shoppica-backend.onrender.com/api/products', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        body: formData,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorData: ApiError = { error: 'Adding product failed' };
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
          console.log('Error response from API:', errorData);
        }
        const errorMessages: Record<number, string> = {
          401: 'Unauthorized: Please log in again.',
          400: 'Bad request: Invalid input data.',
          500: 'Server error. Please try again later.',
        };
        throw new Error(errorData.message || errorData.error || errorMessages[response.status] || `HTTP error! Status: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Expected application/json.');
      }

      const data = await response.json();
      setResult(`✅ Product "${data.name}" added successfully with ID: ${data.id}`);
      setName('');
      setPrice('');
      setPurchase_price('');
      setStock_quantity('');
      setCategory_id('');
      setDescription('');
      setImage(null);
      setIs_active(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setResult(`❌ Add product error: ${errorMessage}`);
      console.error('Product add error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  if (!authChecked) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Checking admin access...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <LogoutButton/>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Admin: Add Product</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product Name"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Purchase Price</label>
          <input
            type="number"
            value={purchase_price}
            onChange={(e) => setPurchase_price(e.target.value)}
            placeholder="Purchase Price"
            step="0.01"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Stock Quantity</label>
          <input
            type="number"
            value={stock_quantity}
            onChange={(e) => setStock_quantity(e.target.value)}
            placeholder="Stock Quantity"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Category ID</label>
          <input
            type="number"
            value={category_id}
            onChange={(e) => setCategory_id(e.target.value)}
            placeholder="Category ID"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="checkbox"
              checked={is_active}
              onChange={(e) => setIs_active(e.target.checked)}
            />
            Is Active
          </label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            display: 'block',
            margin: '20px auto',
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Submitting...' : 'Add Product'}
        </button>
      </form>
      {result && (
        <p style={{ textAlign: 'center', color: result.startsWith('✅') ? 'green' : 'red' }}>
          {result}
        </p>
      )}
    </div>
  );
};

export default AdminPage;