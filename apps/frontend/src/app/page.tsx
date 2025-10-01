import { redirect } from 'next/navigation';

export default function Page() {
  if (process.env.AUTH_ENABLED !== 'true') {
    redirect('/api-keys');
  }

  // Redirect to login page for authenticated users
  redirect('/auth/login');
}
