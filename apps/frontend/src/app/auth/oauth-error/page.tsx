'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

function OAuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/auth/login?error=oauth_failed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleBackToLogin = useCallback(() => {
    router.push('/auth/login');
  }, [router]);

  const error = searchParams.get('error') || 'oauth_error';

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

        {/* Error content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="text-destructive">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.768 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl font-bold font-serif">Authentication Failed</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    There was an error signing you in with Google. Please try again.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
                </p>

                <button
                  onClick={handleBackToLogin}
                  className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-md border border-primary-border shadow-primary px-4 py-2 text-sm font-medium transition-all hover:bg-primary/90"
                >
                  Back to Login
                </button>

                {error && <p className="text-xs text-muted-foreground">Error: {error}</p>}
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

export default function OAuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <OAuthErrorContent />
    </Suspense>
  );
}
