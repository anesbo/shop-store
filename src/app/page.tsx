'use client';

import React, { useEffect, useState } from 'react';

function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = `${apiBaseUrl}/static`; // Assuming images are served from /static/uploads

  // --- Interfaces ---
  type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    purchase_price: number;
    stock_quantity: number;
    low_stock_threshold: number;
    category_id: number | null;
    is_active: 0 | 1;
    images: { id: number; image_url: string; created_at: string }[];
  };

  // --- State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');

  // --- Fetch All Products ---
  const fetchAllProducts = async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${apiBaseUrl}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      const productsData = data.products || [];
      // Log image URLs for debugging
      productsData.forEach((product: Product) => {
        console.log(`Product ${product.id} images:`, product.images);
      });
      return productsData;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products.');
      return [];
    }
  };

  // --- Load Products on Mount ---
  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchAllProducts();
      setProducts(data);
    };

    loadProducts();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to My Store</h1>
      <p style={styles.subHeading}>Browse our collection of products</p>
      {error && <p style={styles.errorMessage}>{error}</p>}
      {products.length === 0 && !error ? (
        <p style={styles.loadingMessage}>Loading products...</p>
      ) : (
        <div style={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} style={styles.productCard}>
              <h3 style={styles.productName}>{product.name}</h3>
              {product.images && product.images.length > 0 ? (
                <img
                  src={`${staticBaseUrl}${product.images[0].image_url}`}
                  alt={`${product.name} image`}
                  style={styles.productImage}
                  onError={(e) => {
                    console.error(`Failed to load image: ${staticBaseUrl}${product.images[0].image_url}`);
                  }}
                />
              ) : (
                <img
                  src="/placeholder.png"
                  alt="No image available"
                  style={styles.productImage}
                />
              )}
              <p style={styles.productDescription}>
                {product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')}
              </p>
              <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
              <p style={styles.productStock}>
                Stock: {product.stock_quantity} {product.stock_quantity <= product.low_stock_threshold ? '(Low Stock)' : ''}
              </p>
              <p style={styles.productCategory}>Category ID: {product.category_id || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Inline Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  },
  heading: {
    textAlign: 'center',
    color: '#2c3e50',
    fontSize: '2.5em',
    marginBottom: '10px',
  },
  subHeading: {
    textAlign: 'center',
    color: '#555',
    fontSize: '1.2em',
    marginBottom: '30px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  productCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  productName: {
    fontSize: '1.5em',
    color: '#34495e',
    marginBottom: '10px',
  },
  productImage: {
    maxWidth: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  productDescription: {
    color: '#666',
    fontSize: '0.9em',
    marginBottom: '10px',
  },
  productPrice: {
    fontSize: '1.1em',
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: '10px',
  },
  productStock: {
    color: '#888',
    fontSize: '0.9em',
    marginBottom: '10px',
  },
  productCategory: {
    color: '#888',
    fontSize: '0.9em',
  },
  errorMessage: {
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  loadingMessage: {
    textAlign: 'center',
    color: '#007bff',
    fontSize: '1.1em',
  },
};

export default Home;