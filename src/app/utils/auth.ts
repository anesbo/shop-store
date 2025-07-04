export const logout = async (): Promise<{ success: boolean; message: string }> => {
  console.log('Initiating logout request');
  try {
    const response = await fetch('https://shoppica-backend.onrender.com/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Logout API response status:', response.status);
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let errorData = { error: 'Logout failed' };
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
        console.log('Logout API error response:', errorData);
      }
      const errorMessages: Record<number, string> = {
        401: 'Unauthorized: No active session found.',
        500: 'Server error. Please try again later.',
      };
      throw new Error(errorData.error || errorMessages[response.status] || `HTTP error! Status: ${response.status}`);
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Unexpected response format. Expected application/json.');
    }

    const data = await response.json();
    console.log('Logout API response data:', data);
    return { success: true, message: data.message || 'Logout successful' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during logout.';
    console.error('Logout error:', error);
    return { success: false, message: errorMessage };
  }
};

export const checkAdminStatus = async (): Promise<{ isAdmin: boolean; message: string }> => {
  console.log('Checking admin status');
  try {
    const response = await fetch('https://shoppica-backend.onrender.com/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Admin check API response status:', response.status);
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      let errorData = { error: 'Failed to check admin status' };
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
        console.log('Admin check API error response:', errorData);
      }
      const errorMessages: Record<number, string> = {
        401: 'Unauthorized: Please log in.',
        403: 'Forbidden: Admin access required.',
        404: 'User profile endpoint not found.',
        500: 'Server error. Please try again later.',
      };
      throw new Error(errorData.error || errorMessages[response.status] || `HTTP error! Status: ${response.status}`);
    }

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Unexpected response format. Expected application/json.');
    }

    const data = await response.json();
    console.log('Admin check API response data:', JSON.stringify(data, null, 2));

    // Check admin indicators at root level and nested under user
    const isAdmin =
      data.is_admin === true ||
      data.isAdmin === true ||
      data.role === 'admin' ||
      data.role === 'administrator' ||
      data.user?.is_admin === true ||
      data.user?.isAdmin === true ||
      data.user?.role === 'admin' ||
      data.user?.role === 'administrator';

    console.log('Determined isAdmin:', isAdmin);
    return { isAdmin, message: isAdmin ? 'User is admin' : 'User is not admin' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while checking admin status.';
    console.error('Admin check error:', error);
    return { isAdmin: false, message: errorMessage };
  }
};