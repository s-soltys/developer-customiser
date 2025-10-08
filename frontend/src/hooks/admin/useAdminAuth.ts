import { useState, useEffect } from 'react';

const ADMIN_TOKEN_KEY = 'admin_authenticated';

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

/**
 * Hook for admin authentication.
 * Stores authentication state in sessionStorage (expires on tab close).
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check sessionStorage on mount
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) === 'true';
  });

  useEffect(() => {
    // Sync with sessionStorage changes (e.g., from other tabs)
    const handleStorageChange = () => {
      setIsAuthenticated(sessionStorage.getItem(ADMIN_TOKEN_KEY) === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, 'true');
        // Also store password for Basic Auth (in memory for this session)
        sessionStorage.setItem('admin_password', password);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Invalid password' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem('admin_password');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    login,
    logout,
  };
}

/**
 * Get admin password from sessionStorage for Basic Auth headers.
 */
export function getAdminPassword(): string | null {
  return sessionStorage.getItem('admin_password');
}
