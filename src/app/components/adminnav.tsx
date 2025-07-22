'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const styles: { [key: string]: React.CSSProperties } = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#2c3e50',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.1em',
    fontWeight: 'bold',
    padding: '8px 15px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease',
  },
  navLinkHover: {
    backgroundColor: '#34495e',
  },
  primaryButton: {
    padding: '8px 20px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    margin: '10px 0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingMessage: {
    color: '#007bff',
    textAlign: 'center',
    margin: '10px 0',
    fontSize: '1.1em',
  },
};

const NavBar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';

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
      setError('Authentication check failed: ' + (err instanceof Error ? err.message : String(err)));
      setIsAuthenticated(false);
      setIsAdminUser(false);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router, apiBaseUrl]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
      router.push('/login');
    } catch (err) {
      setError('Error during logout: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, router]);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  if (!isAuthenticated || !isAdminUser) {
    return null;
  }

  return (
    <nav style={styles.nav}>
      {loading && <p style={styles.loadingMessage}>Loading...</p>}
      {error && <p style={styles.errorMessage}>Error: {error}</p>}
      <div style={styles.navLinks}>
        <Link href="/admin/add-product" style={styles.navLink}>Add Product</Link>
        <Link href="/admin/view-products" style={styles.navLink}>View/Edit Products</Link>
        <Link href="/admin/view-orders" style={styles.navLink}>View Orders</Link>
        <Link href="/admin/add-categories" style={styles.navLink}>Manage Categories</Link>
      </div>
      <button onClick={handleLogout} style={styles.primaryButton} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </nav>
  );
};

export default NavBar;