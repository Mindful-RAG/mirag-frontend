import { useState, useEffect, useCallback } from "react";
import { authService } from "../lib/auth-service";
import type { User } from "../types/auth";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isInitialized: boolean; // Track if initial auth check is complete
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const login = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.loginWithGoogle();
      setUser(response.user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      setError(errorMessage);
      // Still clear user on logout error
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setError(null);
      const authStatus = await authService.checkAuthStatus();
      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  }, []);

  // Check authentication status on mount (page load/refresh)
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Checking authentication status on app start...");
        const authStatus = await authService.checkAuthStatus();

        if (isMounted) {
          if (authStatus.authenticated && authStatus.user) {
            setUser(authStatus.user);
            console.log("User restored from session:", authStatus.user);
          } else {
            setUser(null);
            console.log("No authenticated user found");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setUser(null);
          // Don't set error on initialization failure - user just isn't logged in
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run on mount

  return {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    isInitialized,
  };
};
