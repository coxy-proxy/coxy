'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// User type matching the backend's profile endpoint response
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  avatar: string | null;
  authProvider?: 'EMAIL' | 'GOOGLE' | 'BOTH';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/profile', {
        credentials: 'include', // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }

      if (response.status === 401) {
        return null; // Not authenticated
      }

      throw new Error(`Failed to fetch user: ${response.status}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    // Prevent concurrent calls
    if (isFetching) {
      return;
    }

    setIsFetching(true);
    setIsLoading(true);
    try {
      const userData = await fetchUser();
      setUser(userData);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [fetchUser, isFetching]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Redirect to login page
      window.location.href = '/auth/login';
    }
  }, []);

  // Initial user fetch on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refreshUser,
    setUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Compatibility hook to replace Clerk's useUser
export function useUser() {
  const { user, isLoading } = useAuth();

  return {
    user,
    isLoaded: !isLoading,
    isSignedIn: !!user,
  };
}
