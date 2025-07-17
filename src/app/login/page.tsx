'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!email || !password) {
      showTemporaryMessage('Email and password are required.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Login failed with status ${response.status}`);
      }

      if (data.user && data.user.is_admin) {
        showTemporaryMessage('Login successful! Redirecting to admin dashboard...', 'success');
        setTimeout(() => router.push('/admin'), 1000);
      } else {
        showTemporaryMessage('Access denied: Admin privileges required.', 'error');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      showTemporaryMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Admin Login</h1>
      {error && <p style={styles.errorMessage}>Error: {error}</p>}
      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
      {loading && <p style={styles.loadingMessage}>Logging in...</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            disabled={loading}
          />
        </div>
        <button type="submit" style={styles.primaryButton} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  heading: {
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '2em',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
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
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#28a745',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingMessage: {
    color: '#007bff',
    textAlign: 'center',
    marginBottom: '15px',
    fontSize: '1.1em',
  },
};

export default LoginPage;