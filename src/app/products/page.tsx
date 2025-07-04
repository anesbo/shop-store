'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  purchase_price: number;
  stock_quantity: number;
  category_id?: number;
  description?: string;
  image?: string; // URL or path to the image
  is_active?: number; // 1 for active, 0 for inactive
}

interface ApiResponse {
  message: string;
  page: number;
  per_page: number;
  products: Product[];
  total: number;
}

interface ApiError {
  message?: string;
  error?: string;
}

const ProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    console.log('Fetching products...');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://shoppica-backend.onrender.com/api/products`, {
        method: 'GET',
        credentials: 'include', // Send session cookies
      });

      console.log('API response status:', response.status);
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorData: ApiError = { error: 'Failed to fetch products' };
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
          console.log('API error response:', errorData);
        }
        const errorMessages: Record<number, string> = {
          401: 'Unauthorized: Please log in again.',
          404: 'No products found.',
          500: 'Server error. Please try again later.',
        };
        throw new Error(errorData.message || errorData.error || errorMessages[response.status] || `HTTP error! Status: ${response.status}`);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Unexpected response format. Expected application/json.');
      }

      const data: ApiResponse = await response.json();
      console.log('API response data:', data);
      if (!Array.isArray(data.products)) {
        throw new Error('Expected products to be an array in API response');
      }
      setProducts(data.products);
      console.log('Set products:', data.products);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching products.';
      console.error('Failed to fetch products:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Fetch complete. Loading:', false, 'Error:', error, 'Products:', products);
    }
  };

  useEffect(() => {
    console.log('Component mounted, calling fetchProducts');
    fetchProducts();
  }, []);

  const handleGoAddProduct = () => {
    console.log('Navigating to /admin');
    router.push('/admin');
  };

  const handleViewProduct = (productId: number) => {
    console.log('Navigating to /single-product/', productId);
    router.push(`/single-product/${productId}`);
  };

  console.log('Rendering with state:', { loading, error, products });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Product List</h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          Error: {error}
        </div>
      ) : products.length > 0 ? (
        products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #eee',
              borderRadius: '6px',
              padding: '15px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              backgroundColor: '#fff',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginRight: '20px',
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100'; // Fallback image
                  console.log(`Failed to load image for product ${product.id}`);
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.2em', margin: '0 0 10px', color: '#007bff' }}>
                {product.name}
              </h2>
              <p style={{ margin: '5px 0' }}>
                <strong>Price:</strong> ${product.price}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Purchase Price:</strong> ${product.purchase_price}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Stock:</strong> {product.stock_quantity}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Category ID:</strong> {product.category_id ?? 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Description:</strong> {product.description ?? 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Status:</strong>{' '}
                {product.is_active === 1 ? 'Active' : 'Inactive'}
              </p>
              <button
                onClick={() => handleViewProduct(product.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                View Details
              </button>
            </div>
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#666' }}>No products found.</p>
      )}
      <button
        onClick={handleGoAddProduct}
        disabled={loading}
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        Go to admin page
      </button>
    </div>
  );
};

export default ProductsPage;