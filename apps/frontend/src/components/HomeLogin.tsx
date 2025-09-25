'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function HomeLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event handlers (outlined for future implementation)
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // TODO: add client-side validation as needed
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleForgotPassword = useCallback(() => {
    // TODO: Implement password reset flow
    // Example: router.push("/forgot-password") or open modal
    console.info('Forgot password clicked');
  }, [router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        // TODO: Implement sign-in using your auth provider (e.g., Clerk, custom API)
        // Example (pseudo): await signInWithEmail({ email, password })
        console.info('Attempt login', { email });
      } catch (err) {
        console.error('Login failed', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password],
  );

  const handleGoogleLogin = useCallback(async () => {
    // TODO: Implement Google OAuth login
    // Example with Clerk: await signIn?.authenticateWithRedirect({ strategy: "oauth_google" })
    console.info('Continue with Google clicked');
  }, []);

  const handleSignUpClick = useCallback(() => {
    // Prefer Link for accessibility, but outline programmatic navigation as well
    router.push('/sign-up');
  }, [router]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      {/* Left column - form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Brand header */}
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <span className="relative flex size-8 shrink-0 overflow-hidden rounded-full">
                {/* Use public/logo.png if present */}
                <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
              </span>
            </div>
            Coxy
          </Link>
        </div>

        {/* Login form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold font-serif">Login to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to login to your account
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-3">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="border-input bg-card h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center">
                    <label className="text-sm font-medium" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                      onClick={handleForgotPassword}
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="border-input bg-card h-10 w-full rounded-md border px-3 py-1 text-base shadow-xs outline-none md:text-sm focus-visible:ring-2 focus-visible:ring-ring"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground inline-flex items-center justify-center gap-2 rounded-md border border-primary-border shadow-primary px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 hover:bg-primary/90"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
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
                  Login with Google
                </button>
              </div>

              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/sign-up" className="underline underline-offset-4" onClick={handleSignUpClick}>
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right column - cover image */}
      <div className="bg-muted relative hidden lg:block">
        {/* Using next/image for optimization */}
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
