'use client';

import { useAuth } from '_/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth check to complete

    // Redirect based on authentication status
    if (isAuthenticated) {
      router.replace('/api-keys');
    } else {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
