'use client';

import { useAuth } from '_/contexts/AuthContext';
import { useApiClient } from '_/hooks/useApiClient';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { refreshUser, isAuthenticated, isLoading: authLoading, setUser } = useAuth();
  const apiClient = useApiClient();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/api-keys');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  }, []);

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      // Client-side validation
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.post('/auth/register', {
          email,
          password,
          name,
        });

        if (response.status === 201) {
          // Registration successful - use returned user data
          const userData = response.data.user;
          if (userData) {
            setUser(userData);
          }
          router.replace('/api-keys');
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, name, confirmPassword, apiClient, setUser, router],
  );

  const handleGoogleLogin = useCallback(() => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = '/api/auth/google';
  }, []);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Left column - form */}
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

        {/* Register form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleRegister}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold font-serif">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>

              {error && (
                <div className="bg-destructive/15 text-destructive border border-destructive/20 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    className="border-input bg-card h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter your full name"
                    required
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="border-input bg-card h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className="border-input bg-card h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Create a password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>

                <div className="grid gap-3">
                  <label className="text-sm font-medium" htmlFor="confirmPassword">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="border-input bg-card h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-md border border-primary-border shadow-primary px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 hover:bg-primary/90"
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>

                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="bg-card inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 533.5 544.3"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M533.5 278.4c0-18.5-1.5-36.9-4.7-54.8H272v103.8h146.9c-6.3 34.3-25.6 63.3-54.6 82.7v68h88.4c51.6-47.6 80.8-118 80.8-199.7z"
                      fill="#4285F4"
                    />
                    <path
                      d="M272 544.3c73.8 0 135.8-24.5 181.1-66.2l-88.4-68c-24.5 16.5-56 26-92.7 26-71.2 0-131.7-48-153.3-112.3H27.4v70.6C72.3 492.1 166.6 544.3 272 544.3z"
                      fill="#34A853"
                    />
                    <path
                      d="M118.7 323.8c-4.8-14.4-7.5-29.7-7.5-45.8 0-16.1 2.8-31.4 7.5-45.8v-70.6H27.4C10 195.7 0 235.8 0 278c0 42.3 10 82.3 27.4 116.5l91.3-70.7z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M272 107.7c40.1 0 76.2 13.8 104.7 40.7l78.3-78.3C407.6 26 345.7 0 272 0 166.6 0 72.3 52.2 27.4 138.6l91.3 70.6C140.3 155.7 200.8 107.7 272 107.7z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </button>
              </div>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
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
