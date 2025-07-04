'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '../utils/auth';

const LogoutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    console.log('Logout button clicked');

    const result = await logout();
    if (result.success) {
      console.log('Logout successful, redirecting to /login');
      router.push('/products');
    } else {
      console.error('Logout failed:', result.message);
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '10px 0' }}>
      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
      )}
    </div>
  );
};

export default LogoutButton;