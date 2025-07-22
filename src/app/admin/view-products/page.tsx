'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import EditProductModal from '../../components/EditProductModal';
import NavBar from '../../components/adminnav';

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

const styles: { [key: string]: React.CSSProperties } = {
  formSection: {
    marginBottom: '40px',
    border: '1px solid #e0e0e0',
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 5px rgba(0,0,0,0.03)',
  },
  subHeading: {
    color: '#34495e',
    marginBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '10px',
    fontSize: '2em',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0',
    marginTop: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    minWidth: '1200px',
  },
  tableHeaderRow: {
    backgroundColor: '#ecf0f1',
  },
  tableHeader: {
    borderBottom: '2px solid #ddd',
    padding: '12px 10px',
    textAlign: 'left',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '0.95em',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s ease',
  },
  tableCell: {
    padding: '10px',
    border: 'none',
    verticalAlign: 'top',
    fontSize: '0.85em',
  },
  imageGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  productImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '3px',
    objectFit: 'cover',
    border: '1px solid #eee',
    maxWidth: '40px',
    maxHeight: '40px',
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
    width: '100%',
    margin: 'auto',
  },
  modalImage: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px',
    maxWidth: '300px',
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
  editButton: {
    padding: '6px 10px',
    background: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
    fontWeight: 'bold',
    fontSize: '0.8em',
  },
  deleteButton: {
    padding: '6px 10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8em',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingMessage: {
    color: '#007bff',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.1em',
  },
};

const ViewEditProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = 'https://shoppica-backend.onrender.com';

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const showTemporaryMessage = useCallback((message: string, type: 'success' | 'error') => {
    clearMessages();
    if (type === 'success') {
      setSuccessMessage(message);
    } else {
      setError(message);
    }
    setTimeout(clearMessages, 5000);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch(`${apiBaseUrl}/products`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const responseData = await response.json();
      const productsData: Product[] = responseData.products;
      setProducts(productsData);
    } catch (err: unknown) {
      showTemporaryMessage('Error fetching products: ' + (err instanceof Error ? err.message : String(err)), 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, showTemporaryMessage]);

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    clearMessages();
    try {
      const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete product: ${response.status}`);
      }

      showTemporaryMessage('Product deleted successfully!', 'success');
      fetchProducts();
    } catch (err: unknown) {
      showTemporaryMessage('Error deleting product: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setProductToEdit(null);
    setShowEditModal(false);
    clearMessages();
  };

  const handleSaveEditModal = () => {
    setShowEditModal(false);
    fetchProducts();
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div style={styles.formSection}>
      <NavBar />
      <h2 style={styles.subHeading}>Existing Products</h2>
      {loading && products.length === 0 ? (
        <p style={styles.loadingMessage}>Loading products...</p>
      ) : !loading && products.length === 0 && !error ? (
        <p style={styles.loadingMessage}>No products found. Add a new product above!</p>
      ) : (
        <>
          {error && <p style={styles.errorMessage}>Error: {error}</p>}
          {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Price</th>
                  <th style={styles.tableHeader}>P. Price</th>
                  <th style={styles.tableHeader}>Stock</th>
                  <th style={styles.tableHeader}>Threshold</th>
                  <th style={styles.tableHeader}>Category</th>
                  <th style={styles.tableHeader}>Active</th>
                  <th style={styles.tableHeader}>Description</th>
                  <th style={styles.tableHeader}>Images</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{product.id}</td>
                    <td style={styles.tableCell}>{product.name}</td>
                    <td style={styles.tableCell}>${product.price}</td>
                    <td style={styles.tableCell}>${product.purchase_price}</td>
                    <td style={styles.tableCell}>{product.stock_quantity}</td>
                    <td style={styles.tableCell}>{product.low_stock_threshold}</td>
                    <td style={styles.tableCell}>{product.category_id || 'N/A'}</td>
                    <td style={styles.tableCell}>{product.is_active === 1 ? 'Yes' : 'No'}</td>
                    <td style={styles.tableCell}>
                      {product.description.substring(0, 50) + (product.description.length > 50 ? '...' : '')}
                    </td>
                    <td style={styles.tableCell}>
                      {product.images && product.images.length > 0 ? (
                        <div style={styles.imageGrid}>
                          {product.images.map((img, idx) => (
                            <Image
                              key={idx}
                              src={`${staticBaseUrl}${img.image_url}`}
                              alt={`${product.name} ${idx + 1}`}
                              width={40}
                              height={40}
                              style={styles.productImage}
                              onClick={() => handleImageClick(`${staticBaseUrl}${img.image_url}`)}
                              onError={(e) => console.error(`Failed to load image: ${staticBaseUrl}${img.image_url}`)}
                            />
                          ))}
                        </div>
                      ) : (
                        'No images'
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <button onClick={() => handleEditClick(product)} style={styles.editButton} disabled={loading}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={styles.deleteButton} disabled={loading}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showImageModal && (
        <div style={styles.modal}>
          <Image
            src={selectedImage}
            alt="Product"
            width={500}
            height={500}
            style={styles.modalImage}
            onError={() => console.error(`Failed to load modal image: ${selectedImage}`)}
          />
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
      {showEditModal && productToEdit && (
        <EditProductModal
          product={productToEdit}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditModal}
          apiBaseUrl={apiBaseUrl}
        />
      )}
    </div>
  );
};

export default ViewEditProducts;