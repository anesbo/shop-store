'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

// Product Interface
interface Product {
  id: number;
  name: string;
  price: number;
  purchase_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  description: string;
  category_id: number | null;
  is_active: 0 | 1;
  images: { id: number; image_url: string; created_at: string }[];
}

export default function SingleProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = 'https://shoppica-backend.onrender.com';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');


  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl}/products/${id}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('API Response:', responseData); // Debug response

        // Handle different possible response structures
        const productData: Product = responseData || responseData.product || responseData.data?.product;
        if (!productData || !productData.id) {
          throw new Error('Product not found in response');
        }

        setProduct(productData);
      } catch (err: unknown) {
        console.error('Fetch error:', err);
        setError('Error fetching product: ' + (err instanceof Error ? err.message : String(err)));
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, apiBaseUrl]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Styles
  const styles: { [key: string]: React.CSSProperties } = {
    modalImage: {
      maxWidth: '80%',
      maxHeight: '80%',
      borderRadius: '4px',
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
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      textAlign: 'center',
      color: '#2c3e50',
      fontSize: '2.5em',
      marginBottom: '20px',
    },
    errorMessage: {
      textAlign: 'center',
      color: '#dc3545',
      fontSize: '1.1em',
      marginBottom: '20px',
    },
    loadingMessage: {
      textAlign: 'center',
      color: '#007bff',
      fontSize: '1.1em',
    },
    productContainer: {
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    },
    productName: {
      fontSize: '2em',
      color: '#2c3e50',
      marginBottom: '10px',
    },
    productPrice: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      color: '#28a745',
      marginBottom: '10px',
    },
    productDescription: {
      color: '#666',
      fontSize: '1.1em',
      marginBottom: '15px',
    },
    productDetail: {
      color: '#555',
      fontSize: '1em',
      marginBottom: '10px',
    },
    imageGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '20px',
    },
    productImage: {
      maxWidth: '200px',
      maxHeight: '200px',
      objectFit: 'contain',
      borderRadius: '4px',
      border: '1px solid #eee',
    },
    backButton: {
      padding: '10px 20px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1em',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Product Details</h1>
      {loading && <p style={styles.loadingMessage}>Loading product...</p>}
      {error && <p style={styles.errorMessage}>{error}</p>}
      {product && (
        <div style={styles.productContainer}>
          <h2 style={styles.productName}>{product.name}</h2>
          <p style={styles.productPrice}>${product.price.toFixed(2)}</p>
          <p style={styles.productDescription}>description: <br>  </br>{product.description}</p>
          <p style={styles.productDetail}>Active: {product.is_active === 1 ? 'Yes' : 'No'}</p>
          {product.images && product.images.length > 0 ? (
            <div style={styles.imageGrid}>
              {product.images.map((img, idx) => (
                <Image
                  key={idx}
                  src={`${staticBaseUrl}${img.image_url}`}
                  onClick={()=>{handleImageClick(`${staticBaseUrl}${product.images[idx].image_url}`)}}
                  alt={`${product.name} image ${idx + 1}`}
                  style={styles.productImage}
                />
              ))}
            </div>
          ) : (
            <p style={styles.productDetail}>No images available</p>
          )}
          <button style={styles.backButton} onClick={() => router.push('/')}>
            Back to Home
          </button>
        </div>
      )}
      {showImageModal && (
        <div style={styles.modal}>
          <Image src={selectedImage} alt="Product" style={styles.modalImage} />
          <button
            onClick={() => {
              setShowImageModal(false);
              setSelectedImage('');
            }}
            style={styles.closeButton}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}