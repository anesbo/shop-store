'use client';

import { useState, useEffect, useCallback } from 'react';
import EditProductModal from '../components/EditProductModal';
import { useRouter } from 'next/navigation';

// --- Interfaces for Product ---
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

// --- Main AdminPage Component ---
const AdminPage = () => {
  // --- Product Management States ---
  const [products, setProducts] = useState<Product[]>([]);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // --- Form States for Adding Product ---
  const [addName, setAddName] = useState<string>('');
  const [addPrice, setAddPrice] = useState<string>('');
  const [addPurchasePrice, setAddPurchasePrice] = useState<string>('');
  const [addStockQuantity, setAddStockQuantity] = useState<string>('');
  const [addLowStockThreshold, setAddLowStockThreshold] = useState<string>('');
  const [addDescription, setAddDescription] = useState<string>('');
  const [addCategoryId, setAddCategoryId] = useState<string>('');
  const [addIsActive, setAddIsActive] = useState<string>('1');
  const [addImages, setAddImages] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);

  const [IsAuthenticated, setIsAuthenticated] = useState(false);
  const [IsAdminUser, setIsAdminUser] = useState(false);

  // --- Global UI States ---
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const router = useRouter();

  // Base URL for the API and static files
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = `${apiBaseUrl}/static`; // Assuming images are served from /static/uploads

  // --- Utility Functions for Messages ---
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


  const checkAuthentication = useCallback(async () => {
    setLoading(true);
    try {
      // Make a GET request to your Next.js API route /api/auth/me.
      // The browser will automatically attach the session cookie because of 'credentials: include'.
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Ensures the browser sends the session cookie
      });

      if (response.ok) {
        // If the response is OK, the user is authenticated.
        const userData = await response.json();
        // CRITICAL FIX: Access is_admin directly from userData, not userData.user
        if (userData && userData.is_admin) {
          setIsAuthenticated(true);  // User is authenticated
          setIsAdminUser(true);     // User is an admin
          await fetchProducts(); // Fetch products if authenticated and admin
        } else {
          // User is authenticated but not an admin, or user data is malformed
          setIsAuthenticated(false);
          setIsAdminUser(false);
          router.push('/login'); // Redirect non-admin users
        }
      } else {
        // If the response is not OK (e.g., 401 Unauthorized, 403 Forbidden),
        // the session is likely invalid or expired.
        setIsAuthenticated(false);
        setIsAdminUser(false);
        router.push('/login'); // Redirect to login page
      }
    } catch (err: unknown) {
      // Handle network errors or other unexpected issues during the authentication check
      console.error('Authentication check failed:', err);
      setIsAuthenticated(false);
      setIsAdminUser(false);
      router.push('/login'); // Redirect on error
    } finally {
      setLoading(false);
    }
  }, [router]); // Dependencies: router (for navigation)

  // --- Fetch All Products ---
  const handleLogout = useCallback(async () => {
    setLoading(true); // Set loading state to true
    clearMessages(); // Clear any existing messages

    try {
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // IMPORTANT: This ensures the session cookie is sent with the request
      });

      if (!response.ok) {
        // If the backend returns an error (e.g., 401 if session already expired, or 500)
        const errorData = await response.json();
        throw new Error(errorData.message || `Logout failed with status ${response.status}`);
      }

      // If the request was successful, the backend has invalidated the session.
      // Now, perform client-side cleanup.
      showTemporaryMessage('Logged out successfully!', 'success');
      console.log('User logged out. Redirecting to login page.');

      // Redirect to the login page
      router.push('/login');

    } catch (err) {
      console.error('Error during logout:', err);
      showTemporaryMessage('Error during logout: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false); // Set loading state to false
    }
  }, [apiBaseUrl, clearMessages, showTemporaryMessage, router]);



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

      if (Array.isArray(productsData)) {
        // Log image URLs for debugging
        productsData.forEach(product => {
          console.log(`Product ${product.id} images:`, product.images);
        });
        setProducts(productsData);
      } else {
        throw new Error('Unexpected data format for products');
      }
    } catch (err: unknown) {
      showTemporaryMessage('Error fetching products: ' + (err instanceof Error ? err.message : String(err)), 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, showTemporaryMessage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // --- Add New Product ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!addName || !addPrice || !addPurchasePrice || !addStockQuantity || !addLowStockThreshold || !addDescription || !addIsActive) {
      showTemporaryMessage('All fields are required for adding a product.', 'error');
      setLoading(false);
      return;
    }

    const parsedPrice = parseFloat(addPrice);
    const parsedPurchasePrice = parseFloat(addPurchasePrice);
    const parsedStockQuantity = parseInt(addStockQuantity);
    const parsedLowStockThreshold = parseInt(addLowStockThreshold);
    const parsedCategoryId = addCategoryId ? parseInt(addCategoryId) : null;
    const parsedIsActive = parseInt(addIsActive);

    if (
      isNaN(parsedPrice) || parsedPrice < 0 ||
      isNaN(parsedPurchasePrice) || parsedPurchasePrice < 0 ||
      isNaN(parsedStockQuantity) || parsedStockQuantity < 0 ||
      isNaN(parsedLowStockThreshold) || parsedLowStockThreshold < 0
    ) {
      showTemporaryMessage('Price, Purchase Price, Stock, and Low Stock Threshold must be non-negative numbers.', 'error');
      setLoading(false);
      return;
    }
    if (parsedCategoryId !== null && (isNaN(parsedCategoryId) || parsedCategoryId < 1)) {
      showTemporaryMessage('Category ID must be a positive integer or left empty.', 'error');
      setLoading(false);
      return;
    }
    if (![0, 1].includes(parsedIsActive)) {
      showTemporaryMessage('Is Active must be 0 or 1.', 'error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', addName);
    formData.append('price', String(parsedPrice));
    formData.append('purchase_price', String(parsedPurchasePrice));
    formData.append('stock_quantity', String(parsedStockQuantity));
    formData.append('low_stock_threshold', String(parsedLowStockThreshold));
    formData.append('description', addDescription);
    if (parsedCategoryId !== null) formData.append('category_id', String(parsedCategoryId));
    formData.append('is_active', String(parsedIsActive));

    try {
      const response = await fetch(`${apiBaseUrl}/products`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add product: ${response.status}`);
      }

      const responseData = await response.json();
      const productId = responseData.product_id;

      // Upload images one by one
      for (const image of addImages) {
        const imageFormData = new FormData();
        imageFormData.append('image', image);
        const imageResponse = await fetch(`${apiBaseUrl}/products/${productId}/images`, {
          method: 'POST',
          credentials: 'include',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.message || `Failed to upload image: ${imageResponse.status}`);
        }
      }

      showTemporaryMessage('Product and images added successfully!', 'success');
      setAddName('');
      setAddPrice('');
      setAddPurchasePrice('');
      setAddStockQuantity('');
      setAddLowStockThreshold('');
      setAddDescription('');
      setAddCategoryId('');
      setAddIsActive('1');
      setAddImages([]);
      setAddImagePreviews([]);
      fetchProducts();
    } catch (err: unknown) {
      showTemporaryMessage('Error adding product or images: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Image Preview Handlers ---
  const handleAddImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAddImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAddImagePreviews(newPreviews);
  };

  // --- Delete Product ---
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

  // --- Functions for Edit Modal ---
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
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // --- Render Main Content ---
  return (
    <div style={styles.container}>
      
      <h1 style={styles.heading}>Admin Dashboard :)</h1>
      <button onClick={handleLogout} style={styles.primaryButton} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
        </button>
      {loading && <p style={styles.loadingMessage}>Loading...</p>}
      {error && <p style={styles.errorMessage}>Error: {error}</p>}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}

      <div style={styles.formSection}>
        <h2 style={styles.subHeading}>Add New Product</h2>
        <form onSubmit={handleAddProduct} encType="multipart/form-data" style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="addName" style={styles.label}>Name:</label>
            <input type="text" id="addName" value={addName} onChange={(e) => setAddName(e.target.value)} required style={styles.input} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addPrice" style={styles.label}>Price (Selling):</label>
            <input type="number" id="addPrice" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} required min="0" step="0.01" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addPurchasePrice" style={styles.label}>Purchase Price:</label>
            <input type="number" id="addPurchasePrice" value={addPurchasePrice} onChange={(e) => setAddPurchasePrice(e.target.value)} required min="0" step="0.01" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addStockQuantity" style={styles.label}>Stock Quantity:</label>
            <input type="number" id="addStockQuantity" value={addStockQuantity} onChange={(e) => setAddStockQuantity(e.target.value)} required min="0" step="1" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addLowStockThreshold" style={styles.label}>Low Stock Threshold:</label>
            <input type="number" id="addLowStockThreshold" value={addLowStockThreshold} onChange={(e) => setAddLowStockThreshold(e.target.value)} required min="0" step="1" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addDescription" style={styles.label}>Description:</label>
            <textarea id="addDescription" value={addDescription} onChange={(e) => setAddDescription(e.target.value)} required rows={3} style={styles.textarea} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addCategoryId" style={styles.label}>Category ID (Optional):</label>
            <input type="number" id="addCategoryId" value={addCategoryId} onChange={(e) => setAddCategoryId(e.target.value)} min="1" step="1" style={styles.input} disabled={loading} />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addIsActive" style={styles.label}>Is Active:</label>
            <select id="addIsActive" value={addIsActive} onChange={(e) => setAddIsActive(e.target.value)} style={styles.select} disabled={loading}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="addImages" style={styles.label}>Images (Multiple):</label>
            <input type="file" id="addImages" accept="image/*" multiple onChange={handleAddImagesChange} style={styles.fileInput} disabled={loading} />
            {addImagePreviews.length > 0 && (
              <div style={styles.imagePreviewsContainer}>
                {addImagePreviews.map((src, index) => (
                  <img key={index} src={src} alt={`Add Preview ${index + 1}`} style={styles.imagePreview} />
                ))}
              </div>
            )}
          </div>
          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      <div style={styles.formSection}>
        <h2 style={styles.subHeading}>Existing Products</h2>
        {loading && products.length === 0 ? (
          <p>Loading products...</p>
        ) : !loading && products.length === 0 && !error ? (
          <p>No products found. Add a new product above!</p>
        ) : (
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
                            <img
                              key={idx}
                              src={`${staticBaseUrl}${img.image_url}`}
                              alt={`${product.name} ${idx + 1}`}
                              style={styles.productImage}
                              onError={(e) => {
                                console.error(`Failed to load image: ${staticBaseUrl}${img.image_url}`);
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        'No images'
                      )}
                    </td>
                    <td style={styles.tableCell}>
                      <button onClick={() => handleEditClick(product)} style={{ ...styles.actionButton, ...styles.editButton }} disabled={loading}>Edit</button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={{ ...styles.actionButton, ...styles.deleteButton }} disabled={loading}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

// --- Inline Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1600px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  heading: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '2.8em',
    fontWeight: 'bold',
  },
  subHeading: {
    color: '#34495e',
    marginBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '10px',
    fontSize: '2em',
  },
  formSection: {
    marginBottom: '40px',
    border: '1px solid #e0e0e0',
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 5px rgba(0,0,0,0.03)',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'white',
  },
  fileInput: {
    display: 'block',
    width: '100%',
    padding: '10px 0',
    boxSizing: 'border-box',
  },
  imagePreviewsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
    border: '1px dashed #ccc',
    padding: '10px',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  imagePreview: {
    maxWidth: '100px',
    maxHeight: '100px',
    borderRadius: '4px',
    objectFit: 'contain',
    border: '1px solid #eee',
  },
  primaryButton: {
    gridColumn: '1 / -1',
    padding: '12px 25px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    marginTop: '15px',
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
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    objectFit: 'cover',
    border: '1px solid #eee',
  },
  actionButton: {
    padding: '6px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    fontSize: '0.8em',
    whiteSpace: 'nowrap',
  },
  editButton: {
    background: '#ffc107',
    color: 'white',
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
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

export default AdminPage;