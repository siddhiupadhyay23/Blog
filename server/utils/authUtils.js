// authUtils.js - Add this to your utils folder

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };
  
  let response = await fetch(url, config);
  
  // If token is expired, try to refresh it
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        localStorage.setItem('access_token', data.access_token);
        
        // Retry the original request with new token
        config.headers.Authorization = `Bearer ${data.access_token}`;
        response = await fetch(url, config);
      }
    } catch (error) {
      console.log('Token refresh failed:', error);
    }
  }
  
  return response;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  // Clear other auth-related data
  // Redirect to login page
  window.location.href = '/sign-in';
};