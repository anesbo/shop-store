'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
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

const AddNewProduct = () => {
  const [addName, setAddName] = useState<string>('');
  const [addPrice, setAddPrice] = useState<string>('');
  const [addPurchasePrice, setAddPurchasePrice] = useState<string>('1');
  const [addStockQuantity, setAddStockQuantity] = useState<string>('');
  const [addDescription, setAddDescription] = useState<string>('');
  const [addCategoryId, setAddCategoryId] = useState<string>('');
  const [addIsActive, setAddIsActive] = useState<string>('1');
  const [addImages, setAddImages] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';

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

  const handleAddImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAddImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setAddImagePreviews(newPreviews);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!addName || !addPrice || !addStockQuantity || !addDescription || !addIsActive) {
      showTemporaryMessage('All fields are required for adding a product.', 'error');
      setLoading(false);
      return;
    }

    const parsedPrice = parseFloat(addPrice);
    const parsedStockQuantity = parseInt(addStockQuantity);
    const parsedCategoryId = addCategoryId ? parseInt(addCategoryId) : null;
    const parsedIsActive = parseInt(addIsActive);

    if (
      isNaN(parsedPrice) || parsedPrice < 0 ||
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
    formData.append('purchase_price', String(addPurchasePrice));
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
    } catch (err: unknown) {
      showTemporaryMessage('Error adding product or images: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formSection}>
      <NavBar />
      <h2 style={styles.subHeading}>Add New Product</h2>
      {loading && <p style={styles.loadingMessage}>Loading...</p>}
      {error && <p style={styles.errorMessage}>Error: {error}</p>}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
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
                <Image key={index} width={100} height={100} src={src} alt={`Add Preview ${index + 1}`} style={styles.imagePreview} />
              ))}
            </div>
          )}
        </div>
        <button type="submit" style={styles.primaryButton} disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddNewProduct;