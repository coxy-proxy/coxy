import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import HomeLogin from '../components/HomeLogin';

export default async function Page() {
  if (process.env.AUTH_ENABLED !== 'true') {
    redirect('/api-keys');
  }
  const { userId } = await auth();
  if (userId) {
    redirect('/api-keys');
  }
  return <HomeLogin />;
}
