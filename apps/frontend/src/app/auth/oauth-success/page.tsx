'use client';

import { useAuth } from '_/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OAuthSuccessPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Refresh user data to get the newly authenticated user
        await refreshUser();

        // Redirect to dashboard after successful OAuth
        router.push('/dashboard');
      } catch (error) {
        console.error('Error handling OAuth success:', error);
        // Redirect to login on error
        router.push('/auth/login?error=oauth_callback_failed');
      } finally {
        setIsLoading(false);
      }
    };

    handleOAuthSuccess();
  }, [refreshUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
