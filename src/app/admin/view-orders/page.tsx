'use client';

import React, { useState, useEffect, useCallback } from 'react';
import NavBar from '../../components/adminnav';

interface Order {
  id: number;
  product_id: number;
  name: string;
  pronouns: string;
  phone_number: string;
  state: string;
  delivery_option: 'desk' | 'house';
  created_at: string;
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

const ViewOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://shoppica-backend.onrender.com/api';

  const clearMessages = () => {
    setError('');
  };

  const showTemporaryMessage = useCallback((message: string, type: 'error') => {
    clearMessages();
    setError(message);
    setTimeout(clearMessages, 5000);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const response = await fetch(`${apiBaseUrl}/orders`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const responseData = await response.json();
      const ordersData: Order[] = responseData.orders || responseData.data || responseData;
      setOrders(ordersData);
    } catch (err: unknown) {
      showTemporaryMessage('Error fetching orders: ' + (err instanceof Error ? err.message : String(err)), 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, showTemporaryMessage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div style={styles.formSection}>
      <NavBar />
      <h2 style={styles.subHeading}>Customer Orders</h2>
      {loading && orders.length === 0 ? (
        <p style={styles.loadingMessage}>Loading orders...</p>
      ) : !loading && orders.length === 0 && !error ? (
        <p style={styles.loadingMessage}>No orders found.</p>
      ) : (
        <>
          {error && <p style={styles.errorMessage}>Error: {error}</p>}
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Product ID</th>
                  <th style={styles.tableHeader}>Name</th>
                  <th style={styles.tableHeader}>Pronouns</th>
                  <th style={styles.tableHeader}>Phone Number</th>
                  <th style={styles.tableHeader}>State</th>
                  <th style={styles.tableHeader}>Delivery Option</th>
                  <th style={styles.tableHeader}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{order.id}</td>
                    <td style={styles.tableCell}>{order.product_id}</td>
                    <td style={styles.tableCell}>{order.name}</td>
                    <td style={styles.tableCell}>{order.pronouns || 'N/A'}</td>
                    <td style={styles.tableCell}>{order.phone_number}</td>
                    <td style={styles.tableCell}>{order.state}</td>
                    <td style={styles.tableCell}>{order.delivery_option}</td>
                    <td style={styles.tableCell}>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewOrders;