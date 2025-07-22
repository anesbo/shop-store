'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

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

// --- Props for EditProductModal ---
interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
  apiBaseUrl: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ product, onClose, onSave, apiBaseUrl }) => {
  // --- Form States for Editing Product ---
  const [editName, setEditName] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStockQuantity, setEditStockQuantity] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [editIsActive, setEditIsActive] = useState<string>('');
  const [editNewImages, setEditNewImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);

  // --- UI States ---
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const staticBaseUrl = `https://shoppica-backend.onrender.com`; // For image URLs

  // --- Populate form fields when product prop changes ---
  useEffect(() => {
    if (product) {
      setEditName(product.name);
      setEditPrice(String(product.price));
      setEditStockQuantity(String(product.stock_quantity));
      setEditDescription(product.description);
      setEditCategoryId(product.category_id !== null ? String(product.category_id) : '');
      setEditIsActive(String(product.is_active));
      setEditNewImages([]);
      setEditImagePreviews(product.images.map(img => `${staticBaseUrl}${img.image_url}`));
      clearMessages();
    }
  }, [product, staticBaseUrl]);

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

  // --- Image Preview Handler for new images ---
  const handleEditNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditNewImages(files);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setEditImagePreviews(prev => [...prev.filter(p => !p.startsWith('blob:')), ...newPreviews]);
  };

  // --- Delete Image Handler ---
  const handleDeleteImage = async (imageUrl: string, index: number) => {
    if (!product || !imageUrl.startsWith(staticBaseUrl)) return; // Only delete backend images

    const imageId = product.images.find(img => `${staticBaseUrl}${img.image_url}` === imageUrl)?.id;
    if (!imageId) {
      showTemporaryMessage('Cannot delete image: Invalid image ID', 'error');
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${apiBaseUrl}/products/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete image: ${response.status}`);
      }

      // Update previews and product images
      setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
      if (product) {
        product.images = product.images.filter(img => img.id !== imageId);
      }
      showTemporaryMessage('Image deleted successfully!', 'success');
    } catch (err: unknown) {
      showTemporaryMessage('Error deleting image: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Edit Product Submission ---
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    clearMessages();

    // Validation
    const parsedPrice = parseFloat(editPrice);
    const parsedStockQuantity = parseInt(editStockQuantity);
    const parsedCategoryId = editCategoryId ? parseInt(editCategoryId) : null;
    const parsedIsActive = parseInt(editIsActive);

    if (
      !editName ||
      isNaN(parsedPrice) || parsedPrice < 0 ||
      isNaN(parsedStockQuantity) || parsedStockQuantity < 0 ||
      !editDescription ||
      ![0, 1].includes(parsedIsActive)
    ) {
      showTemporaryMessage('All fields (Name, Price, Stock, Description, Is Active) are required and must be valid.', 'error');
      setLoading(false);
      return;
    }
    if (parsedCategoryId !== null && (isNaN(parsedCategoryId) || parsedCategoryId < 1)) {
      showTemporaryMessage('Category ID must be a positive integer or left empty.', 'error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', editName);
    formData.append('price', String(parsedPrice));
    formData.append('stock_quantity', String(parsedStockQuantity));
    formData.append('description', editDescription);
    if (parsedCategoryId !== null) formData.append('category_id', String(parsedCategoryId));
    formData.append('is_active', String(parsedIsActive));

    try {
      const response = await fetch(`${apiBaseUrl}/products/${product.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update product: ${response.status}`);
      }

      for (const image of editNewImages) {
        const imageFormData = new FormData();
        imageFormData.append('image', image);
        const imageResponse = await fetch(`${apiBaseUrl}/products/${product.id}/images`, {
          method: 'POST',
          credentials: 'include',
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          const errorData = await imageResponse.json();
          throw new Error(errorData.message || `Failed to upload image: ${imageResponse.status}`);
        }
      }

      showTemporaryMessage('Product and images updated successfully!', 'success');
      setEditNewImages([]);
      setEditImagePreviews(product.images.map(img => `${staticBaseUrl}${img.image_url}`));
      onSave();
    } catch (err: unknown) {
      showTemporaryMessage('Error updating product or images: ' + (err instanceof Error ? err.message : String(err)), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return null;
  }

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modalContent}>
        <h2 style={modalStyles.heading}>Edit Product: {product.name}</h2>
        <button onClick={onClose} style={modalStyles.closeButton}>×</button>

        {loading && <p style={modalStyles.loadingMessage}>Loading...</p>}
        {error && <p style={modalStyles.errorMessage}>Error: {error}</p>}
        {successMessage && <p style={modalStyles.successMessage}>{successMessage}</p>}

        <form onSubmit={handleEditProduct} encType="multipart/form-data" style={modalStyles.form}>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editName" style={modalStyles.label}>Name:</label>
            <input type="text" id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} required style={modalStyles.input} disabled={loading} />
          </div>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editPrice" style={modalStyles.label}>Price (Selling):</label>
            <input type="number" id="editPrice" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required min="0" step="0.01" style={modalStyles.input} disabled={loading} />
          </div>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editStockQuantity" style={modalStyles.label}>Stock Quantity:</label>
            <input type="number" id="editStockQuantity" value={editStockQuantity} onChange={(e) => setEditStockQuantity(e.target.value)} required min="0" step="1" style={modalStyles.input} disabled={loading} />
          </div>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editDescription" style={modalStyles.label}>Description:</label>
            <textarea id="sacred://xai/delete/editDescription" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required rows={3} style={modalStyles.textarea} disabled={loading} />
          </div>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editCategoryId" style={modalStyles.label}>Category ID (Optional):</label>
            <input type="number" id="editCategoryId" value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} min="1" step="1" style={modalStyles.input} disabled={loading} />
          </div>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editIsActive" style={modalStyles.label}>Is Active:</label>
            <select id="editIsActive" value={editIsActive} onChange={(e) => setEditIsActive(e.target.value)} style={modalStyles.select} disabled={loading}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          <div style={modalStyles.formGroup}>
            <label htmlFor="editNewImages" style={modalStyles.label}>Add New Images:</label>
            <input type="file" id="editNewImages" accept="image/*" multiple onChange={handleEditNewImagesChange} style={modalStyles.fileInput} disabled={loading} />
            {editImagePreviews.length > 0 && (
              <div style={modalStyles.imagePreviewsContainer}>
                {editImagePreviews.map((src, index) => (
                  <div key={index} style={modalStyles.imagePreviewWrapper}>
                    <Image
                      src={src}
                      alt={`Preview ${index + 1}`}
                      style={modalStyles.imagePreview}
                      width={300}
                      height={200}
                    />
                    {src.startsWith(staticBaseUrl) && (
                      <button
                        type="button"
                        style={modalStyles.deleteImageButton}
                        onClick={() => handleDeleteImage(src, index)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={modalStyles.buttonGroup}>
            <button type="submit" style={modalStyles.saveButton} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} style={modalStyles.cancelButton} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Inline Styles for the Modal ---
const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '2em',
    cursor: 'pointer',
    color: '#888',
  },
  heading: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '25px',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
    border: '1px dashed #e0e0e0',
    padding: '10px',
    borderRadius: '4px',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  imagePreviewWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  imagePreview: {
    maxWidth: '80px',
    maxHeight: '80px',
    borderRadius: '4px',
    objectFit: 'contain',
    border: '1px solid #eee',
  },
  deleteImageButton: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  buttonGroup: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  saveButton: {
    padding: '10px 20px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
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

export default EditProductModal;