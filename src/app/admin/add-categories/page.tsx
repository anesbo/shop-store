'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NavBar from '../../components/adminnav';

interface Category {
  id: number;
  name: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  categorySection: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  subHeading: {
    color: '#34495e',
    marginBottom: '20px',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: '10px',
    fontSize: '2em',
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
    marginLeft: '7px',
    color: '#2c3e50',
  },
  input: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1em',
    width: '100%',
    boxSizing: 'border-box',
  },
  primaryButton: {
    padding: '12px 25px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
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

const AddCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [addCategoryName, setAddCategoryName] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');
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
      const categoriesData: Category[] = responseData.categories || responseData.data?.categories || [];
      setCategories(categoriesData);
    } catch (err: unknown) {
      showTemporaryMessage('Error fetching categories: ' + (err instanceof Error ? err.message : String(err)), 'error');
      setCategories([]);
    }
  }, [apiBaseUrl, showTemporaryMessage]);

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
      showTemporaryMessage('Error editing category: ' + (err instanceof Error ? err.message : String(err)), 'error');
    }
  };

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

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div style={styles.categorySection}>
    <NavBar/>
      <h2 style={styles.subHeading}>Manage Categories</h2>
      {loading && categories.length === 0 ? (
        <p style={styles.loadingMessage}>Loading categories...</p>
      ) : !loading && categories.length === 0 && !error ? (
        <p style={styles.loadingMessage}>No categories found. Add one above!</p>
      ) : (
        <>
          {error && <p style={styles.errorMessage}>Error: {error}</p>}
          {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
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
        </>
      )}
    </div>
  );
};

export default AddCategory;