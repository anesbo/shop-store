'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Category Interface
type Category = {
  id: number;
  name: string;
};

// Product Interface
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

export default function Home() {
  const apiBaseUrl = 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = 'https://shoppica-backend.onrender.com';
  const router = useRouter();

  // State declarations
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchName, setSearchName] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/categories`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Categories Response:', responseData);
      const categoriesData: Category[] = responseData.categories || responseData.data?.categories || [];

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        throw new Error('Unexpected data format for categories');
      }
    } catch (err: unknown) {
      console.error('Fetch categories error:', err);
      setError('Error fetching categories: ' + (err instanceof Error ? err.message : String(err)));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Fetch All Products
  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${apiBaseUrl}/products`;
      console.log('Fetching all products from:', url);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('All Products Response:', responseData);
      const productsData: Product[] = responseData.products || responseData.data?.products || [];
      console.log(
        'Parsed all products:',
        productsData.map((p) => ({ id: p.id, name: p.name, category_id: p.category_id || 'N/A' }))
      );
      setAllProducts(productsData);
      setProducts(productsData);
      console.log('Updated products state (all):', productsData.length, 'products');
    } catch (err: unknown) {
      console.error('Error fetching all products:', err);
      setError('Error fetching products: ' + (err instanceof Error ? err.message : String(err)));
      setAllProducts([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Filter Products (Client-Side)
  const filterProducts = useCallback(() => {
    setLoading(true);
    setError('');
    try {
      let filteredProducts = allProducts;

      // Apply category filter
      if (selectedCategory !== null) {
        filteredProducts = filteredProducts.filter((p) => p.category_id === selectedCategory);
        console.log(
          'Category filter applied (client-side):',
          filteredProducts.map((p) => ({ id: p.id, name: p.name, category_id: p.category_id }))
        );
      }

      // Apply name filter
      if (searchName.trim()) {
        filteredProducts = filteredProducts.filter((p) =>
          p.name.toLowerCase().includes(searchName.trim().toLowerCase())
        );
        console.log(
          'Name filter applied (client-side):',
          filteredProducts.map((p) => ({ id: p.id, name: p.name, category_id: p.category_id || 'N/A' }))
        );
      }

      setProducts(filteredProducts);
      console.log('Updated products state:', filteredProducts.length, 'products');
    } catch (err: unknown) {
      console.error('Error in filtering products:', err);
      setError('Error filtering products: ' + (err instanceof Error ? err.message : String(err)));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchName, allProducts]);

  // Fetch products and categories on mount
  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, [fetchCategories, fetchAllProducts]);

  // Trigger filter on category or name change
  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchName, filterProducts]);

  // Handle product click
  const handleProductClick = (productId: number) => {
    router.push(`/single-product/${productId}`);
  };

  

  // Styles
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      textAlign: 'center',
      color: '#2c3e50',
      fontSize: '2.5em',
    },
    subHeading: {
      textAlign: 'center',
      color: '#666',
      fontSize: '1.2em',
      marginBottom: '20px',
    },
    errorMessage: {
      textAlign: 'center',
      color: '#dc3545',
      fontSize: '1.1em',
    },
    searchSection: {
      marginBottom: '20px',
      textAlign: 'center',
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      alignItems: 'center',
    },
    categorySelect: {
      padding: '8px',
      fontSize: '1em',
      border: '1px solid #ccc',
      borderRadius: '4px',
      width: '200px',
    },
    searchInput: {
      padding: '8px',
      fontSize: '1em',
      border: '1px solid #ccc',
      borderRadius: '4px',
      width: '200px',
    },
    loadingMessage: {
      textAlign: 'center',
      color: '#007bff',
      fontSize: '1.1em',
    },
    noProductsMessage: {
      textAlign: 'center',
      color: '#888',
      fontSize: '1.1em',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '20px',
    },
    productCard: {
      padding: '15px',
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    productName: {
      fontSize: '1.5em',
      color: '#2c3e50',
      marginBottom: '10px',
    },
    productImage: {
      width: '100%',
      height: '150px',
      objectFit: 'contain',
      borderRadius: '4px',
    },
    productDescription: {
      color: '#666',
      fontSize: '1em',
      marginBottom: '10px',
    },
    productPrice: {
      fontSize: '1.2em',
      fontWeight: 'bold',
      color: '#28a745',
    },
    productCategory: {
      color: '#888',
      fontSize: '0.9em',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalImage: {
      maxWidth: '80%',
      maxHeight: '80%',
      borderRadius: '4px',
    },
    closeButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '10px 20px',
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to My Store</h1>
      <p style={styles.subHeading}>Browse our collection of products</p>
      {error && <p style={styles.errorMessage}>{error}</p>}
      <div style={styles.searchSection}>
        <select
          value={selectedCategory ?? ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            setSelectedCategory(value);
            console.log('Selected category:', value);
          }}
          style={styles.categorySelect}
          disabled={loading}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            console.log('Search name:', e.target.value);
          }}
          placeholder="Search by product name"
          style={styles.searchInput}
          disabled={loading}
        />
      </div>
      {loading ? (
        <p style={styles.loadingMessage}>Loading products...</p>
      ) : products.length === 0 ? (
        <p style={styles.noProductsMessage}>No products found.</p>
      ) : (
        <div style={styles.productGrid}>
          {products.map((product) => (
            <div
              key={product.id}
              style={styles.productCard}
              onClick={() => {
                console.log('Product card clicked:', product.id);
                handleProductClick(product.id);
              }}
            >
              <h3 style={styles.productName}>{product.name}</h3>
              {product.images && product.images.length > 0 && product.images[0].image_url ? (
                <Image
                  src={`${staticBaseUrl}${product.images[0].image_url}`}
                  alt={`${product.name} image`}
                  style={styles.productImage}
                />
              ) : (
                <p><i>No image available</i></p>
              )}
              <p style={styles.productDescription}>
                {product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')}
              </p>
              <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
              <p style={styles.productCategory}>Category ID: {product.category_id || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}