import { ClerkProvider } from '@clerk/nextjs';
import './global.css';

import { Nunito, PT_Sans } from 'next/font/google';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${nunito.variable} ${ptSans.variable} antialiased relative bg-sidebar`}>
          <div className="texture" />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
