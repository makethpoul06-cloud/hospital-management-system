import { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('hms_user');
        const accessToken = localStorage.getItem('hms_access_token');

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('hms_user');
        localStorage.removeItem('hms_access_token');
        localStorage.removeItem('hms_refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const serverMessage = errorData.message || errorData.error;
        if (response.status === 401) {
          throw new Error('Invalid email or password. Check your account details and try again.');
        }
        if (response.status === 503) {
          throw new Error(serverMessage || 'Authentication service unavailable. Check that the backend and database are running.');
        }
        throw new Error(serverMessage || `Login failed (${response.status})`);
      }

      const data = await response.json();

      // Store tokens and user info
      localStorage.setItem('hms_access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('hms_refresh_token', data.refreshToken);
      }
      localStorage.setItem('hms_user', JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err instanceof TypeError
        ? 'Unable to connect to the HMS server. Start the backend on http://localhost:5000 and try again.'
        : err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Store tokens and user info
      localStorage.setItem('hms_access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('hms_refresh_token', data.refreshToken);
      }
      localStorage.setItem('hms_user', JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('hms_access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (token) {
        try {
          await fetch(`${apiUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
        } catch (err) {
          console.warn('Logout API call failed, continuing cleanup:', err);
        }
      }
    } finally {
      // Always clear local state regardless of API response
      localStorage.removeItem('hms_access_token');
      localStorage.removeItem('hms_refresh_token');
      localStorage.removeItem('hms_user');
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem('hms_refresh_token');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('hms_access_token', data.accessToken);

      return { success: true, accessToken: data.accessToken };
    } catch (err) {
      console.error('Token refresh error:', err);
      // On token refresh failure, logout the user
      await logout();
      return { success: false, error: err.message };
    }
  }, [logout]);

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
