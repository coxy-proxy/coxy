'use client';

import { useAuth } from '_/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
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
        router.push('/api-keys');
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
      <div className="grid min-h-svh lg:grid-cols-2 bg-background">
        {/* Left column - content */}
        <div className="flex flex-col gap-4 p-6 md:p-10">
          {/* Brand header */}
          <div className="flex justify-center gap-2 md:justify-start">
            <Link href="/" className="flex items-center gap-3 font-bold">
              <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full">
                  <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
                </span>
              </div>
              Coxy
            </Link>
          </div>

          {/* Success content */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl font-bold font-serif">Completing sign in...</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Please wait while we complete your authentication
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - cover image */}
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/coxy-cover.png"
            alt="Cover image"
            fill
            sizes="50vw"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Left column - content */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Brand header */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full">
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
              </span>
            </div>
            Coxy
          </Link>
        </div>

        {/* Redirect content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <h1 className="text-2xl font-bold font-serif">Redirecting...</h1>
                <p className="text-muted-foreground text-sm text-balance">Taking you to your dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - cover image */}
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/coxy-cover.png"
          alt="Cover image"
          fill
          sizes="50vw"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  );
}
