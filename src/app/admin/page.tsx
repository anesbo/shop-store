'use client';

import { useState, useEffect, useCallback } from 'react';
import EditProductModal from '../components/EditProductModal';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- Interfaces ---
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

interface Category {
  id: number;
  name: string;
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
  const [addDescription, setAddDescription] = useState<string>('');
  const [addCategoryId, setAddCategoryId] = useState<string>('');
  const [addIsActive, setAddIsActive] = useState<string>('1');
  const [addImages, setAddImages] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);

  // --- Category Management States ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryName, setAddCategoryName] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');

  // --- Global UI States ---
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';
  const staticBaseUrl = `https://shoppica-backend.onrender.com`;

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

  // --- Authentication Check ---
  const checkAuthentication = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.is_admin) {
          setIsAuthenticated(true);
          setIsAdminUser(true);
          await fetchProducts();
          await fetchCategories();
        } else {
          setIsAuthenticated(false);
          setIsAdminUser(false);
          router.push('/login');
        }
      } else {
        setIsAuthenticated(false);
        setIsAdminUser(false);
        router.push('/login');
      }
    } catch (err: unknown) {
      console.error('Authentication check failed:', err);
      setIsAuthenticated(false);
      setIsAdminUser(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // --- Fetch Categories ---
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/categories`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Categories:', responseData);
      const categoriesData: Category[] = responseData.categories || responseData.data?.categories || [];
      setCategories(categoriesData);
    } catch (err: unknown) {
      console.error('Fetch categories error:', err);
      showTemporaryMessage('Error fetching categories: ' + (err instanceof Error ? err.message : String(err)), 'error');
      setCategories([]);
    }
  }, [apiBaseUrl, showTemporaryMessage]);

  // --- Fetch Products ---
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
      console.log('Products:', productsData);
      setProducts(productsData);
    } catch (err: unknown) {
      showTemporaryMessage('Error fetching products: ' + (err instanceof Error ? err.message : String(err)), 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, showTemporaryMessage]);

  // --- Add Category ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCategoryName) {
      showTemporaryMessage('Category name is required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', addCategoryName);

      const response = await fetch(`${apiBaseUrl}/categories`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add category: ${response.status}`);
      }

      showTemporaryMessage('Category added successfully!', 'success');
      setAddCategoryName('');
      fetchCategories();
    } catch (err: unknown) {
      showTemporaryMessage('Error adding category: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Category ---
  const handleEditCategory = async (categoryId: number, newName: string) => {
    if (!newName) {
      showTemporaryMessage('Category name is required.', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newName);

      const response = await fetch(`${apiBaseUrl}/categories/${categoryId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to edit category: ${response.status}`);
      }

      showTemporaryMessage('Category updated successfully!', 'success');
      fetchCategories();
    } catch (err: unknown) {
      console.error('Error editing category:', err);
      showTemporaryMessage('Error editing category: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

  // --- Delete Category ---
  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete category: ${response.status}`);
      }

      showTemporaryMessage('Category deleted successfully!', 'success');
      fetchCategories();
    } catch (err: unknown) {
      showTemporaryMessage('Error deleting category: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Add Product ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!addName || !addPrice || !addPurchasePrice || !addStockQuantity || !addDescription || !addIsActive) {
      showTemporaryMessage('All fields are required for adding a product.', 'error');
      setLoading(false);
      return;
    }

    const parsedPrice = parseFloat(addPrice);
    const parsedPurchasePrice = parseFloat(addPurchasePrice);
    const parsedStockQuantity = parseInt(addStockQuantity);
    const parsedCategoryId = addCategoryId ? parseInt(addCategoryId) : null;
    const parsedIsActive = parseInt(addIsActive);

    if (
      isNaN(parsedPrice) || parsedPrice < 0 ||
      isNaN(parsedPurchasePrice) || parsedPurchasePrice < 0 ||
      isNaN(parsedStockQuantity) || parsedStockQuantity < 0 
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
  useEffect (() => {
fetchProducts();
  },[])

  // --- Image Preview Handlers ---
  const handleAddImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAddImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAddImagePreviews(newPreviews);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
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

  // --- Edit Product Modal Handlers ---
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

  // --- Logout ---
  const handleLogout = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Logout failed with status ${response.status}`);
      }

      showTemporaryMessage('Logged out successfully!', 'success');
      router.push('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      showTemporaryMessage('Error during logout: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, showTemporaryMessage, router]);

  // --- Check Authentication on Mount ---
  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  // --- Inline Styles ---
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
    categorySection: {
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
    },
    categoryForm: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
    },
    editForm: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center',
      width: '100%',
    },
    categoryList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    categoryItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px',
      backgroundColor: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
    },
    categoryName: {
      fontSize: '1.1em',
      marginLeft:'7px',
      color: '#2c3e50',
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
    saveButton: {
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    cancelButton: {
      padding: '8px 16px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
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

      {/* Category Management Section */}
      <div style={styles.categorySection}>
        <h2 style={styles.subHeading}>Manage Categories</h2>
        <form onSubmit={handleAddCategory} style={styles.categoryForm}>
          <input
            type="text"
            value={addCategoryName}
            onChange={(e) => setAddCategoryName(e.target.value)}
            placeholder="Enter category name"
            style={styles.input}
            disabled={loading}
          />
          <button type="submit" style={styles.primaryButton} disabled={loading}>
            Add Category
          </button>
        </form>
        {loading && categories.length === 0 ? (
          <p style={styles.loadingMessage}>Loading categories...</p>
        ) : !loading && categories.length === 0 && !error ? (
          <p style={styles.loadingMessage}>No categories found. Add one above!</p>
        ) : (
          <div style={styles.categoryList}>
            {categories.map((category) => (
              <div key={category.id} style={styles.categoryItem}>
                {editingCategoryId === category.id ? (
                  <form
                    style={styles.editForm}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditCategory(category.id, editCategoryName);
                      setEditingCategoryId(null);
                      setEditCategoryName('');
                    }}
                  >
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      placeholder="Edit category name"
                      style={styles.input}
                      disabled={loading}
                    />
                    <button type="submit" style={styles.saveButton} disabled={loading}>
                      Save
                    </button>
                    <button
                      type="button"
                      style={styles.cancelButton}
                      onClick={() => {
                        setEditingCategoryId(null);
                        setEditCategoryName('');
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                  <div>
                    <span style={styles.categoryName}>id:{category.id}</span>
                    <span style={styles.categoryName}>{category.name}</span>
                  </div>
                    <div>
                      <button
                        style={styles.editButton}
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setEditCategoryName(category.name);
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Management Section */}
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
                  <Image key={index} src={src} alt={`Add Preview ${index + 1}`} style={styles.imagePreview} />
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
          <p style={styles.loadingMessage}>Loading products...</p>
        ) : !loading && products.length === 0 && !error ? (
          <p style={styles.loadingMessage}>No products found. Add a new product above!</p>
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
                            <Image
                              key={idx}
                              src={`${staticBaseUrl}${img.image_url}`}
                              alt={`${product.name} ${idx + 1}`}
                              style={styles.productImage}
                              onClick={()=>{handleImageClick(`${staticBaseUrl}${product.images[idx].image_url}`)}}
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
                      <button onClick={() => handleEditClick(product)} style={{ ...styles.actionButton, ...styles.editButton }} disabled={loading}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} style={{ ...styles.actionButton, ...styles.deleteButton }} disabled={loading}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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

export default AdminPage;